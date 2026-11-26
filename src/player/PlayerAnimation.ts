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
  panjabiSkirt: THREE.Mesh;
  batMesh: THREE.Group;
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
  }
): HumanRig {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const scale = options.isChild ? 0.76 : 1.0;
  bodyPivot.scale.setScalar(scale);

  const skinMat = new THREE.MeshStandardMaterial({ color: options.skinHex, roughness: 0.68 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: options.shirtHex, roughness: 0.82 });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: options.pantsHex,
    map: options.hasLungi ? textures.lungiCheck : null,
    roughness: 0.85,
  });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.75 });
  const sandalMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });

  // Contact shadow disc grounded at y=0.02
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.95),
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      depthWrite: false,
      opacity: 0.52,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  root.add(shadowPlane);

  // Legs
  const makeLeg = (sideX: number) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(sideX, 0.78, 0);
    const upper = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.085, 0.42, 4, 8),
      options.hasLungi || options.hasSaree ? skinMat : pantsMat
    );
    upper.position.y = -0.32;
    upper.castShadow = true;
    legGroup.add(upper);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.22), sandalMat);
    foot.position.set(0, -0.73, 0.04);
    foot.castShadow = true;
    legGroup.add(foot);
    bodyPivot.add(legGroup);
    return legGroup;
  };
  const leftLeg = makeLeg(-0.11);
  const rightLeg = makeLeg(0.11);

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.24), shirtMat);
  torso.position.y = 1.1;
  torso.castShadow = true;
  bodyPivot.add(torso);

  // Lungi Wrap Cylinder
  const lungiSkirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.24, 0.62, 12),
    new THREE.MeshStandardMaterial({ map: textures.lungiCheck, roughness: 0.85 })
  );
  lungiSkirt.position.y = 0.56;
  lungiSkirt.castShadow = true;
  lungiSkirt.visible = Boolean(options.hasLungi);
  bodyPivot.add(lungiSkirt);

  // Panjabi Lower Kurta Skirt
  const panjabiSkirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.25, 0.34, 12),
    shirtMat
  );
  panjabiSkirt.position.y = 0.74;
  panjabiSkirt.castShadow = true;
  panjabiSkirt.visible = Boolean(options.hasPanjabi);
  bodyPivot.add(panjabiSkirt);

  // Female Saree / Orna Drape
  if (options.hasSaree) {
    const sareeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.26, 0.78, 12),
      new THREE.MeshStandardMaterial({ map: textures.sareePattern, color: options.shirtHex, roughness: 0.8 })
    );
    sareeMesh.position.y = 0.52;
    sareeMesh.castShadow = true;
    bodyPivot.add(sareeMesh);

    const orna = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.52, 0.26),
      new THREE.MeshStandardMaterial({ map: textures.sareePattern, color: options.shirtHex, roughness: 0.75 })
    );
    orna.position.set(0, 1.12, 0.01);
    orna.rotation.z = 0.08;
    bodyPivot.add(orna);
  }

  // Head with Facial Details
  const head = new THREE.Group();
  head.position.y = 1.54;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), skinMat);
  skull.castShadow = true;
  head.add(skull);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.168, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  );
  hair.rotation.x = -0.22;
  head.add(hair);

  if (options.isFemale) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), hairMat);
    bun.position.set(0, -0.02, -0.17);
    head.add(bun);
  }

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  for (const ex of [-0.055, 0.055]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), eyeMat);
    eye.position.set(ex, 0.02, 0.145);
    head.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.045, 0.03), skinMat);
  nose.position.set(0, -0.01, 0.16);
  head.add(nose);
  bodyPivot.add(head);

  // Arms + Hands
  const makeArm = (sideX: number) => {
    const arm = new THREE.Group();
    arm.position.set(sideX, 1.32, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 8), shirtMat);
    sleeve.position.y = -0.14;
    sleeve.castShadow = true;
    arm.add(sleeve);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.22, 4, 8), skinMat);
    forearm.position.y = -0.36;
    forearm.castShadow = true;
    arm.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 6), skinMat);
    hand.position.y = -0.5;
    arm.add(hand);

    bodyPivot.add(arm);
    return arm;
  };
  const leftArm = makeArm(-0.27);
  const rightArm = makeArm(0.27);

  // Optional Cricket Bat in Right Hand (hidden unless playing cricket)
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
  batMesh.position.set(0, -0.52, 0.08);
  batMesh.rotation.x = Math.PI / 2.2;
  batMesh.visible = false;
  rightArm.add(batMesh);

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
    panjabiSkirt,
    batMesh,
  };
}

