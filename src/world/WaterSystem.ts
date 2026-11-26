import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { createVillageWaterMaterial, WaterMaterialHandle } from '../shaders/WaterShader';

interface BoatActor {
  group: THREE.Group;
  baseX: number;
  baseZ: number;
  phase: number;
  patrolRadius: number;
}

export class WaterSystem {
  public readonly group = new THREE.Group();
  private waterHandle: WaterMaterialHandle;
  private boats: BoatActor[] = [];
  private disposables: Array<{ dispose: () => void }> = [];

  constructor(textures: TextureLibrary, isSoftwareGl: boolean) {
    this.waterHandle = createVillageWaterMaterial(isSoftwareGl);
    this.disposables.push(this.waterHandle.material);

    // 1. Wide Padma River Plane on the West
    const riverGeo = new THREE.PlaneGeometry(180, 440, 28, 48);
    this.disposables.push(riverGeo);
    const riverMesh = new THREE.Mesh(riverGeo, this.waterHandle.material);
    riverMesh.rotation.x = -Math.PI / 2;
    riverMesh.position.set(-150, -0.88, 0);
    riverMesh.receiveShadow = true;
    this.group.add(riverMesh);

    // 2. Irrigation Canal Water Strip
    const canalGeo = new THREE.PlaneGeometry(200, 12, 32, 6);
    this.disposables.push(canalGeo);
    const canalMesh = new THREE.Mesh(canalGeo, this.waterHandle.material);
    canalMesh.rotation.x = -Math.PI / 2;
    canalMesh.position.set(16, -0.92, -38);
    canalMesh.receiveShadow = true;
    this.group.add(canalMesh);

    // 3. Village Pond Water
    const pondGeo = new THREE.CircleGeometry(14.8, 32);
    this.disposables.push(pondGeo);
    const pondMesh = new THREE.Mesh(pondGeo, this.waterHandle.material);
    pondMesh.rotation.x = -Math.PI / 2;
    pondMesh.position.set(-26, -0.92, 22);
    pondMesh.receiveShadow = true;
    this.group.add(pondMesh);

    // Pond Concrete Ghat (steps)
    const ghatMat = new THREE.MeshStandardMaterial({ color: 0xb6b0a6, roughness: 0.85 });
    const stepGeo = new THREE.BoxGeometry(5.5, 0.35, 1.4);
    this.disposables.push(ghatMat, stepGeo);
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(stepGeo, ghatMat);
      step.position.set(-26, -0.15 - i * 0.25, 8.2 + i * 1.1);
      step.receiveShadow = true;
      step.castShadow = true;
      this.group.add(step);
    }

    // Water Lilies (Shapla) in the Pond
    this.buildWaterLilies(-26, 22);

    // Wooden River Boats & Fishing Boats (Nouka)
    this.buildBoat(-88, 6, textures, 0, true);
    this.buildBoat(-106, -42, textures, 1.8, false);
    this.buildBoat(-96, 56, textures, 3.4, false);
    this.buildBoat(-76, 11, textures, 0.8, true);
  }

  private buildWaterLilies(cx: number, cz: number): void {
    const padGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 12);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x2f7d32, roughness: 0.72 });
    const flowerGeo = new THREE.ConeGeometry(0.16, 0.22, 6);
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.55 });
    this.disposables.push(padGeo, padMat, flowerGeo, flowerMat);

    for (let i = 0; i < 14; i++) {
      const angle = i * 2.1;
      const dist = 3.5 + (i % 4) * 2.1;
      const x = cx + Math.cos(angle) * dist;
      const z = cz + Math.sin(angle) * dist;
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(x, -0.88, z);
      this.group.add(pad);

      if (i % 2 === 0) {
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.rotation.x = Math.PI;
        flower.position.set(x, -0.78, z);
        this.group.add(flower);
      }
    }
  }

  private buildBoat(
    x: number,
    z: number,
    textures: TextureLibrary,
    phase: number,
    withCanopy: boolean
  ): void {
    const boat = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({
      map: textures.woodPlank,
      color: 0x6b3e1d,
      roughness: 0.84,
    });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const canopyMat = new THREE.MeshStandardMaterial({
      map: textures.bambooWeave,
      color: 0xc29b61,
      roughness: 0.88,
      side: THREE.DoubleSide,
    });

    // Tapered Nouka hull using Lathe/Extrude profile
    const shape = new THREE.Shape();
    shape.moveTo(-3.4, 0.35);
    shape.quadraticCurveTo(-1.8, -0.45, 0, -0.45);
    shape.quadraticCurveTo(1.8, -0.45, 3.4, 0.35);
    shape.lineTo(2.7, 0.55);
    shape.quadraticCurveTo(0, 0.15, -2.7, 0.55);
    shape.closePath();

    const hullGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.5,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.1,
      bevelSegments: 2,
    });
    hullGeo.translate(0, 0, -0.75);
    hullGeo.rotateY(Math.PI / 2);

    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.castShadow = true;
    hull.receiveShadow = true;
    boat.add(hull);

    // Wooden benches
    const benchGeo = new THREE.BoxGeometry(1.3, 0.08, 0.32);
    for (const bz of [-1.2, 0.9]) {
      const bench = new THREE.Mesh(benchGeo, trimMat);
      bench.position.set(0, 0.25, bz);
      boat.add(bench);
    }

    // Bamboo curved canopy (Chhoi) for traditional village passenger boat
    if (withCanopy) {
      const canopyGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 12, 1, true, 0, Math.PI);
      canopyGeo.rotateZ(Math.PI / 2);
      canopyGeo.rotateY(Math.PI / 2);
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 0.32, -0.2);
      canopy.castShadow = true;
      boat.add(canopy);
      this.disposables.push(canopyGeo);
    }

    // Oar
    const oarGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6);
    const oar = new THREE.Mesh(oarGeo, trimMat);
    oar.position.set(0.8, 0.45, 0.6);
    oar.rotation.z = 0.5;
    oar.rotation.x = 0.25;
    boat.add(oar);

    this.disposables.push(hullMat, trimMat, canopyMat, hullGeo, benchGeo, oarGeo);

    boat.position.set(x, -0.74, z);
    this.group.add(boat);
    this.boats.push({
      group: boat,
      baseX: x,
      baseZ: z,
      phase,
      patrolRadius: withCanopy ? 0.4 : 4.5,
    });
  }

  public update(elapsed: number, sunColor: THREE.Color, skyColor: THREE.Color): void {
    this.waterHandle.update(elapsed, sunColor, skyColor);
    for (const b of this.boats) {
      b.group.position.y = -0.74 + Math.sin(elapsed * 1.4 + b.phase) * 0.06;
      b.group.rotation.z = Math.sin(elapsed * 1.1 + b.phase) * 0.04;
      b.group.rotation.x = Math.cos(elapsed * 0.9 + b.phase) * 0.025;
      if (b.patrolRadius > 1) {
        b.group.position.z = b.baseZ + Math.sin(elapsed * 0.14 + b.phase) * b.patrolRadius;
      }
    }
  }

  public dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
