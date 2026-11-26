import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';
import { TextureLibrary } from '../materials/ProceduralTextures';
import { buildHumanRig, HumanRig } from '../player/PlayerAnimation';
import { NpcInteractable } from '../player/PlayerInteraction';
import { ActiveDialogueState } from '../types/game';
import { VehicleEntity } from '../vehicles/VehicleController';
import { groundHeightAt } from '../world/TerrainSystem';
import { NPCAnimation } from './NPCAnimation';
import { NpcActivity, NPCBehaviour, NpcWaypoint } from './NPCBehaviour';
import { getDialogueForNpc } from './NPCDialogue';

export interface NpcActor extends NpcInteractable {
  rig: HumanRig;
  behaviour: NPCBehaviour;
  rotY: number;
  phase: number;
  dialogueKey?: string;
  hp: number;
  brave: boolean;
  hostile: boolean;
  fleeing: boolean;
  hitStunTimer: number;
  knockedDownTimer: number;
  attackCooldown: number;
  punchAnimTimer: number;
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
        hasGamcha?: boolean;
        hasBeard?: boolean;
      },
      dialogueKey?: string,
      brave = false
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
        hp: 100,
        brave,
        hostile: false,
        fleeing: false,
        hitStunTimer: 0,
        knockedDownTimer: 0,
        attackCooldown: 0,
        punchAnimTimer: 0,
      });
    };

    // 1. Key Named Villagers with unique 3-choice dialogues
    addNpc(
      'npc-rahim',
      'Rahim Mia',
      30,
      12.8,
      'work',
      [],
      { skinHex: 0xa66b43, shirtHex: 0xf8fafc, pantsHex: 0x1e293b, hasLungi: true, hasBeard: true },
      'rahim_tea',
      true
    );
    addNpc(
      'npc-karim',
      'Karim Chacha',
      -34,
      -62,
      'work',
      [],
      { skinHex: 0x9c623d, shirtHex: 0xfef3c7, pantsHex: 0x334155, hasLungi: true, hasGamcha: true, hasBeard: true },
      'karim_farmer',
      false
    );
    addNpc(
      'npc-salma',
      'Salma Begum',
      -18,
      3,
      'walk',
      [
        { x: -18, z: 3 },
        { x: -24, z: 10 },
        { x: -12, z: -2 },
      ],
      { skinHex: 0xb9825c, shirtHex: 0xb91c1c, pantsHex: 0xb91c1c, isFemale: true, hasSaree: true },
      'salma_homemaker',
      false
    );
    addNpc(
      'npc-tariq',
      'Tariq (Captain)',
      18,
      72,
      'cricket',
      [],
      { skinHex: 0xb67b52, shirtHex: 0x16a34a, pantsHex: 0xf8fafc },
      'tariq_cricket',
      true
    );
    addNpc(
      'npc-rafiq',
      'Ustad Rafiq',
      77,
      -12,
      'work',
      [],
      { skinHex: 0xa46c47, shirtHex: 0x2563eb, pantsHex: 0x1e293b, hasBeard: true },
      'rafiq_mechanic',
      true
    );
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
      { skinHex: 0xb8815c, shirtHex: 0xf8fafc, pantsHex: 0xf8fafc, hasPanjabi: true, hasBeard: true },
      'imam_mosque',
      false
    );
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
      'teacher_school',
      false
    );
    addNpc(
      'npc-fisherman',
      'Jele Monir',
      -62,
      8,
      'work',
      [],
      { skinHex: 0x935c38, shirtHex: 0xeab308, pantsHex: 0x1e293b, hasLungi: true, hasGamcha: true },
      'fisherman_river',
      true
    );
    addNpc(
      'npc-police',
      'SI Faruk',
      75,
      30,
      'talk',
      [
        { x: 75, z: 30 },
        { x: 73, z: 36 },
      ],
      { skinHex: 0xaa6f48, shirtHex: 0x1e3a8a, pantsHex: 0x0f172a },
      'police_officer',
      true
    );

    // 2. Additional Lively Villagers, Youth, Shoppers & Students (22+ total NPCs)
    addNpc(
      'npc-child-1',
      'Rafi (Student)',
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
      'Mitu (Student)',
      -16,
      -71,
      'walk',
      [
        { x: -16, z: -71 },
        { x: -8, z: -71 },
      ],
      { skinHex: 0xc28a64, shirtHex: 0x166534, pantsHex: 0xf8fafc, isFemale: true, isChild: true }
    );
    addNpc(
      'npc-shopper-1',
      'Hasan Mia',
      38,
      7,
      'walk',
      [
        { x: 38, z: 7 },
        { x: 52, z: 7 },
        { x: 52, z: 22 },
        { x: 34, z: 22 },
      ],
      { skinHex: 0xab714a, shirtHex: 0x0f766e, pantsHex: 0x1e293b, hasLungi: true },
      'shopper_general',
      true
    );
    addNpc(
      'npc-shopper-2',
      'Ayesha Begum',
      42,
      19,
      'walk',
      [
        { x: 42, z: 19 },
        { x: 32, z: 19 },
        { x: 32, z: 7 },
      ],
      { skinHex: 0xc48e68, shirtHex: 0x7c3aed, pantsHex: 0x7c3aed, isFemale: true, hasSaree: true },
      'shopper_general'
    );
    addNpc(
      'npc-bus-waiter',
      'Traveler Jamal',
      59.5,
      48,
      'sit',
      [],
      { skinHex: 0xb67b52, shirtHex: 0x334155, pantsHex: 0x0f172a },
      'shopper_general'
    );
    addNpc(
      'npc-road-walker-1',
      'Kamal Uddin',
      -2,
      6,
      'walk',
      [
        { x: -2, z: 6 },
        { x: 26, z: 6 },
        { x: 26, z: 11 },
        { x: -2, z: 11 },
      ],
      { skinHex: 0xa66b43, shirtHex: 0xf1f5f9, pantsHex: 0x1e293b, hasPanjabi: true, hasGamcha: true },
      'shopper_general',
      true
    );
    addNpc(
      'npc-road-walker-2',
      'Nusrat Jahan',
      12,
      -10,
      'walk',
      [
        { x: 12, z: -10 },
        { x: 12, z: 24 },
      ],
      { skinHex: 0xc6916b, shirtHex: 0x0d9488, pantsHex: 0x0d9488, isFemale: true, hasSaree: true },
      'shopper_general'
    );
    addNpc(
      'npc-tea-patron-1',
      'Babul Bhai',
      29,
      11.5,
      'sit',
      [],
      { skinHex: 0x9f6640, shirtHex: 0x2563eb, pantsHex: 0x1e293b, hasLungi: true },
      'shopper_general',
      true
    );
    addNpc(
      'npc-bazaar-vendor-1',
      'Fish Seller Kuddus',
      34,
      -0.8,
      'work',
      [],
      { skinHex: 0xa16944, shirtHex: 0xfef3c7, pantsHex: 0x1e293b, hasLungi: true, hasGamcha: true },
      'shopper_general',
      true
    );
    addNpc(
      'npc-bazaar-vendor-2',
      'Grocer Salam',
      40,
      12.8,
      'work',
      [],
      { skinHex: 0xb17750, shirtHex: 0x1e40af, pantsHex: 0x1e293b, hasBeard: true },
      'shopper_general'
    );
    addNpc(
      'npc-farmer-2',
      'Farmer Mokles',
      98,
      -42,
      'work',
      [],
      { skinHex: 0x995f3a, shirtHex: 0xe2e8f0, pantsHex: 0x1e293b, hasLungi: true, hasGamcha: true },
      'karim_farmer',
      true
    );
    addNpc(
      'npc-footballer-1',
      'Sohel (Striker)',
      -26,
      86,
      'walk',
      [
        { x: -26, z: 86 },
        { x: -40, z: 90 },
      ],
      { skinHex: 0xb67b52, shirtHex: 0xdc2626, pantsHex: 0x0f172a },
      'tariq_cricket',
      true
    );
    addNpc(
      'npc-footballer-2',
      'Rashed (Keeper)',
      -48,
      88,
      'talk',
      [
        { x: -48, z: 88 },
        { x: -48, z: 86 },
      ],
      { skinHex: 0xaa6f48, shirtHex: 0xfacc15, pantsHex: 0x0f172a },
      'tariq_cricket',
      true
    );
  }

  public openDialogue(npc: NpcInteractable): ActiveDialogueState {
    const actor = this.npcs.find((n) => n.id === npc.id);
    const entry = getDialogueForNpc(actor?.dialogueKey, npc.name);
    return {
      npcId: npc.id,
      speaker: entry.speaker,
      greeting: entry.greeting,
      currentReply: null,
      choices: entry.choices,
    };
  }

  public applyPlayerAttack(
    px: number,
    pz: number,
    pRotY: number,
    isGun: boolean,
    audio: AudioManager
  ): NpcActor | null {
    const fx = Math.sin(pRotY);
    const fz = Math.cos(pRotY);
    const maxRange = isGun ? 28 : 2.35;
    const minDot = isGun ? 0.9 : 0.35;

    let hitNpc: NpcActor | null = null;
    let bestDist = maxRange;

    for (const n of this.npcs) {
      if (n.knockedDownTimer > 0) continue;
      const dx = n.x - px;
      const dz = n.z - pz;
      const dist = Math.hypot(dx, dz);
      if (dist > bestDist || dist < 0.01) continue;
      const dot = (dx / dist) * fx + (dz / dist) * fz;
      if (dot >= minDot) {
        bestDist = dist;
        hitNpc = n;
      }
    }

    if (hitNpc) {
      const dmg = isGun ? 52 : 34;
      hitNpc.hp = Math.max(0, hitNpc.hp - dmg);
      hitNpc.hitStunTimer = 0.45;
      audio.playImpactHit(isGun);

      // Knockback impulse
      const kx = (hitNpc.x - px) / (Math.hypot(hitNpc.x - px, hitNpc.z - pz) || 1);
      const kz = (hitNpc.z - pz) / (Math.hypot(hitNpc.x - px, hitNpc.z - pz) || 1);
      hitNpc.x += kx * (isGun ? 0.65 : 0.9);
      hitNpc.z += kz * (isGun ? 0.65 : 0.9);

      if (hitNpc.hp <= 0) {
        hitNpc.knockedDownTimer = 9.0;
        hitNpc.hostile = false;
        hitNpc.fleeing = false;
      } else if (hitNpc.brave) {
        hitNpc.hostile = true;
      } else {
        hitNpc.fleeing = true;
      }
    }

    return hitNpc;
  }

  public update(
    dt: number,
    playerX: number,
    playerZ: number,
    vehicles: VehicleEntity[],
    onPlayerHit: (dmg: number) => void
  ): void {
    for (const n of this.npcs) {
      if (n.knockedDownTimer > 0) {
        n.knockedDownTimer -= dt;
        n.rig.bodyPivot.rotation.x = THREE.MathUtils.damp(
          n.rig.bodyPivot.rotation.x,
          Math.PI / 2,
          10,
          dt
        );
        n.rig.bodyPivot.position.y = 0.18;
        if (n.knockedDownTimer <= 0) {
          n.hp = 100;
          n.rig.bodyPivot.rotation.x = 0;
          n.rig.bodyPivot.position.y = 0;
        }
        continue;
      }

      n.rig.bodyPivot.rotation.x = THREE.MathUtils.damp(n.rig.bodyPivot.rotation.x, 0, 10, dt);

      if (n.hitStunTimer > 0) {
        n.hitStunTimer -= dt;
        n.rig.torso.rotation.x = -0.35;
        n.rig.root.position.set(n.x, groundHeightAt(n.x, n.z), n.z);
        continue;
      }
      n.rig.torso.rotation.x = THREE.MathUtils.damp(n.rig.torso.rotation.x, 0, 10, dt);

      if (n.attackCooldown > 0) n.attackCooldown -= dt;
      if (n.punchAnimTimer > 0) n.punchAnimTimer -= dt;

      // Hostile NPC chases & punches back!
      if (n.hostile) {
        const dx = playerX - n.x;
        const dz = playerZ - n.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 28) {
          n.hostile = false;
        } else if (dist > 1.55) {
          n.x += (dx / dist) * 4.3 * dt;
          n.z += (dz / dist) * 4.3 * dt;
          n.rotY = Math.atan2(dx, dz);
          n.phase += dt * 9.5;
          n.rig.root.position.set(n.x, groundHeightAt(n.x, n.z), n.z);
          n.rig.root.rotation.y = n.rotY;
          NPCAnimation.update(n.rig, dt, n.phase, true, false, false);
        } else {
          n.rotY = Math.atan2(dx, dz);
          n.rig.root.position.set(n.x, groundHeightAt(n.x, n.z), n.z);
          n.rig.root.rotation.y = n.rotY;
          if (n.attackCooldown <= 0) {
            n.attackCooldown = 1.25;
            n.punchAnimTimer = 0.28;
            onPlayerHit(14);
          }
          if (n.punchAnimTimer > 0) {
            n.rig.rightArm.rotation.x = -Math.sin((n.punchAnimTimer / 0.28) * Math.PI) * 1.45;
          } else {
            NPCAnimation.update(n.rig, dt, n.phase, false, false, false);
          }
        }
        continue;
      }

      // Fleeing NPC runs away from player
      if (n.fleeing) {
        const dx = n.x - playerX;
        const dz = n.z - playerZ;
        const dist = Math.hypot(dx, dz);
        if (dist > 24 || dist < 0.01) {
          n.fleeing = false;
        } else {
          n.x = THREE.MathUtils.clamp(n.x + (dx / dist) * 4.6 * dt, -140, 140);
          n.z = THREE.MathUtils.clamp(n.z + (dz / dist) * 4.6 * dt, -140, 140);
          n.rotY = Math.atan2(dx, dz);
          n.phase += dt * 10;
          n.rig.root.position.set(n.x, groundHeightAt(n.x, n.z), n.z);
          n.rig.root.rotation.y = n.rotY;
          NPCAnimation.update(n.rig, dt, n.phase, true, false, false);
        }
        continue;
      }

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
