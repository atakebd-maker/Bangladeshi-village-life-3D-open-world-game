import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { PlayerOutfit } from '../types/game';

export interface HumanRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  lungiSkirt: THREE.Mesh;
  sareeSkirt: THREE.Mesh | null;
  panjabiSkirt: THREE.Mesh;
  gamchaMesh: THREE.Mesh;
  batMesh: THREE.Group;
  gunMesh: THREE.Group;
}

export function buildHumanRig(
  textures: TextureLibrary,
  options: {
    skinHex: number;
    shirtHex: number;
    pantsHex: number;
    isFemale?: boolean;
    isChild?: boolean;
    hasLungi?: boolean;
    hasPanjabi?: boolean;
    hasSaree?: boolean;
    hasGamcha?: boolean;
    hasBeard?: boolean;
  }
): HumanRig {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const scale = options.isChild ? 0.76 : 1.0;
  bodyPivot.scale.setScalar(scale);

  const skinMat = new THREE.MeshStandardMaterial({ color: options.skinHex, roughness: 0.62 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: options.shirtHex, roughness: 0.78 });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: options.pantsHex,
    map: options.hasLungi ? textures.lungiBlue : null,
    roughness: 0.82,
  });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.72 });
  const sandalMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.88 });

  // Grounded contact shadow disc
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.95),
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  root.add(shadowPlane);

  // Legs with calves & sandals (kept slightly compact on thighs so cloth wraps cleanly)
  const makeLeg = (sideX: number) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(sideX, 0.8, 0);
    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.074, 0.24, 5, 10),
      options.hasLungi || options.hasSaree ? skinMat : pantsMat
    );
    thigh.position.y = -0.19;
    thigh.castShadow = true;
    legGroup.add(thigh);

    const calf = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.06, 0.24, 5, 10),
      options.hasLungi || options.hasSaree ? skinMat : pantsMat
    );
    calf.position.y = -0.52;
    calf.castShadow = true;
    legGroup.add(calf);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.065, 0.22), sandalMat);
    foot.position.set(0, -0.76, 0.04);
    foot.castShadow = true;
    legGroup.add(foot);
    bodyPivot.add(legGroup);
    return legGroup;
  };
  const leftLeg = makeLeg(-0.105);
  const rightLeg = makeLeg(0.105);

  // Shaped Torso & Neck
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.175, 0.56, 12),
    shirtMat
  );
  torso.scale.set(1.08, 1, 0.68);
  torso.position.y = 1.11;
  torso.castShadow = true;
  bodyPivot.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.072, 0.14, 10), skinMat);
  neck.position.y = 1.42;
  bodyPivot.add(neck);

  // Waist-Pivoted Pleated Lungi Wrap (pivots from waist y=0.86 down to y=0.22)
  const lungiGeo = new THREE.CylinderGeometry(0.2, 0.265, 0.64, 16);
  lungiGeo.translate(0, -0.32, 0);
  const lungiSkirt = new THREE.Mesh(
    lungiGeo,
    new THREE.MeshStandardMaterial({
      map: textures.lungiBlue,
      roughness: 0.84,
      side: THREE.DoubleSide,
    })
  );
  lungiSkirt.position.y = 0.86;
  lungiSkirt.castShadow = true;
  lungiSkirt.visible = Boolean(options.hasLungi);
  bodyPivot.add(lungiSkirt);

  // Panjabi Lower Kurta Skirt
  const panjabiSkirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.24, 0.34, 14),
    shirtMat
  );
  panjabiSkirt.position.y = 0.74;
  panjabiSkirt.castShadow = true;
  panjabiSkirt.visible = Boolean(options.hasPanjabi);
  bodyPivot.add(panjabiSkirt);

  // Traditional Red-Checkered Gamcha Shoulder Cloth
  const gamchaMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.54, 0.28),
    new THREE.MeshStandardMaterial({ map: textures.lungiCheck, roughness: 0.85 })
  );
  gamchaMesh.position.set(-0.14, 1.18, 0.01);
  gamchaMesh.visible = Boolean(options.hasGamcha);
  bodyPivot.add(gamchaMesh);

  // Female Saree / Orna Drape (waist-pivoted so saree moves with legs)
  let sareeSkirt: THREE.Mesh | null = null;
  if (options.hasSaree) {
    const sareeGeo = new THREE.CylinderGeometry(0.2, 0.27, 0.74, 16);
    sareeGeo.translate(0, -0.37, 0);
    sareeSkirt = new THREE.Mesh(
      sareeGeo,
      new THREE.MeshStandardMaterial({
        map: textures.sareePattern,
        color: options.shirtHex,
        roughness: 0.78,
        side: THREE.DoubleSide,
      })
    );
    sareeSkirt.position.y = 0.86;
    sareeSkirt.castShadow = true;
    bodyPivot.add(sareeSkirt);

    const orna = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.52, 0.25),
      new THREE.MeshStandardMaterial({ map: textures.sareePattern, color: options.shirtHex, roughness: 0.75 })
    );
    orna.position.set(0, 1.12, 0.01);
    orna.rotation.z = 0.08;
    bodyPivot.add(orna);
  }

  // Head with Detailed Facial Features
  const head = new THREE.Group();
  head.position.y = 1.58;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.155, 16, 14), skinMat);
  skull.scale.set(0.92, 1.06, 0.96);
  skull.castShadow = true;
  head.add(skull);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.165, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
    hairMat
  );
  hair.rotation.x = -0.22;
  head.add(hair);

  if (options.isFemale) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), hairMat);
    bun.position.set(0, -0.02, -0.17);
    head.add(bun);
  }

  if (options.hasBeard) {
    const beard = new THREE.Mesh(
      new THREE.SphereGeometry(0.152, 12, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45),
      hairMat
    );
    beard.position.set(0, -0.02, 0.02);
    head.add(beard);
  }

  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  for (const ex of [-0.052, 0.052]) {
    const ew = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeWhiteMat);
    ew.position.set(ex, 0.02, 0.138);
    head.add(ew);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), pupilMat);
    pup.position.set(ex, 0.02, 0.148);
    head.add(pup);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.012, 0.015), hairMat);
    brow.position.set(ex, 0.055, 0.142);
    head.add(brow);
  }

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.048, 0.032), skinMat);
  nose.position.set(0, -0.005, 0.155);
  head.add(nose);

  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.014, 0.015),
    new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.6 })
  );
  mouth.position.set(0, -0.058, 0.142);
  head.add(mouth);
  bodyPivot.add(head);

  // Arms + Hands
  const makeArm = (sideX: number) => {
    const arm = new THREE.Group();
    arm.position.set(sideX, 1.34, 0);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), shirtMat);
    arm.add(shoulder);

    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.056, 0.2, 5, 8), shirtMat);
    sleeve.position.y = -0.14;
    sleeve.castShadow = true;
    arm.add(sleeve);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.21, 5, 8), skinMat);
    forearm.position.y = -0.35;
    forearm.castShadow = true;
    arm.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), skinMat);
    hand.position.y = -0.49;
    arm.add(hand);

    bodyPivot.add(arm);
    return arm;
  };
  const leftArm = makeArm(-0.265);
  const rightArm = makeArm(0.265);

  // Cricket Bat in Right Hand
  const batMesh = new THREE.Group();
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.52, 0.035),
    new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.72 })
  );
  blade.position.y = -0.26;
  batMesh.add(blade);
  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.02, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 })
  );
  grip.position.y = 0.08;
  batMesh.add(grip);
  batMesh.position.set(0, -0.51, 0.08);
  batMesh.rotation.x = Math.PI / 2.2;
  batMesh.visible = false;
  rightArm.add(batMesh);

  // Handgun / Pistol in Right Hand
  const gunMesh = new THREE.Group();
  const gunMetal = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.28,
  });
  const slide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.065, 0.24), gunMetal);
  slide.position.set(0, 0.04, 0.1);
  gunMesh.add(slide);
  const gunGrip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.11, 0.055), gunMetal);
  gunGrip.position.set(0, -0.02, 0.02);
  gunGrip.rotation.x = -0.22;
  gunMesh.add(gunGrip);
  gunMesh.position.set(0, -0.5, 0.04);
  gunMesh.rotation.x = Math.PI / 2;
  gunMesh.visible = false;
  rightArm.add(gunMesh);

  return {
    root,
    bodyPivot,
    head,
    torso,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    lungiSkirt,
    sareeSkirt,
    panjabiSkirt,
    gamchaMesh,
    batMesh,
    gunMesh,
  };
}

