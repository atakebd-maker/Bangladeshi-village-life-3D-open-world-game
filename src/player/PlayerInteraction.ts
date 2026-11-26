import { DoorInteractable } from '../buildings/HouseModels';
import { SitSpot } from '../buildings/InteriorSystem';
import { InteractionPrompt } from '../types/game';
import { VehicleEntity } from '../vehicles/VehicleController';

export interface NpcInteractable {
  id: string;
  name: string;
  x: number;
  z: number;
}

export class PlayerInteraction {
  public findClosestPrompt(
    px: number,
    pz: number,
    vehicles: VehicleEntity[],
    npcs: NpcInteractable[],
    doors: DoorInteractable[],
    sitSpots: SitSpot[],
    isDriving: boolean,
    cricketActive: boolean
  ): {
    prompt: InteractionPrompt | null;
    nearestVehicle: VehicleEntity | null;
    nearestNpc: NpcInteractable | null;
    nearestDoor: DoorInteractable | null;
    nearestSit: SitSpot | null;
    nearCricket: boolean;
    nearFootball: boolean;
  } {
    if (isDriving) {
      return {
        prompt: { id: 'exit-veh', label: 'গাড়ি থেকে নামুন', kind: 'vehicle' },
        nearestVehicle: null,
        nearestNpc: null,
        nearestDoor: null,
        nearestSit: null,
        nearCricket: false,
        nearFootball: false,
      };
    }

    // House Doors (high priority when right next to entrance)
    let nearestDoor: DoorInteractable | null = null;
    let doorDist = 2.6;
    for (const d of doors) {
      const dist = Math.hypot(d.worldX - px, d.worldZ - pz);
      if (dist < doorDist) {
        doorDist = dist;
        nearestDoor = d;
      }
    }
    if (nearestDoor) {
      return {
        prompt: {
          id: nearestDoor.id,
          label: nearestDoor.isOpen ? 'দরজা বন্ধ করুন' : 'দরজা খুলুন',
          kind: 'door',
        },
        nearestVehicle: null,
        nearestNpc: null,
        nearestDoor,
        nearestSit: null,
        nearCricket: false,
        nearFootball: false,
      };
    }

    let bestDist = 4.2;
    let nearestVehicle: VehicleEntity | null = null;
    for (const v of vehicles) {
      const d = Math.hypot(v.x - px, v.z - pz);
      if (d < bestDist) {
        bestDist = d;
        nearestVehicle = v;
      }
    }
    if (nearestVehicle) {
      return {
        prompt: { id: nearestVehicle.id, label: `${nearestVehicle.label} চালান`, kind: 'vehicle' },
        nearestVehicle,
        nearestNpc: null,
        nearestDoor: null,
        nearestSit: null,
        nearCricket: false,
        nearFootball: false,
      };
    }

    const distCricket = Math.hypot(px - 18, pz - 74);
    if (distCricket < 7.5 && !cricketActive) {
      return {
        prompt: { id: 'cricket-pitch', label: 'ক্রিকেট খেলুন', kind: 'cricket' },
        nearestVehicle: null,
        nearestNpc: null,
        nearestDoor: null,
        nearestSit: null,
        nearCricket: true,
        nearFootball: false,
      };
    }

    const distFootball = Math.hypot(px - -34, pz - 88);
    if (distFootball < 18) {
      return {
        prompt: { id: 'football-pitch', label: 'ফুটবল কিক দিন', kind: 'football' },
        nearestVehicle: null,
        nearestNpc: null,
        nearestDoor: null,
        nearestSit: null,
        nearCricket: false,
        nearFootball: true,
      };
    }

    let nearestSit: SitSpot | null = null;
    let sitDist = 2.6;
    for (const s of sitSpots) {
      const d = Math.hypot(s.x - px, s.z - pz);
      if (d < sitDist) {
        sitDist = d;
        nearestSit = s;
      }
    }
    if (nearestSit) {
      return {
        prompt: { id: nearestSit.id, label: nearestSit.label, kind: 'sit' },
        nearestVehicle: null,
        nearestNpc: null,
        nearestDoor: null,
        nearestSit,
        nearCricket: false,
        nearFootball: false,
      };
    }

    let nearestNpc: NpcInteractable | null = null;
    let npcDist = 3.5;
    for (const n of npcs) {
      const d = Math.hypot(n.x - px, n.z - pz);
      if (d < npcDist) {
        npcDist = d;
        nearestNpc = n;
      }
    }
    if (nearestNpc) {
      return {
        prompt: { id: nearestNpc.id, label: `${nearestNpc.name}-এর সাথে কথা বলুন`, kind: 'npc' },
        nearestVehicle: null,
        nearestNpc,
        nearestDoor: null,
        nearestSit: null,
        nearCricket: false,
        nearFootball: false,
      };
    }

    return {
      prompt: null,
      nearestVehicle: null,
      nearestNpc: null,
      nearestDoor: null,
      nearestSit: null,
      nearCricket: false,
      nearFootball: false,
    };
  }
}
