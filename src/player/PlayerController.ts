import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';
import { BoxCollider } from '../buildings/HouseModels';
import { SitSpot } from '../buildings/InteriorSystem';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { InputState, PlayerOutfit } from '../types/game';
import { groundHeightAt } from '../world/TerrainSystem';
import { buildHumanRig, HumanRig, PlayerAnimation } from './PlayerAnimation';
import { PlayerCombat } from './PlayerCombat';
import { PlayerInventory } from './PlayerInventory';

export class PlayerController {
  public readonly rig: HumanRig;
  public readonly animation = new PlayerAnimation();
  public readonly combat = new PlayerCombat();
  public readonly inventory: PlayerInventory;

  public x: number;
  public y: number;
  public z: number;
  public vy = 0;
  public rotationY = 0;
  public speed = 0;
  public health = 100;
  public stamina = 100;
  public isGrounded = true;
  public posture: 'standing' | 'crouching' | 'sitting' | 'climbing' = 'standing';
  public outfit: PlayerOutfit;
  public drivingVehicleId: string | null = null;

  private stepTimer = 0;
  private textures: TextureLibrary;
  private sittingSpot: SitSpot | null = null;

  constructor(
    textures: TextureLibrary,
    initialPos: [number, number, number],
    initialRotY: number,
    outfit: PlayerOutfit,
    inventoryItems: string[]
  ) {
    this.textures = textures;
    this.x = initialPos[0];
    this.y = initialPos[1];
    this.z = initialPos[2];
    this.rotationY = initialRotY;
    this.outfit = outfit;
    this.inventory = new PlayerInventory(inventoryItems);

    this.rig = buildHumanRig(textures, {
      skinHex: 0xb67b52,
      shirtHex: 0xf8fafc,
      pantsHex: 0x1e293b,
      hasLungi: outfit === 'lungi_genji',
      hasPanjabi: outfit === 'panjabi_pajama',
      hasGamcha: outfit !== 'shirt_pant',
    });
    this.animation.applyOutfit(this.rig, outfit, textures);
    this.rig.root.position.set(this.x, this.y, this.z);
    this.rig.root.rotation.y = this.rotationY;
  }

  public setOutfit(outfit: PlayerOutfit): void {
    this.outfit = outfit;
    this.animation.applyOutfit(this.rig, outfit, this.textures);
  }

  public toggleSit(spot: SitSpot | null): void {
    if (this.posture === 'sitting') {
      this.posture = 'standing';
      this.sittingSpot = null;
      return;
    }
    if (spot) {
      this.posture = 'sitting';
      this.sittingSpot = spot;
      this.x = spot.x;
      this.y = spot.y - 0.52;
      this.z = spot.z;
      this.rotationY = spot.rotY;
    } else {
      this.posture = 'sitting';
      this.sittingSpot = null;
    }
  }

  public takeDamage(amount: number, audio: AudioManager): void {
    if (this.combat.action === 'block') {
      amount *= 0.25;
    }
    this.health = Math.max(0, this.health - amount);
    audio.playImpactHit(amount > 25);
  }

  private sampleSurfaceHeight(x: number, z: number): number {
    // Bamboo bridge deck at x in [10.4, 13.6], z in [-45, -31]
    if (x >= 10.4 && x <= 13.6 && z >= -45 && z <= -31) {
      const t = (z - -38) / 7;
      return Math.cos(t * (Math.PI / 2)) * 0.72 + 0.16;
    }
    // Brick highway culvert bridge at x in [63.5, 72.5], z in [-44.5, -31.5]
    if (x >= 63.5 && x <= 72.5 && z >= -44.5 && z <= -31.5) {
      return 0.28;
    }
    // Village wooden ghat at Padma River shore
    if (x >= -73.8 && x <= -63.2 && z >= 6.6 && z <= 9.4) {
      return -0.12;
    }
    // Padma Char wooden ghat
    if (x >= -115.5 && x <= -108.9 && z >= 6.6 && z <= 9.4) {
      return -0.12;
    }
    return groundHeightAt(x, z);
  }

