import React, { useState } from 'react';
import { Info, Play, RotateCcw, Settings as SettingsIcon, Sliders, Volume2, X } from 'lucide-react';

interface MainMenuProps {
  hasContinue: boolean;
  cricketHighScore: number;
  completedMissions: number;
  onContinue: () => void;
  onPlayNew: () => void;
  onOpenSettings: (tab: 'graphics' | 'sound' | 'world') => void;
  onExit: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasContinue,
  cricketHighScore,
  completedMissions,
  onContinue,
  onPlayNew,
  onOpenSettings,
  onExit,
}) => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="fixed inset-0 z-30 flex items-stretch justify-between pointer-events-none">
      {/* Left Brand Lockup */}
      <div className="flex flex-col justify-between bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent p-6 sm:p-10 pointer-events-auto max-w-md">
        <div>
          <p className="text-xs font-bold tracking-[0.34em] text-amber-400 uppercase">
            TAHSIN STUDIO
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-wide text-white sm:text-5xl">
            BANGLADESH
            <span className="block text-emerald-400">VILLAGE LIFE 3D</span>
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
            Explore Shonargaon village — ride motorcycles, CNGs &amp; cycle rickshaws, cross
            the bamboo bridge, visit the bazaar, and play village cricket.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300">
          <span>Missions: <strong className="font-mono-num text-white">{completedMissions}/5</strong></span>
          <span aria-hidden="true">·</span>
          <span>Cricket Best: <strong className="font-mono-num text-amber-300">{cricketHighScore}</strong></span>
        </div>
      </div>

      {/* Right Free Fire-style Action Column */}
      <div className="flex flex-col justify-center gap-2 bg-gradient-to-l from-slate-950/92 via-slate-950/65 to-transparent px-4 py-3 sm:px-10 sm:py-6 pointer-events-auto min-w-[205px] sm:min-w-[270px] overflow-y-auto">
        {hasContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center justify-center gap-2.5 rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold tracking-wide text-slate-950 shadow-lg transition hover:bg-amber-400 whitespace-nowrap"
          >
            <Play className="h-4 w-4 fill-current" />
            Continue Village
          </button>
        )}

        <button
          type="button"
          onClick={onPlayNew}
          className={`flex items-center justify-center gap-2.5 rounded-lg px-5 py-3 text-sm font-bold tracking-wide shadow-lg transition whitespace-nowrap ${
            hasContinue
              ? 'border border-emerald-500/70 bg-emerald-950/80 text-emerald-200 hover:bg-emerald-900'
              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
          }`}
        >
          {hasContinue ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          {hasContinue ? 'New Game' : 'Play'}
        </button>

        <div className="my-1 h-px bg-slate-800" />

        <button
          type="button"
          onClick={() => onOpenSettings('world')}
          className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white whitespace-nowrap"
        >
          <SettingsIcon className="h-4 w-4 text-slate-400" />
          Settings &amp; Weather
        </button>

        <button
          type="button"
          onClick={() => onOpenSettings('graphics')}
          className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white whitespace-nowrap"
        >
          <Sliders className="h-4 w-4 text-emerald-400" />
          Graphics
        </button>

        <button
          type="button"
          onClick={() => onOpenSettings('sound')}
          className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white whitespace-nowrap"
        >
          <Volume2 className="h-4 w-4 text-amber-400" />
          Sound
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowAbout(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white whitespace-nowrap"
          >
            <Info className="h-3.5 w-3.5" />
            About
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-500/60 hover:text-red-300 whitespace-nowrap"
          >
            Exit
          </button>
        </div>
      </div>

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 pointer-events-auto">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.26em] text-amber-400 uppercase">
                  TAHSIN STUDIO
                </p>
                <h2 className="font-display text-xl font-bold text-white">
                  BANGLADESH VILLAGE LIFE 3D
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                aria-label="Close about"
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                An interactive 3D open-world rural Bangladesh experience powered by Three.js
                WebGL2 PBR rendering and packaged with native Android Capacitor landscape
                configuration in <code className="text-emerald-300">android/</code>.
              </p>
              <p>
                <strong className="text-white">Desktop Controls:</strong> WASD/Arrows to move
                or drive, Mouse drag to look, Shift to sprint, Space to jump/brake, C to
                crouch, V to sit, J/K/L/Q for combat &amp; dodge, E to interact/bat/kick, F to
                enter/exit vehicles, Tab for 1st/3rd person camera.
              </p>
              <p>
                <strong className="text-white">Mobile Touch:</strong> Use the left joystick
                and right action buttons, or drag anywhere in the open viewport to rotate the
                camera.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
