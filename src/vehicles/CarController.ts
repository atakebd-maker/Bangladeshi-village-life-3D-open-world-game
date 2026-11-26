import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { makeWheel, VehicleEntity } from './VehicleController';

export class CarController {
  public static createFourWheeler(
    id: string,
    kind: 'car' | 'jeep' | 'pickup' | 'microbus' | 'local_bus' | 'truck',
    x: number,
    z: number,
    rotY: number,
    colorHex: number,
    textures: TextureLibrary
  ): VehicleEntity {
    const isHeavy = kind === 'local_bus' || kind === 'truck';
    const isMedium = kind === 'microbus' || kind === 'pickup' || kind === 'jeep';
    const w = isHeavy ? 2.35 : 1.85;
    const len = kind === 'local_bus' ? 7.2 : kind === 'truck' ? 6.2 : kind === 'microbus' ? 4.6 : 4.1;
    const wheelR = isHeavy ? 0.46 : 0.36;

    const labelMap: Record<typeof kind, string> = {
      car: 'Sedan Car',
      jeep: 'Patrol Jeep 4x4',
      pickup: 'Cargo Pickup',
      microbus: 'Village Microbus',
      local_bus: 'Bangla Highway Bus',
      truck: 'Cargo Truck',
    };

    const veh = new VehicleEntity(
      {
        id,
        label: labelMap[kind],
        kind,
        maxSpeed: isHeavy ? 17 : kind === 'car' ? 23 : 20,
        accel: isHeavy ? 7.5 : 11.5,
        turnRate: isHeavy ? 1.55 : 2.0,
        wheelRadius: wheelR,
        seatOffset: [-0.45, wheelR + 0.55, len * 0.2],
        exitOffset: [-(w * 0.85), 0, 0],
      },
      x,
      z,
      rotY
    );

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 0.8, len + 0.9),
      new THREE.MeshBasicMaterial({
        map: textures.contactShadow,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.025;
    veh.group.add(shadow);

    const paintMat = new THREE.MeshPhysicalMaterial({
      color: colorHex,
      metalness: 0.55,
      roughness: 0.32,
      clearcoat: 0.75,
      clearcoatRoughness: 0.15,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: 0.72,
    });
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

    const axleZ = len * 0.32;
    const trackX = w * 0.48;
    // Rear wheels
    for (const wx of [-trackX, trackX]) {
      const rw = makeWheel(wheelR, isHeavy ? 0.28 : 0.22);
      rw.position.set(wx, wheelR, -axleZ);
      veh.bodyGroup.add(rw);
      veh.wheels.push(rw);
    }
    // Front steerable wheels
    for (const wx of [-trackX, trackX]) {
      const piv = new THREE.Group();
      piv.position.set(wx, wheelR, axleZ);
      const fw = makeWheel(wheelR, isHeavy ? 0.28 : 0.22);
      piv.add(fw);
      veh.wheels.push(fw);
      veh.steerPivots.push(piv);
      veh.bodyGroup.add(piv);
    }

    if (kind === 'local_bus' || kind === 'microbus') {
      const bodyH = kind === 'local_bus' ? 2.25 : 1.55;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, bodyH, len), paintMat);
      body.position.set(0, wheelR + bodyH / 2 + 0.08, 0);
      body.castShadow = true;
      veh.bodyGroup.add(body);

      // Side Stripe
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.04, 0.24, len + 0.02),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 })
      );
      stripe.position.set(0, wheelR + bodyH * 0.42, 0);
      veh.bodyGroup.add(stripe);

      // Windows Band
      const windows = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.03, bodyH * 0.34, len * 0.86),
        glassMat
      );
      windows.position.set(0, wheelR + bodyH * 0.72, 0.1);
      veh.bodyGroup.add(windows);

      if (kind === 'local_bus') {
        const rack = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.18, len * 0.72), bumperMat);
        rack.position.set(0, wheelR + bodyH + 0.18, -0.3);
        veh.bodyGroup.add(rack);
      }
    } else if (kind === 'truck' || kind === 'pickup') {
      const cabH = kind === 'truck' ? 1.8 : 1.25;
      const cabLen = kind === 'truck' ? 2.1 : 1.75;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(w, cabH, cabLen), paintMat);
      cab.position.set(0, wheelR + cabH / 2 + 0.1, len * 0.5 - cabLen / 2 - 0.1);
      cab.castShadow = true;
      veh.bodyGroup.add(cab);

      const wind = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, cabH * 0.4, 0.08), glassMat);
      wind.position.set(0, wheelR + cabH * 0.75, len * 0.5 - 0.08);
      veh.bodyGroup.add(wind);

      const bedLen = len - cabLen - 0.3;
      const bedMat = new THREE.MeshStandardMaterial({
        map: textures.woodPlank,
        color: kind === 'truck' ? 0xd97706 : colorHex,
        roughness: 0.78,
      });
      const bed = new THREE.Mesh(
        new THREE.BoxGeometry(w, kind === 'truck' ? 1.25 : 0.65, bedLen),
        bedMat
      );
      bed.position.set(0, wheelR + (kind === 'truck' ? 0.75 : 0.48), -len * 0.5 + bedLen / 2 + 0.1);
      bed.castShadow = true;
      veh.bodyGroup.add(bed);
    } else {
      // Car / Jeep
      const lower = new THREE.Mesh(new THREE.BoxGeometry(w, 0.66, len), paintMat);
      lower.position.set(0, wheelR + 0.36, 0);
      lower.castShadow = true;
      veh.bodyGroup.add(lower);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.86, isMedium ? 0.78 : 0.62, len * 0.52),
        glassMat
      );
      cabin.position.set(0, wheelR + 0.96, -0.15);
      cabin.castShadow = true;
      veh.bodyGroup.add(cabin);
    }

    // Headlight SpotLight (turned on when driving at night)
    const headSpot = new THREE.SpotLight(0xfef9c3, 0, 28, Math.PI / 5, 0.45, 1.4);
    headSpot.position.set(0, wheelR + 0.6, len * 0.5);
    const target = new THREE.Object3D();
    target.position.set(0, 0.2, len * 0.5 + 14);
    veh.bodyGroup.add(target);
    headSpot.target = target;
    veh.bodyGroup.add(headSpot);
    veh.headlight = headSpot;

    return veh;
  }
}