export class PlayerAnimation {
  private walkPhase = 0;

  public applyOutfit(rig: HumanRig, outfit: PlayerOutfit, textures: TextureLibrary): void {
    const torsoMat = rig.torso.material as THREE.MeshStandardMaterial;
    if (outfit === 'lungi_genji') {
      torsoMat.color.setHex(0xf8fafc); // white genji
      rig.lungiSkirt.visible = true;
      (rig.lungiSkirt.material as THREE.MeshStandardMaterial).map = textures.lungiCheck;
      rig.panjabiSkirt.visible = false;
    } else if (outfit === 'panjabi_pajama') {
      torsoMat.color.setHex(0x166534); // emerald panjabi
      rig.lungiSkirt.visible = false;
      rig.panjabiSkirt.visible = true;
      (rig.panjabiSkirt.material as THREE.MeshStandardMaterial).color.setHex(0x166534);
    } else {
      torsoMat.color.setHex(0x2563eb); // blue shirt
      rig.lungiSkirt.visible = false;
      rig.panjabiSkirt.visible = false;
    }
  }

  public update(
    rig: HumanRig,
    dt: number,
    speed: number,
    isGrounded: boolean,
    posture: 'standing' | 'crouching' | 'sitting' | 'climbing',
    combatAction: 'none' | 'punch' | 'kick' | 'block' | 'dodge',
    combatTimer: number,
    isDriving: boolean
  ): void {
    if (isDriving) {
      rig.bodyPivot.position.y = 0.12;
      rig.leftLeg.rotation.x = -Math.PI / 2.4;
      rig.rightLeg.rotation.x = -Math.PI / 2.4;
      rig.leftArm.rotation.x = -0.85;
      rig.rightArm.rotation.x = -0.85;
      return;
    }

    if (posture === 'sitting') {
      rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, -0.38, 12, dt);
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, -Math.PI / 2.1, 12, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, -Math.PI / 2.1, 12, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -0.3, 10, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -0.3, 10, dt);
      return;
    }

    const crouchY = posture === 'crouching' ? -0.28 : 0;
    rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, crouchY, 14, dt);

    if (combatAction === 'punch') {
      const swing = Math.sin((combatTimer / 0.28) * Math.PI) * 1.45;
      rig.rightArm.rotation.x = -swing;
      rig.leftArm.rotation.x = 0.2;
      return;
    }
    if (combatAction === 'kick') {
      const swing = Math.sin((combatTimer / 0.34) * Math.PI) * 1.35;
      rig.rightLeg.rotation.x = -swing;
      rig.leftArm.rotation.x = -0.5;
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
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0.45, 10, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, -0.35, 10, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -0.6, 10, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -0.6, 10, dt);
      return;
    }

    if (speed > 0.25) {
      this.walkPhase += dt * (4.8 + speed * 0.95);
      const amp = Math.min(0.85, speed * 0.14);
      rig.leftLeg.rotation.x = Math.sin(this.walkPhase) * amp;
      rig.rightLeg.rotation.x = -Math.sin(this.walkPhase) * amp;
      rig.leftArm.rotation.x = -Math.sin(this.walkPhase) * amp * 0.8;
      rig.rightArm.rotation.x = Math.sin(this.walkPhase) * amp * 0.8;
    } else {
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 12, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 12, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0, 12, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, 0, 12, dt);
    }
  }
}
