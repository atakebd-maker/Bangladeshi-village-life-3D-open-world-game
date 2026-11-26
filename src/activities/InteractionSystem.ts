import { AudioManager } from '../audio/AudioManager';
import { SitSpot } from '../buildings/InteriorSystem';
import { NPCController } from '../characters/NPCController';
import { PlayerController } from '../player/PlayerController';
import { NpcInteractable } from '../player/PlayerInteraction';
import { VehicleEntity } from '../vehicles/VehicleController';
import { CricketSystem } from './CricketSystem';
import { FootballSystem } from './FootballSystem';
import { MissionSystem } from './MissionSystem';

export class InteractionSystem {
  public activeDialogue: { speaker: string; text: string } | null = null;
  private dialogueTimer = 0;

  public showDialogue(speaker: string, text: string, duration = 5.5): void {
    this.activeDialogue = { speaker, text };
    this.dialogueTimer = duration;
  }

  public update(dt: number): void {
    if (this.dialogueTimer > 0) {
      this.dialogueTimer -= dt;
      if (this.dialogueTimer <= 0) {
        this.activeDialogue = null;
      }
    }
  }

  public handleVehicleToggle(
    player: PlayerController,
    vehicles: VehicleEntity[],
    nearestVehicle: VehicleEntity | null,
    missions: MissionSystem,
    audio: AudioManager
  ): void {
    audio.unlock();
    if (player.drivingVehicleId) {
      const current = vehicles.find((v) => v.id === player.drivingVehicleId);
      if (current) {
        current.hasDriver = false;
        const cos = Math.cos(current.rotationY);
        const sin = Math.sin(current.rotationY);
        const [ex, , ez] = current.spec.exitOffset;
        player.x = current.x + ex * cos + ez * sin;
        player.z = current.z - ex * sin + ez * cos;
        player.y = current.y;
      }
      player.drivingVehicleId = null;
      player.rig.root.visible = true;
      audio.playUiClick();
      return;
    }

    if (nearestVehicle) {
      nearestVehicle.hasDriver = true;
      player.drivingVehicleId = nearestVehicle.id;
      player.posture = 'standing';
      if (nearestVehicle.kind === 'motorcycle' || nearestVehicle.kind === 'sports_bike') {
        missions.complete('mission-garage');
      }
      audio.playUiClick();
    }
  }

  public handlePrimaryInteract(
    player: PlayerController,
    npcCtrl: NPCController,
    nearestNpc: NpcInteractable | null,
    nearestSit: SitSpot | null,
    nearCricket: boolean,
    nearFootball: boolean,
    cricket: CricketSystem,
    football: FootballSystem,
    missions: MissionSystem,
    audio: AudioManager
  ): void {
    audio.unlock();

    if (cricket.state.active) {
      cricket.swingBat(audio);
      return;
    }

    if (nearCricket) {
      player.x = 18;
      player.z = 74.5;
      player.rotationY = Math.PI;
      player.rig.batMesh.visible = true;
      cricket.startMatch();
      audio.playUiClick();
      return;
    }

    if (nearFootball) {
      football.kick(player.x, player.z, player.rotationY, audio);
      return;
    }

    if (nearestSit) {
      player.toggleSit(nearestSit);
      audio.playUiClick();
      return;
    }

    if (nearestNpc) {
      const dlg = npcCtrl.getDialogue(nearestNpc);
      if (dlg.giftItem) {
        player.inventory.addItem(dlg.giftItem);
      }
      if (nearestNpc.id === 'npc-karim' && player.inventory.hasItem('Hot Dudh Cha')) {
        missions.complete('mission-tea');
        this.showDialogue(dlg.speaker, 'Thank you for the hot Dudh Cha! May your journey be blessed!');
      } else if (nearestNpc.id === 'npc-fisherman') {
        missions.complete('mission-river');
        this.showDialogue(dlg.speaker, dlg.text);
      } else {
        this.showDialogue(dlg.speaker, dlg.text);
      }
      audio.playUiClick();
    }
  }
}
