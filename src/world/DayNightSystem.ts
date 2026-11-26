import * as THREE from 'three';
import { TimeOfDayPreset } from '../types/game';

const PRESET_HOURS: Record<TimeOfDayPreset, number> = {
  sunrise: 6.0,
  morning: 9.2,
  noon: 12.5,
  afternoon: 15.8,
  sunset: 17.8,
  night: 22.0,
};

export class DayNightSystem {
  public readonly sunLight: THREE.DirectionalLight;
  public readonly hemiLight: THREE.HemisphereLight;
  public readonly fillLight: THREE.DirectionalLight;
  public readonly skyColor = new THREE.Color(0x87ceeb);
  public readonly sunColor = new THREE.Color(0xfff5db);
  public readonly fog: THREE.FogExp2;

  private timeHours = 9.2;
  private autoCycle = true;
  private stars: THREE.Points;
  private starsMat: THREE.PointsMaterial;

  constructor(scene: THREE.Scene, isSoftwareGl: boolean) {
    // Key Sunlight with tight orthographic shadows
    this.sunLight = new THREE.DirectionalLight(0xfff4d6, 2.35);
    this.sunLight.position.set(45, 75, 35);
    this.sunLight.castShadow = !isSoftwareGl;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    const d = 62;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 210;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    scene.add(this.sunLight);
    scene.add(this.sunLight.target);

    // Cool sky / warm earth hemisphere fill
    this.hemiLight = new THREE.HemisphereLight(0x9fd8ff, 0x5c4c34, 0.85);
    scene.add(this.hemiLight);

    // Subtle opposite rim/fill light
    this.fillLight = new THREE.DirectionalLight(0xa5d8ff, 0.45);
    this.fillLight.position.set(-40, 28, -45);
    scene.add(this.fillLight);

    // Horizon fog
    this.fog = new THREE.FogExp2(0x9bd2f2, 0.0042);
    scene.fog = this.fog;
    scene.background = this.skyColor;

    // Night Stars
    const starCount = 420;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.42;
      const r = 240;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi) + 20;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    this.starsMat = new THREE.PointsMaterial({
      color: 0xf8fafc,
      size: 1.4,
      transparent: true,
      opacity: 0,
      fog: false,
    });
    this.stars = new THREE.Points(starGeo, this.starsMat);
    scene.add(this.stars);
  }

  public setPreset(preset: TimeOfDayPreset, autoCycle: boolean): void {
    this.autoCycle = autoCycle;
    this.timeHours = PRESET_HOURS[preset];
  }

  public isNight(): boolean {
    return this.timeHours < 5.5 || this.timeHours > 18.6;
  }

  public getTimeLabel(): string {
    const h = Math.floor(this.timeHours) % 24;
    const m = Math.floor((this.timeHours % 1) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const phase =
      h >= 5 && h < 7
        ? 'Sunrise'
        : h >= 7 && h < 11
          ? 'Morning'
          : h >= 11 && h < 15
            ? 'Noon'
            : h >= 15 && h < 17
              ? 'Afternoon'
              : h >= 17 && h < 19
                ? 'Sunset'
                : 'Night';
    return `${phase} · ${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  public update(
    dt: number,
    playerX: number,
    playerZ: number,
    cloudCover: number,
    fogDensityBonus: number
  ): void {
    if (this.autoCycle) {
      // Full 24h cycle in ~10 real minutes
      this.timeHours = (this.timeHours + dt * 0.04) % 24;
    }

    const angle = ((this.timeHours - 6) / 24) * Math.PI * 2;
    const sunElev = Math.sin(angle);
    const sunHoriz = Math.cos(angle);

    // Keep directional shadow frustum centered on player for crisp shadows everywhere
    this.sunLight.target.position.set(playerX, 0, playerZ);
    this.sunLight.position.set(
      playerX + sunHoriz * 85,
      Math.max(12, sunElev * 95),
      playerZ + 38
    );

    const dayFactor = THREE.MathUtils.clamp((sunElev + 0.15) / 0.65, 0, 1);
    const goldenFactor = THREE.MathUtils.clamp(1 - Math.abs(sunElev - 0.12) * 3.5, 0, 1);

    // Sky & Sun Colors
    const noonSky = new THREE.Color(0x6ec6f5);
    const goldenSky = new THREE.Color(0xf29f67);
    const nightSky = new THREE.Color(0x0b1528);
    const overcastSky = new THREE.Color(0x6c7a89);

    this.skyColor
      .copy(nightSky)
      .lerp(noonSky, dayFactor)
      .lerp(goldenSky, goldenFactor * 0.55)
      .lerp(overcastSky, cloudCover * 0.65);

    this.sunColor
      .setHex(0xfff4d6)
      .lerp(new THREE.Color(0xff8c42), goldenFactor * 0.7)
      .lerp(new THREE.Color(0x7aa2d4), 1 - dayFactor);

    this.sunLight.color.copy(this.sunColor);
    const weatherDim = 1 - cloudCover * 0.52;
    this.sunLight.intensity = THREE.MathUtils.lerp(0.28, 2.45, dayFactor) * weatherDim;
    this.hemiLight.intensity = THREE.MathUtils.lerp(0.32, 0.92, dayFactor) * (1 - cloudCover * 0.25);
    this.hemiLight.color.copy(this.skyColor);
    this.fillLight.intensity = THREE.MathUtils.lerp(0.18, 0.45, dayFactor);

    this.fog.color.copy(this.skyColor);
    this.fog.density = 0.0036 + fogDensityBonus;

    this.starsMat.opacity = THREE.MathUtils.clamp((0.25 - dayFactor) * 3.5, 0, 0.85) * (1 - cloudCover);
    this.stars.position.set(playerX, 0, playerZ);
  }

  public dispose(): void {
    this.stars.geometry.dispose();
    this.starsMat.dispose();
  }
}
