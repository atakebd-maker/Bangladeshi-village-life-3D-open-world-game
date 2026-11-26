export class EnvironmentSounds {
  private ctx: AudioContext;
  private out: GainNode;
  private rainNoise: AudioBufferSourceNode | null = null;
  private rainGain: GainNode;
  private birdTimer = 1.5;
  private animalTimer = 6.0;

  constructor(ctx: AudioContext, output: GainNode) {
    this.ctx = ctx;
    this.out = output;

    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;

    // Continuous filtered pink-ish noise for rain / river breeze
    const seconds = 2;
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
      data[i] *= 2.5;
    }

    this.rainNoise = ctx.createBufferSource();
    this.rainNoise.buffer = buf;
    this.rainNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;

    this.rainNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.out);
    this.rainNoise.start();
  }

  public update(dt: number, rainIntensity: number, isNight: boolean, nearWater: boolean): void {
    const now = this.ctx.currentTime;
    const targetRain = Math.max(rainIntensity * 0.25, nearWater ? 0.05 : 0.012);
    this.rainGain.gain.setTargetAtTime(targetRain, now, 0.25);

    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      this.birdTimer = isNight ? 3.5 + Math.random() * 4 : 2.2 + Math.random() * 4.5;
      if (rainIntensity < 0.4) {
        if (isNight) {
          this.triggerCricketChirp();
        } else {
          this.triggerBirdChirp();
        }
      }
    }

    this.animalTimer -= dt;
    if (this.animalTimer <= 0) {
      this.animalTimer = 9 + Math.random() * 10;
      if (Math.random() < 0.5) {
        this.triggerCowMoo();
      } else {
        this.triggerChickenCluck();
      }
    }
  }

  private triggerBirdChirp(): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const base = 1800 + Math.random() * 1100;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.35, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(base * 0.9, now + 0.14);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.045, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0005, now + 0.16);
    osc.connect(g);
    g.connect(this.out);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  private triggerCricketChirp(): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4100, now);
    g.gain.setValueAtTime(0.018, now);
    g.gain.exponentialRampToValueAtTime(0.0005, now + 0.09);
    osc.connect(g);
    g.connect(this.out);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public triggerCowMoo(): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.linearRampToValueAtTime(98, now + 0.65);
    filter.type = 'lowpass';
    filter.frequency.value = 360;
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.055, now + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0008, now + 0.75);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.out);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  public triggerChickenCluck(): void {
    const now = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.14;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, t);
      osc.frequency.exponentialRampToValueAtTime(340, t + 0.08);
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(g);
      g.connect(this.out);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  public triggerThunder(): void {
    const now = this.ctx.currentTime;
    const len = this.ctx.sampleRate * 1.4;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.55));
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 210;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.45, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    src.connect(lp);
    lp.connect(g);
    g.connect(this.out);
    src.start(now);
  }

  public dispose(): void {
    try {
      this.rainNoise?.stop();
    } catch {
      // ignore
    }
  }
}
