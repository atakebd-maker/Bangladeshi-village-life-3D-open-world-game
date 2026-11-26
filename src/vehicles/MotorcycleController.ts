import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { makeWheel, VehicleEntity } from './VehicleController';

export class MotorcycleController {
  public static createTwoWheeler(
    id: string,
    kind: 'motorcycle' | 'sports_bike' | 'bicycle',
    x: number,
    z: number,
    rotY: number,
    colorHex: number,
    textures: TextureLibrary
  ): VehicleEntity {
    const label =
      kind === 'sports_bike'
        ? 'Sports Bike 150cc'
        : kind === 'bicycle'
          ? 'Village Bicycle'
          : 'Bangla Motorcycle 125cc';
    const veh = new VehicleEntity(
      {
        id,
        label,
        kind,
        maxSpeed: kind === 'sports_bike' ? 24 : kind === 'motorcycle' ? 19 : 9.5,
        accel: kind === 'sports_bike' ? 14 : kind === 'motorcycle' ? 11 : 6.5,
        turnRate: 2.2,
        wheelRadius: 0.34,
        seatOffset: [0, 0.75, -0.1],
        exitOffset: [-1.1, 0, 0],
      },
      x,
      z,
      rotY
    );

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 2.2),
      new THREE.MeshBasicMaterial({
        map: textures.contactShadow,
        transparent: true,
        depthWrite: false,
        opacity: 0.48,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    veh.group.add(shadow);

    const frameMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: kind === 'bicycle' ? 0.45 : 0.72,
      roughness: 0.28,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.85,
      roughness: 0.22,
    });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.86 });

    // Rear & Front Wheels
    const rearWheel = makeWheel(0.34, kind === 'bicycle' ? 0.06 : 0.14);
    rearWheel.position.set(0, 0.34, -0.68);
    veh.bodyGroup.add(rearWheel);
    veh.wheels.push(rearWheel);

    const steerPivot = new THREE.Group();
    steerPivot.position.set(0, 0.34, 0.68);
    const frontWheel = makeWheel(0.34, kind === 'bicycle' ? 0.06 : 0.13);
    steerPivot.add(frontWheel);
    veh.wheels.push(frontWheel);

    // Front Fork & Handlebar
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 8), metalMat);
    fork.position.set(0, 0.32, -0.05);
    fork.rotation.x = -0.25;
    steerPivot.add(fork);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.68, 8), metalMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 0.68, -0.14);
    steerPivot.add(handle);

    if (kind !== 'bicycle') {
      const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.08, 0.12, 10),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfef08a,
          emissiveIntensity: 0.4,
        })
      );
      lamp.rotation.x = Math.PI / 2;
      lamp.position.set(0, 0.56, 0.02);
      steerPivot.add(lamp);
    }

    veh.steerPivots.push(steerPivot);
    veh.bodyGroup.add(steerPivot);

    // Chassis / Tank / Seat
    if (kind === 'bicycle') {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6), frameMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(0, 0.68, 0);
      veh.bodyGroup.add(bar);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.28), seatMat);
      seat.position.set(0, 0.85, -0.22);
      veh.bodyGroup.add(seat);
    } else {
      const engine = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.55), metalMat);
      engine.position.set(0, 0.42, 0);
      engine.castShadow = true;
      veh.bodyGroup.add(engine);

      const tank = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.26, kind === 'sports_bike' ? 0.82 : 0.62),
        frameMat
      );
      tank.position.set(0, 0.78, 0.22);
      tank.castShadow = true;
      veh.bodyGroup.add(tank);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.68), seatMat);
      seat.position.set(0, 0.72, -0.3);
      seat.castShadow = true;
      veh.bodyGroup.add(seat);

      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.88, 8), metalMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(0.2, 0.3, -0.45);
      veh.bodyGroup.add(exhaust);
    }

    return veh;
  }
}
