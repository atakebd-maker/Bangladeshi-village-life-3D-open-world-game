import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { BoxCollider, DoorInteractable, HouseModels } from '../buildings/HouseModels';
import { MarketModels } from '../buildings/MarketModels';
import { SchoolModels } from '../buildings/SchoolModels';
import { InteriorSystem, SitSpot } from '../buildings/InteriorSystem';
import { MiniMapMarker } from '../types/game';
import { groundHeightAt, riverBankX } from './TerrainSystem';

export class VillageMap {
  public readonly group = new THREE.Group();
  public readonly colliders: BoxCollider[] = [];
  public readonly doors: DoorInteractable[] = [];
  public readonly sitSpots: SitSpot[] = [];
  public readonly markers: MiniMapMarker[] = [];
  public readonly treeTrunks: Array<{ x: number; z: number; r: number }> = [];

  constructor(textures: TextureLibrary) {
    this.buildHomesteads(textures);
    this.buildBazaar(textures);
    this.buildCivicBuildings(textures);
    this.buildSportsGrounds();
    this.buildAgriculture(textures);
    this.buildTreesAndPalms();
  }

  private addMarker(
    id: string,
    label: string,
    x: number,
    z: number,
    color: string,
    kind: MiniMapMarker['kind']
  ): void {
    this.markers.push({ id, label, x, z, color, kind });
  }

  private buildHomesteads(textures: TextureLibrary): void {
    // 1. North-West Main Tin-Roof Homestead (Player Home Area)
    this.group.add(HouseModels.createVillageHouse('door-home-main', 'tin', -16, -10, 0.08, textures, this.colliders, this.doors, 'green'));
    this.group.add(HouseModels.createVillageHouse('door-home-bam', 'bamboo', -26, -15, Math.PI / 2, textures, this.colliders, this.doors));
    this.group.add(HouseModels.createTubeWell(-10, -4));
    this.group.add(HouseModels.createOutdoorKitchen(-21, -5, textures));
    this.group.add(HouseModels.createHaystack(-30, -4));
    this.group.add(HouseModels.createFenceRun(-32, -21, -8, -21, 'bamboo', textures));
    this.group.add(InteriorSystem.createCharpoi('charpoi-home', -12, -5, 0.2, textures, this.sitSpots));
    this.addMarker('home', 'বসতবাড়ি', -16, -10, '#22c55e', 'building');

    // 2. South-West Mud & Tin Homestead
    this.group.add(HouseModels.createVillageHouse('door-sw-mud', 'mud', -26, 48, 0, textures, this.colliders, this.doors, 'red'));
    this.group.add(HouseModels.createVillageHouse('door-sw-tin', 'tin', -36, 54, Math.PI / 2, textures, this.colliders, this.doors, 'silver'));
    this.group.add(HouseModels.createTubeWell(-20, 44));
    this.group.add(HouseModels.createHaystack(-38, 44));
    this.group.add(HouseModels.createFenceRun(-42, 60, -18, 60, 'tin', textures));

    // 3. North-Central Brick Homestead
    this.group.add(HouseModels.createVillageHouse('door-nc-brick', 'brick', -12, -56, 0, textures, this.colliders, this.doors));
    this.group.add(HouseModels.createTubeWell(-4, -52));

    // 4. East Homestead
    this.group.add(HouseModels.createVillageHouse('door-east-tin', 'tin', 34, -58, Math.PI, textures, this.colliders, this.doors, 'red'));
    this.group.add(HouseModels.createOutdoorKitchen(28, -54, textures));
    this.group.add(HouseModels.createHaystack(42, -54));

    // 5. Padma River Ghat & Padma Char Island landmarks
    this.addMarker('ghat', 'পদ্মা নদীর ঘাট', -68, 8, '#06b6d4', 'building');
    this.group.add(InteriorSystem.createCharpoi('charpoi-char', -132, 8, 0.5, textures, this.sitSpots));
    this.group.add(HouseModels.createHaystack(-140, 12));
    this.addMarker('padma-char', 'পদ্মার চর (দ্বীপ)', -134, 8, '#f59e0b', 'building');
  }

