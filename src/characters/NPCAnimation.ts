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
    if (isSitting) {
      rig.bodyPivot.position.y = -0.35;
      rig.leftLeg.rotation.x = -Math.PI / 2.2;
      rig.rightLeg.rotation.x = -Math.PI / 2.2;
      rig.leftArm.rotation.x = -0.25;
      rig.rightArm.rotation.x = -0.25;
      return;
    }

    rig.bodyPivot.position.y = 0;
    if (isMoving) {
      const amp = 0.55;
      rig.leftLeg.rotation.x = Math.sin(phase) * amp;
      rig.rightLeg.rotation.x = -Math.sin(phase) * amp;
      rig.leftArm.rotation.x = -Math.sin(phase) * amp * 0.75;
      rig.rightArm.rotation.x = Math.sin(phase) * amp * 0.75;
    } else if (isWorking) {
      rig.leftLeg.rotation.x = 0;
      rig.rightLeg.rotation.x = 0;
      rig.rightArm.rotation.x = -0.6 + Math.sin(phase * 1.6) * 0.35;
      rig.leftArm.rotation.x = -0.35;
    } else {
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, dt);
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0, 8, dt);
      rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, 0, 8, dt);
    }
  }
}
