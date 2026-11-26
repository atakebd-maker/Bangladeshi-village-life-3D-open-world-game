import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { groundHeightAt } from '../world/TerrainSystem';

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class HouseModels {
  public static createVillageHouse(
    kind: 'tin' | 'bamboo' | 'mud' | 'brick',
    x: number,
    z: number,
    rotY: number,
    textures: TextureLibrary,
    colliders: BoxCollider[],
    tinVariant: 'silver' | 'green' | 'red' = 'silver'
  ): THREE.Group {
    const group = new THREE.Group();
    const y = groundHeightAt(x, z);
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    const w = kind === 'brick' ? 8.2 : 6.8;
    const d = kind === 'brick' ? 6.2 : 5.0;
    const h = kind === 'brick' ? 3.4 : 2.9;

    const plinthMat = new THREE.MeshStandardMaterial({
      color: kind === 'brick' ? 0x94a3b8 : 0x7c6248,
      roughness: 0.94,
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map:
        kind === 'bamboo'
          ? textures.bambooWeave
          : kind === 'mud'
            ? textures.mudPlaster
            : kind === 'brick'
              ? textures.redBrick
              : textures.corrugatedTin,
      color: kind === 'brick' ? 0xe8d8c8 : kind === 'tin' ? 0xdbe2e8 : 0xffffff,
      roughness: kind === 'tin' ? 0.45 : 0.88,
      metalness: kind === 'tin' ? 0.52 : 0.02,
    });
    const tinTex =
      tinVariant === 'green'
        ? textures.corrugatedTinGreen
        : tinVariant === 'red'
          ? textures.corrugatedTinRed
          : textures.corrugatedTin;
    const roofMat = new THREE.MeshStandardMaterial({
      map: tinTex,
      roughness: 0.38,
      metalness: 0.62,
      side: THREE.DoubleSide,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      map: textures.woodPlank,
      color: 0x5c3a21,
      roughness: 0.82,
    });

    // 1. Raised Plinth (Bhita)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 1.4, 0.45, d + 2.2), plinthMat);
    plinth.position.set(0, 0.22, 0.45);
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    group.add(plinth);

    // 2. Main Walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    walls.position.set(0, 0.45 + h / 2, 0);
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // 3. Roof (Pitched Tin or Brick Parapet)
    if (kind === 'brick') {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.6, 0.28, d + 1.8),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 })
      );
      slab.position.set(0, 0.45 + h + 0.14, 0.45);
      slab.castShadow = true;
      group.add(slab);

      const parapet = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.6, 0.55, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.85 })
      );
      parapet.position.set(0, 0.45 + h + 0.55, d / 2 + 1.25);
      group.add(parapet);
    } else {
      const roofSlope = Math.PI * 0.16;
      const panelGeo = new THREE.BoxGeometry(w + 1.4, 0.08, d * 0.72);
      const frontPanel = new THREE.Mesh(panelGeo, roofMat);
      frontPanel.position.set(0, 0.45 + h + 0.58, d * 0.27);
      frontPanel.rotation.x = roofSlope;
      frontPanel.castShadow = true;
      group.add(frontPanel);

      const backPanel = new THREE.Mesh(panelGeo, roofMat);
      backPanel.position.set(0, 0.45 + h + 0.58, -d * 0.27);
      backPanel.rotation.x = -roofSlope;
      backPanel.castShadow = true;
      group.add(backPanel);

      // Ridge Cap
      const ridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, w + 1.45, 8),
        roofMat
      );
      ridge.rotation.z = Math.PI / 2;
      ridge.position.set(0, 0.45 + h + 1.05, 0);
      group.add(ridge);

      // Veranda Awning
      const awning = new THREE.Mesh(new THREE.BoxGeometry(w + 1.0, 0.06, 1.8), roofMat);
      awning.position.set(0, 0.45 + h - 0.35, d / 2 + 0.85);
      awning.rotation.x = 0.22;
      awning.castShadow = true;
      group.add(awning);
    }

    // 4. Veranda Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.09, 0.1, h - 0.3, 8);
    [-w / 2 + 0.35, 0, w / 2 - 0.35].forEach((px) => {
      if (Math.abs(px) < 0.5) return;
      const p = new THREE.Mesh(pillarGeo, woodMat);
      p.position.set(px, 0.45 + (h - 0.3) / 2, d / 2 + 1.25);
      p.castShadow = true;
      group.add(p);
    });

    // 5. Wooden Door & Shuttered Windows
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.05, 0.12), woodMat);
    door.position.set(0, 0.45 + 1.02, d / 2 + 0.04);
    group.add(door);

    const winMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.35 });
    [-w * 0.28, w * 0.28].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.1), winMat);
      win.position.set(wx, 0.45 + 1.65, d / 2 + 0.04);
      group.add(win);
    });

    // Register AABB collider (conservative world bounds)
    const rad = Math.max(w, d + 2) * 0.52;
    colliders.push({
      minX: x - rad,
      maxX: x + rad,
      minZ: z - rad,
      maxZ: z + rad,
    });

    return group;
  }

  public static createTubeWell(x: number, z: number): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, groundHeightAt(x, z), z);

    const padMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.9 });
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a2f,
      roughness: 0.45,
      metalness: 0.72,
    });

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.14, 14), padMat);
    pad.position.y = 0.07;
    pad.receiveShadow = true;
    g.add(pad);

    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.15, 10), ironMat);
    pipe.position.y = 0.65;
    pipe.castShadow = true;
    g.add(pipe);

    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8), ironMat);
    spout.rotation.z = Math.PI / 2.6;
    spout.position.set(0.15, 0.85, 0);
    g.add(spout);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), ironMat);
    handle.rotation.z = -0.9;
    handle.position.set(-0.22, 1.18, 0);
    g.add(handle);

    return g;
  }

  public static createHaystack(x: number, z: number): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, groundHeightAt(x, z), z);
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xd4a74a, roughness: 0.95 });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x6b4c2a, roughness: 0.9 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.7, 1.6, 14), hayMat);
    base.position.y = 0.8;
    base.castShadow = true;
    base.receiveShadow = true;
    g.add(base);

    const top = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.35, 14), hayMat);
    top.position.y = 2.25;
    top.castShadow = true;
    g.add(top);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 3.3, 6), poleMat);
    pole.position.y = 1.65;
    g.add(pole);

    return g;
  }

  public static createOutdoorKitchen(x: number, z: number, textures: TextureLibrary): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, groundHeightAt(x, z), z);

    const mudMat = new THREE.MeshStandardMaterial({ map: textures.mudPlaster, roughness: 0.94 });
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.65,
      roughness: 0.42,
    });
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.9,
    });

    const chula = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.45, 12), mudMat);
    chula.position.y = 0.22;
    chula.castShadow = true;
    g.add(chula);

    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), potMat);
    pot.scale.y = 0.78;
    pot.position.y = 0.52;
    g.add(pot);

    const fire = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), emberMat);
    fire.position.set(0, 0.18, 0.22);
    g.add(fire);

    return g;
  }

  public static createFenceRun(
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    kind: 'bamboo' | 'tin',
    textures: TextureLibrary
  ): THREE.Group {
    const g = new THREE.Group();
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    const mat = new THREE.MeshStandardMaterial({
      map: kind === 'bamboo' ? textures.bambooWeave : textures.corrugatedTin,
      roughness: kind === 'bamboo' ? 0.9 : 0.45,
      metalness: kind === 'bamboo' ? 0 : 0.55,
      side: THREE.DoubleSide,
    });

    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.35, len), mat);
    panel.position.set((x1 + x2) / 2, groundHeightAt((x1 + x2) / 2, (z1 + z2) / 2) + 0.68, (z1 + z2) / 2);
    panel.rotation.y = angle;
    panel.castShadow = true;
    panel.receiveShadow = true;
    g.add(panel);
    return g;
  }
}
