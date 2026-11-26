import { AudioManager } from '../audio/AudioManager';
import { InputState, WeaponMode } from '../types/game';

export class PlayerCombat {
  public action: 'none' | 'punch' | 'kick' | 'block' | 'dodge' | 'shoot' = 'none';
  public timer = 0;
  public weaponMode: WeaponMode = 'fist';
  public ammo = 30;
  private cooldown = 0;

  public toggleWeapon(): void {
    this.weaponMode = this.weaponMode === 'fist' ? 'gun' : 'fist';
  }

  public update(
    dt: number,
    input: InputState,
    audio: AudioManager
  ): { dodgeBoost: boolean; meleeHit: boolean; gunFired: boolean } {
    let dodgeBoost = false;
    let meleeHit = false;
    let gunFired = false;

    if (this.cooldown > 0) this.cooldown -= dt;

    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.action = 'none';
      }
    }

    if (this.timer <= 0 && this.cooldown <= 0) {
      if (input.fireGun || (input.punch && this.weaponMode === 'gun')) {
        if (this.ammo <= 0) this.ammo = 30;
        this.ammo--;
        this.action = 'shoot';
        this.timer = 0.22;
        this.cooldown = 0.24;
        gunFired = true;
        audio.playGunshot();
      } else if (input.punch) {
        this.action = 'punch';
        this.timer = 0.28;
        this.cooldown = 0.32;
        meleeHit = true;
        audio.playPunchOrKick(false);
      } else if (input.kick) {
        this.action = 'kick';
        this.timer = 0.34;
        this.cooldown = 0.42;
        meleeHit = true;
        audio.playPunchOrKick(true);
      } else if (input.dodge) {
        this.action = 'dodge';
        this.timer = 0.28;
        this.cooldown = 0.55;
        dodgeBoost = true;
      } else if (input.block) {
        this.action = 'block';
      } else {
        this.action = 'none';
      }
    }

    return { dodgeBoost, meleeHit, gunFired };
  }
}
