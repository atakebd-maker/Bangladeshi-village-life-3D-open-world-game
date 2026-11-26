import React from 'react';
import { LoadingProgress } from '../core/LoadingManager';

interface LoadingScreenProps {
  progress: LoadingProgress;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-black">
      {/* হাঁটতে থাকা গ্রামবাসীর পূর্ণ ছবি (পোর্ট্রেট ও ল্যান্ডস্কেপে কোনো অংশ কাটা পড়বে না) */}
      <img
        src="/assets/aistudio/image_51b664be.png"
        alt="লোডিং বাংলাদেশ ভিলেজ লাইফ থ্রিডি"
        referrerPolicy="no-referrer"
        className="h-full w-full portrait:object-contain landscape:object-cover object-center"
      />

      {/* উপরের ব্র্যান্ডিং */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 py-3 sm:px-8 sm:py-3.5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.28em] text-amber-400 uppercase">
            TAHSIN STUDIO
          </p>
          <h2 className="font-display text-base font-bold tracking-wide text-white sm:text-2xl">
            বাংলাদেশ ভিলেজ লাইফ 3D
          </h2>
        </div>
        <span className="rounded border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-emerald-300">
          ওপেন ওয়ার্ল্ড · সোনারগাঁও
        </span>
      </div>

      {/* নিচের দিকে ১০ সেকেন্ডের লোডিং বার */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-4 pt-10 pb-4 sm:px-8 sm:pb-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="font-medium text-slate-100 truncate">{progress.stage}</span>
            <span className="font-mono-num font-bold text-amber-400 shrink-0">
              {Math.round(progress.percent)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-white/20 bg-slate-900/90 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400 transition-all duration-100"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
