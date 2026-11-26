import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { makeWheel, VehicleEntity } from './VehicleController';

export class RickshawController {
  public static createThreeOrEasyBike(
    id: string,
    kind: 'cycle_rickshaw' | 'cng' | 'auto_rickshaw' | 'easy_bike',
    x: number,
    z: number,
    rotY: number,
    textures: TextureLibrary
  ): VehicleEntity {
    const labelMap: Record<typeof kind, string> = {
      cycle_rickshaw: 'Cycle Rickshaw',
      cng: 'Green CNG Auto',
      auto_rickshaw: 'Auto-Rickshaw',
      easy_bike: 'Battery Easy Bike',
    };
    const veh = new VehicleEntity(
      {
        id,
        label: labelMap[kind],
        kind,
        maxSpeed: kind === 'cycle_rickshaw' ? 8.5 : kind === 'easy_bike' ? 12.5 : 16.5,
        accel: kind === 'cycle_rickshaw' ? 5.5 : 9.0,
        turnRate: 2.35,
        wheelRadius: kind === 'easy_bike' ? 0.26 : 0.34,
        seatOffset: [0, 0.82, 0.35],
        exitOffset: [-1.45, 0, 0],
      },
      x,
      z,
      rotY
    );

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 3.0),
      new THREE.MeshBasicMaterial({
        map: textures.contactShadow,
        transparent: true,
        depthWrite: false,
        opacity: 0.52,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    veh.group.add(shadow);

    const bodyHex =
      kind === 'cng'
        ? 0x15803d
        : kind === 'auto_rickshaw'
          ? 0x0f766e
          : kind === 'easy_bike'
            ? 0x1d4ed8
            : 0xdc2626;
    const hoodHex =
      kind === 'cng' ? 0xfacc15 : kind === 'cycle_rickshaw' ? 0x16a34a : 0x1e293b;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyHex,
      metalness: 0.45,
      roughness: 0.38,
    });
    const hoodMat = new THREE.MeshStandardMaterial({ color: hoodHex, roughness: 0.72 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    const r = kind === 'easy_bike' ? 0.26 : 0.34;
    if (kind === 'easy_bike') {
      // 4 wheels
      for (const [wx, wz] of [
        [-0.58, -0.95],
        [0.58, -0.95],
      ]) {
        const w = makeWheel(r, 0.14);
        w.position.set(wx, r, wz);
        veh.bodyGroup.add(w);
        veh.wheels.push(w);
      }
      for (const [wx, wz] of [
        [-0.55, 0.95],
        [0.55, 0.95],
      ]) {
        const p = new THREE.Group();
        p.position.set(wx, r, wz);
        const w = makeWheel(r, 0.14);
        p.add(w);
        veh.wheels.push(w);
        veh.steerPivots.push(p);
        veh.bodyGroup.add(p);
      }
    } else {
      // 3 wheels (2 rear, 1 front steering)
      for (const wx of [-0.62, 0.62]) {
        const w = makeWheel(r, kind === 'cycle_rickshaw' ? 0.07 : 0.15);
        w.position.set(wx, r, -0.78);
        veh.bodyGroup.add(w);
        veh.wheels.push(w);
      }
      const frontPivot = new THREE.Group();
      frontPivot.position.set(0, r, 0.96);
      const fw = makeWheel(r, kind === 'cycle_rickshaw' ? 0.07 : 0.15);
      frontPivot.add(fw);
      veh.wheels.push(fw);
      veh.steerPivots.push(frontPivot);
      veh.bodyGroup.add(frontPivot);
    }

    // Chassis & Passenger Cabin
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 0.14, kind === 'easy_bike' ? 2.4 : 1.7),
      frameMat
    );
    deck.position.set(0, r + 0.1, -0.2);
    deck.castShadow = true;
    veh.bodyGroup.add(deck);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.24, 0.65, kind === 'easy_bike' ? 1.85 : 1.05),
      bodyMat
    );
    cabin.position.set(0, r + 0.48, -0.45);
    cabin.castShadow = true;
    veh.bodyGroup.add(cabin);

    // Colorful Roof / Folding Hood
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.12, kind === 'easy_bike' ? 2.45 : 1.55),
      hoodMat
    );
    roof.position.set(0, r + 1.48, -0.22);
    roof.castShadow = true;
    veh.bodyGroup.add(roof);

    // Roof Supports
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.05, 6);
    for (const [px, pz] of [
      [-0.58, -0.92],
      [0.58, -0.92],
      [-0.58, 0.38],
      [0.58, 0.38],
    ]) {
      const p = new THREE.Mesh(postGeo, frameMat);
      p.position.set(px, r + 0.96, pz);
      veh.bodyGroup.add(p);
    }

    // CNG / Auto Front Nose & Windshield
    if (kind !== 'cycle_rickshaw') {
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.72, 0.55), bodyMat);
      nose.position.set(0, r + 0.45, 0.85);
      nose.castShadow = true;
      veh.bodyGroup.add(nose);

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.48, 0.06),
        new THREE.MeshPhysicalMaterial({
          color: 0xbae6fd,
          roughness: 0.1,
          transparent: true,
          opacity: 0.65,
        })
      );
      glass.position.set(0, r + 1.08, 0.65);
      glass.rotation.x = -0.22;
      veh.bodyGroup.add(glass);
    }

    return veh;
  }
}
