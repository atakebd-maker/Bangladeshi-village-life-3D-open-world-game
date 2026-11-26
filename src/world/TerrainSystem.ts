import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';

export function riverBankX(z: number): number {
  return -72 + Math.sin(z * 0.024) * 8;
}

export function groundHeightAt(x: number, z: number): number {
  // Padma river channel on west
  const bank = riverBankX(z);
  if (x < bank + 5) {
    const t = THREE.MathUtils.clamp((bank + 5 - x) / 14, 0, 1);
    return -2.4 * t;
  }

  // Irrigation canal along z = -38 from river to x = 115
  if (x < 115) {
    const canalDist = Math.abs(z - (-38 + Math.sin(x * 0.03) * 2.2));
    if (canalDist < 5.5) {
      const t = THREE.MathUtils.clamp((5.5 - canalDist) / 3.5, 0, 1);
      return -2.1 * t;
    }
  }

  // Village pond centered at (-26, 22)
  const pondDist = Math.hypot(x - -26, z - 22);
  if (pondDist < 15.5) {
    const t = THREE.MathUtils.clamp((15.5 - pondDist) / 5.0, 0, 1);
    return -2.2 * t;
  }

  // Keep roads, bazaar, cricket & football fields flat at y = 0
  if (
    Math.abs(x - 68) < 8 ||
    (Math.abs(z - 6) < 7 && x > -68 && x < 74) ||
    (Math.abs(x - 12) < 6 && z > -105 && z < 105) ||
    Math.hypot(x - 18, z - 66) < 30 ||
    (Math.abs(x + 34) < 24 && Math.abs(z - 88) < 16) ||
    (x > 22 && x < 62 && z > -14 && z < 36)
  ) {
    return 0;
  }

  // Gentle organic micro-undulation outside flat areas
  const hill =
    Math.sin(x * 0.025) * Math.cos(z * 0.025) * 0.35 +
    Math.sin(x * 0.06 + z * 0.04) * 0.12;
  return Math.max(-0.1, hill);
}

export function getLocationName(x: number, z: number): string {
  if (x < riverBankX(z) + 12) return 'Padma River Bank';
  if (Math.hypot(x - -26, z - 22) < 20) return 'Village Pond (Pukur)';
  if (Math.hypot(x - 18, z - 66) < 32) return 'Village Cricket Field';
  if (Math.abs(x + 34) < 24 && Math.abs(z - 88) < 16) return 'Village Football Ground';
  if (x > 24 && x < 62 && z > -14 && z < 38) return 'Village Bazaar';
  if (Math.hypot(x - 24, z + 18) < 18) return 'Shanti Jame Mosque';
  if (Math.hypot(x + 14, z + 84) < 20) return 'Shonargaon Village School';
  if (Math.hypot(x - 30, z + 86) < 18) return 'Darul Ulum Madrasa';
  if (Math.hypot(x - 58, z - 48) < 18) return 'Highway Bus Stand';
  if (Math.hypot(x - 80, z - 32) < 16) return 'Village Police Outpost';
  if (Math.hypot(x - 80, z + 12) < 16) return 'Rahman Motor Repair Garage';
  if (Math.hypot(x - 56, z + 66) < 16) return 'Community Health Clinic';
  if (Math.abs(z + 38) < 10 && Math.abs(x - 12) < 12) return 'Bamboo Bridge (Shako)';
  if (x > 86) return z > 0 ? 'Mustard Fields' : 'Eastern Paddy Fields';
  if (x < -10 && z < -48) return 'Northern Paddy Fields';
  return 'Shonargaon Homesteads';
}

export class TerrainSystem {
  public readonly mesh: THREE.Mesh;
  private material: THREE.MeshStandardMaterial;

  constructor(textures: TextureLibrary) {
    const size = 520;
    const segments = 150;
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const colGrass = new THREE.Color(0x6d9344);
    const colLush = new THREE.Color(0x4b7432);
    const colSand = new THREE.Color(0xb6996b);
    const colMud = new THREE.Color(0x6e5a42);
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = groundHeightAt(x, z);
      pos.setY(i, y);

      if (y < -0.35) {
        tmp.copy(colMud);
      } else if (y < 0.02 && x < riverBankX(z) + 12) {
        tmp.copy(colSand);
      } else {
        const tint = (Math.sin(x * 0.07) * Math.cos(z * 0.07) + 1) * 0.5;
        tmp.copy(colGrass).lerp(colLush, tint);
      }
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    this.material = new THREE.MeshStandardMaterial({
      map: textures.grassGround,
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.0,
    });

    this.mesh = new THREE.Mesh(geom, this.material);
    this.mesh.receiveShadow = true;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
