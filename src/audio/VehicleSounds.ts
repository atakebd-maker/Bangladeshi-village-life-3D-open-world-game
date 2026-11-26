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

  private splashCooldown = 0;

  public update(drivingKind: string | null, speedKmh: number, hornPressed: boolean): void {
    const now = this.ctx.currentTime;
    if (!drivingKind || drivingKind === 'bicycle' || drivingKind === 'cycle_rickshaw' || drivingKind === 'boat') {
      this.engineGain.gain.setTargetAtTime(0, now, 0.08);
      if (drivingKind === 'boat' && Math.abs(speedKmh) > 2.5) {
        this.splashCooldown -= 0.016;
        if (this.splashCooldown <= 0) {
          this.splashCooldown = Math.max(0.45, 0.95 - Math.abs(speedKmh) * 0.012);
          this.playOarSplash();
        }
      }
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

  private playOarSplash(): void {
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.16);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(520, now);
    bp.frequency.exponentialRampToValueAtTime(220, now + 0.15);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.075, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.out);
    src.start(now);
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
    } else if (kind === 'boat') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.26);
      g.gain.setValueAtTime(0.11, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(g);
      g.connect(this.out);
      osc.start(now);
      osc.stop(now + 0.29);
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
