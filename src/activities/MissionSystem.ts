import { MissionItem } from '../types/game';

export const VILLAGE_MISSIONS: MissionItem[] = [
  {
    id: 'mission-tea',
    title: 'Tea for Karim Chacha',
    description: 'Pick up Hot Dudh Cha from Rahim Tea Stall and visit Karim Chacha in the paddy field.',
    targetLocation: 'Rahim Tea Stall / Paddy Field',
    targetX: 30,
    targetZ: 15,
    completed: false,
    reward: 'Village Goodwill',
  },
  {
    id: 'mission-garage',
    title: 'Ride from Rahman Garage',
    description: 'Visit Rahman Repair Garage on the highway and drive a Motorcycle or Sports Bike.',
    targetLocation: 'Rahman Repair Garage',
    targetX: 80,
    targetZ: -12,
    completed: false,
    reward: 'Rider Badge',
  },
  {
    id: 'mission-cricket',
    title: 'Shonargaon Cricket Star',
    description: 'Score at least 6 runs in a Village Cricket match at the Cricket Field.',
    targetLocation: 'Village Cricket Field',
    targetX: 18,
    targetZ: 66,
    completed: false,
    reward: 'Willow Cricket Bat',
  },
  {
    id: 'mission-bridge',
    title: 'Cross the Bamboo Bridge',
    description: 'Cross the traditional Bamboo Shako Bridge over the canal to visit the Village School.',
    targetLocation: 'Shonargaon Village School',
    targetX: -14,
    targetZ: -84,
    completed: false,
    reward: 'Scholar Greeting',
  },
  {
    id: 'mission-river',
    title: 'Padma River Sunset Walk',
    description: 'Visit Jele Monir at the Padma River Bank boat ghat on the western shore.',
    targetLocation: 'Padma River Bank',
    targetX: -62,
    targetZ: 8,
    completed: false,
    reward: 'Fresh River Rui Fish',
  },
];

export class MissionSystem {
  public missions: MissionItem[];

  constructor(completedIds: string[]) {
    this.missions = VILLAGE_MISSIONS.map((m) => ({
      ...m,
      completed: completedIds.includes(m.id),
    }));
  }

  public complete(id: string): boolean {
    const m = this.missions.find((item) => item.id === id);
    if (!m || m.completed) return false;
    m.completed = true;
    return true;
  }

  public getActiveMission(): MissionItem | null {
    return this.missions.find((m) => !m.completed) ?? null;
  }

  public getCompletedIds(): string[] {
    return this.missions.filter((m) => m.completed).map((m) => m.id);
  }
}
