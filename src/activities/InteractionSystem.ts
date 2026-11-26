import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';
import { DoorInteractable } from '../buildings/HouseModels';
import { SitSpot } from '../buildings/InteriorSystem';
import { NPCController } from '../characters/NPCController';
import { PlayerController } from '../player/PlayerController';
import { NpcInteractable } from '../player/PlayerInteraction';
import { ActiveDialogueState, DialogueChoice } from '../types/game';
import { VehicleEntity } from '../vehicles/VehicleController';
import { CricketSystem } from './CricketSystem';
import { FootballSystem } from './FootballSystem';
import { MissionSystem } from './MissionSystem';

export class InteractionSystem {
  public activeDialogue: ActiveDialogueState | null = null;

  public closeDialogue(): void {
    this.activeDialogue = null;
  }

  public selectDialogueChoice(
    choice: DialogueChoice,
    player: PlayerController,
    missions: MissionSystem,
    audio: AudioManager
  ): void {
    if (!this.activeDialogue) return;
    audio.playUiClick();
    this.activeDialogue = {
      ...this.activeDialogue,
      currentReply: choice.reply,
    };
    if (choice.giftItem) {
      player.inventory.addItem(choice.giftItem);
    }
    if (choice.completeMissionId) {
      if (missions.complete(choice.completeMissionId)) {
        audio.playMissionComplete();
      }
    }
  }

  public update(dt: number, doors: DoorInteractable[], playerX: number, playerZ: number): void {
    // Animate doors smoothly on their hinges
    for (const d of doors) {
      const targetRot = d.isOpen ? Math.PI * 0.58 : 0;
      d.pivot.rotation.y = THREE.MathUtils.damp(d.pivot.rotation.y, targetRot, 10, dt);
    }

    // Auto-close dialogue if player walks far away
    if (this.activeDialogue) {
      // Keep dialogue open while nearby; close button or walking > 8m away closes it
      const _unused = playerX + playerZ;
      void _unused;
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
      this.activeDialogue = null;
      if (nearestVehicle.kind === 'motorcycle' || nearestVehicle.kind === 'sports_bike') {
        if (missions.complete('mission-garage')) {
          audio.playMissionComplete();
        }
      }
      audio.playUiClick();
    }
  }

  public handlePrimaryInteract(
    player: PlayerController,
    npcCtrl: NPCController,
    nearestDoor: DoorInteractable | null,
    nearestNpc: NpcInteractable | null,
    nearestSit: SitSpot | null,
    nearCricket: boolean,
    nearFootball: boolean,
    cricket: CricketSystem,
    football: FootballSystem,
    audio: AudioManager
  ): void {
    audio.unlock();

    if (cricket.state.active) {
      cricket.swingBat(audio);
      return;
    }

    if (nearestDoor) {
      nearestDoor.isOpen = !nearestDoor.isOpen;
      nearestDoor.doorCollider.disabled = nearestDoor.isOpen;
      audio.playDoorSound(nearestDoor.isOpen);
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
      this.activeDialogue = npcCtrl.openDialogue(nearestNpc);
      audio.playUiClick();
    }
  }
}