export class PlayerAnimation {
  private walkPhase = 0;

  public applyOutfit(rig: HumanRig, outfit: PlayerOutfit, textures: TextureLibrary): void {
    const torsoMat = rig.torso.material as THREE.MeshStandardMaterial;
    if (outfit === 'lungi_genji') {
      torsoMat.color.setHex(0xf8fafc);
      rig.lungiSkirt.visible = true;
      (rig.lungiSkirt.material as THREE.MeshStandardMaterial).map = textures.lungiBlue;
      rig.panjabiSkirt.visible = false;
      rig.gamchaMesh.visible = true;
    } else if (outfit === 'panjabi_pajama') {
      torsoMat.color.setHex(0x166534);
      rig.lungiSkirt.visible = false;
      rig.panjabiSkirt.visible = true;
      (rig.panjabiSkirt.material as THREE.MeshStandardMaterial).color.setHex(0x166534);
      rig.gamchaMesh.visible = true;
    } else {
      torsoMat.color.setHex(0x2563eb);
      rig.lungiSkirt.visible = false;
      rig.panjabiSkirt.visible = false;
      rig.gamchaMesh.visible = false;
    }
  }

  public update(
    rig: HumanRig,
    dt: number,
    speed: number,
    isGrounded: boolean,
    posture: 'standing' | 'crouching' | 'sitting' | 'climbing',
    combatAction: 'none' | 'punch' | 'kick' | 'block' | 'dodge' | 'shoot',
    combatTimer: number,
    isDriving: boolean,
    holdingGun: boolean
  ): void {
    rig.gunMesh.visible = holdingGun && !isDriving && !rig.batMesh.visible;
    const cloth = rig.lungiSkirt.visible ? rig.lungiSkirt : rig.sareeSkirt;

    if (isDriving) {
      rig.bodyPivot.position.y = 0.12;
      rig.leftLeg.rotation.x = -Math.PI / 2.4;
      rig.rightLeg.rotation.x = -Math.PI / 2.4;
      rig.leftArm.rotation.x = -0.85;
      rig.rightArm.rotation.x = -0.85;
      if (cloth) {
        cloth.rotation.x = -1.05;
        cloth.rotation.z = 0;
        cloth.scale.set(1.08, 0.88, 1.35);
      }
      return;
    }

    if (posture === 'sitting') {
      rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, -0.38, 12, dt);
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, -Math.PI / 2.1, 12, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, -Math.PI / 2.1, 12, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -0.3, 10, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -0.3, 10, dt);
      if (cloth) {
        cloth.rotation.x = THREE.MathUtils.damp(cloth.rotation.x, -0.95, 12, dt);
        cloth.rotation.z = THREE.MathUtils.damp(cloth.rotation.z, 0, 12, dt);
        cloth.scale.set(1.08, 0.9, 1.32);
      }
      return;
    }

    const crouchY = posture === 'crouching' ? -0.28 : 0;
    rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, crouchY, 14, dt);

    if (combatAction === 'punch') {
      const swing = Math.sin((combatTimer / 0.28) * Math.PI) * 1.5;
      rig.rightArm.rotation.x = -swing;
      rig.leftArm.rotation.x = 0.25;
      return;
    }
    if (combatAction === 'shoot') {
      rig.rightArm.rotation.x = -1.52 - Math.sin((combatTimer / 0.22) * Math.PI) * 0.18;
      rig.leftArm.rotation.x = -0.35;
      return;
    }
    if (combatAction === 'kick') {
      const kickArc = Math.sin((combatTimer / 0.34) * Math.PI);
      const swing = kickArc * (cloth ? 0.95 : 1.35);
      rig.rightLeg.rotation.x = -swing;
      rig.leftArm.rotation.x = -0.5;
      if (cloth) {
        cloth.rotation.x = -kickArc * 0.52;
        cloth.scale.set(1.04, 0.85, 1 + kickArc * 0.85);
      }
      return;
    }
    if (combatAction === 'block') {
      rig.leftArm.rotation.x = -1.2;
      rig.rightArm.rotation.x = -1.2;
      rig.leftArm.rotation.z = -0.45;
      rig.rightArm.rotation.z = 0.45;
      return;
    }

    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, 0.08, 10, dt);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, -0.08, 10, dt);

    if (!isGrounded) {
      const airAmp = cloth ? 0.28 : 0.45;
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, airAmp, 10, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, -airAmp * 0.8, 10, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -0.6, 10, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, holdingGun ? -1.45 : -0.6, 10, dt);
      if (cloth) {
        cloth.rotation.x = THREE.MathUtils.damp(cloth.rotation.x, -0.1, 10, dt);
        cloth.scale.z = THREE.MathUtils.damp(cloth.scale.z, 1.48, 10, dt);
      }
      return;
    }

    if (speed > 0.25) {
      this.walkPhase += dt * (4.8 + speed * 0.95);
      const stride = Math.sin(this.walkPhase);
      // Keep leg swing inside the flowing lungi envelope so legs never poke out of the cloth
      const maxAmp = cloth ? 0.38 : 0.82;
      const amp = Math.min(maxAmp, speed * (cloth ? 0.068 : 0.14));
      rig.leftLeg.rotation.x = stride * amp;
      rig.rightLeg.rotation.x = -stride * amp;
      const armAmp = Math.min(0.7, speed * 0.12);
      rig.leftArm.rotation.x = -stride * armAmp * 0.8;
      rig.rightArm.rotation.x = holdingGun ? -1.35 : stride * armAmp * 0.8;

      if (cloth) {
        const stretch = Math.abs(stride) * Math.min(1, speed / 5.5);
        const crouchScaleY = posture === 'crouching' ? 0.78 : 1;
        cloth.scale.set(
          1 - stretch * 0.07,
          crouchScaleY,
          1 + stretch * 0.78
        );
        cloth.rotation.x = Math.sin(this.walkPhase * 2) * 0.06 - (posture === 'crouching' ? 0.15 : 0);
        cloth.rotation.z = Math.cos(this.walkPhase) * 0.065 * Math.min(1, speed / 5);
      }
    } else {
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 12, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 12, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0, 12, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(
        rig.rightArm.rotation.x,
        holdingGun ? -1.42 : 0,
        12,
        dt
      );
      if (cloth) {
        const crouchScaleY = posture === 'crouching' ? 0.78 : 1;
        cloth.scale.x = THREE.MathUtils.damp(cloth.scale.x, 1, 10, dt);
        cloth.scale.y = THREE.MathUtils.damp(cloth.scale.y, crouchScaleY, 10, dt);
        cloth.scale.z = THREE.MathUtils.damp(cloth.scale.z, posture === 'crouching' ? 1.2 : 1, 10, dt);
        cloth.rotation.x = THREE.MathUtils.damp(cloth.rotation.x, posture === 'crouching' ? -0.2 : 0, 10, dt);
        cloth.rotation.z = THREE.MathUtils.damp(cloth.rotation.z, 0, 10, dt);
      }
    }
  }
}
