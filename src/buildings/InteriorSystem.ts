import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { groundHeightAt } from '../world/TerrainSystem';

export interface SitSpot {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export class InteriorSystem {
  public static createBench(
    id: string,
    label: string,
    x: number,
    z: number,
    rotY: number,
    textures: TextureLibrary,
    sitSpots: SitSpot[]
  ): THREE.Group {
    const g = new THREE.Group();
    const gy = groundHeightAt(x, z);
    g.position.set(x, gy, z);
    g.rotation.y = rotY;

    const woodMat = new THREE.MeshStandardMaterial({
      map: textures.woodPlank,
      color: 0x7c4d2b,
      roughness: 0.82,
    });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3f2e21, roughness: 0.9 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.09, 0.52), woodMat);
    seat.position.y = 0.48;
    seat.castShadow = true;
    seat.receiveShadow = true;
    g.add(seat);

    for (const lx of [-0.82, 0.82]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.48, 0.44), legMat);
      leg.position.set(lx, 0.24, 0);
      leg.castShadow = true;
      g.add(leg);
    }

    sitSpots.push({ id, label, x, y: gy + 0.52, z, rotY });
    return g;
  }

  public static createCharpoi(
    id: string,
    x: number,
    z: number,
    rotY: number,
    textures: TextureLibrary,
    sitSpots: SitSpot[]
  ): THREE.Group {
    const g = new THREE.Group();
    const gy = groundHeightAt(x, z);
    g.position.set(x, gy, z);
    g.rotation.y = rotY;

    const frameMat = new THREE.MeshStandardMaterial({ map: textures.woodPlank, roughness: 0.85 });
    const weaveMat = new THREE.MeshStandardMaterial({ map: textures.bambooWeave, roughness: 0.92 });

    const mat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.05), weaveMat);
    mat.position.y = 0.48;
    mat.castShadow = true;
    g.add(mat);

    for (const [lx, lz] of [
      [-0.86, -0.45],
      [0.86, -0.45],
      [-0.86, 0.45],
      [0.86, 0.45],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.5, 8), frameMat);
      leg.position.set(lx, 0.25, lz);
      g.add(leg);
    }

    sitSpots.push({ id, label: 'Sit on Bamboo Charpoi', x, y: gy + 0.52, z, rotY });
    return g;
  }
}
