import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';

export function riverBankX(z: number): number {
  return -72 + Math.sin(z * 0.024) * 8;
}

export function groundHeightAt(x: number, z: number): number {
  // Scenic Padma Char (Sand Island across the Padma River) centered at (-134, 8)
  const charDist = Math.hypot(x - -134, z - 8);
  if (charDist < 24) {
    const t = THREE.MathUtils.clamp((24 - charDist) / 10, 0, 1);
    return -2.4 + t * 3.1; // rises cleanly from -2.4 riverbed to +0.70 dry island
  }

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
  if (Math.hypot(x - -134, z - 8) < 24) return 'পদ্মার চর (পশ্চিম পাড়)';
  if (x < riverBankX(z) - 3) return 'পদ্মা নদী';
  if (x < riverBankX(z) + 12) return 'পদ্মা নদীর ঘাট';
  if (Math.hypot(x - -26, z - 22) < 20) return 'গ্রামের পুকুর পাড়';
  if (Math.hypot(x - 18, z - 66) < 32) return 'গ্রামের ক্রিকেট মাঠ';
  if (Math.abs(x + 34) < 24 && Math.abs(z - 88) < 16) return 'গ্রামের ফুটবল মাঠ';
  if (x > 24 && x < 62 && z > -14 && z < 38) return 'সোনারগাঁও বাজার';
  if (Math.hypot(x - 24, z + 18) < 18) return 'শান্তি জামে মসজিদ';
  if (Math.hypot(x + 14, z + 84) < 20) return 'সোনারগাঁও উচ্চ বিদ্যালয়';
  if (Math.hypot(x - 30, z + 86) < 18) return 'দারুল উলুম মাদ্রাসা';
  if (Math.hypot(x - 58, z - 48) < 18) return 'হাইওয়ে বাস স্ট্যান্ড';
  if (Math.hypot(x - 80, z - 32) < 16) return 'গ্রাম পুলিশ ফাঁড়ি';
  if (Math.hypot(x - 80, z + 12) < 16) return 'রহমান মোটর গ্যারেজ';
  if (Math.hypot(x - 56, z + 66) < 16) return 'গ্রাম স্বাস্থ্য কেন্দ্র';
  if (Math.abs(z + 38) < 10 && Math.abs(x - 12) < 12) return 'বাঁশের সাঁকো';
  if (x > 86) return z > 0 ? 'সরিষা ক্ষেত' : 'পূর্ব দিকের ধান ক্ষেত';
  if (x < -10 && z < -48) return 'উত্তর দিকের ধান ক্ষেত';
  return 'সোনারগাঁও বসতবাড়ি';
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
