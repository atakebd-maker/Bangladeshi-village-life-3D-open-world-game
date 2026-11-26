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
    sitSpots: SitSpot[],
    isDriving: boolean,
    cricketActive: boolean
  ): {
    prompt: InteractionPrompt | null;
    nearestVehicle: VehicleEntity | null;
    nearestNpc: NpcInteractable | null;
    nearestSit: SitSpot | null;
    nearCricket: boolean;
    nearFootball: boolean;
  } {
    if (isDriving) {
      return {
        prompt: { id: 'exit-veh', label: 'Exit Vehicle', kind: 'vehicle' },
        nearestVehicle: null,
        nearestNpc: null,
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
        prompt: { id: nearestVehicle.id, label: `Drive ${nearestVehicle.label}`, kind: 'vehicle' },
        nearestVehicle,
        nearestNpc: null,
        nearestSit: null,
        nearCricket: false,
        nearFootball: false,
      };
    }

    // Cricket Pitch near (18, 58..75)
    const distCricket = Math.hypot(px - 18, pz - 74);
    if (distCricket < 7.5 && !cricketActive) {
      return {
        prompt: { id: 'cricket-pitch', label: 'Play Village Cricket', kind: 'cricket' },
        nearestVehicle: null,
        nearestNpc: null,
        nearestSit: null,
        nearCricket: true,
        nearFootball: false,
      };
    }

    // Football Pitch near (-34, 88)
    const distFootball = Math.hypot(px - -34, pz - 88);
    if (distFootball < 18) {
      return {
        prompt: { id: 'football-pitch', label: 'Kick Football', kind: 'football' },
        nearestVehicle: null,
        nearestNpc: null,
        nearestSit: null,
        nearCricket: false,
        nearFootball: true,
      };
    }

    // Sit spots (benches / charpoi)
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
        nearestSit,
        nearCricket: false,
        nearFootball: false,
      };
    }

    // NPCs
    let nearestNpc: NpcInteractable | null = null;
    let npcDist = 3.4;
    for (const n of npcs) {
      const d = Math.hypot(n.x - px, n.z - pz);
      if (d < npcDist) {
        npcDist = d;
        nearestNpc = n;
      }
    }
    if (nearestNpc) {
      return {
        prompt: { id: nearestNpc.id, label: `Talk to ${nearestNpc.name}`, kind: 'npc' },
        nearestVehicle: null,
        nearestNpc,
        nearestSit: null,
        nearCricket: false,
        nearFootball: false,
      };
    }

    return {
      prompt: null,
      nearestVehicle: null,
      nearestNpc: null,
      nearestSit: null,
      nearCricket: false,
      nearFootball: false,
    };
  }
}
