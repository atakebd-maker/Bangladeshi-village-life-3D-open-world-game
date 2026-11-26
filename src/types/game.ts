export type GameScreenState = 'intro' | 'menu' | 'loading' | 'playing';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export type TimeOfDayPreset =
  | 'sunrise'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'sunset'
  | 'night';

export type WeatherPreset =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'fog';

export type PlayerOutfit = 'lungi_genji' | 'panjabi_pajama' | 'shirt_pant';

export type VehicleKind =
  | 'motorcycle'
  | 'sports_bike'
  | 'bicycle'
  | 'auto_rickshaw'
  | 'cng'
  | 'easy_bike'
  | 'cycle_rickshaw'
  | 'car'
  | 'jeep'
  | 'pickup'
  | 'microbus'
  | 'local_bus'
  | 'truck';

export type CameraMode = 'third_person' | 'first_person';

export interface GameSettings {
  graphics: GraphicsQuality;
  masterVolume: number;
  ambientVolume: number;
  sfxVolume: number;
  cameraSensitivity: number;
  autoDayNight: boolean;
  timeOfDay: TimeOfDayPreset;
  weather: WeatherPreset;
}

export interface MissionItem {
  id: string;
  title: string;
  description: string;
  targetLocation: string;
  targetX: number;
  targetZ: number;
  completed: boolean;
  reward: string;
}

export interface SaveData {
  hasPlayedIntro: boolean;
  playerPosition: [number, number, number];
  playerRotationY: number;
  outfit: PlayerOutfit;
  activeVehicleId: string | null;
  completedMissionIds: string[];
  cricketHighScore: number;
  footballGoals: number;
  inventory: string[];
  settings: GameSettings;
}

export interface CricketHudState {
  active: boolean;
  teamName: string;
  opponentName: string;
  runs: number;
  wickets: number;
  ballsBowled: number;
  maxOvers: number;
  lastEvent: string;
  ballIncoming: boolean;
  timingProgress: number;
  inningOver: boolean;
}

export interface FootballHudState {
  active: boolean;
  goals: number;
  shots: number;
  lastEvent: string;
}

export interface InteractionPrompt {
  id: string;
  label: string;
  kind: 'vehicle' | 'npc' | 'cricket' | 'football' | 'sit' | 'door' | 'item';
}

export interface MiniMapMarker {
  id: string;
  label: string;
  x: number;
  z: number;
  color: string;
  kind: 'building' | 'vehicle' | 'mission' | 'sport';
}

export interface HudSnapshot {
  locationName: string;
  playerX: number;
  playerZ: number;
  playerHeading: number;
  stamina: number;
  isDriving: boolean;
  vehicleName: string;
  speedKmh: number;
  cameraMode: CameraMode;
  posture: 'standing' | 'crouching' | 'sitting' | 'climbing';
  activePrompt: InteractionPrompt | null;
  dialogue: { speaker: string; text: string } | null;
  activeMission: MissionItem | null;
  completedCount: number;
  totalMissions: number;
  cricket: CricketHudState;
  football: FootballHudState;
  inventory: string[];
  outfit: PlayerOutfit;
  timeLabel: string;
  weatherLabel: string;
  markers: MiniMapMarker[];
}

export interface InputState {
  moveX: number;
  moveY: number;
  lookDeltaX: number;
  lookDeltaY: number;
  sprint: boolean;
  jump: boolean;
  crouch: boolean;
  punch: boolean;
  kick: boolean;
  block: boolean;
  dodge: boolean;
  interact: boolean;
  vehicleToggle: boolean;
  sitToggle: boolean;
  steer: number;
  throttle: number;
  brake: number;
  horn: boolean;
}
