import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { groundHeightAt } from '../world/TerrainSystem';
import { AnimalActor } from './CowController';

export class GoatController {
  public static createQuadruped(
    kind: 'goat' | 'dog' | 'cat',
    x: number,
    z: number,
    colorHex: number,
    textures: TextureLibrary
  ): AnimalActor {
    const g = new THREE.Group();
    const s = kind === 'cat' ? 0.52 : kind === 'dog' ? 0.76 : 0.72;
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.85 });

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95 * s, 1.3 * s),
      new THREE.MeshBasicMaterial({
        map: textures.contactShadow,
        transparent: true,
        depthWrite: false,
        opacity: 0.4,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    g.add(shadow);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42 * s, 0.42 * s, 0.92 * s), mat);
    body.position.set(0, 0.62 * s, 0);
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.28 * s, 0.28 * s, 0.36 * s), mat);
    head.position.set(0, 0.86 * s, 0.52 * s);
    head.castShadow = true;
    g.add(head);

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * s, 0.04 * s, 0.36 * s, 6), mat);
    tail.position.set(0, 0.76 * s, -0.52 * s);
    tail.rotation.x = -0.6;
    g.add(tail);

    const legs: THREE.Object3D[] = [];
    const legGeo = new THREE.CylinderGeometry(0.05 * s, 0.04 * s, 0.45 * s, 6);
    for (const [lx, lz] of [
      [-0.14 * s, 0.32 * s],
      [0.14 * s, 0.32 * s],
      [-0.14 * s, -0.32 * s],
      [0.14 * s, -0.32 * s],
    ]) {
      const l = new THREE.Mesh(legGeo, mat);
      l.position.set(lx, 0.225 * s, lz);
      l.castShadow = true;
      g.add(l);
      legs.push(l);
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
      waitTimer: 1 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      legs,
    };
  }
}
