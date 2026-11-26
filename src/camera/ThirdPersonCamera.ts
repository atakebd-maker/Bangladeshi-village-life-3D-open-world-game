import * as THREE from 'three';
import { groundHeightAt } from '../world/TerrainSystem';

const _smoothedTarget = new THREE.Vector3();
const _desiredCam = new THREE.Vector3();

export class ThirdPersonCamera {
  public yaw = Math.PI; // Start directly behind player facing into the village
  public pitch = 0.24;
  private distance = 5.4;
  private initialized = false;
  private manualLookTimer = 0;

  public applyLookDelta(dx: number, dy: number, sensitivity: number): void {
    this.yaw -= dx * 0.0048 * sensitivity;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch + dy * 0.0038 * sensitivity,
      -0.05,
      0.95
    );
    this.manualLookTimer = 1.6;
  }

  public resetBehind(playerX: number, playerY: number, playerZ: number, playerRotY: number): void {
    this.yaw = playerRotY + Math.PI;
    this.pitch = 0.24;
    _smoothedTarget.set(playerX, playerY + 1.5, playerZ);
    this.initialized = true;
  }

  public update(
    camera: THREE.PerspectiveCamera,
    dt: number,
    targetX: number,
    targetY: number,
    targetZ: number,
    targetRotY: number,
    isDriving: boolean,
    speedKmh: number
  ): void {
    const safeDt = Math.min(dt, 0.05);
    const lookH = isDriving ? 1.55 : 1.52;

    if (!this.initialized) {
      this.yaw = targetRotY + Math.PI;
      _smoothedTarget.set(targetX, targetY + lookH, targetZ);
      this.initialized = true;
    }

    // Gently trail behind driving vehicle when user isn't manually orbiting
    if (this.manualLookTimer > 0) {
      this.manualLookTimer -= safeDt;
    } else if (isDriving && speedKmh > 6) {
      const desiredYaw = targetRotY + Math.PI;
      let diff = desiredYaw - this.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.yaw += diff * (1 - Math.exp(-safeDt * 2.5));
    }

    // Smoothly damp target point so terrain bumps or animations never shake the camera
    const targetAlpha = 1 - Math.exp(-safeDt * 14);
    _smoothedTarget.x = THREE.MathUtils.lerp(_smoothedTarget.x, targetX, targetAlpha);
    _smoothedTarget.y = THREE.MathUtils.lerp(_smoothedTarget.y, targetY + lookH, targetAlpha);
    _smoothedTarget.z = THREE.MathUtils.lerp(_smoothedTarget.z, targetZ, targetAlpha);

    const targetDist = isDriving ? 7.8 + Math.min(2.6, speedKmh * 0.025) : 5.3;
    this.distance = THREE.MathUtils.damp(this.distance, targetDist, 8, safeDt);

    const horiz = Math.cos(this.pitch) * this.distance;
    const vert = Math.sin(this.pitch) * this.distance;

    const camX = _smoothedTarget.x + Math.sin(this.yaw) * horiz;
    const camZ = _smoothedTarget.z + Math.cos(this.yaw) * horiz;
    const minGround = groundHeightAt(camX, camZ) + 0.65;
    const camY = Math.max(minGround, _smoothedTarget.y + vert);

    _desiredCam.set(camX, camY, camZ);
    const camAlpha = 1 - Math.exp(-safeDt * 12);
    camera.position.lerp(_desiredCam, camAlpha);
    camera.lookAt(_smoothedTarget);

    const targetFov = isDriving ? 62 + Math.min(10, speedKmh * 0.12) : 60;
    if (Math.abs(camera.fov - targetFov) > 0.35) {
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 6, safeDt);
      camera.updateProjectionMatrix();
    }
  }
}
