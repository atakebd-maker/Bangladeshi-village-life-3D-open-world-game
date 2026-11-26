import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { groundHeightAt } from '../world/TerrainSystem';
import { BoxCollider } from './HouseModels';

export class SchoolModels {
  public static createSchoolOrClinic(
    bnName: string,
    enName: string,
    x: number,
    z: number,
    rotY: number,
    wallHex: number,
    roofVariant: 'red' | 'green',
    withFlagpole: boolean,
    textures: TextureLibrary,
    colliders: BoxCollider[]
  ): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, groundHeightAt(x, z), z);
    g.rotation.y = rotY;

    const w = 13.5;
    const d = 6.2;
    const h = 3.6;

    const wallMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.82 });
    const roofMat = new THREE.MeshStandardMaterial({
      map: roofVariant === 'red' ? textures.corrugatedTinRed : textures.corrugatedTinGreen,
      roughness: 0.4,
      metalness: 0.6,
    });
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.78 });

    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(w + 1.4, 0.45, d + 2.6),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 })
    );
    plinth.position.set(0, 0.22, 0.6);
    plinth.receiveShadow = true;
    g.add(plinth);

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    body.position.set(0, 0.45 + h / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const roofFront = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.1, d * 0.78), roofMat);
    roofFront.position.set(0, 0.45 + h + 0.6, d * 0.28);
    roofFront.rotation.x = 0.25;
    roofFront.castShadow = true;
    g.add(roofFront);

    const roofBack = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.1, d * 0.78), roofMat);
    roofBack.position.set(0, 0.45 + h + 0.6, -d * 0.28);
    roofBack.rotation.x = -0.25;
    roofBack.castShadow = true;
    g.add(roofBack);

    // Veranda Pillars
    for (let px = -5.5; px <= 5.5; px += 2.75) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.32, h, 0.32), pillarMat);
      col.position.set(px, 0.45 + h / 2, d / 2 + 1.4);
      col.castShadow = true;
      g.add(col);
    }

    // Signboard
    const signTex = textures.createSignTexture(bnName, enName, '#1e3a8a', '#fef08a');
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 1.0, 0.12),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
    );
    sign.position.set(0, 0.45 + h + 0.35, d / 2 + 1.55);
    g.add(sign);

    // Bangladesh National Flagpole
    if (withFlagpole) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 6.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.3 })
      );
      pole.position.set(0, 3.1, d / 2 + 3.4);
      pole.castShadow = true;
      g.add(pole);

      const flagGreen = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.96, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x006a4e, roughness: 0.75 })
      );
      flagGreen.position.set(0.82, 5.65, d / 2 + 3.4);
      g.add(flagGreen);

      const flagRed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16),
        new THREE.MeshStandardMaterial({ color: 0xf42a41, roughness: 0.7 })
      );
      flagRed.rotation.x = Math.PI / 2;
      flagRed.position.set(0.75, 5.65, d / 2 + 3.4);
      g.add(flagRed);
    }

    colliders.push({
      minX: x - w * 0.55,
      maxX: x + w * 0.55,
      minZ: z - d * 0.6,
      maxZ: z + d * 0.75,
    });
    return g;
  }

  public static createMosque(
    x: number,
    z: number,
    textures: TextureLibrary,
    colliders: BoxCollider[]
  ): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, groundHeightAt(x, z), z);

    const whiteWall = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.78 });
    const greenTrim = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.52 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
    });

    const base = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.5, 10.5), whiteWall);
    base.position.y = 0.25;
    base.receiveShadow = true;
    g.add(base);

    const hall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 4.4, 9.2), whiteWall);
    hall.position.y = 0.5 + 2.2;
    hall.castShadow = true;
    hall.receiveShadow = true;
    g.add(hall);

    const parapet = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.55, 9.6), greenTrim);
    parapet.position.y = 5.1;
    g.add(parapet);

    // Central Dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
      whiteWall
    );
    dome.position.y = 5.2;
    dome.castShadow = true;
    g.add(dome);

    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 1.3, 8), goldMat);
    finial.position.y = 8.2;
    g.add(finial);

    // Minaret Tower
    const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 10.5, 12), whiteWall);
    minaret.position.set(4.5, 5.25, 4.5);
    minaret.castShadow = true;
    g.add(minaret);

    const minCap = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), greenTrim);
    minCap.position.set(4.5, 10.6, 4.5);
    g.add(minCap);

    const signTex = textures.createSignTexture('শান্তি জামে মসজিদ', 'Shanti Jame Mosque', '#065f46');
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.85, 0.1),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
    );
    sign.position.set(0, 4.3, 4.7);
    g.add(sign);

    colliders.push({ minX: x - 5.4, maxX: x + 5.4, minZ: z - 5.4, maxZ: z + 5.4 });
    return g;
  }

  public static createBusStandOrPoliceOrGarage(
    type: 'bus_stand' | 'police' | 'garage',
    x: number,
    z: number,
    rotY: number,
    textures: TextureLibrary,
    colliders: BoxCollider[]
  ): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, groundHeightAt(x, z), z);
    g.rotation.y = rotY;

    if (type === 'bus_stand') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.82 });
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
      const back = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.8, 0.25), mat);
      back.position.set(0, 1.4, -1.2);
      back.castShadow = true;
      g.add(back);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.16, 3.2), roofMat);
      roof.position.set(0, 2.88, 0);
      roof.castShadow = true;
      g.add(roof);

      const signTex = textures.createSignTexture('বাস স্ট্যান্ড', 'Highway Bus Stand', '#1e40af');
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.8, 0.1),
        new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
      );
      sign.position.set(0, 3.35, 1.5);
      g.add(sign);

      colliders.push({ minX: x - 3.8, maxX: x + 3.8, minZ: z - 1.8, maxZ: z + 1.8 });
    } else if (type === 'police') {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(8.0, 3.2, 6.0),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 })
      );
      wall.position.set(0, 1.6, 0);
      wall.castShadow = true;
      g.add(wall);

      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(8.1, 0.55, 6.1),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 })
      );
      stripe.position.set(0, 2.95, 0);
      g.add(stripe);

      const signTex = textures.createSignTexture('পুলিশ ফাঁড়ি', 'Village Police Outpost', '#1e3a8a');
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 0.85, 0.1),
        new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
      );
      sign.position.set(0, 3.7, 3.05);
      g.add(sign);

      colliders.push({ minX: x - 4.2, maxX: x + 4.2, minZ: z - 3.2, maxZ: z + 3.2 });
    } else {
      // Repair Garage (open bay tin shed + oil drums)
      const tinMat = new THREE.MeshStandardMaterial({
        map: textures.corrugatedTin,
        color: 0xb9c4cc,
        roughness: 0.42,
        metalness: 0.62,
        side: THREE.DoubleSide,
      });
      const back = new THREE.Mesh(new THREE.BoxGeometry(9.0, 3.4, 0.22), tinMat);
      back.position.set(0, 1.7, -3.2);
      back.castShadow = true;
      g.add(back);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.12, 7.2), tinMat);
      roof.position.set(0, 3.55, 0);
      roof.rotation.x = 0.08;
      roof.castShadow = true;
      g.add(roof);

      const postGeo = new THREE.CylinderGeometry(0.09, 0.09, 3.5, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
      for (const px of [-4.4, 4.4]) {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(px, 1.75, 3.2);
        g.add(post);
      }

      // Oil drums
      const drumMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.48, metalness: 0.55 });
      for (const dx of [-3.6, -2.9]) {
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 12), drumMat);
        drum.position.set(dx, 0.45, -2.4);
        drum.castShadow = true;
        g.add(drum);
      }

      const signTex = textures.createSignTexture('মোটর গ্যারেজ', 'Rahman Repair Garage', '#7c2d12');
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.9, 0.1),
        new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
      );
      sign.position.set(0, 4.1, 3.4);
      g.add(sign);

      colliders.push({ minX: x - 4.6, maxX: x + 4.6, minZ: z - 3.6, maxZ: z - 2.4 });
    }
    return g;
  }
}
