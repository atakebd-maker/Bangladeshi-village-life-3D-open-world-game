import * as THREE from 'three';

const _lookAt = new THREE.Vector3();

export class FirstPersonCamera {
  public yaw = 0;
  public pitch = 0;

  public applyLookDelta(dx: number, dy: number, sensitivity: number): void {
    this.yaw -= dx * 0.005 * sensitivity;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch - dy * 0.004 * sensitivity,
      -0.85,
      0.85
    );
  }

  public update(
    camera: THREE.PerspectiveCamera,
    targetX: number,
    targetY: number,
    targetZ: number,
    isDriving: boolean
  ): void {
    const eyeY = targetY + (isDriving ? 1.42 : 1.62);
    camera.position.set(targetX, eyeY, targetZ);

    const lookDist = 10;
    _lookAt.set(
      targetX - Math.sin(this.yaw) * Math.cos(this.pitch) * lookDist,
      eyeY + Math.sin(this.pitch) * lookDist,
      targetZ - Math.cos(this.yaw) * Math.cos(this.pitch) * lookDist
    );
    camera.lookAt(_lookAt);
  }
}
