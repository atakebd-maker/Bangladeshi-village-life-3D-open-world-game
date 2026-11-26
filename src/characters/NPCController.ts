import * as THREE from 'three';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { buildHumanRig, HumanRig } from '../player/PlayerAnimation';
import { NpcInteractable } from '../player/PlayerInteraction';
import { VehicleEntity } from '../vehicles/VehicleController';
import { groundHeightAt } from '../world/TerrainSystem';
import { NPCAnimation } from './NPCAnimation';
import { NpcActivity, NPCBehaviour, NpcWaypoint } from './NPCBehaviour';
import { VILLAGE_DIALOGUES } from './NPCDialogue';

export interface NpcActor extends NpcInteractable {
  rig: HumanRig;
  behaviour: NPCBehaviour;
  rotY: number;
  phase: number;
  dialogueKey?: string;
}

export class NPCController {
  public readonly group = new THREE.Group();
  public readonly npcs: NpcActor[] = [];

  constructor(textures: TextureLibrary) {
    const addNpc = (
      id: string,
      name: string,
      x: number,
      z: number,
      activity: NpcActivity,
      waypoints: NpcWaypoint[],
      style: {
        skinHex: number;
        shirtHex: number;
        pantsHex: number;
        isFemale?: boolean;
        isChild?: boolean;
        hasLungi?: boolean;
        hasPanjabi?: boolean;
        hasSaree?: boolean;
      },
      dialogueKey?: string
    ) => {
      const rig = buildHumanRig(textures, style);
      const y = groundHeightAt(x, z);
      rig.root.position.set(x, y, z);
      this.group.add(rig.root);

      this.npcs.push({
        id,
        name,
        x,
        z,
        rotY: 0,
        phase: Math.random() * Math.PI * 2,
        rig,
        behaviour: new NPCBehaviour(activity, waypoints),
        dialogueKey,
      });
    };

    // 1. Rahim Mia at Tea Stall
    addNpc(
      'npc-rahim',
      'Rahim Mia',
      30,
      12.8,
      'work',
      [],
      { skinHex: 0xa66b43, shirtHex: 0xf8fafc, pantsHex: 0x1e293b, hasLungi: true },
      'rahim_tea'
    );

    // 2. Karim Chacha working in Paddy Field
    addNpc(
      'npc-karim',
      'Karim Chacha',
      -34,
      -62,
      'work',
      [],
      { skinHex: 0x9c623d, shirtHex: 0xfef3c7, pantsHex: 0x334155, hasLungi: true },
      'karim_farmer'
    );

    // 3. Salma Begum near Homestead & Pond
    addNpc(
      'npc-salma',
      'Salma Begum',
      -19,
      6,
      'walk',
      [
        { x: -19, z: 6 },
        { x: -24, z: 12 },
        { x: -14, z: -2 },
      ],
      { skinHex: 0xb9825c, shirtHex: 0xb91c1c, pantsHex: 0xb91c1c, isFemale: true, hasSaree: true },
      'salma_homemaker'
    );

    // 4. Tariq at Cricket Field
    addNpc(
      'npc-tariq',
      'Tariq (Captain)',
      18,
      72,
      'cricket',
      [],
      { skinHex: 0xb67b52, shirtHex: 0x16a34a, pantsHex: 0xf8fafc },
      'tariq_cricket'
    );

    // 5. Ustad Rafiq at Motor Repair Garage
    addNpc(
      'npc-rafiq',
      'Ustad Rafiq',
      77,
      -12,
      'work',
      [],
      { skinHex: 0xa46c47, shirtHex: 0x2563eb, pantsHex: 0x1e293b },
      'rafiq_mechanic'
    );

    // 6. Hafez Yunus near Mosque
    addNpc(
      'npc-imam',
      'Hafez Yunus',
      24,
      -11,
      'talk',
      [
        { x: 24, z: -11 },
        { x: 20, z: -8 },
      ],
      { skinHex: 0xb8815c, shirtHex: 0xf8fafc, pantsHex: 0xf8fafc, hasPanjabi: true },
      'imam_mosque'
    );

    // 7. School Teacher & School Children
    addNpc(
      'npc-teacher',
      'Master Anisur',
      -14,
      -76,
      'talk',
      [
        { x: -14, z: -76 },
        { x: -9, z: -76 },
      ],
      { skinHex: 0xb0754c, shirtHex: 0xe2e8f0, pantsHex: 0x1e293b, hasPanjabi: true },
      'teacher_school'
    );
    addNpc(
      'npc-child-1',
      'School Boy',
      -11,
      -73,
      'walk',
      [
        { x: -11, z: -73 },
        { x: -18, z: -73 },
        { x: -18, z: -68 },
      ],
      { skinHex: 0xb67b52, shirtHex: 0xf8fafc, pantsHex: 0x166534, isChild: true }
    );
    addNpc(
      'npc-child-2',
      'School Girl',
      -16,
      -71,
      'walk',
      [
        { x: -16, z: -71 },
        { x: -8, z: -71 },
      ],
      { skinHex: 0xc28a64, shirtHex: 0x166534, pantsHex: 0xf8fafc, isFemale: true, isChild: true, hasSaree: false }
    );

    // 8. Fisherman at Padma River Ghat
    addNpc(
      'npc-fisherman',
      'Jele Monir',
      -62,
      8,
      'work',
      [],
      { skinHex: 0x935c38, shirtHex: 0xeab308, pantsHex: 0x1e293b, hasLungi: true },
      'fisherman_river'
    );

    // 9. Walking Bazaar Shoppers & Women in Saree / Salwar Kameez
    addNpc(
      'npc-shopper-1',
      'Villager Hasan',
      38,
      7,
      'walk',
      [
        { x: 38, z: 7 },
        { x: 52, z: 7 },
        { x: 52, z: 22 },
        { x: 34, z: 22 },
      ],
      { skinHex: 0xab714a, shirtHex: 0x0f766e, pantsHex: 0x1e293b, hasLungi: true }
    );
    addNpc(
      'npc-shopper-2',
      'Ayesha',
      42,
      19,
      'walk',
      [
        { x: 42, z: 19 },
        { x: 32, z: 19 },
        { x: 32, z: 7 },
      ],
      { skinHex: 0xc48e68, shirtHex: 0x7c3aed, pantsHex: 0x7c3aed, isFemale: true, hasSaree: true }
    );

    // 10. Sitting villager at Bus Stand
    addNpc(
      'npc-bus-waiter',
      'Traveler Jamal',
      59.5,
      48,
      'sit',
      [],
      { skinHex: 0xb67b52, shirtHex: 0x334155, pantsHex: 0x0f172a }
    );
  }

