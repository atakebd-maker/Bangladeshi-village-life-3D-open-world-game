import { GameSettings } from '../types/game';
import { EnvironmentSounds } from './EnvironmentSounds';
import { VehicleSounds } from './VehicleSounds';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private envSounds: EnvironmentSounds | null = null;
  private vehicleSounds: VehicleSounds | null = null;
  private settings: GameSettings;
  private initialized = false;

  constructor(settings: GameSettings) {
    this.settings = { ...settings };
  }

  public unlock(): void {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.ambientGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.ambientGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.applySettings(this.settings);
      this.envSounds = new EnvironmentSounds(this.ctx, this.ambientGain);
      this.vehicleSounds = new VehicleSounds(this.ctx, this.sfxGain);
      this.initialized = true;
    } catch {
      // AudioContext unavailable in restricted headless context
    }
  }

  public applySettings(settings: GameSettings): void {
    this.settings = { ...settings };
    if (!this.ctx || !this.masterGain || !this.ambientGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(settings.masterVolume, now, 0.05);
    this.ambientGain.gain.setTargetAtTime(settings.ambientVolume, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(settings.sfxVolume, now, 0.05);
  }

  public playStudioIntroChime(): void {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const freqs = [220, 329.63, 440, 659.25];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.11 / (idx + 1), now + idx * 0.09 + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.09 + 1.8);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 1.9);
    });
  }

  public playFootstep(surface: 'dirt' | 'grass' | 'road' | 'wood'): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value =
      surface === 'wood' ? 320 : surface === 'road' ? 680 : surface === 'dirt' ? 460 : 950;
    filter.Q.value = 1.6;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  public playCricketHit(power: 'six' | 'four' | 'single' | 'miss'): void {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    if (power === 'miss') {
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.14);
      gain.gain.setValueAtTime(0.12, now);
    } else {
      osc.frequency.setValueAtTime(power === 'six' ? 520 : 380, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
      gain.gain.setValueAtTime(power === 'six' ? 0.42 : 0.28, now);
    }
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playPunchOrKick(isKick: boolean): void {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isKick ? 190 : 240, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.12);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playUiClick(): void {
    this.unlock();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(860, now + 0.05);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playThunder(): void {
    if (!this.ctx || !this.ambientGain) return;
    this.envSounds?.triggerThunder();
  }

  public playCowMoo(): void {
    this.envSounds?.triggerCowMoo();
  }

  public playChickenCluck(): void {
    this.envSounds?.triggerChickenCluck();
  }

  public update(
    dt: number,
    rainIntensity: number,
    isNight: boolean,
    nearWater: boolean,
    drivingKind: string | null,
    speedKmh: number,
    hornPressed: boolean
  ): void {
    if (!this.initialized) return;
    this.envSounds?.update(dt, rainIntensity, isNight, nearWater);
    this.vehicleSounds?.update(drivingKind, speedKmh, hornPressed);
  }

  public dispose(): void {
    this.envSounds?.dispose();
    this.vehicleSounds?.dispose();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