  private buildBazaar(textures: TextureLibrary): void {
    // Tea Stall (South of E-W road)
    this.group.add(
      MarketModels.createShopStall('চা স্টল', 'Rahim Tea Stall', 30, 15, Math.PI, 0x15803d, '#064e3b', textures, this.colliders, 'tea')
    );
    this.group.add(InteriorSystem.createBench('bench-tea-1', 'চা স্টলের বেঞ্চে বসুন', 29, 11.5, 0, textures, this.sitSpots));
    this.group.add(InteriorSystem.createBench('bench-tea-2', 'চা স্টলের বেঞ্চে বসুন', 32, 11.5, 0, textures, this.sitSpots));

    // Grocery Shop
    this.group.add(
      MarketModels.createShopStall('মুদি দোকান', 'Bismillah Grocery', 40, 15, Math.PI, 0x1d4ed8, '#1e3a8a', textures, this.colliders, 'grocery')
    );
    // Clothing Shop
    this.group.add(
      MarketModels.createShopStall('বস্ত্রালয়', 'Padma Clothing', 50, 15, Math.PI, 0xb91c1c, '#7f1d1d', textures, this.colliders, 'clothing')
    );

    // Opposite row (North side of bazaar)
    this.group.add(
      MarketModels.createShopStall('মাছের বাজার', 'Fresh Fish Market', 34, -3, 0, 0x0f766e, '#134e4a', textures, this.colliders, 'fish')
    );
    this.group.add(
      MarketModels.createShopStall('সবজি বাজার', 'Vegetable Market', 44, -3, 0, 0x16a34a, '#14532d', textures, this.colliders, 'veg')
    );
    this.group.add(
      MarketModels.createShopStall('ফলের দোকান', 'Seasonal Fruits', 54, -3, 0, 0xd97706, '#78350f', textures, this.colliders, 'fruit')
    );

    // South Bazaar row
    this.group.add(
      MarketModels.createShopStall('সেলুন', 'Village Barber', 33, 29, Math.PI, 0x2563eb, '#1e40af', textures, this.colliders, 'barber')
    );
    this.group.add(
      MarketModels.createShopStall('হোটেল', 'Bangla Hotel & Rice', 46, 29, Math.PI, 0x9a3412, '#7c2d12', textures, this.colliders, 'hotel')
    );

    // Rickshaw Stand
    this.group.add(MarketModels.createRickshawStand(58, 12, textures));
    this.addMarker('bazaar', 'সোনারগাঁও বাজার', 44, 14, '#f59e0b', 'building');
  }

  private buildCivicBuildings(textures: TextureLibrary): void {
    // Mosque
    this.group.add(SchoolModels.createMosque(24, -18, textures, this.colliders));
    this.addMarker('mosque', 'জামে মসজিদ', 24, -18, '#10b981', 'building');

    // School
    this.group.add(
      SchoolModels.createSchoolOrClinic(
        'সোনারগাঁও উচ্চ বিদ্যালয়',
        'Shonargaon Village School',
        -14,
        -84,
        0,
        0xfef3c7,
        'red',
        true,
        textures,
        this.colliders
      )
    );
    this.addMarker('school', 'উচ্চ বিদ্যালয়', -14, -84, '#38bdf8', 'building');

    // Madrasa
    this.group.add(
      SchoolModels.createSchoolOrClinic(
        'দারুল উলুম মাদ্রাসা',
        'Darul Ulum Madrasa',
        30,
        -86,
        0,
        0xe2e8f0,
        'green',
        false,
        textures,
        this.colliders
      )
    );

    // Village Clinic
    this.group.add(
      SchoolModels.createSchoolOrClinic(
        'গ্রাম স্বাস্থ্য কেন্দ্র',
        'Community Health Clinic',
        54,
        -66,
        -Math.PI / 2,
        0xf8fafc,
        'red',
        false,
        textures,
        this.colliders
      )
    );

    // Highway Bus Stand, Police Outpost, Repair Garage
    this.group.add(
      SchoolModels.createBusStandOrPoliceOrGarage('bus_stand', 59, 48, Math.PI / 2, textures, this.colliders)
    );
    this.group.add(InteriorSystem.createBench('bench-bus', 'বাস স্ট্যান্ডের বেঞ্চে বসুন', 59.5, 48, Math.PI / 2, textures, this.sitSpots));
    this.addMarker('bus', 'বাস স্ট্যান্ড', 59, 48, '#60a5fa', 'building');

    this.group.add(
      SchoolModels.createBusStandOrPoliceOrGarage('police', 80, 32, -Math.PI / 2, textures, this.colliders)
    );
    this.group.add(
      SchoolModels.createBusStandOrPoliceOrGarage('garage', 80, -12, -Math.PI / 2, textures, this.colliders)
    );
    this.addMarker('garage', 'মোটর গ্যারেজ', 80, -12, '#fb923c', 'building');
  }