  public getDialogue(npc: NpcInteractable): { speaker: string; text: string; giftItem?: string } {
    const actor = this.npcs.find((n) => n.id === npc.id);
    const entry = actor?.dialogueKey ? VILLAGE_DIALOGUES[actor.dialogueKey] : null;
    if (!entry) {
      return {
        speaker: npc.name,
        text: 'Assalamu Alaikum! Enjoy exploring Shonargaon village today.',
      };
    }
    const line = entry.lines[Math.floor(Math.random() * entry.lines.length)];
    return {
      speaker: entry.speaker,
      text: line,
      giftItem: entry.giftItem,
    };
  }

  public update(dt: number, playerX: number, playerZ: number, vehicles: VehicleEntity[]): void {
    for (const n of this.npcs) {
      const res = n.behaviour.step(dt, n.x, n.z, n.rotY, playerX, playerZ, vehicles);
      n.x = res.x;
      n.z = res.z;
      n.rotY = res.rotY;
      if (res.moving) n.phase += dt * 7.2;
      else n.phase += dt * 2.5;

      n.rig.root.position.set(n.x, res.y, n.z);
      n.rig.root.rotation.y = n.rotY;
      NPCAnimation.update(
        n.rig,
        dt,
        n.phase,
        res.moving,
        n.behaviour.activity === 'sit',
        n.behaviour.activity === 'work'
      );
    }
  }
}
