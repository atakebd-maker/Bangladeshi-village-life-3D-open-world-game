import * as THREE from 'three';

export class SceneManager {
  public mode: 'menu' | 'playing' = 'menu';
  private menuOrbitAngle = 0.4;

  public updateMenuCamera(camera: THREE.PerspectiveCamera, dt: number): void {
    this.menuOrbitAngle += dt * 0.14;
    // Showcase the tin-roof homestead (-16, -10), parked red motorcycle (-8, -7), and lush palm grove
    const targetX = -12;
    const targetY = 1.9;
    const targetZ = -8;
    const radius = 14.5;

    camera.position.set(
      targetX + Math.cos(this.menuOrbitAngle) * radius,
      4.6 + Math.sin(this.menuOrbitAngle * 0.5) * 0.6,
      targetZ + Math.sin(this.menuOrbitAngle) * radius
    );
    camera.lookAt(targetX, targetY, targetZ);
  }
}
