import { VehicleEntity } from '../vehicles/VehicleController';
import { groundHeightAt } from '../world/TerrainSystem';

export type NpcActivity = 'walk' | 'sit' | 'work' | 'talk' | 'cycle' | 'cricket';

export interface NpcWaypoint {
  x: number;
  z: number;
}

export class NPCBehaviour {
  public activity: NpcActivity;
  public waypoints: NpcWaypoint[];
  public wpIndex = 0;
  public pauseTimer = 0;

  constructor(activity: NpcActivity, waypoints: NpcWaypoint[]) {
    this.activity = activity;
    this.waypoints = waypoints;
  }

  public step(
    dt: number,
    x: number,
    z: number,
    rotY: number,
    playerX: number,
    playerZ: number,
    vehicles: VehicleEntity[]
  ): { x: number; y: number; z: number; rotY: number; moving: boolean } {
    // React / step aside if a moving vehicle approaches closely
    for (const v of vehicles) {
      if (Math.abs(v.speed) > 1.5) {
        const dx = x - v.x;
        const dz = z - v.z;
        const d = Math.hypot(dx, dz);
        if (d < 4.5 && d > 0.01) {
          const nx = x + (dx / d) * 3.8 * dt;
          const nz = z + (dz / d) * 3.8 * dt;
          return { x: nx, y: groundHeightAt(nx, nz), z: nz, rotY: Math.atan2(dx, dz), moving: true };
        }
      }
    }

    if (this.activity === 'sit' || this.activity === 'work' || this.activity === 'cricket') {
      return { x, y: groundHeightAt(x, z), z, rotY, moving: false };
    }

    // Pause briefly if player stands right in front to chat
    if (Math.hypot(playerX - x, playerZ - z) < 2.6) {
      const lookRot = Math.atan2(playerX - x, playerZ - z);
      return { x, y: groundHeightAt(x, z), z, rotY: lookRot, moving: false };
    }

    if (this.waypoints.length < 2) {
      return { x, y: groundHeightAt(x, z), z, rotY, moving: false };
    }

    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      return { x, y: groundHeightAt(x, z), z, rotY, moving: false };
    }

    const target = this.waypoints[this.wpIndex];
    const dx = target.x - x;
    const dz = target.z - z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.7) {
      this.wpIndex = (this.wpIndex + 1) % this.waypoints.length;
      if (this.activity === 'talk') this.pauseTimer = 3.0;
      return { x, y: groundHeightAt(x, z), z, rotY, moving: false };
    }

    const speed = this.activity === 'cycle' ? 4.2 : 1.75;
    const nx = x + (dx / dist) * speed * dt;
    const nz = z + (dz / dist) * speed * dt;
    const nextRot = Math.atan2(dx, dz);
    return { x: nx, y: groundHeightAt(nx, nz), z: nz, rotY: nextRot, moving: true };
  }
}
