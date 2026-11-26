export class VehicleSounds {
  private ctx: AudioContext;
  private out: GainNode;
  private engineOsc: OscillatorNode;
  private engineGain: GainNode;
  private hornCooldown = 0;

  constructor(ctx: AudioContext, output: GainNode) {
    this.ctx = ctx;
    this.out = output;

    this.engineOsc = ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 55;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;

    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0;

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.out);
    this.engineOsc.start();
  }

  public update(drivingKind: string | null, speedKmh: number, hornPressed: boolean): void {
    const now = this.ctx.currentTime;
    if (!drivingKind || drivingKind === 'bicycle' || drivingKind === 'cycle_rickshaw') {
      this.engineGain.gain.setTargetAtTime(0, now, 0.08);
    } else {
      const isHeavy = drivingKind === 'local_bus' || drivingKind === 'truck' || drivingKind === 'jeep';
      const isCng = drivingKind === 'cng' || drivingKind === 'auto_rickshaw';
      const baseHz = isHeavy ? 42 : isCng ? 68 : 58;
      const targetHz = baseHz + Math.abs(speedKmh) * (isCng ? 1.8 : 1.35);
      this.engineOsc.frequency.setTargetAtTime(targetHz, now, 0.06);
      const vol = 0.055 + Math.min(0.09, Math.abs(speedKmh) * 0.002);
      this.engineGain.gain.setTargetAtTime(vol, now, 0.08);
    }

    if (hornPressed && this.hornCooldown <= 0 && drivingKind) {
      this.hornCooldown = 0.35;
      this.playHorn(drivingKind);
    }
    if (this.hornCooldown > 0) {
      this.hornCooldown = Math.max(0, this.hornCooldown - 0.016);
    }
  }

  private playHorn(kind: string): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    if (kind === 'bicycle' || kind === 'cycle_rickshaw') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1650, now);
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(g);
      g.connect(this.out);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      osc.type = 'sawtooth';
      const f = kind === 'local_bus' || kind === 'truck' ? 185 : 390;
      osc.frequency.setValueAtTime(f, now);
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(g);
      g.connect(this.out);
      osc.start(now);
      osc.stop(now + 0.24);
    }
  }

  public dispose(): void {
    try {
      this.engineOsc.stop();
    } catch {
      // ignore
    }
  }
}
