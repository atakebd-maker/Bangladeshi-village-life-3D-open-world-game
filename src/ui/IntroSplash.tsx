import React, { useEffect, useState } from 'react';

interface IntroSplashProps {
  canSkip: boolean;
  onStartAudio?: () => void;
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({
  canSkip,
  onStartAudio,
  onComplete,
}) => {
  // Phase 1: Black screen with "TAHSIN STUDIO" in English
  // Phase 2: Cover artwork with the two characters and "BANGLADESH VILLAGE LIFE 3D" title
  // Phase 3: Smooth fade out into Main Menu
  const [phase, setPhase] = useState<'studio' | 'cover' | 'fadeout'>('studio');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('cover'), 2800);
    const t2 = window.setTimeout(() => setPhase('fadeout'), 5600);
    const t3 = window.setTimeout(() => onComplete(), 6200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      onClick={() => onStartAudio?.()}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-600 ${
        phase === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {phase === 'studio' ? (
        <div className="relative flex flex-col items-center justify-center px-6 text-center">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.45em] text-amber-400/90 uppercase">
            Presents
          </p>
          <div className="relative overflow-hidden px-6 py-2">
            <h1 className="font-display text-4xl font-bold tracking-[0.22em] text-white sm:text-6xl drop-shadow-[0_6px_28px_rgba(245,158,11,0.3)]">
              TAHSIN STUDIO
            </h1>
            <div className="animate-light-sweep pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
          </div>
          <div className="mt-3 h-[2px] w-44 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden bg-black">
          <img
            src="/assets/aistudio/image_7de12f21.png"
            alt="BANGLADESH VILLAGE LIFE 3D - Developed by TAHSIN STUDIO"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="pointer-events-none absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-slate-200">
            <span className="font-semibold tracking-wider text-amber-300">TAHSIN STUDIO</span>
            <span className="text-slate-300">Starting Village World...</span>
          </div>
        </div>
      )}

      {canSkip && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="absolute top-4 right-5 z-10 rounded-lg border border-white/25 bg-black/75 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-white transition hover:border-amber-400 whitespace-nowrap"
        >
          Skip Intro
        </button>
      )}
    </div>
  );
};
