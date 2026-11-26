import { MissionItem } from '../types/game';

export const VILLAGE_MISSIONS: MissionItem[] = [
  {
    id: 'mission-tea',
    title: 'করিম চাচার জন্য চা',
    description: 'রহিমের চা স্টল থেকে গরম দুধ চা নিয়ে উত্তর ধান ক্ষেতে করিম চাচার কাছে যান।',
    targetLocation: 'রহিমের চা স্টল / ধান ক্ষেত',
    targetX: 30,
    targetZ: 15,
    completed: false,
    reward: 'গ্রামবাসীর ভালোবাসা',
  },
  {
    id: 'mission-garage',
    title: 'রহমান গ্যারেজ থেকে রাইড',
    description: 'হাইওয়ের পাশের রহমান মেরামত গ্যারেজে গিয়ে মোটরসাইকেল বা স্পোর্টস বাইক চালান।',
    targetLocation: 'রহমান মোটর গ্যারেজ',
    targetX: 80,
    targetZ: -12,
    completed: false,
    reward: 'রাইডার ব্যাজ',
  },
  {
    id: 'mission-cricket',
    title: 'সোনারগাঁও ক্রিকেট তারকা',
    description: 'গ্রামের ক্রিকেট মাঠে গিয়ে ম্যাচে অন্তত ৬ রান সংগ্রহ করুন।',
    targetLocation: 'গ্রামের ক্রিকেট মাঠ',
    targetX: 18,
    targetZ: 66,
    completed: false,
    reward: 'উইলো ক্রিকেট ব্যাট',
  },
  {
    id: 'mission-bridge',
    title: 'বাঁশের সাঁকো পারাপার',
    description: 'খালের ওপরের ঐতিহ্যবাহী বাঁশের সাঁকো পার হয়ে সোনারগাঁও উচ্চ বিদ্যালয়ে যান।',
    targetLocation: 'সোনারগাঁও উচ্চ বিদ্যালয়',
    targetX: -14,
    targetZ: -84,
    completed: false,
    reward: 'শিক্ষকের শুভেচ্ছা',
  },
  {
    id: 'mission-river',
    title: 'পদ্মা নদীর ঘাট ভ্রমণ',
    description: 'পশ্চিম পাড়ে পদ্মা নদীর ঘাটে জেলে মনিরের সাথে দেখা করুন অথবা নৌকায় চড়ে পদ্মার চরে ঘুরে আসুন।',
    targetLocation: 'পদ্মা নদীর ঘাট / পদ্মার চর',
    targetX: -68,
    targetZ: 8,
    completed: false,
    reward: 'তাজা পদ্মার রুই মাছ',
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
