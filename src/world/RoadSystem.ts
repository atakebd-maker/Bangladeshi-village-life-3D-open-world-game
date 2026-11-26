import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';

export class RoadSystem {
  public readonly group = new THREE.Group();
  private disposables: Array<{ dispose: () => void }> = [];

  constructor(textures: TextureLibrary) {
    // 1. Paved Highway (North-South at x = 68)
    const highwayTex = textures.asphaltRoad.clone();
    highwayTex.needsUpdate = true;
    highwayTex.repeat.set(1, 24);
    this.disposables.push(highwayTex);

    const highwayMat = new THREE.MeshStandardMaterial({
      map: highwayTex,
      roughness: 0.85,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.disposables.push(highwayMat);

    const highwayGeo = new THREE.PlaneGeometry(8.5, 300);
    highwayGeo.rotateX(-Math.PI / 2);
    this.disposables.push(highwayGeo);

    const highway = new THREE.Mesh(highwayGeo, highwayMat);
    highway.position.set(68, 0.04, 0);
    highway.receiveShadow = true;
    this.group.add(highway);

    // Brick culvert bridge over irrigation canal at (68, -38)
    const bridgeDeckGeo = new THREE.BoxGeometry(9.4, 0.45, 13);
    const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: 0x525860, roughness: 0.88 });
    this.disposables.push(bridgeDeckGeo, bridgeDeckMat);
    const bridgeDeck = new THREE.Mesh(bridgeDeckGeo, bridgeDeckMat);
    bridgeDeck.position.set(68, 0.05, -38);
    bridgeDeck.receiveShadow = true;
    bridgeDeck.castShadow = true;
    this.group.add(bridgeDeck);

    const parapetGeo = new THREE.BoxGeometry(0.4, 0.85, 13);
    const parapetMat = new THREE.MeshStandardMaterial({
      map: textures.redBrick,
      roughness: 0.88,
    });
    this.disposables.push(parapetGeo, parapetMat);
    [-4.5, 4.5].forEach((dx) => {
      const wall = new THREE.Mesh(parapetGeo, parapetMat);
      wall.position.set(68 + dx, 0.55, -38);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.group.add(wall);
    });

    // 2. Main East-West Village Dirt Road (z = 6, from river ghat x=-60 to highway x=68)
    const dirtMat = new THREE.MeshStandardMaterial({
      map: textures.dirtRoad,
      roughness: 0.94,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.disposables.push(dirtMat);

    const ewGeo = new THREE.PlaneGeometry(5.2, 128);
    ewGeo.rotateX(-Math.PI / 2);
    ewGeo.rotateY(Math.PI / 2);
    this.disposables.push(ewGeo);
    const ewRoad = new THREE.Mesh(ewGeo, dirtMat);
    ewRoad.position.set(4, 0.03, 6);
    ewRoad.receiveShadow = true;
    this.group.add(ewRoad);

    // 3. North-South Village Lane (x = 12, south section z = -30 to 92 and north section z = -98 to -46)
    const makeNSRoad = (zStart: number, zEnd: number) => {
      const len = zEnd - zStart;
      const g = new THREE.PlaneGeometry(4.4, len);
      g.rotateX(-Math.PI / 2);
      this.disposables.push(g);
      const m = new THREE.Mesh(g, dirtMat);
      m.position.set(12, 0.03, (zStart + zEnd) / 2);
      m.receiveShadow = true;
      this.group.add(m);
    };
    makeNSRoad(-31, 92);
    makeNSRoad(-98, -45);

    // 4. Bazaar Plaza Apron
    const bazaarApronGeo = new THREE.PlaneGeometry(34, 38);
    bazaarApronGeo.rotateX(-Math.PI / 2);
    const bazaarApronMat = new THREE.MeshStandardMaterial({
      color: 0x9b8262,
      roughness: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.disposables.push(bazaarApronGeo, bazaarApronMat);
    const apron = new THREE.Mesh(bazaarApronGeo, bazaarApronMat);
    apron.position.set(45, 0.022, 17);
    apron.receiveShadow = true;
    this.group.add(apron);

    // 5. Bamboo Bridge (Shako) across the canal at (x = 12, z = -38)
    this.buildBambooBridge(12, -38, textures);
  }

  private buildBambooBridge(cx: number, cz: number, textures: TextureLibrary): void {
    const bridge = new THREE.Group();
    bridge.position.set(cx, 0, cz);

    const bambooMat = new THREE.MeshStandardMaterial({
      color: 0xb08c4f,
      map: textures.woodPlank,
      roughness: 0.82,
    });
    const darkRopeMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 0.9 });
    this.disposables.push(bambooMat, darkRopeMat);

    // Deck slats across 14m span (z = -7..+7)
    const slatGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.8, 8);
    slatGeo.rotateZ(Math.PI / 2);
    this.disposables.push(slatGeo);

    for (let i = -18; i <= 18; i++) {
      const z = i * 0.38;
      const archY = Math.cos((i / 18) * (Math.PI / 2)) * 0.72 + 0.12;
      const slat = new THREE.Mesh(slatGeo, bambooMat);
      slat.position.set(0, archY, z);
      slat.castShadow = true;
      slat.receiveShadow = true;
      bridge.add(slat);
    }

    // Side bamboo posts & handrails
    const postGeo = new THREE.CylinderGeometry(0.07, 0.08, 3.0, 8);
    this.disposables.push(postGeo);
    for (let z = -6; z <= 6; z += 3) {
      const archY = Math.cos((z / 7) * (Math.PI / 2)) * 0.72;
      [-1.35, 1.35].forEach((x) => {
        const post = new THREE.Mesh(postGeo, bambooMat);
        post.position.set(x, archY - 0.35, z);
        post.castShadow = true;
        bridge.add(post);
      });
    }

    // Handrails
    const railGeo = new THREE.CylinderGeometry(0.05, 0.05, 14, 8);
    railGeo.rotateX(Math.PI / 2);
    this.disposables.push(railGeo);
    [-1.35, 1.35].forEach((x) => {
      const rail = new THREE.Mesh(railGeo, darkRopeMat);
      rail.position.set(x, 1.25, 0);
      rail.castShadow = true;
      bridge.add(rail);
    });

    this.group.add(bridge);
  }

  public dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
