import * as THREE from 'three';
import { HumanRig } from '../player/PlayerAnimation';

export class NPCAnimation {
  public static update(
    rig: HumanRig,
    dt: number,
    phase: number,
    isMoving: boolean,
    isSitting: boolean,
    isWorking: boolean
  ): void {
    const cloth = rig.lungiSkirt.visible ? rig.lungiSkirt : rig.sareeSkirt;

    if (isSitting) {
      rig.bodyPivot.position.y = -0.35;
      rig.leftLeg.rotation.x = -Math.PI / 2.2;
      rig.rightLeg.rotation.x = -Math.PI / 2.2;
      rig.leftArm.rotation.x = -0.25;
      rig.rightArm.rotation.x = -0.25;
      if (cloth) {
        cloth.rotation.x = -0.95;
        cloth.rotation.z = 0;
        cloth.scale.set(1.08, 1, 1.35);
      }
      return;
    }

    rig.bodyPivot.position.y = 0;
    if (isMoving) {
      const amp = cloth ? 0.38 : 0.55;
      const stride = Math.sin(phase);
      rig.leftLeg.rotation.x = stride * amp;
      rig.rightLeg.rotation.x = -stride * amp;
      rig.leftArm.rotation.x = -stride * 0.42;
      rig.rightArm.rotation.x = stride * 0.42;
      if (cloth) {
        const stretch = Math.abs(stride);
        cloth.scale.set(1 - stretch * 0.06, 1, 1 + stretch * 0.65);
        cloth.rotation.x = Math.sin(phase * 2) * 0.05;
        cloth.rotation.z = Math.cos(phase) * 0.05;
      }
    } else if (isWorking) {
      rig.leftLeg.rotation.x = 0;
      rig.rightLeg.rotation.x = 0;
      rig.rightArm.rotation.x = -0.6 + Math.sin(phase * 1.6) * 0.35;
      rig.leftArm.rotation.x = -0.35;
      if (cloth) {
        cloth.scale.set(1, 1, 1);
        cloth.rotation.x = 0;
        cloth.rotation.z = 0;
      }
    } else {
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0, 8, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, 0, 8, dt);
      if (cloth) {
        cloth.scale.x = THREE.MathUtils.damp(cloth.scale.x, 1, 8, dt);
        cloth.scale.z = THREE.MathUtils.damp(cloth.scale.z, 1, 8, dt);
        cloth.rotation.x = THREE.MathUtils.damp(cloth.rotation.x, 0, 8, dt);
        cloth.rotation.z = THREE.MathUtils.damp(cloth.rotation.z, 0, 8, dt);
      }
    }
  }
}
