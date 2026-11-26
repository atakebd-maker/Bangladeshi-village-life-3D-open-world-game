import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { groundHeightAt } from '../world/TerrainSystem';
import { BoxCollider } from './HouseModels';

export class MarketModels {
  public static createShopStall(
    bnName: string,
    enName: string,
    x: number,
    z: number,
    rotY: number,
    accentHex: number,
    signBg: string,
    textures: TextureLibrary,
    colliders: BoxCollider[],
    style: 'tea' | 'grocery' | 'fish' | 'veg' | 'fruit' | 'barber' | 'clothing' | 'hotel'
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, groundHeightAt(x, z), z);
    group.rotation.y = rotY;

    const w = style === 'hotel' ? 7.2 : 4.8;
    const d = 3.8;
    const h = 2.75;

    const wallMat = new THREE.MeshStandardMaterial({
      map: style === 'hotel' ? textures.redBrick : textures.bambooWeave,
      color: style === 'hotel' ? 0xfef3c7 : 0xf1e6d2,
      roughness: 0.86,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      map: textures.corrugatedTin,
      color: accentHex,
      roughness: 0.42,
      metalness: 0.55,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      map: textures.woodPlank,
      roughness: 0.84,
    });

    // Plinth
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.6, 0.25, d + 1.4),
      new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.92 })
    );
    floor.position.set(0, 0.12, 0.35);
    floor.receiveShadow = true;
    group.add(floor);

    // Back & Side Walls (Open Front)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.22), wallMat);
    backWall.position.set(0, 0.25 + h / 2, -d / 2);
    backWall.castShadow = true;
    group.add(backWall);

    [-w / 2, w / 2].forEach((sx) => {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.2, h, d), wallMat);
      side.position.set(sx, 0.25 + h / 2, 0);
      side.castShadow = true;
      group.add(side);
    });

    // Sloped Corrugated Tin Roof + Front Awning
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.08, d + 1.6), roofMat);
    roof.position.set(0, 0.25 + h + 0.18, 0.35);
    roof.rotation.x = 0.14;
    roof.castShadow = true;
    group.add(roof);

    // Front Counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(w - 0.4, 0.92, 0.72), woodMat);
    counter.position.set(0, 0.25 + 0.46, d / 2 - 0.45);
    counter.castShadow = true;
    group.add(counter);

    // Shop-specific realistic props
    if (style === 'tea') {
      const kettle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.22, 0.34, 10),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.82, roughness: 0.25 })
      );
      kettle.position.set(-0.7, 1.35, d / 2 - 0.45);
      group.add(kettle);

      const jarMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.25,
        transparent: true,
        opacity: 0.85,
      });
      for (let i = 0; i < 4; i++) {
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 10), jarMat);
        jar.position.set(0.2 + i * 0.32, 1.3, d / 2 - 0.45);
        group.add(jar);
      }
    } else if (style === 'fish' || style === 'veg' || style === 'fruit') {
      const basketMat = new THREE.MeshStandardMaterial({ map: textures.bambooWeave, roughness: 0.9 });
      const itemColor =
        style === 'fish' ? 0x94a3b8 : style === 'veg' ? 0x22c55e : 0xf59e0b;
      const itemMat = new THREE.MeshStandardMaterial({ color: itemColor, roughness: 0.55 });
      for (let i = -1; i <= 1; i++) {
        const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.32, 0.26, 12), basketMat);
        basket.position.set(i * 1.15, 1.28, d / 2 - 0.45);
        group.add(basket);
        const goods = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), itemMat);
        goods.scale.y = 0.55;
        goods.position.set(i * 1.15, 1.38, d / 2 - 0.45);
        group.add(goods);
      }
    } else if (style === 'clothing') {
      const clothColors = [0xdc2626, 0x2563eb, 0x16a34a, 0xd97706];
      clothColors.forEach((c, idx) => {
        const fabric = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 1.2, 0.08),
          new THREE.MeshStandardMaterial({ color: c, roughness: 0.78 })
        );
        fabric.position.set(-1.3 + idx * 0.85, 1.85, -d / 2 + 0.35);
        group.add(fabric);
      });
    }

    // Bengali & English Signboard
    const signTex = textures.createSignTexture(bnName, enName, signBg);
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 });
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.85, 0.1), signMat);
    signBoard.position.set(0, 0.25 + h + 0.55, d / 2 + 0.7);
    group.add(signBoard);

    const rad = Math.max(w, d) * 0.52;
    colliders.push({
      minX: x - rad,
      maxX: x + rad,
      minZ: z - rad,
      maxZ: z + rad,
    });

    return group;
  }

  public static createRickshawStand(
    x: number,
    z: number,
    textures: TextureLibrary
  ): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, groundHeightAt(x, z), z);

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.72,
      roughness: 0.38,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      map: textures.corrugatedTinGreen,
      roughness: 0.42,
      metalness: 0.55,
    });

    for (const [px, pz] of [
      [-3.5, -2.0],
      [3.5, -2.0],
      [-3.5, 2.0],
      [3.5, 2.0],
    ]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.8, 8), steelMat);
      post.position.set(px, 1.4, pz);
      post.castShadow = true;
      g.add(post);
    }

    const roof = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 5.2), roofMat);
    roof.position.set(0, 2.85, 0);
    roof.castShadow = true;
    g.add(roof);

    const signTex = textures.createSignTexture('রিকশা স্ট্যান্ড', 'Rickshaw Stand', '#065f46');
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.8, 0.1),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
    );
    sign.position.set(0, 3.25, 2.55);
    g.add(sign);

    return g;
  }
}
