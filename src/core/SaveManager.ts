import { GameSettings, SaveData } from '../types/game';

const STORAGE_KEY = 'bd_village_life_3d_save_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  graphics: 'high',
  masterVolume: 0.75,
  ambientVolume: 0.65,
  sfxVolume: 0.85,
  cameraSensitivity: 1.0,
  autoDayNight: true,
  timeOfDay: 'morning',
  weather: 'sunny',
};

export const DEFAULT_SAVE_DATA: SaveData = {
  hasPlayedIntro: false,
  playerPosition: [0, 0, 8],
  playerRotationY: 0,
  outfit: 'lungi_genji',
  activeVehicleId: null,
  completedMissionIds: [],
  cricketHighScore: 0,
  footballGoals: 0,
  inventory: ['Bamboo Hand Fan'],
  settings: { ...DEFAULT_SETTINGS },
};

export class SaveManager {
  public static load(): SaveData {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE_DATA, settings: { ...DEFAULT_SETTINGS } };
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        settings: {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings ?? {}),
        },
        completedMissionIds: Array.isArray(parsed.completedMissionIds)
          ? parsed.completedMissionIds
          : [],
        inventory: Array.isArray(parsed.inventory)
          ? parsed.inventory
          : [...DEFAULT_SAVE_DATA.inventory],
      };
    } catch {
      return { ...DEFAULT_SAVE_DATA, settings: { ...DEFAULT_SETTINGS } };
    }
  }

  public static save(data: SaveData): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota errors in restricted webviews
    }
  }

  public static hasExistingProgress(): boolean {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return Boolean(
        parsed.hasPlayedIntro &&
          (parsed.completedMissionIds?.length ||
            (parsed.cricketHighScore ?? 0) > 0 ||
            (parsed.playerPosition &&
              (Math.abs(parsed.playerPosition[0]) > 1 || Math.abs(parsed.playerPosition[2] - 8) > 1)))
      );
    } catch {
      return false;
    }
  }

  public static resetForNewGame(preserveSettings: GameSettings, hasPlayedIntro: boolean): SaveData {
    const fresh: SaveData = {
      ...DEFAULT_SAVE_DATA,
      hasPlayedIntro,
      settings: { ...preserveSettings },
    };
    this.save(fresh);
    return fresh;
  }
}
