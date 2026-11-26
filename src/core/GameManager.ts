import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CricketSystem } from '../activities/CricketSystem';
import { FootballSystem } from '../activities/FootballSystem';
import { InteractionSystem } from '../activities/InteractionSystem';
import { MissionSystem } from '../activities/MissionSystem';
import { AnimalAI } from '../animals/AnimalAI';
import { AudioManager } from '../audio/AudioManager';
import { FirstPersonCamera } from '../camera/FirstPersonCamera';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { NPCController } from '../characters/NPCController';
import { createProceduralTextureLibrary, TextureLibrary } from '../materials/ProceduralTextures';
import { PlayerController } from '../player/PlayerController';
import { PlayerInteraction } from '../player/PlayerInteraction';
import {
  CameraMode,
  DialogueChoice,
  GameSettings,
  GraphicsQuality,
  HudSnapshot,
  InputState,
  PlayerOutfit,
  SaveData,
} from '../types/game';
import { TrafficSystem } from '../vehicles/TrafficSystem';
import { VehicleEntity } from '../vehicles/VehicleController';
import { spawnVillageVehicles } from '../vehicles/VehicleInteraction';
import { DayNightSystem } from '../world/DayNightSystem';
import { RoadSystem } from '../world/RoadSystem';
import { getLocationName, groundHeightAt, TerrainSystem } from '../world/TerrainSystem';
import { VillageMap } from '../world/VillageMap';
import { WaterSystem } from '../world/WaterSystem';
import { WeatherSystem } from '../world/WeatherSystem';
import { GameLoadingManager, LoadingProgress } from './LoadingManager';
import { SaveManager } from './SaveManager';
import { SceneManager } from './SceneManager';

function detectSoftwareWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export class GameManager {
  public readonly isSoftwareGl: boolean;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly audio: AudioManager;
  public readonly sceneManager = new SceneManager();

  public input: InputState = {
    moveX: 0,
    moveY: 0,
    lookDeltaX: 0,
    lookDeltaY: 0,
    sprint: false,
    jump: false,
    crouch: false,
    punch: false,
    fireGun: false,
    kick: false,
    block: false,
    dodge: false,
    interact: false,
    vehicleToggle: false,
    sitToggle: false,
    steer: 0,
    throttle: 0,
    brake: 0,
    horn: false,
  };

  private container: HTMLElement;
  private textures: TextureLibrary;
  private terrain: TerrainSystem;
  private roads: RoadSystem;
  private water: WaterSystem;
  private dayNight: DayNightSystem;
  private weather: WeatherSystem;
  private village: VillageMap;
  private player: PlayerController;
  private vehicles: VehicleEntity[];
  private traffic: TrafficSystem;
  private npcs: NPCController;
  private animals: AnimalAI;
  private cricket: CricketSystem;
  private football: FootballSystem;
  private missions: MissionSystem;
  private interaction = new InteractionSystem();
  private playerInteract = new PlayerInteraction();
  private thirdCam = new ThirdPersonCamera();
  private firstCam = new FirstPersonCamera();

  private cameraMode: CameraMode = 'third_person';
  private settings: GameSettings;
  private saveData: SaveData;
  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;
  private hudTimer = 0;
  private saveTimer = 0;
  private isDead = false;
  private deathReason = '';
  private deathTimer = 0;
  private gunTracerMesh: THREE.Mesh;
  private gunTracerTimer = 0;
  private onHudUpdate: (snap: HudSnapshot) => void;
  private onContextLost: (lost: boolean) => void;

  private keys = new Set<string>();
  private keyboardDrivingMove = false;
  private keyVehicleQueued = false;
  private keyInteractQueued = false;
  private keySitQueued = false;
  private keyCrouchQueued = false;
  private keyJumpQueued = false;
  private keyFireQueued = false;

  constructor(
    container: HTMLElement,
    initialSave: SaveData,
    onProgress: (p: LoadingProgress) => void,
    onHudUpdate: (snap: HudSnapshot) => void,
    onContextLost: (lost: boolean) => void
  ) {
    this.container = container;
    this.saveData = initialSave;
    this.settings = { ...initialSave.settings };
    this.onHudUpdate = onHudUpdate;
    this.onContextLost = onContextLost;
    this.audio = new AudioManager(this.settings);

    const loader = new GameLoadingManager(onProgress);
    loader.report(12, 'Initializing 3D PBR renderer...');

    this.isSoftwareGl = detectSoftwareWebGL();
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);

    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.onContextLost(true);
    });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.onContextLost(false);
    });

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      (container.clientWidth || window.innerWidth) / Math.max(1, container.clientHeight || window.innerHeight),
      0.15,
      360
    );

    // Studio PMREM reflection map for authentic metallic tin, water & vehicle paint
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    loader.report(28, 'Crafting procedural village textures...');
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextureLibrary(maxAniso);

    loader.report(45, 'Shaping Shonargaon terrain, roads & river...');
    this.dayNight = new DayNightSystem(this.scene, this.isSoftwareGl);
    this.dayNight.setPreset(this.settings.timeOfDay, this.settings.autoDayNight);
    this.weather = new WeatherSystem(this.scene);
    this.weather.setWeather(this.settings.weather);

    this.terrain = new TerrainSystem(this.textures);
    this.scene.add(this.terrain.mesh);

    this.roads = new RoadSystem(this.textures);
    this.scene.add(this.roads.group);

    this.water = new WaterSystem(this.textures, this.isSoftwareGl);
    this.scene.add(this.water.group);

    loader.report(64, 'Building houses, bazaar, mosque & schools...');
    this.village = new VillageMap(this.textures);
    this.scene.add(this.village.group);

    loader.report(78, 'Spawning vehicles, traffic, villagers & animals...');
    this.vehicles = spawnVillageVehicles(this.textures);
    for (const v of this.vehicles) {
      this.scene.add(v.group);
    }

    this.traffic = new TrafficSystem(this.textures);
    this.scene.add(this.traffic.group);

    this.npcs = new NPCController(this.textures);
    this.scene.add(this.npcs.group);

    this.animals = new AnimalAI(this.textures);
    this.scene.add(this.animals.group);

    this.cricket = new CricketSystem(this.textures);
    this.scene.add(this.cricket.group);

    this.football = new FootballSystem();
    this.scene.add(this.football.ballMesh);

    this.missions = new MissionSystem(initialSave.completedMissionIds);
    this.player = new PlayerController(
      this.textures,
      initialSave.playerPosition,
      initialSave.playerRotationY,
      initialSave.outfit,
      initialSave.inventory
    );
    this.scene.add(this.player.rig.root);

    // Muzzle tracer beam for gunshots
    const tracerGeo = new THREE.CylinderGeometry(0.025, 0.025, 20, 6);
    tracerGeo.rotateX(Math.PI / 2);
    tracerGeo.translate(0, 0, 10);
    this.gunTracerMesh = new THREE.Mesh(
      tracerGeo,
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9 })
    );
    this.gunTracerMesh.visible = false;
    this.scene.add(this.gunTracerMesh);

    this.thirdCam.resetBehind(
      this.player.x,
      this.player.y,
      this.player.z,
      this.player.rotationY
    );

    this.applyGraphicsPreset(this.settings.graphics);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    loader.report(100, 'Welcome to Shonargaon Village');
    this.bindEvents();
    this.startLoop();
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleResize = (): void => {
    const w = this.container.clientWidth || window.innerWidth;
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    const k = e.code;
    this.keys.add(k);
    if (k === 'KeyF') this.keyVehicleQueued = true;
    if (k === 'KeyE') this.keyInteractQueued = true;
    if (k === 'KeyV') this.keySitQueued = true;
    if (k === 'KeyC') this.keyCrouchQueued = true;
    if (k === 'Space') this.keyJumpQueued = true;
    if (k === 'KeyG') this.keyFireQueued = true;
    if (k === 'KeyR' || k === 'Digit1') this.toggleWeaponMode();
    if (k === 'Tab') {
      e.preventDefault();
      this.toggleCameraMode();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  public applySettings(next: GameSettings): void {
    this.settings = { ...next };
    this.applyGraphicsPreset(next.graphics);
    this.dayNight.setPreset(next.timeOfDay, next.autoDayNight);
    this.weather.setWeather(next.weather);
    this.audio.applySettings(next);
    this.persistSave();
  }

  private applyGraphicsPreset(preset: GraphicsQuality): void {
    const dprCap = this.isSoftwareGl
      ? 1
      : preset === 'low'
        ? 0.85
        : preset === 'medium'
          ? 1.15
          : preset === 'high'
            ? 1.6
            : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(dprCap);

    if (!this.isSoftwareGl) {
      this.renderer.shadowMap.enabled = preset !== 'low';
      this.dayNight.sunLight.castShadow = preset !== 'low';
    }

    const farMap: Record<GraphicsQuality, number> = {
      low: 200,
      medium: 260,
      high: 330,
      ultra: 420,
    };
    this.camera.far = farMap[preset];
    this.camera.updateProjectionMatrix();
  }

  public setPlayingMode(playing: boolean): void {
    this.sceneManager.mode = playing ? 'playing' : 'menu';
    if (playing) {
      this.audio.unlock();
    }
  }

  public setOutfit(outfit: PlayerOutfit): void {
    this.player.setOutfit(outfit);
    this.persistSave();
  }

  public toggleCameraMode(): void {
    this.cameraMode = this.cameraMode === 'third_person' ? 'first_person' : 'third_person';
    if (this.cameraMode === 'first_person') {
      this.firstCam.yaw = this.thirdCam.yaw;
      this.firstCam.pitch = 0;
    }
  }

  public toggleWeaponMode(): void {
    this.player.combat.toggleWeapon();
    this.audio.playUiClick();
  }

  public selectDialogueChoice(choice: DialogueChoice): void {
    this.interaction.selectDialogueChoice(choice, this.player, this.missions, this.audio);
  }

  public closeDialogue(): void {
    this.interaction.closeDialogue();
    this.audio.playUiClick();
  }

  public respawnPlayer(): void {
    this.isDead = false;
    this.deathReason = '';
    this.deathTimer = 0;
    this.player.health = 100;
    this.player.stamina = 100;
    this.player.x = 0;
    this.player.y = groundHeightAt(0, 8);
    this.player.z = 8;
    this.player.vy = 0;
    this.player.speed = 0;
    this.player.rotationY = 0;
    this.player.posture = 'standing';
    this.player.drivingVehicleId = null;
    this.player.rig.root.visible = true;
    this.player.rig.bodyPivot.rotation.x = 0;
    this.player.rig.bodyPivot.position.y = 0;
    this.interaction.closeDialogue();
    this.cricket.stopMatch();
    this.thirdCam.resetBehind(this.player.x, this.player.y, this.player.z, this.player.rotationY);
    this.audio.playUiClick();
  }

  public getMissions() {
    return this.missions.missions;
  }

  private handlePlayerDamaged(dmg: number): void {
    if (this.isDead) return;
    this.player.takeDamage(dmg, this.audio);
    if (this.player.health <= 0) {
      this.handlePlayerKilled('গ্রামবাসীর সাথে মারামারিতে অজ্ঞান হয়ে গেছেন');
    }
  }

  private handlePlayerKilled(reason: string): void {
    if (this.isDead) return;
    this.isDead = true;
    this.deathReason = reason;
    this.deathTimer = 2.6;
    this.player.health = 0;
    this.player.speed = 0;
    this.player.rig.bodyPivot.rotation.x = Math.PI / 2;
    this.player.rig.bodyPivot.position.y = 0.2;
    this.interaction.closeDialogue();
    this.audio.playImpactHit(true);
  }

  public resetFromSave(save: SaveData): void {
    this.saveData = save;
    this.isDead = false;
    this.deathReason = '';
    this.deathTimer = 0;
    this.player.health = 100;
    this.player.stamina = 100;
    this.player.x = save.playerPosition[0];
    this.player.y = save.playerPosition[1];
    this.player.z = save.playerPosition[2];
    this.player.rotationY = save.playerRotationY;
    this.player.drivingVehicleId = null;
    this.player.rig.root.visible = true;
    this.player.rig.bodyPivot.rotation.x = 0;
    this.player.rig.bodyPivot.position.y = 0;
    this.player.setOutfit(save.outfit);
    this.missions = new MissionSystem(save.completedMissionIds);
    this.cricket.stopMatch();
    this.thirdCam.resetBehind(this.player.x, this.player.y, this.player.z, this.player.rotationY);
    this.applySettings(save.settings);
  }

  public startCricketWithConfig(teamName: string, overs: number): void {
    this.player.x = 18;
    this.player.z = 74.5;
    this.player.rotationY = Math.PI;
    this.player.rig.batMesh.visible = true;
    this.cricket.startMatch(teamName, overs);
  }

  public exitCricket(): void {
    this.cricket.stopMatch();
    this.player.rig.batMesh.visible = false;
  }

  public swingCricketBat(): void {
    this.cricket.swingBat(this.audio);
  }

  public triggerLookDelta(dx: number, dy: number): void {
    if (this.cameraMode === 'third_person') {
      this.thirdCam.applyLookDelta(dx, dy, this.settings.cameraSensitivity);
    } else {
      this.firstCam.applyLookDelta(dx, dy, this.settings.cameraSensitivity);
    }
  }

  public persistSave(): void {
    this.saveData = {
      ...this.saveData,
      hasPlayedIntro: true,
      playerPosition: [this.player.x, this.player.y, this.player.z],
      playerRotationY: this.player.rotationY,
      outfit: this.player.outfit,
      activeVehicleId: this.player.drivingVehicleId,
      completedMissionIds: this.missions.getCompletedIds(),
      cricketHighScore: Math.max(this.saveData.cricketHighScore, this.cricket.state.runs),
      footballGoals: Math.max(this.saveData.footballGoals, this.football.state.goals),
      inventory: [...this.player.inventory.items],
      settings: { ...this.settings },
    };
    SaveManager.save(this.saveData);
  }

  private mergeKeyboardIntoInput(): void {
    let kx = 0;
    let ky = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) kx -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) kx += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) ky += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) ky -= 1;

    if (kx !== 0 || ky !== 0) {
      this.keyboardDrivingMove = true;
      this.input.moveX = kx;
      this.input.moveY = ky;
      this.input.steer = kx;
      this.input.throttle = ky > 0 ? 1 : 0;
      this.input.brake = ky < 0 ? 1 : 0;
    } else if (this.keyboardDrivingMove) {
      this.keyboardDrivingMove = false;
      this.input.moveX = 0;
      this.input.moveY = 0;
      this.input.steer = 0;
      this.input.throttle = 0;
      this.input.brake = 0;
    }

    if (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) this.input.sprint = true;
    if (this.keys.has('KeyJ')) this.input.punch = true;
    if (this.keys.has('KeyK')) this.input.kick = true;
    if (this.keys.has('KeyL')) this.input.block = true;
    if (this.keys.has('KeyQ')) this.input.dodge = true;
    if (this.keys.has('KeyH')) this.input.horn = true;
    if (this.keyJumpQueued) {
      this.input.jump = true;
      this.keyJumpQueued = false;
    }
    if (this.keyCrouchQueued) {
      this.input.crouch = true;
      this.keyCrouchQueued = false;
    }
    if (this.keySitQueued) {
      this.input.sitToggle = true;
      this.keySitQueued = false;
    }
    if (this.keyVehicleQueued) {
      this.input.vehicleToggle = true;
      this.keyVehicleQueued = false;
    }
    if (this.keyInteractQueued) {
      this.input.interact = true;
      this.keyInteractQueued = false;
    }
    if (this.keyFireQueued) {
      this.input.fireGun = true;
      this.keyFireQueued = false;
    }
  }

  private clearOneShotInputs(): void {
    if (!this.keys.has('ShiftLeft') && !this.keys.has('ShiftRight')) this.input.sprint = false;
    this.input.jump = false;
    this.input.crouch = false;
    this.input.sitToggle = false;
    this.input.vehicleToggle = false;
    this.input.interact = false;
    this.input.fireGun = false;
    if (!this.keys.has('KeyJ')) this.input.punch = false;
    if (!this.keys.has('KeyK')) this.input.kick = false;
    if (!this.keys.has('KeyL')) this.input.block = false;
    if (!this.keys.has('KeyQ')) this.input.dodge = false;
    if (!this.keys.has('KeyH')) this.input.horn = false;
  }

  private startLoop(): void {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (this.disposed) return;
      const dt = Math.min(0.05, this.clock.getDelta() || 0.016);
      const elapsed = this.clock.elapsedTime;

      this.stepSimulation(dt, elapsed);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.frameId = window.setTimeout(tick, 16);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private stepSimulation(dt: number, elapsed: number): void {
    if (this.sceneManager.mode === 'menu') {
      this.dayNight.update(dt, -12, -8, this.weather.cloudCover, this.weather.fogBonus);
      this.water.update(elapsed, this.dayNight.sunColor, this.dayNight.skyColor);
      this.animals.update(dt, elapsed, 999, 999);
      this.sceneManager.updateMenuCamera(this.camera, dt);
      return;
    }

    this.mergeKeyboardIntoInput();

    if (this.gunTracerTimer > 0) {
      this.gunTracerTimer -= dt;
      if (this.gunTracerTimer <= 0) {
        this.gunTracerMesh.visible = false;
      }
    }

    const activeVeh = this.player.drivingVehicleId
      ? this.vehicles.find((v) => v.id === this.player.drivingVehicleId) ?? null
      : null;

    const camYaw =
      this.cameraMode === 'third_person' ? this.thirdCam.yaw : this.firstCam.yaw;

    // Proximity interactions
    const prox = this.playerInteract.findClosestPrompt(
      this.player.x,
      this.player.z,
      this.vehicles,
      this.npcs.npcs,
      this.village.doors,
      this.village.sitSpots,
      Boolean(activeVeh),
      this.cricket.state.active
    );

    if (this.isDead) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.respawnPlayer();
      }
    } else {
      if (this.input.vehicleToggle) {
        this.interaction.handleVehicleToggle(
          this.player,
          this.vehicles,
          prox.nearestVehicle,
          this.missions,
          this.audio
        );
      }

      if (this.input.interact) {
        this.interaction.handlePrimaryInteract(
          this.player,
          this.npcs,
          prox.nearestDoor,
          prox.nearestNpc,
          prox.nearestSit,
          prox.nearCricket,
          prox.nearFootball,
          this.cricket,
          this.football,
          this.audio
        );
      }

      // Update Player or Vehicle
      if (activeVeh) {
        activeVeh.update(dt, this.input, this.village.colliders, this.dayNight.isNight());
        this.player.x = activeVeh.x;
        this.player.y = activeVeh.y + activeVeh.spec.seatOffset[1] - 0.35;
        this.player.z = activeVeh.z;
        this.player.rotationY = activeVeh.rotationY;
        this.player.rig.root.position.set(this.player.x, this.player.y, this.player.z);
        this.player.rig.root.rotation.y = activeVeh.rotationY;
        this.player.rig.root.visible =
          activeVeh.kind === 'motorcycle' ||
          activeVeh.kind === 'sports_bike' ||
          activeVeh.kind === 'bicycle' ||
          activeVeh.kind === 'cycle_rickshaw';
      } else {
        const { meleeHit, gunFired } = this.player.update(
          dt,
          this.input,
          camYaw,
          this.village.colliders,
          this.village.treeTrunks,
          this.audio
        );
        if (gunFired) {
          this.gunTracerMesh.position.set(
            this.player.x + Math.sin(this.player.rotationY) * 0.45,
            this.player.y + 1.24,
            this.player.z + Math.cos(this.player.rotationY) * 0.45
          );
          this.gunTracerMesh.rotation.y = this.player.rotationY;
          this.gunTracerMesh.visible = true;
          this.gunTracerTimer = 0.09;
        }
        if (meleeHit || gunFired) {
          this.npcs.applyPlayerAttack(
            this.player.x,
            this.player.z,
            this.player.rotationY,
            gunFired,
            this.audio
          );
        }
      }
    }

    // Update idle vehicles gently
    for (const v of this.vehicles) {
      if (v !== activeVeh) {
        v.update(dt, this.input, this.village.colliders, this.dayNight.isNight());
      }
    }

    // Update autonomous road traffic (lethal on foot collision)
    this.traffic.update(
      dt,
      this.player.x,
      this.player.z,
      Boolean(activeVeh),
      this.dayNight.isNight(),
      (vehLabel) => this.handlePlayerKilled(`${vehLabel}-এর সাথে ধাক্কা লেগেছে`)
    );

    // Update NPCs, Animals, Sports, World Atmosphere
    this.npcs.update(dt, this.player.x, this.player.z, this.vehicles, (dmg) =>
      this.handlePlayerDamaged(dmg)
    );
    this.animals.update(dt, elapsed, this.player.x, this.player.z);
    this.cricket.update(dt, this.audio);
    this.football.update(dt, this.player.x, this.player.z, this.player.speed);
    this.interaction.update(dt, this.village.doors, this.player.x, this.player.z);

    // Check positional missions
    if (this.cricket.state.runs >= 6 && this.missions.complete('mission-cricket')) {
      this.audio.playMissionComplete();
    }
    if (
      Math.hypot(this.player.x - -14, this.player.z - -84) < 15 &&
      this.missions.complete('mission-bridge')
    ) {
      this.audio.playMissionComplete();
    }

    // Weather & Day-Night
    this.weather.update(dt, this.player.x, this.player.z, () => this.audio.playThunder());
    this.dayNight.update(
      dt,
      this.player.x,
      this.player.z,
      this.weather.cloudCover,
      this.weather.fogBonus
    );
    this.water.update(elapsed, this.dayNight.sunColor, this.dayNight.skyColor);

    // Procedural Audio mix
    const nearWater =
      this.player.x < -55 ||
      Math.hypot(this.player.x - -26, this.player.z - 22) < 20;
    this.audio.update(
      dt,
      this.weather.rainIntensity,
      this.dayNight.isNight(),
      nearWater,
      activeVeh ? activeVeh.kind : null,
      activeVeh ? activeVeh.getSpeedKmh() : 0,
      this.input.horn
    );

    // Camera Update
    const speedKmh = activeVeh ? activeVeh.getSpeedKmh() : this.player.speed * 3.6;
    if (this.cameraMode === 'third_person') {
      this.thirdCam.update(
        this.camera,
        dt,
        this.player.x,
        this.player.y,
        this.player.z,
        this.player.rotationY,
        Boolean(activeVeh),
        speedKmh
      );
    } else {
      this.firstCam.update(
        this.camera,
        this.player.x,
        this.player.y,
        this.player.z,
        Boolean(activeVeh)
      );
    }

    // Throttled HUD Snapshot (~15Hz) so React UI stays fast
    this.hudTimer += dt;
    if (this.hudTimer >= 0.065) {
      this.hudTimer = 0;
      const vehMarkers = this.vehicles.slice(0, 8).map((v) => ({
        id: v.id,
        label: v.label,
        x: v.x,
        z: v.z,
        color: '#38bdf8',
        kind: 'vehicle' as const,
      }));
      const activeM = this.missions.getActiveMission();
      const missionMarker = activeM
        ? [
            {
              id: activeM.id,
              label: activeM.title,
              x: activeM.targetX,
              z: activeM.targetZ,
              color: '#facc15',
              kind: 'mission' as const,
            },
          ]
        : [];

      this.onHudUpdate({
        locationName: getLocationName(this.player.x, this.player.z),
        playerX: this.player.x,
        playerZ: this.player.z,
        playerHeading: this.player.rotationY,
        health: Math.round(this.player.health),
        stamina: this.player.stamina,
        weaponMode: this.player.combat.weaponMode,
        ammo: this.player.combat.ammo,
        isDead: this.isDead,
        deathReason: this.deathReason,
        isDriving: Boolean(activeVeh),
        vehicleName: activeVeh ? activeVeh.label : '',
        speedKmh: Math.round(speedKmh),
        cameraMode: this.cameraMode,
        posture: this.player.posture,
        activePrompt: prox.prompt,
        dialogue: this.interaction.activeDialogue,
        activeMission: activeM,
        completedCount: this.missions.getCompletedIds().length,
        totalMissions: this.missions.missions.length,
        cricket: { ...this.cricket.state },
        football: { ...this.football.state },
        inventory: [...this.player.inventory.items],
        outfit: this.player.outfit,
        timeLabel: this.dayNight.getTimeLabel(),
        weatherLabel: this.weather.getWeatherLabel(),
        markers: [...this.village.markers, ...vehMarkers, ...missionMarker],
      });
    }

    // Periodic Auto-Save every 6 seconds
    this.saveTimer += dt;
    if (this.saveTimer >= 6) {
      this.saveTimer = 0;
      this.persistSave();
    }

    this.clearOneShotInputs();
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.persistSave();
    this.terrain.dispose();
    this.roads.dispose();
    this.water.dispose();
    this.dayNight.dispose();
    this.weather.dispose();
    this.textures.dispose();
    this.audio.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
