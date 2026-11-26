import * as THREE from 'three';
import { BoxCollider } from '../buildings/HouseModels';
import { InputState, VehicleKind } from '../types/game';
import { groundHeightAt } from '../world/TerrainSystem';

export interface VehicleSpec {
  id: string;
  label: string;
  kind: VehicleKind;
  maxSpeed: number; // m/s
  accel: number;
  turnRate: number;
  wheelRadius: number;
  seatOffset: [number, number, number];
  exitOffset: [number, number, number];
}

export class VehicleEntity {
  public readonly id: string;
  public readonly label: string;
  public readonly kind: VehicleKind;
  public readonly spec: VehicleSpec;
  public readonly group = new THREE.Group();
  public readonly wheels: THREE.Object3D[] = [];
  public readonly steerPivots: THREE.Object3D[] = [];
  public headlight: THREE.SpotLight | null = null;
  public bodyGroup = new THREE.Group();

  public x: number;
  public y: number;
  public z: number;
  public rotationY: number;
  public speed = 0; // m/s
  public steerAngle = 0;
  public hasDriver = false;
  private suspensionPhase = 0;

  constructor(spec: VehicleSpec, x: number, z: number, rotY: number) {
    this.id = spec.id;
    this.label = spec.label;
    this.kind = spec.kind;
    this.spec = spec;
    this.x = x;
    this.y = groundHeightAt(x, z);
    this.z = z;
    this.rotationY = rotY;
    this.group.position.set(this.x, this.y, this.z);
    this.group.rotation.y = rotY;
    this.group.add(this.bodyGroup);
  }

  public getSpeedKmh(): number {
    return Math.abs(this.speed * 3.6);
  }

  public update(
    dt: number,
    input: InputState,
    colliders: BoxCollider[],
    isNight: boolean
  ): void {
    if (this.headlight) {
      this.headlight.intensity = isNight && this.hasDriver ? 3.5 : 0;
    }

    if (this.hasDriver) {
      const targetSteer = -input.steer * 0.52;
      this.steerAngle = THREE.MathUtils.damp(this.steerAngle, targetSteer, 10, dt);

      if (input.throttle > 0.05) {
        this.speed += this.spec.accel * input.throttle * dt;
      } else if (input.brake > 0.05) {
        if (this.speed > 0.5) {
          this.speed -= this.spec.accel * 1.9 * input.brake * dt;
        } else {
          this.speed -= this.spec.accel * 0.55 * input.brake * dt;
        }
      } else {
        this.speed = THREE.MathUtils.damp(this.speed, 0, 2.4, dt);
      }

      this.speed = THREE.MathUtils.clamp(
        this.speed,
        -this.spec.maxSpeed * 0.35,
        this.spec.maxSpeed
      );

      if (Math.abs(this.speed) > 0.15) {
        const dirSign = this.speed >= 0 ? 1 : -1;
        this.rotationY +=
          this.steerAngle * this.spec.turnRate * dirSign * Math.min(1, Math.abs(this.speed) / 4) * dt;
      }
    } else {
      this.speed = THREE.MathUtils.damp(this.speed, 0, 4, dt);
      this.steerAngle = THREE.MathUtils.damp(this.steerAngle, 0, 8, dt);
    }

    if (Math.abs(this.speed) > 0.02) {
      const fx = Math.sin(this.rotationY);
      const fz = Math.cos(this.rotationY);
      const nextX = THREE.MathUtils.clamp(this.x + fx * this.speed * dt, -146, 146);
      const nextZ = THREE.MathUtils.clamp(this.z + fz * this.speed * dt, -146, 146);

      if (this.canDriveAt(nextX, nextZ, colliders)) {
        this.x = nextX;
        this.z = nextZ;
      } else {
        this.speed *= -0.25;
      }
    }

    this.y = this.sampleRoadOrGround(this.x, this.z);
    this.group.position.set(this.x, this.y, this.z);
    this.group.rotation.y = this.rotationY;

    // Spin wheels & pivot front handlebars/steering wheels
    const wheelSpin = (this.speed * dt) / Math.max(0.15, this.spec.wheelRadius);
    for (const w of this.wheels) {
      w.rotation.x += wheelSpin;
    }
    for (const p of this.steerPivots) {
      p.rotation.y = this.steerAngle;
    }

    // Subtle suspension bounce when moving
    if (Math.abs(this.speed) > 0.4) {
      this.suspensionPhase += dt * (8 + Math.abs(this.speed) * 0.8);
      this.bodyGroup.position.y = Math.sin(this.suspensionPhase) * 0.018;
    } else {
      this.bodyGroup.position.y = THREE.MathUtils.damp(this.bodyGroup.position.y, 0, 10, dt);
    }
  }

  private sampleRoadOrGround(x: number, z: number): number {
    if (x >= 10.4 && x <= 13.6 && z >= -45 && z <= -31) {
      const t = (z - -38) / 7;
      return Math.cos(t * (Math.PI / 2)) * 0.72 + 0.16;
    }
    if (x >= 63.5 && x <= 72.5 && z >= -44.5 && z <= -31.5) {
      return 0.28;
    }
    return groundHeightAt(x, z);
  }

  private canDriveAt(x: number, z: number, colliders: BoxCollider[]): boolean {
    if (groundHeightAt(x, z) < -0.9 && !(x >= 63.5 && x <= 72.5 && z >= -44.5 && z <= -31.5)) {
      return false;
    }
    const r = 1.1;
    for (const c of colliders) {
      if (x + r > c.minX && x - r < c.maxX && z + r > c.minZ && z - r < c.maxZ) {
        return false;
      }
    }
    return true;
  }
}

export function makeWheel(radius: number, width: number, rimHex = 0xcbd5e1): THREE.Group {
  const g = new THREE.Group();
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, 16),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.88 })
  );
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true;
  g.add(tire);

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, width + 0.02, 12),
    new THREE.MeshStandardMaterial({ color: rimHex, metalness: 0.78, roughness: 0.28 })
  );
  rim.rotation.z = Math.PI / 2;
  g.add(rim);
  return g;
}