  private buildSportsGrounds(): void {
    // 1. Cricket Field at (18, 66)
    const outfield = new THREE.Mesh(
      new THREE.CircleGeometry(26, 36),
      new THREE.MeshStandardMaterial({
        color: 0x3f8f3b,
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    outfield.rotation.x = -Math.PI / 2;
    outfield.position.set(18, 0.025, 66);
    outfield.receiveShadow = true;
    this.group.add(outfield);

    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 18.2),
      new THREE.MeshStandardMaterial({
        color: 0xc2a273,
        roughness: 0.95,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      })
    );
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(18, 0.035, 66);
    pitch.receiveShadow = true;
    this.group.add(pitch);

    // Boundary ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(25.2, 25.6, 48),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, side: THREE.DoubleSide, roughness: 0.8 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(18, 0.04, 66);
    this.group.add(ring);

    // Wooden Stumps at both ends
    const stumpMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.72 });
    const stumpGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.72, 6);
    for (const wz of [66 - 8.5, 66 + 8.5]) {
      for (const wx of [-0.14, 0, 0.14]) {
        const s = new THREE.Mesh(stumpGeo, stumpMat);
        s.position.set(18 + wx, 0.36, wz);
        s.castShadow = true;
        this.group.add(s);
      }
    }
    this.addMarker('cricket', 'ক্রিকেট মাঠ', 18, 66, '#facc15', 'sport');

    // 2. Football Field at (-34, 88)
    const fbPitch = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 22),
      new THREE.MeshStandardMaterial({
        color: 0x357a38,
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    fbPitch.rotation.x = -Math.PI / 2;
    fbPitch.position.set(-34, 0.025, 88);
    fbPitch.receiveShadow = true;
    this.group.add(fbPitch);

    const postMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
    for (const gx of [-34 - 17.5, -34 + 17.5]) {
      for (const gz of [88 - 2.6, 88 + 2.6]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 8), postMat);
        p.position.set(gx, 1.15, gz);
        p.castShadow = true;
        this.group.add(p);
      }
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 5.2, 8), postMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(gx, 2.3, 88);
      this.group.add(bar);
    }
    this.addMarker('football', 'ফুটবল মাঠ', -34, 88, '#a3e635', 'sport');
  }

  private buildAgriculture(textures: TextureLibrary): void {
    // Paddy Fields (Instanced lush green & golden rice stalks)
    const stalkGeo = new THREE.ConeGeometry(0.16, 0.85, 5);
    stalkGeo.translate(0, 0.42, 0);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86 });

    const paddyZones = [
      { minX: -54, maxX: -26, minZ: -86, maxZ: -52 },
      { minX: 90, maxX: 132, minZ: -84, maxZ: -26 },
    ];
    const paddyCount = 900;
    const paddyMesh = new THREE.InstancedMesh(stalkGeo, stalkMat, paddyCount);
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    let idx = 0;
    for (const z of paddyZones) {
      for (let i = 0; i < paddyCount / paddyZones.length; i++) {
        const x = z.minX + Math.random() * (z.maxX - z.minX);
        const pz = z.minZ + Math.random() * (z.maxZ - z.minZ);
        dummy.position.set(x, groundHeightAt(x, pz), pz);
        dummy.scale.setScalar(0.8 + Math.random() * 0.45);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        paddyMesh.setMatrixAt(idx, dummy.matrix);
        col.setHex(Math.random() > 0.25 ? 0x4d9432 : 0x7ab83e);
        paddyMesh.setColorAt(idx, col);
        idx++;
      }
    }
    paddyMesh.instanceMatrix.needsUpdate = true;
    if (paddyMesh.instanceColor) paddyMesh.instanceColor.needsUpdate = true;
    paddyMesh.computeBoundingSphere();
    this.group.add(paddyMesh);

    // Soil pads under paddy fields
    const padMat = new THREE.MeshStandardMaterial({ map: textures.paddyField, roughness: 0.96 });
    for (const z of paddyZones) {
      const w = z.maxX - z.minX;
      const d = z.maxZ - z.minZ;
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(w, d), padMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set((z.minX + z.maxX) / 2, 0.02, (z.minZ + z.maxZ) / 2);
      pad.receiveShadow = true;
      this.group.add(pad);
    }

    // Mustard Fields (Vibrant yellow blooms East of Highway)
    const mustardGeo = new THREE.DodecahedronGeometry(0.28, 0);
    const mustardMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.78 });
    const mustardCount = 460;
    const mustardMesh = new THREE.InstancedMesh(mustardGeo, mustardMat, mustardCount);
    for (let i = 0; i < mustardCount; i++) {
      const x = 90 + Math.random() * 40;
      const z = 12 + Math.random() * 58;
      dummy.position.set(x, groundHeightAt(x, z) + 0.35, z);
      dummy.scale.setScalar(0.8 + Math.random() * 0.45);
      dummy.updateMatrix();
      mustardMesh.setMatrixAt(i, dummy.matrix);
    }
    mustardMesh.instanceMatrix.needsUpdate = true;
    mustardMesh.computeBoundingSphere();
    this.group.add(mustardMesh);

    // Vegetable Garden near South-West Homestead
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95 });
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 });
    for (let row = 0; row < 4; row++) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.22, 0.9), bedMat);
      bed.position.set(-14, 0.11, 52 + row * 1.6);
      this.group.add(bed);
      for (let k = -2.4; k <= 2.4; k += 1.2) {
        const plant = new THREE.Mesh(new THREE.SphereGeometry(0.28, 7, 6), bushMat);
        plant.position.set(-14 + k, 0.32, 52 + row * 1.6);
        this.group.add(plant);
      }
    }
  }

  private buildTreesAndPalms(): void {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4c35, roughness: 0.92 });
    const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x2f7d32, roughness: 0.72 });
    const mangoLeafMat = new THREE.MeshStandardMaterial({ color: 0x256829, roughness: 0.78 });
    const bananaLeafMat = new THREE.MeshStandardMaterial({ color: 0x59981a, roughness: 0.65 });

    // Helper: create authentic multi-part Coconut/Palm Tree
    const addCoconutTree = (x: number, z: number, height: number) => {
      const y = groundHeightAt(x, z);
      if (y < -0.2) return;
      const t = new THREE.Group();
      t.position.set(x, y, z);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.28, height, 7),
        trunkMat
      );
      trunk.position.y = height / 2;
      trunk.rotation.z = (Math.random() - 0.5) * 0.14;
      trunk.castShadow = true;
      t.add(trunk);

      // Crown of 6 arched palm fronds
      for (let i = 0; i < 6; i++) {
        const frond = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.8, 5), palmLeafMat);
        frond.rotation.z = Math.PI / 2.3;
        frond.rotation.y = (i / 6) * Math.PI * 2;
        frond.position.set(
          Math.cos((i / 6) * Math.PI * 2) * 1.0,
          height - 0.15,
          -Math.sin((i / 6) * Math.PI * 2) * 1.0
        );
        frond.castShadow = true;
        t.add(frond);
      }
      this.group.add(t);
      this.treeTrunks.push({ x, z, r: 0.45 });
    };

    // Helper: Mango / Jackfruit Canopy Tree (3-sphere layered organic crown)
    const addMangoOrJackfruit = (x: number, z: number, isJackfruit: boolean) => {
      const y = groundHeightAt(x, z);
      if (y < -0.2) return;
      const t = new THREE.Group();
      t.position.set(x, y, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 3.2, 8), trunkMat);
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      t.add(trunk);

      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1, 1), mangoLeafMat);
      c1.position.set(0, 3.8, 0);
      c1.castShadow = true;
      t.add(c1);

      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.55, 1), palmLeafMat);
      c2.position.set(1.1, 3.4, 0.6);
      t.add(c2);

      const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.45, 1), mangoLeafMat);
      c3.position.set(-1.0, 3.5, -0.5);
      t.add(c3);

      if (isJackfruit) {
        const fruitMat = new THREE.MeshStandardMaterial({ color: 0xa3b829, roughness: 0.8 });
        const jf = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), fruitMat);
        jf.scale.y = 1.4;
        jf.position.set(0.32, 2.2, 0.15);
        t.add(jf);
      }
      this.group.add(t);
      this.treeTrunks.push({ x, z, r: 0.55 });
    };

    // Helper: Banana Tree Cluster
    const addBananaClump = (x: number, z: number) => {
      const y = groundHeightAt(x, z);
      if (y < -0.2) return;
      const t = new THREE.Group();
      t.position.set(x, y, z);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 0.78 });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.2, 7), stemMat);
      stem.position.y = 1.1;
      stem.castShadow = true;
      t.add(stem);

      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 1.85), bananaLeafMat);
        const a = (i / 5) * Math.PI * 2;
        leaf.rotation.y = a;
        leaf.rotation.x = 0.35;
        leaf.position.set(Math.sin(a) * 0.7, 2.1, Math.cos(a) * 0.7);
        t.add(leaf);
      }
      this.group.add(t);
    };

    // Curated village trees around homesteads, pond, river bank, and outer perimeter groves
    const coconutSpots: Array<[number, number, number]> = [
      [-8, -14, 7.5],
      [-28, 4, 8.2],
      [-40, 22, 7.8],
      [-10, 30, 8.4],
      [8, -22, 7.6],
      [20, -2, 8.0],
      [-42, -26, 8.5],
      [-60, -10, 7.4],
      [-62, 34, 8.1],
      [48, -46, 8.6],
      [62, -24, 7.9],
      [60, 72, 8.2],
      [-55, 75, 7.5],
      [-136, 2, 7.8],
      [-129, 15, 7.2],
    ];
    for (const [x, z, h] of coconutSpots) addCoconutTree(x, z, h);

    const mangoSpots: Array<[number, number, boolean]> = [
      [-24, -22, true],
      [-4, -30, false],
      [-42, 42, true],
      [4, 24, false],
      [38, -72, true],
      [-28, -94, false],
      [48, 68, true],
      [86, 56, false],
      [84, -46, true],
    ];
    for (const [x, z, jf] of mangoSpots) addMangoOrJackfruit(x, z, jf);

    const bananaSpots: Array<[number, number]> = [
      [-14, -20],
      [-34, 62],
      [-14, 28],
      [18, -50],
      [-48, -4],
      [28, 42],
    ];
    for (const [x, z] of bananaSpots) addBananaClump(x, z);

    // Dense natural perimeter tree-line (so open world blends naturally into horizon fog)
    for (let i = 0; i < 65; i++) {
      const a = (i / 65) * Math.PI * 2;
      const r = 138 + (i % 3) * 14;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (x < riverBankX(z) + 4) continue;
      if (i % 2 === 0) addMangoOrJackfruit(x, z, false);
      else addCoconutTree(x, z, 8.5);
    }
  }
}
