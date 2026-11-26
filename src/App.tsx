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
  locationName: 'Shonargaon Homesteads',
  playerX: 0,
  playerZ: 8,
  playerHeading: 0,
  stamina: 100,
  isDriving: false,
  vehicleName: '',
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
    teamName: 'Shonargaon Tigers',
    opponentName: 'Padma Strikers',
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
  timeLabel: 'Morning · 9:12 AM',
  weatherLabel: 'Sunny',
  markers: [],
};

async function tryRequestLandscape(): Promise<void> {
  try {
    const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
    if (isCoarsePointer && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen().catch(() => {});
    }
    const orientation = screen.orientation as unknown as {
      lock?: (mode: string) => Promise<void>;
    };
    if (orientation?.lock) {
      await orientation.lock('landscape');
    }
  } catch {
    // Browsers only allow orientation lock in installed PWAs / fullscreen / native Android WebView
  }
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<GameManager | null>(null);
  const loadTimerRef = useRef<number>(0);

  const [initialSave, setInitialSave] = useState<SaveData>(() => SaveManager.load());
  const [hasContinue, setHasContinue] = useState<boolean>(() => SaveManager.hasExistingProgress());
  const [screen, setScreen] = useState<GameScreenState>('intro');
  const [loadProgress, setLoadProgress] = useState<LoadingProgress>({
    percent: 0,
    stage: 'Preparing village world...',
  });
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'graphics' | 'sound' | 'world'>('graphics');
  const [settingsState, setSettingsState] = useState<GameSettings>(() => SaveManager.load().settings);
  const [contextLost, setContextLost] = useState<boolean>(false);

  // Mount Three.js 3D Engine once
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
    tryRequestLandscape();
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
    let pct = 12;
    setLoadProgress({ percent: pct, stage: 'Entering Shonargaon Village...' });
    clearInterval(loadTimerRef.current);
    loadTimerRef.current = window.setInterval(() => {
      pct += 18;
      if (pct < 55) {
        setLoadProgress({ percent: pct, stage: 'Loading roads, bazaar & river...' });
      } else if (pct < 92) {
        setLoadProgress({ percent: pct, stage: 'Spawning villagers, vehicles & animals...' });
      } else {
        clearInterval(loadTimerRef.current);
        setLoadProgress({ percent: 100, stage: 'Ready' });
        gm.setPlayingMode(true);
        setScreen('playing');
      }
    }, 240);
  };

  const handleSettingsChange = (next: GameSettings) => {
    setSettingsState(next);
    gameRef.current?.applySettings(next);
  };

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setScreen('intro');
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#070b12]">
      {/* Dedicated isolated WebGL mount */}
      <div ref={canvasMountRef} className="absolute inset-0 h-full w-full" />

      {contextLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-6 text-center">
          <div className="max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="font-display text-lg font-bold text-white">Graphics Context Paused</h2>
            <p className="mt-2 text-xs text-slate-300">
              Restoring WebGL 3D scene resources...
            </p>
          </div>
        </div>
      )}

      {screen === 'intro' && (
        <IntroSplash
          canSkip={initialSave.hasPlayedIntro}
          onStartAudio={() => {
            tryRequestLandscape();
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
        />
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
