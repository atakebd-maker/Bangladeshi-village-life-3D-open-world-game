import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { CarController } from './CarController';
import { MotorcycleController } from './MotorcycleController';
import { RickshawController } from './RickshawController';
import { VehicleEntity } from './VehicleController';

interface TrafficUnit {
  entity: VehicleEntity;
  axis: 'z' | 'x';
  dir: 1 | -1;
  laneCoord: number;
  minBound: number;
  maxBound: number;
  cruiseSpeed: number;
  hitRadius: number;
}

export class TrafficSystem {
  public readonly group = new THREE.Group();
  public readonly units: TrafficUnit[] = [];

  constructor(textures: TextureLibrary) {
    const addUnit = (
      entity: VehicleEntity,
      axis: 'z' | 'x',
      dir: 1 | -1,
      laneCoord: number,
      minBound: number,
      maxBound: number,
      cruiseSpeed: number,
      hitRadius: number
    ) => {
      entity.rotationY =
        axis === 'z' ? (dir === 1 ? 0 : Math.PI) : dir === 1 ? Math.PI / 2 : -Math.PI / 2;
      this.group.add(entity.group);
      this.units.push({
        entity,
        axis,
        dir,
        laneCoord,
        minBound,
        maxBound,
        cruiseSpeed,
        hitRadius,
      });
    };

    // Paved Highway Northbound & Southbound Traffic (x = 66.0 and x = 70.0)
    addUnit(
      CarController.createFourWheeler('traf-bus', 'local_bus', 66, -110, 0, 0x15803d, textures),
      'z',
      1,
      66,
      -135,
      135,
      11.5,
      2.3
    );
    addUnit(
      CarController.createFourWheeler('traf-truck', 'truck', 70, 95, Math.PI, 0xd97706, textures),
      'z',
      -1,
      70,
      -135,
      135,
      10.0,
      2.2
    );
    addUnit(
      CarController.createFourWheeler('traf-car', 'car', 66, 20, 0, 0x2563eb, textures),
      'z',
      1,
      66,
      -135,
      135,
      13.5,
      1.85
    );
    addUnit(
      RickshawController.createThreeOrEasyBike('traf-cng', 'cng', 70, -45, Math.PI, textures),
      'z',
      -1,
      70,
      -135,
      135,
      9.2,
      1.5
    );

    // Main Village Road Traffic (z = 6 East-West)
    addUnit(
      RickshawController.createThreeOrEasyBike('traf-rickshaw', 'cycle_rickshaw', -35, 6, Math.PI / 2, textures),
      'x',
      1,
      6,
      -54,
      58,
      5.8,
      1.35
    );
    addUnit(
      MotorcycleController.createTwoWheeler('traf-moto', 'motorcycle', 32, 4.8, -Math.PI / 2, 0xdc2626, textures),
      'x',
      -1,
      4.8,
      -54,
      58,
      8.6,
      1.25
    );
  }

  public update(
    dt: number,
    playerX: number,
    playerZ: number,
    isDriving: boolean,
    isNight: boolean,
    onPlayerHit: (vehicleLabel: string) => void
  ): void {
    for (const u of this.units) {
      const e = u.entity;
      e.speed = u.cruiseSpeed;

      if (u.axis === 'z') {
        e.z += u.dir * u.cruiseSpeed * dt;
        e.x = u.laneCoord;
        if (e.z > u.maxBound) e.z = u.minBound;
        if (e.z < u.minBound) e.z = u.maxBound;
      } else {
        e.x += u.dir * u.cruiseSpeed * dt;
        e.z = u.laneCoord;
        if (e.x > u.maxBound) e.x = u.minBound;
        if (e.x < u.minBound) e.x = u.maxBound;
      }

      e.group.position.set(e.x, e.y, e.z);
      e.group.rotation.y = e.rotationY;

      const spin = (u.cruiseSpeed * dt) / Math.max(0.2, e.spec.wheelRadius);
      for (const w of e.wheels) {
        w.rotation.x += spin;
      }
      if (e.headlight) {
        e.headlight.intensity = isNight ? 3.2 : 0;
      }

      // Check collision with player on foot
      if (!isDriving) {
        const dist = Math.hypot(playerX - e.x, playerZ - e.z);
        if (dist < u.hitRadius) {
          onPlayerHit(e.label);
        }
      }
    }
  }
}
