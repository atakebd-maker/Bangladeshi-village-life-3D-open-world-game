import React, { useState } from 'react';
import { Camera, Home, Settings as SettingsIcon, Shirt } from 'lucide-react';
import { GameManager } from '../core/GameManager';
import { HudSnapshot, PlayerOutfit } from '../types/game';
import { MiniMap } from './MiniMap';
import { MobileControls } from './MobileControls';

interface GameHUDProps {
  hud: HudSnapshot;
  gameRef: React.MutableRefObject<GameManager | null>;
  onOpenSettings: () => void;
  onReturnToMenu: () => void;
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
}) => {
  const [cricketTeam, setCricketTeam] = useState('Shonargaon Tigers');
  const [cricketOvers, setCricketOvers] = useState(2);

  const cycleOutfit = () => {
    const idx = OUTFIT_CYCLE.indexOf(hud.outfit);
    const next = OUTFIT_CYCLE[(idx + 1) % OUTFIT_CYCLE.length];
    gameRef.current?.setOutfit(next);
  };

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {/* Touch & Camera Layer */}
      <MobileControls
        gameRef={gameRef}
        isDriving={hud.isDriving}
        activePrompt={hud.activePrompt}
        cricketActive={hud.cricket.active}
      />

      {/* Top-Left: MiniMap + Location + Stamina */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-start gap-2.5 pointer-events-auto">
        <MiniMap
          playerX={hud.playerX}
          playerZ={hud.playerZ}
          playerHeading={hud.playerHeading}
          markers={hud.markers}
        />
        <div className="rounded-lg border border-slate-700/80 bg-slate-950/85 px-3 py-2 text-xs shadow-lg">
          <p className="font-bold text-white">{hud.locationName}</p>
          <p className="mt-0.5 text-[11px] text-slate-300">
            {hud.timeLabel} · {hud.weatherLabel}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Stamina</span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-emerald-400 transition-all"
                style={{ width: `${Math.round(hud.stamina)}%` }}
              />
            </div>
          </div>
          {hud.isDriving && (
            <p className="font-mono-num mt-1 text-[11px] font-bold text-amber-300">
              {hud.vehicleName} · {hud.speedKmh} km/h
            </p>
          )}
        </div>
      </div>

      {/* Top-Center: Active Mission */}
      {hud.activeMission && (
        <div className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 flex-col items-center rounded-lg border border-slate-700/80 bg-slate-950/85 px-4 py-1.5 text-center shadow-lg">
          <p className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
            Mission ({hud.completedCount}/{hud.totalMissions}) · {hud.activeMission.title}
          </p>
          <p className="text-[11px] text-slate-300">{hud.activeMission.targetLocation}</p>
        </div>
      )}

      {/* Top-Right: Camera, Outfit, Settings, Menu */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={cycleOutfit}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950/85 px-2.5 py-2 text-[11px] font-semibold text-slate-200 hover:border-emerald-400 whitespace-nowrap"
          title="Change Clothing"
        >
          <Shirt className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{OUTFIT_LABELS[hud.outfit]}</span>
        </button>

        <button
          type="button"
          onClick={() => gameRef.current?.toggleCameraMode()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950/85 px-2.5 py-2 text-[11px] font-semibold text-slate-200 hover:border-sky-400 whitespace-nowrap"
          title="Toggle Camera (Tab)"
        >
          <Camera className="h-3.5 w-3.5 text-sky-400" />
          <span className="hidden sm:inline">
            {hud.cameraMode === 'third_person' ? '3rd' : '1st'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="rounded-lg border border-slate-700 bg-slate-950/85 p-2 text-slate-200 hover:border-amber-400"
        >
          <SettingsIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onReturnToMenu}
          aria-label="Main Menu"
          className="rounded-lg border border-slate-700 bg-slate-950/85 p-2 text-slate-200 hover:border-red-400"
        >
          <Home className="h-4 w-4" />
        </button>
      </div>

      {/* Interactive Cricket Scoreboard & Timing Meter */}
      {hud.cricket.active && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[320px] sm:w-[390px] rounded-xl border border-emerald-600/70 bg-slate-950/92 p-3 text-xs shadow-2xl pointer-events-auto">
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

      {/* Proximity Action Prompt */}
      {hud.activePrompt && !hud.cricket.active && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-lg border border-amber-400/70 bg-slate-950/90 px-4 py-1.5 text-xs font-bold text-amber-200 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              const gm = gameRef.current;
              if (!gm) return;
              if (hud.activePrompt?.kind === 'vehicle') gm.input.vehicleToggle = true;
              else gm.input.interact = true;
            }}
          >
            {hud.activePrompt.label} [{hud.activePrompt.kind === 'vehicle' ? 'F' : 'E'}]
          </button>
        </div>
      )}

      {/* NPC Dialogue Toast */}
      {hud.dialogue && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 max-w-md rounded-xl border border-emerald-500/60 bg-slate-950/92 px-4 py-2.5 text-center shadow-xl">
          <p className="text-xs font-bold text-emerald-400">{hud.dialogue.speaker}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-100">{hud.dialogue.text}</p>
        </div>
      )}
    </div>
  );
};
