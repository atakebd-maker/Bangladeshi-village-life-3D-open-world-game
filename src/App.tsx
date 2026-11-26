import { useCallback, useEffect, useRef, useState } from 'react';
import { GameManager } from './core/GameManager';
import { LoadingProgress } from './core/LoadingManager';
import { SaveManager } from './core/SaveManager';
import { GameScreenState, GameSettings, HudSnapshot, SaveData } from './types/game';
import { GameHUD } from './ui/GameHUD';
import { IntroSplash } from './ui/IntroSplash';
import { LoadingScreen } from './ui/LoadingScreen';
import { MainMenu } from './ui/MainMenu';
import { Settings } from './ui/Settings';

const INITIAL_HUD: HudSnapshot = {
  locationName: 'সোনারগাঁও বসতবাড়ি',
  playerX: 0,
  playerZ: 8,
  playerHeading: 0,
  health: 100,
  stamina: 100,
  weaponMode: 'fist',
  ammo: 30,
  isDead: false,
  deathReason: '',
  isDriving: false,
  vehicleName: '',
  vehicleKind: null,
  speedKmh: 0,
  cameraMode: 'third_person',
  posture: 'standing',
  activePrompt: null,
  dialogue: null,
  activeMission: null,
  completedCount: 0,
  totalMissions: 5,
  cricket: {
    active: false,
    teamName: 'সোনারগাঁও টাইগার্স',
    opponentName: 'পদ্মা স্ট্রাইকার্স',
    runs: 0,
    wickets: 0,
    ballsBowled: 0,
    maxOvers: 2,
    lastEvent: '',
    ballIncoming: false,
    timingProgress: 0,
    inningOver: false,
  },
  football: { active: false, goals: 0, shots: 0, lastEvent: '' },
  inventory: [],
  outfit: 'lungi_genji',
  timeLabel: 'সকাল · ৯:১২',
  weatherLabel: 'রোদেলা',
  notice: null,
  markers: [],
};

