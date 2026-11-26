import * as THREE from 'three';
import { groundHeightAt } from '../world/TerrainSystem';

const _targetPos = new THREE.Vector3();
const _desiredCam = new THREE.Vector3();

export class ThirdPersonCamera {
  public yaw = 0;
  public pitch = 0.28;
  private distance = 6.2;

  public applyLookDelta(dx: number, dy: number, sensitivity: number): void {
    this.yaw -= dx * 0.005 * sensitivity;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch + dy * 0.004 * sensitivity,
      -0.08,
      1.05
    );
  }

  public update(
    camera: THREE.PerspectiveCamera,
    dt: number,
    targetX: number,
    targetY: number,
    targetZ: number,
    isDriving: boolean,
    speedKmh: number
  ): void {
    const targetDist = isDriving ? 8.2 + Math.min(3.0, speedKmh * 0.03) : 5.8;
    this.distance = THREE.MathUtils.damp(this.distance, targetDist, 6, dt);

    const lookH = isDriving ? 1.5 : 1.45;
    _targetPos.set(targetX, targetY + lookH, targetZ);

    const horiz = Math.cos(this.pitch) * this.distance;
    const vert = Math.sin(this.pitch) * this.distance;

    const camX = targetX + Math.sin(this.yaw) * horiz;
    const camZ = targetZ + Math.cos(this.yaw) * horiz;
    const minGround = groundHeightAt(camX, camZ) + 0.6;
    const camY = Math.max(minGround, targetY + lookH + vert);

    _desiredCam.set(camX, camY, camZ);
    const alpha = 1 - Math.exp(-dt * 10);
    camera.position.lerp(_desiredCam, alpha);
    camera.lookAt(_targetPos);

    // Subtle FOV widening when driving fast
    const targetFov = isDriving ? 62 + Math.min(12, speedKmh * 0.14) : 60;
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 6, dt);
      camera.updateProjectionMatrix();
    }
  }
}
