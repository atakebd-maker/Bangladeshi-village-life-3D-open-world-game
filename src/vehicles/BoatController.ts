import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { VehicleEntity, VehicleSpec } from './VehicleController';

export class BoatController {
  public static createBoat(
    id: string,
    label: string,
    x: number,
    z: number,
    rotY: number,
    withCanopy: boolean,
    hullColorHex: number,
    textures: TextureLibrary
  ): VehicleEntity {
    const spec: VehicleSpec = {
      id,
      label,
      kind: 'boat',
      maxSpeed: withCanopy ? 9.5 : 11.2,
      accel: 5.8,
      turnRate: 1.65,
      wheelRadius: 0.4,
      seatOffset: [0, 0.72, -0.55],
      exitOffset: [2.1, 0.25, 0],
    };

    const entity = new VehicleEntity(spec, x, z, rotY);
    const body = entity.bodyGroup;

    const hullMat = new THREE.MeshStandardMaterial({
      map: textures.woodPlank,
      color: hullColorHex,
      roughness: 0.82,
      metalness: 0.04,
    });
    const tarTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.65,
      metalness: 0.12,
    });
    const benchMat = new THREE.MeshStandardMaterial({
      map: textures.woodPlank,
      color: 0x92400e,
      roughness: 0.78,
    });
    const canopyMat = new THREE.MeshStandardMaterial({
      map: textures.bambooWeave,
      color: 0xc29b61,
      roughness: 0.88,
      side: THREE.DoubleSide,
    });

    // 1. Curved Bangladeshi Nouka Hull (ExtrudeGeometry)
    const shape = new THREE.Shape();
    shape.moveTo(-3.55, 0.42);
    shape.quadraticCurveTo(-1.95, -0.46, 0, -0.46);
    shape.quadraticCurveTo(1.95, -0.46, 3.55, 0.42);
    shape.lineTo(2.85, 0.6);
    shape.quadraticCurveTo(0, 0.16, -2.85, 0.6);
    shape.closePath();

    const hullGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.56,
      bevelEnabled: true,
      bevelThickness: 0.11,
      bevelSize: 0.09,
      bevelSegments: 2,
    });
    hullGeo.translate(0, 0, -0.78);
    hullGeo.rotateY(Math.PI / 2);

    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.castShadow = true;
    hull.receiveShadow = true;
    body.add(hull);

    // 2. Dark tarred gunwale trim & raised bow/stern prows (গলুই)
    const prowGeo = new THREE.ConeGeometry(0.18, 0.72, 6);
    for (const dir of [-1, 1]) {
      const prow = new THREE.Mesh(prowGeo, tarTrimMat);
      prow.position.set(0, 0.68, dir * 3.35);
      prow.rotation.x = dir * 0.62;
      prow.castShadow = true;
      body.add(prow);
    }

    // 3. Inner wooden deck & cross benches (পাটাতন)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.07, 4.1), benchMat);
    deck.position.set(0, -0.02, 0);
    deck.receiveShadow = true;
    body.add(deck);

    const benchGeo = new THREE.BoxGeometry(1.36, 0.08, 0.36);
    for (const bz of [-1.25, -0.35, 1.05]) {
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(0, 0.28, bz);
      bench.castShadow = true;
      body.add(bench);
    }

    // 4. Optional Bamboo Woven Chhoi Canopy (ছই)
    if (withCanopy) {
      const canopyGeo = new THREE.CylinderGeometry(0.88, 0.88, 2.0, 14, 1, true, 0, Math.PI);
      canopyGeo.rotateZ(Math.PI / 2);
      canopyGeo.rotateY(Math.PI / 2);
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 0.36, 0.48);
      canopy.castShadow = true;
      body.add(canopy);

      // Bamboo rib arches on canopy edges
      const archGeo = new THREE.TorusGeometry(0.89, 0.03, 6, 16, Math.PI);
      for (const az of [-0.48, 1.44]) {
        const arch = new THREE.Mesh(archGeo, tarTrimMat);
        arch.position.set(0, 0.36, az);
        body.add(arch);
      }
    }

    // 5. Animated Rowing Oar (বৈঠা) mounted on stern-right oarlock
    const oarPivot = new THREE.Group();
    oarPivot.position.set(0.76, 0.42, -0.78);
    oarPivot.rotation.set(0.22, 0, 0.5);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 2.45, 7), benchMat);
    shaft.position.set(0, -0.45, 0);
    shaft.castShadow = true;
    oarPivot.add(shaft);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.62, 0.04), tarTrimMat);
    blade.position.set(0, -1.62, 0);
    blade.castShadow = true;
    oarPivot.add(blade);

    body.add(oarPivot);
    entity.oarPivot = oarPivot;

    // 6. Bow Lantern (কুপি/হারিকেন) for atmospheric river crossings at dusk/night
    const lanternGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.22, 8),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.75,
        roughness: 0.25,
      })
    );
    lanternGlass.position.set(0, 0.76, 2.45);
    body.add(lanternGlass);

    const lantern = new THREE.PointLight(0xffb74d, 0, 12, 1.8);
    lantern.position.set(0, 0.85, 2.45);
    body.add(lantern);
    entity.lanternLight = lantern;

    return entity;
  }
}
