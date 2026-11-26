import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';
import { FootballHudState } from '../types/game';

export class FootballSystem {
  public readonly ballMesh: THREE.Mesh;
  public state: FootballHudState = {
    active: false,
    goals: 0,
    shots: 0,
    lastEvent: 'Dribble or kick the ball into either goal!',
  };

  private pos = new THREE.Vector3(-34, 0.22, 88);
  private vel = new THREE.Vector3();

  constructor() {
    this.ballMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 })
    );
    this.ballMesh.position.copy(this.pos);
    this.ballMesh.castShadow = true;
  }

  public kick(playerX: number, playerZ: number, playerRotY: number, audio: AudioManager): void {
    const dist = Math.hypot(this.pos.x - playerX, this.pos.z - playerZ);
    if (dist > 2.6) return;
    const fx = Math.sin(playerRotY);
    const fz = Math.cos(playerRotY);
    this.vel.set(fx * 14, 4.2, fz * 14);
    this.state.shots++;
    this.state.lastEvent = 'Shot fired!';
    audio.playPunchOrKick(true);
  }

  public update(dt: number, playerX: number, playerZ: number, playerSpeed: number): void {
    const distToPitch = Math.hypot(playerX - -34, playerZ - 88);
    this.state.active = distToPitch < 24;

    // Gentle dribble when walking into the ball
    const dx = this.pos.x - playerX;
    const dz = this.pos.z - playerZ;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.72 && dist > 0.01) {
      const push = Math.max(2.5, playerSpeed * 1.25);
      this.vel.x = (dx / dist) * push;
      this.vel.z = (dz / dist) * push;
    }

    this.pos.addScaledVector(this.vel, dt);
    this.vel.y -= 14 * dt;
    if (this.pos.y < 0.22) {
      this.pos.y = 0.22;
      this.vel.y = Math.abs(this.vel.y) > 1.2 ? -this.vel.y * 0.45 : 0;
      this.vel.x *= Math.exp(-dt * 2.2);
      this.vel.z *= Math.exp(-dt * 2.2);
    }

    this.ballMesh.rotation.x += this.vel.z * dt * 2.5;
    this.ballMesh.rotation.z -= this.vel.x * dt * 2.5;

    // Goal check at x < -51 or x > -17 within z in [85.4, 90.6]
    if ((this.pos.x < -51 || this.pos.x > -17) && this.pos.z > 85.4 && this.pos.z < 90.6) {
      this.state.goals++;
      this.state.lastEvent = `GOAL! Total Village Goals: ${this.state.goals}`;
      this.pos.set(-34, 0.22, 88);
      this.vel.set(0, 0, 0);
    }

    // Keep ball inside pitch outer bounds
    if (this.pos.x < -54 || this.pos.x > -14 || this.pos.z < 75 || this.pos.z > 101) {
      this.pos.set(-34, 0.22, 88);
      this.vel.set(0, 0, 0);
    }

    this.ballMesh.position.copy(this.pos);
  }
}
