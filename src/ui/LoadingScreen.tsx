import React from 'react';
import { LoadingProgress } from '../core/LoadingManager';

interface LoadingScreenProps {
  progress: LoadingProgress;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-black">
      {/* Walking villager artwork full-bleed landscape */}
      <img
        src="/assets/aistudio/image_51b664be.png"
        alt="Loading Bangladesh Village Life 3D"
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover object-center"
      />

      {/* Top subtle branding */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/75 via-black/35 to-transparent px-5 py-3.5 sm:px-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.28em] text-amber-400 uppercase">
            TAHSIN STUDIO
          </p>
          <h2 className="font-display text-lg font-bold tracking-wide text-white sm:text-2xl">
            BANGLADESH VILLAGE LIFE 3D
          </h2>
        </div>
        <span className="rounded border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          Open World · Shonargaon
        </span>
      </div>

      {/* Bottom Loading Bar anchored cleanly at the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-5 pt-10 pb-4 sm:px-8 sm:pb-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-1.5 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-slate-100">{progress.stage}</span>
            <span className="font-mono-num font-bold text-amber-400">
              {Math.round(progress.percent)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-white/20 bg-slate-900/90 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400 transition-all duration-150"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
