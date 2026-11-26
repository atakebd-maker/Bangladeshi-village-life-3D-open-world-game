import { AudioManager } from '../audio/AudioManager';
import { InputState } from '../types/game';

export class PlayerCombat {
  public action: 'none' | 'punch' | 'kick' | 'block' | 'dodge' = 'none';
  public timer = 0;
  private cooldown = 0;

  public update(dt: number, input: InputState, audio: AudioManager): { dodgeBoost: boolean } {
    let dodgeBoost = false;
    if (this.cooldown > 0) this.cooldown -= dt;

    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.action = 'none';
      }
    }

    if (this.timer <= 0 && this.cooldown <= 0) {
      if (input.punch) {
        this.action = 'punch';
        this.timer = 0.28;
        this.cooldown = 0.32;
        audio.playPunchOrKick(false);
      } else if (input.kick) {
        this.action = 'kick';
        this.timer = 0.34;
        this.cooldown = 0.42;
        audio.playPunchOrKick(true);
      } else if (input.dodge) {
        this.action = 'dodge';
        this.timer = 0.28;
        this.cooldown = 0.6;
        dodgeBoost = true;
      } else if (input.block) {
        this.action = 'block';
      } else {
        this.action = 'none';
      }
    }

    return { dodgeBoost };
  }
}
