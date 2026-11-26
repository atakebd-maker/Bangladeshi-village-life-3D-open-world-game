import * as THREE from 'three';
import { groundHeightAt } from '../world/TerrainSystem';
import { AnimalActor } from './CowController';

export class ChickenController {
  public static createBirdActor(
    kind: 'chicken' | 'duck' | 'bird',
    x: number,
    z: number,
    colorHex: number
  ): AnimalActor {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.78 });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });

    if (kind === 'bird') {
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.48, 6), bodyMat);
      body.rotation.x = Math.PI / 2;
      g.add(body);

      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.18), bodyMat);
      wingL.position.x = -0.32;
      const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.18), bodyMat);
      wingR.position.x = 0.32;
      g.add(wingL, wingR);

      g.position.set(x, 12 + Math.random() * 5, z);
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
        waitTimer: 0,
        phase: Math.random() * Math.PI * 2,
        legs: [wingL, wingR],
      };
    }

    const s = kind === 'duck' ? 1.1 : 0.9;
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.2 * s, 10, 8), bodyMat);
    body.scale.set(0.85, 0.85, 1.3);
    body.position.y = kind === 'duck' ? 0.12 : 0.28;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 8, 8), bodyMat);
    head.position.set(0, (kind === 'duck' ? 0.34 : 0.48), 0.18 * s);
    g.add(head);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, (kind === 'duck' ? 0.33 : 0.47), 0.3 * s);
    g.add(beak);

    g.position.set(x, kind === 'duck' ? -0.88 : groundHeightAt(x, z), z);
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
      waitTimer: 1 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      legs: [],
    };
  }
}
