import React, { useState } from 'react';
import { Info, LogOut, Play, RotateCcw, Settings as SettingsIcon, Sliders, Volume2, X } from 'lucide-react';

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
      {/* বাম পাশের টাইটেল ও তথ্য */}
      <div className="flex flex-col justify-between bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent p-6 sm:p-10 pointer-events-auto max-w-md">
        <div>
          <p className="text-xs font-bold tracking-[0.34em] text-amber-400 uppercase">
            TAHSIN STUDIO
          </p>
          <h1 className="font-display mt-2 text-2xl font-bold leading-tight tracking-wide text-white sm:text-4xl">
            বাংলাদেশ
            <span className="block text-emerald-400">ভিলেজ লাইফ 3D</span>
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
            সোনারগাঁও গ্রাম ঘুরে দেখুন — মোটরসাইকেল, সিএনজি ও রিকশা চালান, ঘরের দরজা খুলে
            ভেতরে প্রবেশ করুন, গ্রামবাসীর সাথে কথা বলুন এবং ক্রিকেট খেলুন।
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300">
          <span>
            মিশন: <strong className="font-mono-num text-white">{completedMissions}/৫</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            ক্রিকেট সেরা:{' '}
            <strong className="font-mono-num text-amber-300">{cricketHighScore}</strong>
          </span>
        </div>
      </div>

      {/* ডান পাশের মেনু বাটনসমূহ */}
      <div className="flex flex-col justify-center gap-2 bg-gradient-to-l from-slate-950/92 via-slate-950/65 to-transparent px-4 py-3 sm:px-10 sm:py-6 pointer-events-auto min-w-[210px] sm:min-w-[275px] overflow-y-auto">
        {hasContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center justify-center gap-2.5 rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold tracking-wide text-slate-950 shadow-lg transition hover:bg-amber-400 whitespace-nowrap"
          >
            <Play className="h-4 w-4 fill-current" />
            চালিয়ে যান
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
          {hasContinue ? 'নতুন খেলা শুরু' : 'খেলা শুরু করুন'}
        </button>

        <div className="my-1 h-px bg-slate-800" />

        <button
          type="button"
          onClick={() => onOpenSettings('world')}
          className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white whitespace-nowrap"
        >
          <SettingsIcon className="h-4 w-4 text-slate-400" />
          সময় ও আবহাওয়া
        </button>

        <button
          type="button"
          onClick={() => onOpenSettings('graphics')}
          className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white whitespace-nowrap"
        >
          <Sliders className="h-4 w-4 text-emerald-400" />
          গ্রাফিক্স সেটিংস
        </button>

        <button
          type="button"
          onClick={() => onOpenSettings('sound')}
          className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white whitespace-nowrap"
        >
          <Volume2 className="h-4 w-4 text-amber-400" />
          সাউন্ড সেটিংস
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowAbout(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white whitespace-nowrap"
          >
            <Info className="h-3.5 w-3.5" />
            তথ্য
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex items-center justify-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-500/60 hover:text-red-300 whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" />
            বের হন
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
                  বাংলাদেশ ভিলেজ লাইফ 3D
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                aria-label="বন্ধ করুন"
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                গ্রামীণ বাংলাদেশের আসল পরিবেশ নিয়ে তৈরি ৩ডি ওপেন ওয়ার্ল্ড গেম — বাড়ির দরজা খুলে
                ভেতরে যাওয়া, গ্রামবাসীর সাথে ৩টি অপশনে কথা বলা, মারামারি ও বন্দুক ব্যবহার এবং রাস্তার
                ট্রাফিকসহ সম্পূর্ণ অভিজ্ঞতা।
              </p>
              <p>
                <strong className="text-white">কম্পিউটার কন্ট্রোল:</strong> WASD/Arrow হাঁটা ও গাড়ি
                চালানো, মাউস ড্র্যাগ করে চারপাশ দেখা, Shift দৌড়ানো, Space লাফ, C বসা, J ঘুষি, G
                গুলি, R/1 অস্ত্র বদল (ঘুষি/বন্দুক), E দরজা খোলা/কথা বলা/ব্যাট, F গাড়িতে ওঠা-নামা।
              </p>
              <p>
                <strong className="text-white">মোবাইল টাচ কন্ট্রোল:</strong> বাম দিকের জয়স্টিক দিয়ে
                চলাফেরা, ডান দিকের বাটন দিয়ে ঘুষি/গুলি/লাফ/দরজা ও কথা বলা এবং স্ক্রিনে ড্র্যাগ করে
                ক্যামেরা ঘোরান।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
