import * as THREE from 'three';
import { WeatherPreset } from '../types/game';

export class WeatherSystem {
  public currentWeather: WeatherPreset = 'sunny';
  public cloudCover = 0;
  public rainIntensity = 0;
  public fogBonus = 0;

  private rainPoints: THREE.Points;
  private rainMat: THREE.PointsMaterial;
  private rainCount = 900;
  private flashLight: THREE.DirectionalLight;
  private thunderTimer = 8;
  private flashIntensity = 0;

  constructor(scene: THREE.Scene) {
    const positions = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 28;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainMat = new THREE.PointsMaterial({
      color: 0xcbd5e1,
      size: 0.22,
      transparent: true,
      opacity: 0,
    });
    this.rainPoints = new THREE.Points(geo, this.rainMat);
    this.rainPoints.frustumCulled = false;
    scene.add(this.rainPoints);

    this.flashLight = new THREE.DirectionalLight(0xdbeafe, 0);
    this.flashLight.position.set(-20, 60, -20);
    scene.add(this.flashLight);
  }

  public setWeather(preset: WeatherPreset): void {
    this.currentWeather = preset;
  }

  public getWeatherLabel(): string {
    switch (this.currentWeather) {
      case 'sunny':
        return 'রোদেলা';
      case 'cloudy':
        return 'মেঘলা';
      case 'rainy':
        return 'বৃষ্টি';
      case 'heavy_rain':
        return 'ভারী বৃষ্টি';
      case 'thunderstorm':
        return 'বজ্রবৃষ্টি';
      case 'fog':
        return 'কুয়াশা';
    }
  }

  public update(
    dt: number,
    playerX: number,
    playerZ: number,
    onThunder?: () => void
  ): void {
    let targetCloud = 0;
    let targetRain = 0;
    let targetFog = 0;

    switch (this.currentWeather) {
      case 'sunny':
        targetCloud = 0;
        targetRain = 0;
        targetFog = 0;
        break;
      case 'cloudy':
        targetCloud = 0.58;
        targetRain = 0;
        targetFog = 0.0018;
        break;
      case 'rainy':
        targetCloud = 0.72;
        targetRain = 0.55;
        targetFog = 0.004;
        break;
      case 'heavy_rain':
        targetCloud = 0.85;
        targetRain = 0.9;
        targetFog = 0.0065;
        break;
      case 'thunderstorm':
        targetCloud = 0.94;
        targetRain = 1.0;
        targetFog = 0.0075;
        break;
      case 'fog':
        targetCloud = 0.45;
        targetRain = 0;
        targetFog = 0.015;
        break;
    }

    const k = 1 - Math.exp(-dt * 1.5);
    this.cloudCover = THREE.MathUtils.lerp(this.cloudCover, targetCloud, k);
    this.rainIntensity = THREE.MathUtils.lerp(this.rainIntensity, targetRain, k);
    this.fogBonus = THREE.MathUtils.lerp(this.fogBonus, targetFog, k);

    // Update rain particles around player
    this.rainMat.opacity = this.rainIntensity * 0.65;
    this.rainPoints.visible = this.rainIntensity > 0.04;
    if (this.rainPoints.visible) {
      this.rainPoints.position.set(playerX, 0, playerZ);
      const pos = this.rainPoints.geometry.attributes.position as THREE.BufferAttribute;
      const fallSpeed = 24 + this.rainIntensity * 14;
      for (let i = 0; i < this.rainCount; i++) {
        let y = pos.getY(i) - fallSpeed * dt;
        if (y < 0) y = 28;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // Lightning & thunder in thunderstorm
    if (this.currentWeather === 'thunderstorm') {
      this.thunderTimer -= dt;
      if (this.thunderTimer <= 0) {
        this.thunderTimer = 7 + Math.random() * 10;
        this.flashIntensity = 4.5;
        onThunder?.();
      }
    }
    this.flashIntensity = Math.max(0, this.flashIntensity - dt * 12);
    this.flashLight.intensity = this.flashIntensity;
  }

  public dispose(): void {
    this.rainPoints.geometry.dispose();
    this.rainMat.dispose();
  }
}