  public update(
    dt: number,
    input: InputState,
    cameraYaw: number,
    colliders: BoxCollider[],
    trees: Array<{ x: number; z: number; r: number }>,
    audio: AudioManager
  ): { meleeHit: boolean; gunFired: boolean } {
    if (this.drivingVehicleId) {
      this.speed = 0;
      this.animation.update(this.rig, dt, 0, true, 'standing', 'none', 0, true, false);
      return { meleeHit: false, gunFired: false };
    }

    const { dodgeBoost, meleeHit, gunFired } = this.combat.update(dt, input, audio);

    if (input.sitToggle) {
      this.toggleSit(this.sittingSpot);
    }
    if (this.posture === 'sitting') {
      if (Math.hypot(input.moveX, input.moveY) > 0.25 || input.jump) {
        this.posture = 'standing';
        this.sittingSpot = null;
      } else {
        this.rig.root.position.set(this.x, this.y, this.z);
        this.rig.root.rotation.y = this.rotationY;
        this.animation.update(this.rig, dt, 0, true, 'sitting', 'none', 0, false, false);
        return { meleeHit, gunFired };
      }
    }

    if (input.crouch) {
      this.posture = this.posture === 'crouching' ? 'standing' : 'crouching';
    }

    const moveMag = Math.min(1, Math.hypot(input.moveX, input.moveY));
    const wantsSprint = input.sprint && this.stamina > 5 && this.posture !== 'crouching';
    if (wantsSprint && moveMag > 0.2) {
      this.stamina = Math.max(0, this.stamina - dt * 18);
    } else {
      this.stamina = Math.min(100, this.stamina + dt * 14);
    }

    const maxSpeed =
      this.posture === 'crouching' ? 2.6 : wantsSprint ? 9.4 : 5.6;

    if (moveMag > 0.05 || dodgeBoost) {
      const forwardX = -Math.sin(cameraYaw);
      const forwardZ = -Math.cos(cameraYaw);
      const rightX = Math.cos(cameraYaw);
      const rightZ = -Math.sin(cameraYaw);

      const dirX = rightX * input.moveX + forwardX * input.moveY;
      const dirZ = rightZ * input.moveX + forwardZ * input.moveY;
      const len = Math.hypot(dirX, dirZ) || 1;
      const nx = dirX / len;
      const nz = dirZ / len;

      const targetSpeed = dodgeBoost ? 11.5 : maxSpeed * moveMag;
      this.speed = THREE.MathUtils.damp(this.speed, targetSpeed, 12, dt);

      const nextX = THREE.MathUtils.clamp(this.x + nx * this.speed * dt, -148, 148);
      const nextZ = THREE.MathUtils.clamp(this.z + nz * this.speed * dt, -148, 148);

      const canX = this.canStandAt(nextX, this.z, colliders, trees);
      const canZ = this.canStandAt(this.x, nextZ, colliders, trees);
      if (canX) this.x = nextX;
      if (canZ) this.z = nextZ;

      const targetRot = Math.atan2(nx, nz);
      let diff = targetRot - this.rotationY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotationY += diff * Math.min(1, dt * 12);
    } else {
      this.speed = THREE.MathUtils.damp(this.speed, 0, 14, dt);
    }

    // Smooth ground height + jump physics
    const groundY = this.sampleSurfaceHeight(this.x, this.z);
    if (input.jump && this.isGrounded) {
      this.vy = 6.6;
      this.isGrounded = false;
      this.posture = 'standing';
    }
    this.vy -= 18.5 * dt;
    this.y += this.vy * dt;
    if (this.y <= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.isGrounded = true;
    }

    if (this.isGrounded && this.speed > 0.8) {
      this.stepTimer -= dt * (this.speed / 4.5);
      if (this.stepTimer <= 0) {
        this.stepTimer = 0.42;
        const onRoad = Math.abs(this.x - 68) < 4.5 || Math.abs(this.z - 6) < 3;
        audio.playFootstep(onRoad ? 'road' : 'grass');
      }
    }

    this.rig.root.position.set(this.x, this.y, this.z);
    this.rig.root.rotation.y = this.rotationY;
    this.animation.update(
      this.rig,
      dt,
      this.speed,
      this.isGrounded,
      this.posture,
      this.combat.action,
      this.combat.timer,
      false,
      this.combat.weaponMode === 'gun'
    );

    return { meleeHit, gunFired };
  }

  private canStandAt(
    x: number,
    z: number,
    colliders: BoxCollider[],
    trees: Array<{ x: number; z: number; r: number }>
  ): boolean {
    const onGhat =
      (x >= -73.8 && x <= -63.2 && z >= 6.6 && z <= 9.4) ||
      (x >= -115.5 && x <= -108.9 && z >= 6.6 && z <= 9.4);
    if (
      groundHeightAt(x, z) < -1.15 &&
      !onGhat &&
      !(x >= 10.2 && x <= 13.8 && z >= -45 && z <= -31)
    ) {
      return false;
    }
    const r = 0.36;
    for (const c of colliders) {
      if (c.disabled) continue;
      if (x + r > c.minX && x - r < c.maxX && z + r > c.minZ && z - r < c.maxZ) {
        return false;
      }
    }
    for (const t of trees) {
      if (Math.hypot(x - t.x, z - t.z) < t.r + r) {
        return false;
      }
    }
    return true;
  }
}
