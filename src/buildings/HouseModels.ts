import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { groundHeightAt } from '../world/TerrainSystem';

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  disabled?: boolean;
}

export interface DoorInteractable {
  id: string;
  label: string;
  worldX: number;
  worldZ: number;
  pivot: THREE.Group;
  isOpen: boolean;
  doorCollider: BoxCollider;
}

export class HouseModels {
  public static createVillageHouse(
    id: string,
    kind: 'tin' | 'bamboo' | 'mud' | 'brick',
    x: number,
    z: number,
    rotY: number,
    textures: TextureLibrary,
    colliders: BoxCollider[],
    doors: DoorInteractable[],
    tinVariant: 'silver' | 'green' | 'red' = 'silver'
  ): THREE.Group {
    const group = new THREE.Group();
    const y = groundHeightAt(x, z);
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    const w = kind === 'brick' ? 8.2 : 7.0;
    const d = kind === 'brick' ? 6.4 : 5.4;
    const h = kind === 'brick' ? 3.4 : 3.0;
    const wallT = 0.24;
    const doorW = 1.45;
    const doorH = 2.25;

    const plinthMat = new THREE.MeshStandardMaterial({
      color: kind === 'brick' ? 0x94a3b8 : 0x7c6248,
      roughness: 0.94,
    });
    const floorMat = new THREE.MeshStandardMaterial({
      color: kind === 'brick' ? 0xd6d3d1 : 0x9b7e5e,
      roughness: 0.88,
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
      side: THREE.DoubleSide,
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

    // 1. Raised Plinth & Walkable Interior Floor (step height ~0.22m so player steps cleanly inside)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 1.4, 0.24, d + 2.2), plinthMat);
    plinth.position.set(0, 0.12, 0.45);
    plinth.receiveShadow = true;
    group.add(plinth);

    const interiorFloor = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.3, d - 0.3), floorMat);
    interiorFloor.rotation.x = -Math.PI / 2;
    interiorFloor.position.set(0, 0.25, 0);
    interiorFloor.receiveShadow = true;
    group.add(interiorFloor);

    // 2. Hollow 4-Wall Room with Walkable Front Doorway
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, wallT), wallMat);
    backWall.position.set(0, 0.24 + h / 2, -d / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, h, d), wallMat);
    leftWall.position.set(-w / 2, 0.24 + h / 2, 0);
    leftWall.castShadow = true;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, h, d), wallMat);
    rightWall.position.set(w / 2, 0.24 + h / 2, 0);
    rightWall.castShadow = true;
    group.add(rightWall);

    const frontSideW = (w - doorW) / 2;
    const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(frontSideW, h, wallT), wallMat);
    frontLeft.position.set(-(doorW / 2 + frontSideW / 2), 0.24 + h / 2, d / 2);
    frontLeft.castShadow = true;
    group.add(frontLeft);

    const frontRight = new THREE.Mesh(new THREE.BoxGeometry(frontSideW, h, wallT), wallMat);
    frontRight.position.set(doorW / 2 + frontSideW / 2, 0.24 + h / 2, d / 2);
    frontRight.castShadow = true;
    group.add(frontRight);

    const transomH = h - doorH;
    const transom = new THREE.Mesh(new THREE.BoxGeometry(doorW, transomH, wallT), wallMat);
    transom.position.set(0, 0.24 + doorH + transomH / 2, d / 2);
    group.add(transom);

    // 3. Hinged Wooden Door (Opens when player clicks Open Door!)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-doorW / 2, 0.24, d / 2);
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.06, doorH - 0.04, 0.09), woodMat);
    doorLeaf.position.set(doorW / 2, doorH / 2, 0);
    doorLeaf.castShadow = true;
    doorPivot.add(doorLeaf);

    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 })
    );
    handle.position.set(doorW - 0.22, doorH * 0.48, 0.08);
    doorPivot.add(handle);
    group.add(doorPivot);

    // 4. Interior Furniture (Bed/Charpoi, Table, Warm Lantern)
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.42, 1.05),
      new THREE.MeshStandardMaterial({ map: textures.bambooWeave, roughness: 0.88 })
    );
    bed.position.set(-w / 2 + 1.25, 0.46, -d / 2 + 1.0);
    group.add(bed);

    const table = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.8), woodMat);
    table.position.set(w / 2 - 1.15, 0.6, -d / 2 + 0.9);
    group.add(table);

    const lantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.24, 8),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.4,
      })
    );
    lantern.position.set(w / 2 - 1.15, 1.1, -d / 2 + 0.9);
    group.add(lantern);

    // 5. Roof (Pitched Tin or Brick Parapet)
    if (kind === 'brick') {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.6, 0.26, d + 1.8),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 })
      );
      slab.position.set(0, 0.24 + h + 0.13, 0.45);
      slab.castShadow = true;
      group.add(slab);
    } else {
      const roofSlope = Math.PI * 0.16;
      const panelGeo = new THREE.BoxGeometry(w + 1.4, 0.08, d * 0.72);
      const frontPanel = new THREE.Mesh(panelGeo, roofMat);
      frontPanel.position.set(0, 0.24 + h + 0.58, d * 0.27);
      frontPanel.rotation.x = roofSlope;
      frontPanel.castShadow = true;
      group.add(frontPanel);

      const backPanel = new THREE.Mesh(panelGeo, roofMat);
      backPanel.position.set(0, 0.24 + h + 0.58, -d * 0.27);
      backPanel.rotation.x = -roofSlope;
      backPanel.castShadow = true;
      group.add(backPanel);

      const ridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, w + 1.45, 8),
        roofMat
      );
      ridge.rotation.z = Math.PI / 2;
      ridge.position.set(0, 0.24 + h + 1.05, 0);
      group.add(ridge);

      const awning = new THREE.Mesh(new THREE.BoxGeometry(w + 1.0, 0.06, 1.8), roofMat);
      awning.position.set(0, 0.24 + h - 0.32, d / 2 + 0.85);
      awning.rotation.x = 0.22;
      awning.castShadow = true;
      group.add(awning);
    }

    // 6. Veranda Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.09, 0.1, h - 0.3, 8);
    [-w / 2 + 0.35, w / 2 - 0.35].forEach((px) => {
      const p = new THREE.Mesh(pillarGeo, woodMat);
      p.position.set(px, 0.24 + (h - 0.3) / 2, d / 2 + 1.25);
      p.castShadow = true;
      group.add(p);
    });

    // Shuttered Front Windows
    const winMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.35 });
    [-w * 0.32, w * 0.32].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.12), winMat);
      win.position.set(wx, 0.24 + 1.65, d / 2 + 0.08);
      group.add(win);
    });

    // Helper: transform local wall AABB to world AABB (handles cardinal / rotated houses accurately)
    const addLocalBoxCollider = (lx: number, lz: number, bw: number, bd: number): BoxCollider => {
      const cos = Math.cos(rotY);
      const sin = Math.sin(rotY);
      const wx = x + lx * cos + lz * sin;
      const wz = z - lx * sin + lz * cos;
      const worldW = Math.abs(bw * cos) + Math.abs(bd * sin);
      const worldD = Math.abs(bw * sin) + Math.abs(bd * cos);
      const col: BoxCollider = {
        minX: wx - worldW / 2,
        maxX: wx + worldW / 2,
        minZ: wz - worldD / 2,
        maxZ: wz + worldD / 2,
      };
      colliders.push(col);
      return col;
    };

    addLocalBoxCollider(0, -d / 2, w, wallT + 0.2);
    addLocalBoxCollider(-w / 2, 0, wallT + 0.2, d);
    addLocalBoxCollider(w / 2, 0, wallT + 0.2, d);
    addLocalBoxCollider(-(doorW / 2 + frontSideW / 2), d / 2, frontSideW, wallT + 0.2);
    addLocalBoxCollider(doorW / 2 + frontSideW / 2, d / 2, frontSideW, wallT + 0.2);

    const doorCollider = addLocalBoxCollider(0, d / 2, doorW, wallT + 0.25);
    const doorWorldX = x + (d / 2 + 0.5) * Math.sin(rotY);
    const doorWorldZ = z + (d / 2 + 0.5) * Math.cos(rotY);
    doors.push({
      id,
      label: 'Open Door',
      worldX: doorWorldX,
      worldZ: doorWorldZ,
      pivot: doorPivot,
      isOpen: false,
      doorCollider,
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
    panel.position.set(
      (x1 + x2) / 2,
      groundHeightAt((x1 + x2) / 2, (z1 + z2) / 2) + 0.68,
      (z1 + z2) / 2
    );
    panel.rotation.y = angle;
    panel.castShadow = true;
    panel.receiveShadow = true;
    g.add(panel);
    return g;
  }
}
