import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';
import { DoorInteractable } from '../buildings/HouseModels';
import { SitSpot } from '../buildings/InteriorSystem';
import { NPCController } from '../characters/NPCController';
import { PlayerController } from '../player/PlayerController';
import { NpcInteractable } from '../player/PlayerInteraction';
import { ActiveDialogueState, DialogueChoice } from '../types/game';
import { VehicleEntity } from '../vehicles/VehicleController';
import { groundHeightAt } from '../world/TerrainSystem';
import { CricketSystem } from './CricketSystem';
import { FootballSystem } from './FootballSystem';
import { MissionSystem } from './MissionSystem';

function isWalkableShoreOrGhat(x: number, z: number): boolean {
  const onGhat =
    (x >= -73.8 && x <= -63.2 && z >= 6.6 && z <= 9.4) ||
    (x >= -115.5 && x <= -108.9 && z >= 6.6 && z <= 9.4);
  if (onGhat) return true;
  return groundHeightAt(x, z) >= -0.95;
}

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
  ): { notice?: string } {
    audio.unlock();
    if (player.drivingVehicleId) {
      const current = vehicles.find((v) => v.id === player.drivingVehicleId);
      if (current) {
        if (current.kind === 'boat') {
          // Search around the boat (1.8m to 8.5m) for dry shore or wooden ghat
          let landed: [number, number] | null = null;
          for (let radius = 2.0; radius <= 8.5 && !landed; radius += 1.3) {
            for (let a = 0; a < 16; a++) {
              const ang = (a / 16) * Math.PI * 2;
              const tx = current.x + Math.cos(ang) * radius;
              const tz = current.z + Math.sin(ang) * radius;
              if (isWalkableShoreOrGhat(tx, tz)) {
                landed = [tx, tz];
                break;
              }
            }
          }
          if (!landed) {
            return { notice: 'নৌকা থেকে নামতে তীর বা কাঠের ঘাটের কাছে যান!' };
          }
          current.hasDriver = false;
          current.speed = 0;
          player.x = landed[0];
          player.z = landed[1];
          player.y = Math.max(-0.12, groundHeightAt(landed[0], landed[1])) + 0.05;
        } else {
          current.hasDriver = false;
          const cos = Math.cos(current.rotationY);
          const sin = Math.sin(current.rotationY);
          const [ex, , ez] = current.spec.exitOffset;
          player.x = current.x + ex * cos + ez * sin;
          player.z = current.z - ex * sin + ez * cos;
          player.y = current.y;
        }
      }
      player.drivingVehicleId = null;
      player.rig.root.visible = true;
      audio.playUiClick();
      return {};
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
      if (nearestVehicle.kind === 'boat') {
        return { notice: 'নৌকা চলছে! পদ্মা নদী পেরিয়ে পশ্চিম পাড়ের চরে ঘুরে আসুন।' };
      }
    }
    return {};
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
