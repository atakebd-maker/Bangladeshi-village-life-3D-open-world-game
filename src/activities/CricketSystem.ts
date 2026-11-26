import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { buildHumanRig, HumanRig } from '../player/PlayerAnimation';
import { CricketHudState } from '../types/game';

export class CricketSystem {
  public readonly group = new THREE.Group();
  public state: CricketHudState = {
    active: false,
    teamName: 'সোনারগাঁও টাইগার্স',
    opponentName: 'পদ্মা স্ট্রাইকার্স',
    runs: 0,
    wickets: 0,
    ballsBowled: 0,
    maxOvers: 2,
    lastEvent: 'খেলতে ক্রিজে দাঁড়ান',
    ballIncoming: false,
    timingProgress: 0,
    inningOver: false,
  };

  private ballMesh: THREE.Mesh;
  private ballPos = new THREE.Vector3(18, 1.1, 58);
  private ballVel = new THREE.Vector3();
  private ballPhase: 'idle' | 'bowling' | 'hit' = 'idle';
  private bowlTimer = 0;
  private fielders: HumanRig[] = [];

  constructor(textures: TextureLibrary) {
    this.ballMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45 })
    );
    this.ballMesh.position.copy(this.ballPos);
    this.ballMesh.castShadow = true;
    this.group.add(this.ballMesh);

    const positions: Array<[number, number, number]> = [
      [18, 57, 0],
      [7, 62, 0.9],
      [29, 64, -0.9],
      [11, 82, 2.5],
      [27, 81, -2.5],
    ];
    positions.forEach(([fx, fz, rot], i) => {
      const rig = buildHumanRig(textures, {
        skinHex: 0xb0754c,
        shirtHex: i === 0 ? 0x1d4ed8 : 0x2563eb,
        pantsHex: 0xf8fafc,
      });
      rig.root.position.set(fx, 0, fz);
      rig.root.rotation.y = rot;
      this.group.add(rig.root);
      this.fielders.push(rig);
    });
  }

  public startMatch(teamName = 'সোনারগাঁও টাইগার্স', overs = 2): void {
    this.state = {
      active: true,
      teamName,
      opponentName: 'পদ্মা স্ট্রাইকার্স',
      runs: 0,
      wickets: 0,
      ballsBowled: 0,
      maxOvers: overs,
      lastEvent: 'বোলার দৌড়ে আসছে — প্রস্তুত হোন!',
      ballIncoming: false,
      timingProgress: 0,
      inningOver: false,
    };
    this.ballPhase = 'idle';
    this.bowlTimer = 1.2;
  }

  public stopMatch(): void {
    this.state.active = false;
    this.ballPhase = 'idle';
    this.ballPos.set(18, 0.11, 66);
    this.ballMesh.position.copy(this.ballPos);
  }

  public swingBat(audio: AudioManager): void {
    if (!this.state.active || this.state.inningOver || this.ballPhase !== 'bowling') return;

    const timing = this.state.timingProgress;
    const err = Math.abs(timing - 0.84);
    this.ballPhase = 'hit';
    this.state.ballIncoming = false;
    this.state.ballsBowled++;

    if (err < 0.08) {
      this.state.runs += 6;
      this.state.lastEvent = 'ছক্কা! গাছের ওপর দিয়ে বিশাল ছয়!';
      this.ballVel.set((Math.random() - 0.5) * 14, 13, -24);
      audio.playCricketHit('six');
    } else if (err < 0.17) {
      this.state.runs += 4;
      this.state.lastEvent = 'চার! দারুণ ড্রাইভে বাউন্ডারি!';
      this.ballVel.set((Math.random() > 0.5 ? 1 : -1) * 16, 4.5, -18);
      audio.playCricketHit('four');
    } else if (err < 0.28) {
      const r = Math.random() > 0.4 ? 2 : 1;
      this.state.runs += r;
      this.state.lastEvent = `${r} রান — দ্রুত দৌড়ে রান সংগ্রহ!`;
      this.ballVel.set((Math.random() - 0.5) * 10, 3.5, -11);
      audio.playCricketHit('single');
    } else {
      this.state.wickets += 1;
      this.state.lastEvent = 'ক্যাচ আউট! ফিল্ডারের হাতে বল!';
      this.ballVel.set(6, 7, -6);
      audio.playCricketHit('miss');
    }

    this.checkInningEnd();
    this.bowlTimer = 2.0;
  }

  private checkInningEnd(): void {
    const maxBalls = this.state.maxOvers * 6;
    if (this.state.wickets >= 5 || this.state.ballsBowled >= maxBalls) {
      this.state.inningOver = true;
      this.state.lastEvent = `ইনিংস শেষ! মোট স্কোর: ${this.state.runs}/${this.state.wickets}`;
    }
  }

  public update(dt: number, audio: AudioManager): void {
    if (!this.state.active) return;

    if (this.ballPhase === 'idle' && !this.state.inningOver) {
      this.bowlTimer -= dt;
      if (this.bowlTimer <= 0) {
        this.ballPhase = 'bowling';
        this.ballPos.set(18 + (Math.random() - 0.5) * 0.4, 1.55, 57.5);
        this.ballVel.set(0, -1.3, 12.2);
        this.state.ballIncoming = true;
        this.state.timingProgress = 0;
        this.state.lastEvent = 'বল আসছে — এখনই ব্যাট চালান!';
      }
    } else if (this.ballPhase === 'bowling') {
      this.ballPos.addScaledVector(this.ballVel, dt);
      if (this.ballPos.y < 0.12) {
        this.ballPos.y = 0.12;
        this.ballVel.y = 3.2;
      } else {
        this.ballVel.y -= 9.5 * dt;
      }
      this.state.timingProgress = THREE.MathUtils.clamp((this.ballPos.z - 57.5) / 16.5, 0, 1);

      if (this.ballPos.z >= 75.0) {
        this.ballPhase = 'idle';
        this.state.ballIncoming = false;
        this.state.ballsBowled++;
        this.state.wickets++;
        this.state.lastEvent = 'বোল্ড আউট! স্টাম্প উড়ে গেছে!';
        audio.playCricketHit('miss');
        this.checkInningEnd();
        this.bowlTimer = 2.0;
      }
    } else if (this.ballPhase === 'hit') {
      this.ballPos.addScaledVector(this.ballVel, dt);
      this.ballVel.y -= 14 * dt;
      if (this.ballPos.y < 0.11) {
        this.ballPos.y = 0.11;
        this.ballVel.y = Math.abs(this.ballVel.y) * 0.4;
        this.ballVel.x *= 0.82;
        this.ballVel.z *= 0.82;
      }
      this.bowlTimer -= dt;
      if (this.bowlTimer <= 0) {
        this.ballPhase = 'idle';
        this.bowlTimer = 1.0;
      }
    }

    this.ballMesh.position.copy(this.ballPos);
  }
}
