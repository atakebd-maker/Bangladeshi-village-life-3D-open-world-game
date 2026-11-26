import React, { useState } from 'react';
import {
  AlertCircle,
  Camera,
  DoorOpen,
  Home,
  LogOut,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  Shirt,
  Skull,
  X,
} from 'lucide-react';
import { GameManager } from '../core/GameManager';
import { HudSnapshot, PlayerOutfit } from '../types/game';
import { MiniMap } from './MiniMap';
import { MobileControls } from './MobileControls';

interface GameHUDProps {
  hud: HudSnapshot;
  gameRef: React.MutableRefObject<GameManager | null>;
  onOpenSettings: () => void;
  onReturnToMenu: () => void;
  onExitGame: () => void;
}

const OUTFIT_LABELS: Record<PlayerOutfit, string> = {
  lungi_genji: 'Lungi & Genji',
  panjabi_pajama: 'Panjabi',
  shirt_pant: 'Shirt & Pant',
};

const OUTFIT_CYCLE: PlayerOutfit[] = ['lungi_genji', 'panjabi_pajama', 'shirt_pant'];

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  gameRef,
  onOpenSettings,
  onReturnToMenu,
  onExitGame,
}) => {
  const [cricketTeam, setCricketTeam] = useState('Shonargaon Tigers');
  const [cricketOvers, setCricketOvers] = useState(2);
  const [pauseOpen, setPauseOpen] = useState(false);

  const cycleOutfit = () => {
    const idx = OUTFIT_CYCLE.indexOf(hud.outfit);
    const next = OUTFIT_CYCLE[(idx + 1) % OUTFIT_CYCLE.length];
    gameRef.current?.setOutfit(next);
  };

  const topCircleBtn =
    'flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-white/80 bg-black/45 text-white hover:border-amber-300 active:scale-90 transition shadow-[0_2px_10px_rgba(0,0,0,0.45)]';

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {/* Touch & Camera Layer */}
      <MobileControls
        gameRef={gameRef}
        isDriving={hud.isDriving}
        activePrompt={hud.activePrompt}
        cricketActive={hud.cricket.active}
        weaponMode={hud.weaponMode}
        ammo={hud.ammo}
      />

      {/* Top-Left: Avatar + Health/Stamina Bars + Circular MiniMap (matches screenshot) */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col items-start gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Circular Hero Portrait */}
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/85 bg-slate-900 shadow-lg">
            <img
              src="/assets/aistudio/image_51b664be.png"
              alt="Player"
              className="h-full w-full object-cover object-[48%_18%] scale-[1.9]"
            />
          </div>

          {/* Red Health Bar & Blue Stamina Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="relative h-3.5 w-32 sm:w-40 overflow-hidden rounded-sm border border-white/75 bg-black/65 shadow">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, hud.health))}%` }}
              />
            </div>
            <div className="relative h-2.5 w-28 sm:w-36 overflow-hidden rounded-sm border border-white/75 bg-black/65 shadow">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, hud.stamina))}%` }}
              />
            </div>
            <p className="text-[10px] font-semibold text-white/90 drop-shadow">
              {hud.locationName} · {hud.timeLabel}
              {hud.isDriving ? ` · ${hud.speedKmh} km/h` : ''}
            </p>
          </div>
        </div>

        {/* Circular Radar MiniMap directly below portrait */}
        <MiniMap
          playerX={hud.playerX}
          playerZ={hud.playerZ}
          playerHeading={hud.playerHeading}
          markers={hud.markers}
        />
      </div>

      {/* Top-Center: Glowing Amber-Bordered Mission Banner */}
      {hud.activeMission && (
        <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 items-center gap-2 rounded-lg border-2 border-amber-400/85 bg-black/75 px-4 py-1.5 text-center shadow-[0_0_16px_rgba(250,204,21,0.3)]">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-xs font-bold tracking-wide text-white whitespace-nowrap">
            Mission: {hud.activeMission.title}
          </span>
          <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        </div>
      )}

      {/* Top-Right: Translucent White-Bordered Circular Buttons (Settings, Outfit, Camera, Pause/Exit) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          title="Settings"
          className={topCircleBtn}
        >
          <SettingsIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={cycleOutfit}
          aria-label="Change Outfit"
          title={`Outfit: ${OUTFIT_LABELS[hud.outfit]}`}
          className={topCircleBtn}
        >
          <Shirt className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => gameRef.current?.toggleCameraMode()}
          aria-label="Switch Camera"
          title={`Camera: ${hud.cameraMode === 'third_person' ? '3rd Person' : '1st Person'}`}
          className={topCircleBtn}
        >
          <Camera className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setPauseOpen(true)}
          aria-label="Pause or Exit Game"
          title="Pause / Exit Game"
          className={topCircleBtn}
        >
          <Pause className="h-5 w-5" />
        </button>
      </div>

      {/* Interactive Cricket Scoreboard & Timing Meter */}
      {hud.cricket.active && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[320px] sm:w-[390px] rounded-xl border border-emerald-500/75 bg-slate-950/92 p-3 text-xs shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400">{hud.cricket.teamName}</span>
            <span className="font-mono-num text-base font-bold text-white">
              {hud.cricket.runs}/{hud.cricket.wickets}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({Math.floor(hud.cricket.ballsBowled / 6)}.{hud.cricket.ballsBowled % 6} /{' '}
                {hud.cricket.maxOvers} ov)
              </span>
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-300">{hud.cricket.lastEvent}</p>

          {hud.cricket.ballIncoming && (
            <div className="mt-2">
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="absolute inset-y-0 bg-emerald-500/45"
                  style={{ left: '74%', width: '18%' }}
                />
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${Math.round(hud.cricket.timingProgress * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between gap-2">
            {!hud.cricket.inningOver ? (
              <button
                type="button"
                onClick={() => gameRef.current?.swingCricketBat()}
                className="flex-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                SWING BAT (E)
              </button>
            ) : (
              <div className="flex flex-1 items-center gap-1.5">
                <select
                  value={cricketTeam}
                  onChange={(e) => setCricketTeam(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                >
                  <option value="Shonargaon Tigers">Shonargaon Tigers</option>
                  <option value="Padma Lions">Padma Lions</option>
                  <option value="Bengal XI">Bengal XI</option>
                </select>
                <select
                  value={cricketOvers}
                  onChange={(e) => setCricketOvers(Number(e.target.value))}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                >
                  <option value={1}>1 Ov</option>
                  <option value={2}>2 Ov</option>
                  <option value={3}>3 Ov</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    gameRef.current?.startCricketWithConfig(cricketTeam, cricketOvers)
                  }
                  className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-slate-950"
                >
                  Rematch
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => gameRef.current?.exitCricket()}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white"
            >
              Leave
            </button>
          </div>
        </div>
      )}

      {/* Football Ground Score Readout */}
      {hud.football.active && !hud.cricket.active && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 rounded-lg border border-lime-500/60 bg-slate-950/90 px-4 py-1.5 text-xs text-center shadow-lg">
          <span className="font-bold text-lime-400">Village Football</span>
          <span className="mx-2 text-slate-500">·</span>
          <span className="font-mono-num text-white">Goals: {hud.football.goals}</span>
          <span className="mx-2 text-slate-500">·</span>
          <span className="text-slate-300">{hud.football.lastEvent}</span>
        </div>
      )}

      {/* Proximity Action Prompt (Open Door, Talk, Drive Vehicle, etc.) */}
      {hud.activePrompt && !hud.cricket.active && !hud.dialogue && !hud.isDead && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              const gm = gameRef.current;
              if (!gm) return;
              if (hud.activePrompt?.kind === 'vehicle') gm.input.vehicleToggle = true;
              else gm.input.interact = true;
            }}
            className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-black/80 px-4 py-1.5 text-xs font-bold text-amber-200 shadow-lg hover:bg-black"
          >
            {hud.activePrompt.kind === 'door' && <DoorOpen className="h-4 w-4 text-amber-300" />}
            <span>
              {hud.activePrompt.label} [{hud.activePrompt.kind === 'vehicle' ? 'F' : 'E'}]
            </span>
          </button>
        </div>
      )}

      {/* Interactive 3-Choice Villager Dialogue Panel */}
      {hud.dialogue && !hud.isDead && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-xl border-2 border-white/75 bg-black/88 p-3.5 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <span className="text-xs font-bold text-amber-300">{hud.dialogue.speaker}</span>
            <button
              type="button"
              onClick={() => gameRef.current?.closeDialogue()}
              aria-label="Close Dialogue"
              className="rounded-full border border-white/30 p-1 text-slate-300 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-white">
            {hud.dialogue.currentReply ?? hud.dialogue.greeting}
          </p>

          <div className="mt-3 flex flex-col gap-1.5">
            {hud.dialogue.choices.map((choice, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => gameRef.current?.selectDialogueChoice(choice)}
                className="w-full rounded-lg border border-amber-400/50 bg-slate-900/90 px-3 py-1.5 text-left text-xs font-semibold text-amber-100 hover:border-amber-300 hover:bg-amber-500/20 active:scale-[0.99] transition"
              >
                {idx + 1}. {choice.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Knocked Out / Traffic Accident Respawn Overlay */}
      {hud.isDead && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-red-950/75 p-4 pointer-events-auto">
          <div className="w-full max-w-sm rounded-2xl border-2 border-red-400/80 bg-slate-950/95 p-6 text-center shadow-2xl">
            <Skull className="mx-auto h-10 w-10 text-red-400" />
            <h2 className="font-display mt-2 text-2xl font-bold text-white">KNOCKED OUT</h2>
            <p className="mt-1 text-xs text-red-200">{hud.deathReason}</p>
            <p className="mt-2 text-[11px] text-slate-400">
              Restarting from Shonargaon village start...
            </p>
            <button
              type="button"
              onClick={() => gameRef.current?.respawnPlayer()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              <RotateCcw className="h-4 w-4" />
              Restart Now
            </button>
          </div>
        </div>
      )}

      {/* Pause & Exit Game Modal */}
      {pauseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="w-full max-w-xs rounded-2xl border-2 border-white/75 bg-slate-950/95 p-5 text-center shadow-2xl">
            <p className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase">
              TAHSIN STUDIO
            </p>
            <h2 className="font-display mt-1 text-xl font-bold text-white">GAME PAUSED</h2>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPauseOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                <Play className="h-4 w-4 fill-current" />
                Resume Village
              </button>

              <button
                type="button"
                onClick={() => {
                  setPauseOpen(false);
                  gameRef.current?.respawnPlayer();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:border-amber-400"
              >
                <RotateCcw className="h-4 w-4 text-amber-400" />
                Restart Village
              </button>

              <button
                type="button"
                onClick={() => {
                  setPauseOpen(false);
                  onReturnToMenu();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:border-sky-400"
              >
                <Home className="h-4 w-4 text-sky-400" />
                Main Menu
              </button>

              <button
                type="button"
                onClick={() => {
                  setPauseOpen(false);
                  onExitGame();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-500/70 bg-red-950/80 px-4 py-2.5 text-xs font-bold text-red-200 hover:bg-red-900"
              >
                <LogOut className="h-4 w-4" />
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
