import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { groundHeightAt } from '../world/TerrainSystem';
import { ChickenController } from './ChickenController';
import { AnimalActor, CowController } from './CowController';
import { GoatController } from './GoatController';

export class AnimalAI {
  public readonly group = new THREE.Group();
  public readonly animals: AnimalActor[] = [];

  constructor(textures: TextureLibrary) {
    const add = (a: AnimalActor) => {
      this.animals.push(a);
      this.group.add(a.group);
    };

    // Cows, Calves & Buffaloes grazing near homesteads & paddy fields
    add(CowController.createBovine('cow', -34, 14, textures));
    add(CowController.createBovine('calf', -32, 16, textures));
    add(CowController.createBovine('cow', 95, 22, textures));
    add(CowController.createBovine('buffalo', -48, -18, textures));
    add(CowController.createBovine('buffalo', -52, 42, textures));

    // Goats, Village Dogs & Cats
    add(GoatController.createQuadruped('goat', -18, -14, 0xf1f5f9, textures));
    add(GoatController.createQuadruped('goat', -22, 44, 0x334155, textures));
    add(GoatController.createQuadruped('goat', 28, -50, 0x92400e, textures));
    add(GoatController.createQuadruped('dog', -8, 2, 0xb45309, textures));
    add(GoatController.createQuadruped('dog', 36, 10, 0xd6d3d1, textures));
    add(GoatController.createQuadruped('cat', -15, -7, 0xf59e0b, textures));

    // Chickens scratching in courtyards
    for (const [cx, cz, col] of [
      [-14, -7, 0xfef3c7],
      [-15, -6, 0xb45309],
      [-23, 51, 0xf8fafc],
      [31, -55, 0x7c2d12],
    ] as Array<[number, number, number]>) {
      add(ChickenController.createBirdActor('chicken', cx, cz, col));
    }

    // Ducks swimming inside the Village Pond (-26, 22)
    for (const [dx, dz] of [
      [-24, 20],
      [-28, 24],
      [-23, 25],
    ]) {
      add(ChickenController.createBirdActor('duck', dx, dz, 0xf8fafc));
    }

    // Soaring Village Birds over the river & paddy fields
    for (let i = 0; i < 8; i++) {
      add(
        ChickenController.createBirdActor(
          'bird',
          -35 + i * 16,
          -40 + (i % 3) * 35,
          0xf1f5f9
        )
      );
    }
  }

  public update(dt: number, elapsed: number, playerX: number, playerZ: number): void {
    for (const a of this.animals) {
      if (a.kind === 'bird') {
        a.phase += dt * 1.4;
        const r = 18;
        a.x = a.homeX + Math.cos(a.phase * 0.45) * r;
        a.z = a.homeZ + Math.sin(a.phase * 0.45) * r;
        a.group.position.set(a.x, 14 + Math.sin(elapsed * 2 + a.phase) * 0.8, a.z);
        a.group.rotation.y = -a.phase * 0.45;
        const flap = Math.sin(elapsed * 9 + a.phase) * 0.35;
        if (a.legs[0]) a.legs[0].rotation.z = flap;
        if (a.legs[1]) a.legs[1].rotation.z = -flap;
        continue;
      }

      if (a.waitTimer > 0) {
        a.waitTimer -= dt;
        // Scatter gently if player walks right onto small animals
        if ((a.kind === 'chicken' || a.kind === 'goat') && Math.hypot(playerX - a.x, playerZ - a.z) < 2.2) {
          a.waitTimer = 0;
          a.targetX = a.homeX + (Math.random() - 0.5) * 9;
          a.targetZ = a.homeZ + (Math.random() - 0.5) * 9;
        }
        continue;
      }

      const dx = a.targetX - a.x;
      const dz = a.targetZ - a.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.4) {
        a.waitTimer = 2 + Math.random() * 5;
        const roam = a.kind === 'duck' ? 5 : 8;
        a.targetX = a.homeX + (Math.random() - 0.5) * roam * 2;
        a.targetZ = a.homeZ + (Math.random() - 0.5) * roam * 2;
        continue;
      }

      const speed = a.kind === 'dog' ? 2.1 : a.kind === 'chicken' ? 1.5 : 1.05;
      a.x += (dx / dist) * speed * dt;
      a.z += (dz / dist) * speed * dt;
      a.rotY = Math.atan2(dx, dz);
      const gy = a.kind === 'duck' ? -0.88 : groundHeightAt(a.x, a.z);
      a.group.position.set(a.x, gy, a.z);
      a.group.rotation.y = a.rotY;

      a.phase += dt * 7;
      for (let i = 0; i < a.legs.length; i++) {
        a.legs[i].rotation.x = Math.sin(a.phase + i * Math.PI * 0.5) * 0.35;
      }
    }
  }
}
