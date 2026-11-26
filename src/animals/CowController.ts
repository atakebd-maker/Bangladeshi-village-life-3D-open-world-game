import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { groundHeightAt } from '../world/TerrainSystem';

export interface AnimalActor {
  group: THREE.Group;
  kind: 'cow' | 'calf' | 'buffalo' | 'goat' | 'chicken' | 'duck' | 'dog' | 'cat' | 'bird';
  homeX: number;
  homeZ: number;
  x: number;
  z: number;
  rotY: number;
  targetX: number;
  targetZ: number;
  waitTimer: number;
  phase: number;
  legs: THREE.Object3D[];
}

export class CowController {
  public static createBovine(
    kind: 'cow' | 'calf' | 'buffalo',
    x: number,
    z: number,
    textures: TextureLibrary
  ): AnimalActor {
    const g = new THREE.Group();
    const scale = kind === 'calf' ? 0.62 : kind === 'buffalo' ? 1.15 : 1.0;
    const coatHex = kind === 'buffalo' ? 0x27272a : kind === 'calf' ? 0xd97706 : 0xb45309;
    const coatMat = new THREE.MeshStandardMaterial({ color: coatHex, roughness: 0.85 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.65 });

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6 * scale, 2.2 * scale),
      new THREE.MeshBasicMaterial({
        map: textures.contactShadow,
        transparent: true,
        depthWrite: false,
        opacity: 0.45,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    g.add(shadow);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.72 * scale, 0.72 * scale, 1.5 * scale), coatMat);
    body.position.set(0, 0.92 * scale, 0);
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.44 * scale, 0.42 * scale, 0.52 * scale), coatMat);
    head.position.set(0, 1.08 * scale, 0.92 * scale);
    head.castShadow = true;
    g.add(head);

    for (const hx of [-0.18 * scale, 0.18 * scale]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05 * scale, 0.28 * scale, 6), hornMat);
      horn.position.set(hx, 1.32 * scale, 0.88 * scale);
      horn.rotation.z = hx < 0 ? 0.5 : -0.5;
      g.add(horn);
    }

    const legs: THREE.Object3D[] = [];
    const legGeo = new THREE.CylinderGeometry(0.08 * scale, 0.065 * scale, 0.72 * scale, 7);
    for (const [lx, lz] of [
      [-0.24 * scale, 0.52 * scale],
      [0.24 * scale, 0.52 * scale],
      [-0.24 * scale, -0.52 * scale],
      [0.24 * scale, -0.52 * scale],
    ]) {
      const leg = new THREE.Mesh(legGeo, coatMat);
      leg.position.set(lx, 0.36 * scale, lz);
      leg.castShadow = true;
      g.add(leg);
      legs.push(leg);
    }

    g.position.set(x, groundHeightAt(x, z), z);
    return {
      group: g,
      kind,
      homeX: x,
      homeZ: z,
      x,
      z,
      rotY: Math.random() * Math.PI * 2,
      targetX: x,
      targetZ: z,
      waitTimer: 2 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      legs,
    };
  }
}