// গেম পোর্ট্রেট (সোজাভাবে) ও ল্যান্ডস্কেপ উভয় মোডেই স্বাভাবিকভাবে চলবে

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<GameManager | null>(null);
  const loadTimerRef = useRef<number>(0);

  const [initialSave, setInitialSave] = useState<SaveData>(() => SaveManager.load());
  const [hasContinue, setHasContinue] = useState<boolean>(() => SaveManager.hasExistingProgress());
  const [screen, setScreen] = useState<GameScreenState>('intro');
  const [loadProgress, setLoadProgress] = useState<LoadingProgress>({
    percent: 0,
    stage: 'সোনারগাঁও গ্রাম প্রস্তুত হচ্ছে...',
  });
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'graphics' | 'sound' | 'world'>('graphics');
  const [settingsState, setSettingsState] = useState<GameSettings>(() => SaveManager.load().settings);
  const [contextLost, setContextLost] = useState<boolean>(false);

  // থ্রি.জেএস ইঞ্জিন মাউন্ট
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const save = SaveManager.load();
    const gm = new GameManager(
      mount,
      save,
      (p) => setLoadProgress(p),
      (snap) => setHud(snap),
      (lost) => setContextLost(lost)
    );
    gameRef.current = gm;

    return () => {
      clearInterval(loadTimerRef.current);
      gm.dispose();
      gameRef.current = null;
    };
  }, []);

  const handleIntroComplete = useCallback(() => {
    const updated: SaveData = { ...initialSave, hasPlayedIntro: true };
    SaveManager.save(updated);
    setInitialSave(updated);
    setScreen('menu');
  }, [initialSave]);

  const startGameplay = (isNewGame: boolean) => {
    const gm = gameRef.current;
    if (!gm) return;
    gm.audio.playUiClick();

    if (isNewGame) {
      const fresh = SaveManager.resetForNewGame(settingsState, true);
      setInitialSave(fresh);
      setHasContinue(false);
      gm.resetFromSave(fresh);
    }

    setScreen('loading');
    let pct = 0;
    setLoadProgress({ percent: 0, stage: 'সোনারগাঁও গ্রামের রাস্তাঘাট তৈরি হচ্ছে...' });
    clearInterval(loadTimerRef.current);
    // ঠিক ১০ সেকেন্ডের লোডিং সময় (১০০ মিলিসেকেন্ড x ১০০ ধাপ = ১০,০০০ মিলিসেকেন্ড)
    loadTimerRef.current = window.setInterval(() => {
      pct += 1;
      if (pct < 25) {
        setLoadProgress({ percent: pct, stage: 'সোনারগাঁও গ্রামের রাস্তাঘাট তৈরি হচ্ছে...' });
      } else if (pct < 50) {
        setLoadProgress({ percent: pct, stage: 'বাড়িঘর, বাজার, মসজিদ ও স্কুল লোড হচ্ছে...' });
      } else if (pct < 75) {
        setLoadProgress({ percent: pct, stage: 'গাড়ি, রিকশা, গ্রামবাসী ও পশুপাখি যুক্ত হচ্ছে...' });
      } else if (pct < 100) {
        setLoadProgress({ percent: pct, stage: 'আবহাওয়া, পদ্মা নদী ও সাউন্ড সেটআপ হচ্ছে...' });
      } else {
        clearInterval(loadTimerRef.current);
        setLoadProgress({ percent: 100, stage: 'প্রস্তুত! সোনারগাঁও গ্রামে স্বাগতম' });
        gm.setPlayingMode(true);
        setScreen('playing');
      }
    }, 100);
  };

  const handleSettingsChange = (next: GameSettings) => {
    setSettingsState(next);
    gameRef.current?.applySettings(next);
  };

  const handleExit = () => {
    gameRef.current?.persistSave();
    gameRef.current?.setPlayingMode(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    try {
      window.close();
    } catch {
      // ব্রাউজার ট্যাব বন্ধ না হলে এক্সিট স্ক্রিন দেখাবে
    }
    setScreen('exited');
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#070b12]">
      <div ref={canvasMountRef} className="absolute inset-0 h-full w-full" />

      {contextLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-6 text-center">
          <div className="max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="font-display text-lg font-bold text-white">গ্রাফিক্স রিস্টোর হচ্ছে</h2>
            <p className="mt-2 text-xs text-slate-300">
              থ্রিডি দৃশ্য পুনরায় চালু হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
            </p>
          </div>
        </div>
      )}

      {screen === 'intro' && (
        <IntroSplash
          canSkip={initialSave.hasPlayedIntro}
          onStartAudio={() => {
            gameRef.current?.audio.playStudioIntroChime();
          }}
          onComplete={handleIntroComplete}
        />
      )}

      {screen === 'loading' && <LoadingScreen progress={loadProgress} />}

      {screen === 'menu' && (
        <MainMenu
          hasContinue={hasContinue}
          cricketHighScore={initialSave.cricketHighScore}
          completedMissions={initialSave.completedMissionIds.length}
          onContinue={() => startGameplay(false)}
          onPlayNew={() => startGameplay(true)}
          onOpenSettings={(tab) => {
            setSettingsTab(tab);
            setSettingsOpen(true);
          }}
          onExit={handleExit}
        />
      )}

      {screen === 'playing' && (
        <GameHUD
          hud={hud}
          gameRef={gameRef}
          onOpenSettings={() => {
            setSettingsTab('graphics');
            setSettingsOpen(true);
          }}
          onReturnToMenu={() => {
            gameRef.current?.persistSave();
            gameRef.current?.setPlayingMode(false);
            setHasContinue(SaveManager.hasExistingProgress());
            setInitialSave(SaveManager.load());
            setScreen('menu');
          }}
          onExitGame={handleExit}
        />
      )}

      {screen === 'exited' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6 text-center">
          <p className="text-xs font-bold tracking-[0.35em] text-amber-400 uppercase">
            TAHSIN STUDIO
          </p>
          <h1 className="font-display mt-3 text-2xl font-bold text-white sm:text-4xl">
            বাংলাদেশ ভিলেজ লাইফ 3D
          </h1>
          <p className="mt-3 max-w-sm text-xs text-slate-300">
            আপনার অগ্রগতি সেভ করা হয়েছে। খেলার জন্য ধন্যবাদ!
          </p>
          <button
            type="button"
            onClick={() => setScreen('menu')}
            className="mt-6 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg hover:bg-emerald-400"
          >
            পুনরায় খেলুন
          </button>
        </div>
      )}

      {settingsOpen && (
        <Settings
          settings={settingsState}
          initialTab={settingsTab}
          onChange={handleSettingsChange}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
