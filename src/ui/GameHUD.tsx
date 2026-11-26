import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Backpack,
  Camera,
  CheckCircle2,
  DoorOpen,
  Home,
  LogOut,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  ShoppingBag,
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
  lungi_genji: 'লুঙ্গি ও গেঞ্জি',
  panjabi_pajama: 'পাঞ্জাবি-পায়জামা',
  shirt_pant: 'শার্ট ও প্যান্ট',
};

const OUTFIT_OPTIONS: Array<{ id: PlayerOutfit; title: string; desc: string }> = [
  { id: 'lungi_genji', title: 'লুঙ্গি ও গেঞ্জি + গামছা', desc: 'ঐতিহ্যবাহী গ্রামীণ পোশাক' },
  { id: 'panjabi_pajama', title: 'সবুজ পাঞ্জাবি ও গামছা', desc: 'ভদ্র ও মার্জিত গ্রামীণ সাজ' },
  { id: 'shirt_pant', title: 'নীল শার্ট ও প্যান্ট', desc: 'আধুনিক ক্যাজুয়াল পোশাক' },
];

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  gameRef,
  onOpenSettings,
  onReturnToMenu,
  onExitGame,
}) => {
  const [cricketTeam, setCricketTeam] = useState('সোনারগাঁও টাইগার্স');
  const [cricketOvers, setCricketOvers] = useState(2);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [outfitOpen, setOutfitOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const selectOutfit = (outfit: PlayerOutfit) => {
    gameRef.current?.setOutfit(outfit);
    setToast(`পোশাক পরিবর্তন হয়েছে: ${OUTFIT_LABELS[outfit]}`);
  };

  const toggleCamera = () => {
    gameRef.current?.toggleCameraMode();
    const nextLabel =
      hud.cameraMode === 'third_person' ? 'ফার্স্ট পারসন ভিউ' : 'থার্ড পারসন ভিউ';
    setToast(`ক্যামেরা: ${nextLabel}`);
  };

  const topCircleBtn =
    'flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-white/80 bg-black/45 text-white hover:border-amber-300 active:scale-90 transition shadow-[0_2px_10px_rgba(0,0,0,0.45)] cursor-pointer';

  const missionsList = gameRef.current?.getMissions() ?? [];
  const activeToast = hud.notice ?? toast;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {/* টাচ ও ক্যামেরা কন্ট্রোল (নিচের লেয়ার z-0, যাতে উপরের কোনো মেনুতে বাধা না দেয়) */}
      <MobileControls
        gameRef={gameRef}
        isDriving={hud.isDriving}
        vehicleKind={hud.vehicleKind}
        activePrompt={hud.activePrompt}
        cricketActive={hud.cricket.active}
        weaponMode={hud.weaponMode}
        ammo={hud.ammo}
      />

      {/* বাম-উপর: ক্যারেক্টার ছবি + লাল/নীল বার + গোল মিনিম্যাপ */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex flex-col items-start gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-10 w-10 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/85 bg-slate-900 shadow-lg">
            <img
              src="/assets/aistudio/image_51b664be.png"
              alt="প্লেয়ার"
              className="h-full w-full object-cover object-[48%_18%] scale-[1.9]"
            />
          </div>

          <div className="flex flex-col gap-1 sm:gap-1.5">
            <div className="relative h-3 sm:h-3.5 w-24 sm:w-40 overflow-hidden rounded-sm border border-white/75 bg-black/65 shadow">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, hud.health))}%` }}
              />
            </div>
            <div className="relative h-2 sm:h-2.5 w-20 sm:w-36 overflow-hidden rounded-sm border border-white/75 bg-black/65 shadow">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, hud.stamina))}%` }}
              />
            </div>
            <p className="max-w-[130px] sm:max-w-none truncate text-[9px] sm:text-[10px] font-semibold text-white/95 drop-shadow">
              {hud.locationName} · {hud.timeLabel} · {hud.weatherLabel}
              {hud.isDriving ? ` · ${hud.speedKmh} কিমি/ঘ` : ''}
            </p>
          </div>
        </div>

        {/* গোল মিনিম্যাপ (ক্লিক করলে গ্রামের মানচিত্র ও জায়গার তালিকা খুলবে) */}
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          aria-label="গ্রামের মানচিত্র দেখুন"
          title="গ্রামের জায়গাসমূহ দেখুন"
          className="cursor-pointer active:scale-95 transition-transform"
        >
          <MiniMap
            playerX={hud.playerX}
            playerZ={hud.playerZ}
            playerHeading={hud.playerHeading}
            markers={hud.markers}
          />
        </button>
      </div>

      {/* উপর-মাঝে / পোর্ট্রেটে ডান-নিচে: হলুদ বর্ডারযুক্ত মিশন ব্যানার (ক্লিক করলে সব মিশন দেখাবে) */}
      {hud.activeMission && (
        <button
          type="button"
          onClick={() => setMissionsOpen(true)}
          className="flex absolute top-14 right-3 md:top-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 items-center gap-1.5 sm:gap-2 rounded-lg border-2 border-amber-400/85 bg-black/75 px-2.5 sm:px-4 py-1 sm:py-1.5 text-center shadow-[0_0_16px_rgba(250,204,21,0.3)] hover:border-amber-300 pointer-events-auto cursor-pointer"
        >
          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-amber-400" />
          <span className="text-[10px] sm:text-xs font-bold tracking-wide text-white whitespace-nowrap max-w-[165px] sm:max-w-none truncate">
            মিশন: {hud.activeMission.title}
          </span>
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-amber-400" />
        </button>
      )}

      {/* ডান-উপর: সাদা গোল বাটনসমূহ (সেটিংস, পোশাক ও ব্যাগ, ক্যামেরা, পজ ও বের হন) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="সেটিংস"
          title="সেটিংস"
          className={topCircleBtn}
        >
          <SettingsIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setOutfitOpen(true)}
          aria-label="পোশাক ও ব্যাগ"
          title="পোশাক ও ব্যাগ"
          className={topCircleBtn}
        >
          <ShoppingBag className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={toggleCamera}
          aria-label="ক্যামেরা পরিবর্তন"
          title="ক্যামেরা পরিবর্তন"
          className={topCircleBtn}
        >
          <Camera className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setPauseOpen(true)}
          aria-label="পজ বা গেম থেকে বের হন"
          title="পজ / বের হন"
          className={topCircleBtn}
        >
          <Pause className="h-5 w-5" />
        </button>
      </div>

      {/* হালকা বাংলা টোস্ট মেসেজ */}
      {activeToast && (
        <div className="absolute top-24 md:top-16 left-1/2 -translate-x-1/2 z-30 max-w-[90vw] rounded-full border border-amber-300/80 bg-black/85 px-4 py-1 text-center text-xs font-bold text-amber-200 shadow-lg">
          {activeToast}
        </div>
      )}

      {/* ক্রিকেট স্কোরবোর্ড ও টাইমিং বার */}
      {hud.cricket.active && (
        <div className="absolute top-24 md:top-16 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[390px] rounded-xl border border-emerald-500/75 bg-slate-950/92 p-3 text-xs shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400">{hud.cricket.teamName}</span>
            <span className="font-mono-num text-base font-bold text-white">
              {hud.cricket.runs}/{hud.cricket.wickets}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({Math.floor(hud.cricket.ballsBowled / 6)}.{hud.cricket.ballsBowled % 6} /{' '}
                {hud.cricket.maxOvers} ওভার)
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
                ব্যাট চালান (E)
              </button>
            ) : (
              <div className="flex flex-1 items-center gap-1.5">
                <select
                  value={cricketTeam}
                  onChange={(e) => setCricketTeam(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                >
                  <option value="সোনারগাঁও টাইগার্স">সোনারগাঁও টাইগার্স</option>
                  <option value="পদ্মা লায়ন্স">পদ্মা লায়ন্স</option>
                  <option value="বেঙ্গল একাদশ">বেঙ্গল একাদশ</option>
                </select>
                <select
                  value={cricketOvers}
                  onChange={(e) => setCricketOvers(Number(e.target.value))}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                >
                  <option value={1}>১ ওভার</option>
                  <option value={2}>২ ওভার</option>
                  <option value={3}>৩ ওভার</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    gameRef.current?.startCricketWithConfig(cricketTeam, cricketOvers)
                  }
                  className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-slate-950"
                >
                  আবার খেলুন
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => gameRef.current?.exitCricket()}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white"
            >
              বের হন
            </button>
          </div>
        </div>
      )}

      {/* ফুটবল মাঠের স্কোর */}
      {hud.football.active && !hud.cricket.active && (
        <div className="absolute top-24 md:top-16 left-1/2 -translate-x-1/2 z-30 max-w-[90vw] rounded-lg border border-lime-500/60 bg-slate-950/90 px-4 py-1.5 text-xs text-center shadow-lg">
          <span className="font-bold text-lime-400">গ্রামের ফুটবল</span>
          <span className="mx-2 text-slate-500">·</span>
          <span className="font-mono-num text-white">গোল: {hud.football.goals}</span>
          <span className="mx-2 text-slate-500">·</span>
          <span className="text-slate-300">{hud.football.lastEvent}</span>
        </div>
      )}

      {/* কাছে এলে কাজের বাটন (দরজা খুলুন, কথা বলুন, গাড়ি/নৌকা চালান) */}
      {hud.activePrompt && !hud.cricket.active && !hud.dialogue && !hud.isDead && (
        <div className="absolute bottom-44 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              const gm = gameRef.current;
              if (!gm) return;
              if (hud.activePrompt?.kind === 'vehicle') gm.input.vehicleToggle = true;
              else gm.input.interact = true;
            }}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-amber-300 bg-black/80 px-4 py-1.5 text-xs font-bold text-amber-200 shadow-lg hover:bg-black cursor-pointer"
          >
            {hud.activePrompt.kind === 'door' && <DoorOpen className="h-4 w-4 text-amber-300" />}
            <span>
              {hud.activePrompt.label} [{hud.activePrompt.kind === 'vehicle' ? 'F' : 'E'}]
            </span>
          </button>
        </div>
      )}

      {/* ৩-অপশন গ্রামবাসীর সাথে কথোপকথন */}
      {hud.dialogue && !hud.isDead && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-md rounded-xl border-2 border-white/75 bg-black/90 p-3.5 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <span className="text-xs font-bold text-amber-300">{hud.dialogue.speaker}</span>
            <button
              type="button"
              onClick={() => gameRef.current?.closeDialogue()}
              aria-label="বন্ধ করুন"
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
                className="w-full rounded-lg border border-amber-400/50 bg-slate-900/90 px-3 py-1.5 text-left text-xs font-semibold text-amber-100 hover:border-amber-300 hover:bg-amber-500/20 active:scale-[0.99] transition cursor-pointer"
              >
                {idx + 1}. {choice.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* মিশন তালিকা মোডাল */}
      {missionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="w-full max-w-md rounded-2xl border-2 border-amber-400/70 bg-slate-950/95 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="font-display text-base font-bold text-amber-300">
                গ্রামের মিশন ({hud.completedCount}/{hud.totalMissions})
              </h2>
              <button
                type="button"
                onClick={() => setMissionsOpen(false)}
                className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {missionsList.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg border p-3 text-xs ${
                    m.completed
                      ? 'border-emerald-500/50 bg-emerald-950/35 text-emerald-100'
                      : 'border-slate-700 bg-slate-900/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{m.title}</span>
                    {m.completed && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">{m.description}</p>
                  <p className="mt-1 text-[10px] text-amber-300">স্থান: {m.targetLocation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* পোশাক ও ব্যাগ (Outfit & Inventory) মোডাল */}
      {outfitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="w-full max-w-md rounded-2xl border-2 border-white/75 bg-slate-950/95 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="font-display text-base font-bold text-white">পোশাক ও হাতের ব্যাগ</h2>
              <button
                type="button"
                onClick={() => setOutfitOpen(false)}
                className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {OUTFIT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectOutfit(opt.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-xs transition ${
                    hud.outfit === opt.id
                      ? 'border-emerald-400 bg-emerald-950/60 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div>
                    <p className="font-bold">{opt.title}</p>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </div>
                  {hud.outfit === opt.id && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Backpack className="h-4 w-4" />
                <span>সংগ্রহ করা জিনিস ({hud.inventory.length})</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hud.inventory.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* গ্রামের স্থানসমূহ মোডাল */}
      {mapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="w-full max-w-sm rounded-2xl border-2 border-white/75 bg-slate-950/95 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="font-display text-base font-bold text-white">সোনারগাঁও মানচিত্র</h2>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-amber-300">বর্তমান স্থান: {hud.locationName}</p>
            <div className="mt-3 max-h-[50vh] space-y-1.5 overflow-y-auto text-xs">
              {hud.markers
                .filter((m) => m.kind === 'building' || m.kind === 'sport')
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2"
                  >
                    <span className="font-semibold text-white">{m.label}</span>
                    <span className="font-mono-num text-[11px] text-slate-400">
                      {Math.round(Math.hypot(m.x - hud.playerX, m.z - hud.playerZ))} মিটার দূরে
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* মারা গেলে বা অজ্ঞান হলে রিস্পন স্ক্রিন */}
      {hud.isDead && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-red-950/75 p-4 pointer-events-auto">
          <div className="w-full max-w-sm rounded-2xl border-2 border-red-400/80 bg-slate-950/95 p-6 text-center shadow-2xl">
            <Skull className="mx-auto h-10 w-10 text-red-400" />
            <h2 className="font-display mt-2 text-2xl font-bold text-white">আপনি অজ্ঞান হয়ে গেছেন!</h2>
            <p className="mt-1 text-xs text-red-200">{hud.deathReason}</p>
            <p className="mt-2 text-[11px] text-slate-400">
              প্রথম থেকে আবার গেমপ্লে শুরু হচ্ছে...
            </p>
            <button
              type="button"
              onClick={() => gameRef.current?.respawnPlayer()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              <RotateCcw className="h-4 w-4" />
              এখনই আবার শুরু করুন
            </button>
          </div>
        </div>
      )}

      {/* পজ এবং গেম থেকে বের হওয়ার মেনু */}
      {pauseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="w-full max-w-xs rounded-2xl border-2 border-white/75 bg-slate-950/95 p-5 text-center shadow-2xl">
            <p className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase">
              TAHSIN STUDIO
            </p>
            <h2 className="font-display mt-1 text-xl font-bold text-white">গেম পজ</h2>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPauseOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                <Play className="h-4 w-4 fill-current" />
                খেলা চালিয়ে যান
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
                আবার শুরু করুন
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
                মেইন মেনু
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
                গেম থেকে বের হন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
