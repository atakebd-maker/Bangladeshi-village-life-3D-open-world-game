import React, { useRef, useState } from 'react';
import {
  Armchair,
  ArrowLeft,
  ArrowRight,
  Car,
  DoorOpen,
  Footprints,
  Hand,
  LogOut,
  MessageCircle,
  Volume2,
} from 'lucide-react';
import { GameManager } from '../core/GameManager';
import { InteractionPrompt, WeaponMode } from '../types/game';

interface MobileControlsProps {
  gameRef: React.MutableRefObject<GameManager | null>;
  isDriving: boolean;
  activePrompt: InteractionPrompt | null;
  cricketActive: boolean;
  weaponMode: WeaponMode;
  ammo: number;
}

const FistIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.5 9.5a1.6 1.6 0 0 0-1.5 1.1V7.2a1.6 1.6 0 0 0-3.2 0v2.1V6a1.6 1.6 0 0 0-3.2 0v3.3V7.2a1.6 1.6 0 0 0-3.2 0v5.1l-.9-.9a1.5 1.5 0 0 0-2.1 2.1l3.3 3.8A4.8 4.8 0 0 0 11.4 19h3.4A4.6 4.6 0 0 0 19.4 14.4V11a1.6 1.6 0 0 0-.9-1.5Z" />
  </svg>
);

const GunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 7h15.5l1.2-1.5h1.3v3.5l-1.5 1H14v3.2a1 1 0 0 1-1 1h-2.1l-1.3 4.8H6l1.4-5.5H4.5L3 12V7Zm8.2 3v2.3h1.5V10h-1.5Z" />
  </svg>
);

const JumpPersonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="4.2" r="2.1" />
    <path d="M7.2 7.2 10.6 9h2.8l3.4-1.8 1 1.7-3.3 2v3.3l2.6 4.1-1.9 1-2.5-3.6h-1.4L8.8 19.3l-1.9-1 2.6-4.1V10.9l-3.3-2 1-1.7Z" />
  </svg>
);

const RunPersonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="14.5" cy="4.3" r="2.1" />
    <path d="M13.6 7.5c.8 0 1.4.6 1.4 1.4l-.6 2.8 3 1.8-.9 1.6-2.8-1.4-1.2 2.4 2.7 3.8-1.8 1-2.6-3.4-2.1 1.7-1.2 3-1.8-.6 1.3-3.5 2.5-1.9 1.2-3.2-2.6.9-.9 2-1.7-.7 1.3-3.2 4.8-1.6Z" />
  </svg>
);

const CrouchPersonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="13.5" cy="6.5" r="2.1" />
    <path d="M13.5 9.4c1.1 0 1.9.8 1.9 1.9v2.4l3 1.4-.7 1.8-3.8-1.4-2.6.2 1.2 3.8H9.8l-1.7-5.2 2.9-3.9c.5-.6 1.4-1 2.5-1Z" />
  </svg>
);

const BatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 3 9 13l2 2L21 5l-2-2Z" />
    <path d="m9 13-5 5" />
    <circle cx="17" cy="17" r="2.2" />
  </svg>
);

const PedalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="7" y="4" width="10" height="16" rx="2" transform="rotate(-10 12 12)" />
    <path d="M9 9h6M9 13h6M9 17h6" />
  </svg>
);

export const MobileControls: React.FC<MobileControlsProps> = ({
  gameRef,
  isDriving,
  activePrompt,
  cricketActive,
  weaponMode,
  ammo,
}) => {
  const [knob, setKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sprintActive, setSprintActive] = useState(false);
  const joyOrigin = useRef<{ x: number; y: number } | null>(null);
  const lookPointer = useRef<{ id: number; x: number; y: number } | null>(null);

  const setInput = (patch: Partial<GameManager['input']>) => {
    const gm = gameRef.current;
    if (!gm) return;
    Object.assign(gm.input, patch);
  };

  // ভার্চুয়াল জয়স্টিক কন্ট্রোল
  const handleJoyDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    joyOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoy(e.clientX, e.clientY);
  };

  const handleJoyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joyOrigin.current) return;
    e.stopPropagation();
    updateJoy(e.clientX, e.clientY);
  };

  const handleJoyUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    joyOrigin.current = null;
    setKnob({ x: 0, y: 0 });
    setInput({ moveX: 0, moveY: 0 });
  };

  const updateJoy = (cx: number, cy: number) => {
    if (!joyOrigin.current) return;
    const maxR = 42;
    let dx = cx - joyOrigin.current.x;
    let dy = cy - joyOrigin.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnob({ x: dx, y: dy });
    setInput({ moveX: dx / maxR, moveY: -dy / maxR });
  };

  // ফাঁকা জায়গায় টাচ/ড্র্যাগ করলে ক্যামেরা ঘুরবে (বাটনে চাপ পড়বে না)
  const handleLookDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    lookPointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };

  const handleLookMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!lookPointer.current || lookPointer.current.id !== e.pointerId) return;
    const dx = e.clientX - lookPointer.current.x;
    const dy = e.clientY - lookPointer.current.y;
    lookPointer.current.x = e.clientX;
    lookPointer.current.y = e.clientY;
    gameRef.current?.triggerLookDelta(dx, dy);
  };

  const handleLookUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lookPointer.current?.id === e.pointerId) {
      lookPointer.current = null;
    }
  };

  const actionCircle =
    'flex flex-col items-center justify-center rounded-full border-2 border-white/80 bg-black/40 text-white active:scale-90 transition-transform select-none touch-none shadow-[0_3px_12px_rgba(0,0,0,0.45)]';

  return (
    <div
      onPointerDown={handleLookDown}
      onPointerMove={handleLookMove}
      onPointerUp={handleLookUp}
      onPointerCancel={handleLookUp}
      className="fixed inset-0 z-0 pointer-events-auto"
    >
      {/* বাম থাম্ব: ভার্চুয়াল জয়স্টিক অথবা গাড়ির স্টিয়ারিং */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-7 z-10">
        {isDriving ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="বামে ঘোরান"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ steer: -1 });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ steer: 0 });
              }}
              onPointerLeave={() => setInput({ steer: 0 })}
              className="flex h-14 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-black/45 text-white active:scale-95 shadow-lg"
            >
              <ArrowLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              aria-label="ডানে ঘোরান"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ steer: 1 });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ steer: 0 });
              }}
              onPointerLeave={() => setInput({ steer: 0 })}
              className="flex h-14 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-black/45 text-white active:scale-95 shadow-lg"
            >
              <ArrowRight className="h-7 w-7" />
            </button>
          </div>
        ) : (
          <div
            onPointerDown={handleJoyDown}
            onPointerMove={handleJoyMove}
            onPointerUp={handleJoyUp}
            onPointerCancel={handleJoyUp}
            className="relative flex h-[112px] w-[112px] sm:h-[124px] sm:w-[124px] items-center justify-center rounded-full border-2 border-white/75 bg-black/25 touch-none shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
          >
            <span className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 text-[10px] leading-none text-white/95">
              ▲
            </span>
            <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] leading-none text-white/95">
              ▼
            </span>
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] leading-none text-white/95">
              ◀
            </span>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] leading-none text-white/95">
              ▶
            </span>

            <div
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border border-white bg-gradient-to-b from-white via-slate-200 to-slate-400 shadow-[0_3px_10px_rgba(0,0,0,0.5)]"
              style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
            />
          </div>
        )}
      </div>

      {/* ডান থাম্ব: গোল অ্যাকশন বাটনসমূহ */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10">
        {isDriving ? (
          <div className="flex items-end gap-2.5">
            <button
              type="button"
              aria-label="হর্ন"
              title="হর্ন"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ horn: true });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ horn: false });
              }}
              className={`${actionCircle} h-12 w-12`}
            >
              <Volume2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="ব্রেক বা পেছনে"
              title="ব্রেক / পেছনে"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ brake: 1 });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ brake: 0 });
              }}
              onPointerLeave={() => setInput({ brake: 0 })}
              className={`${actionCircle} h-14 w-14 border-red-300/85 bg-black/50`}
            >
              <PedalIcon className="h-5 w-5" />
              <span className="text-[8px] font-bold">ব্রেক</span>
            </button>

            <button
              type="button"
              aria-label="গ্যাস বা চালান"
              title="সামনে চালান"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ throttle: 1 });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ throttle: 0 });
              }}
              onPointerLeave={() => setInput({ throttle: 0 })}
              className={`${actionCircle} h-16 w-16 border-white bg-black/45`}
            >
              <PedalIcon className="h-6 w-6" />
              <span className="text-[8px] font-bold">গ্যাস</span>
            </button>

            <button
              type="button"
              aria-label="গাড়ি থেকে নামুন"
              title="গাড়ি থেকে নামুন"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ vehicleToggle: true });
              }}
              className={`${actionCircle} h-12 w-12 border-amber-300 bg-amber-500/85 text-slate-950`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="relative h-[168px] w-[205px] sm:h-[180px] sm:w-[222px]">
            {/* অস্ত্র পরিবর্তন (ঘুষি / বন্দুক) */}
            <button
              type="button"
              aria-label="অস্ত্র বদল (ঘুষি বা বন্দুক)"
              title={weaponMode === 'gun' ? 'খালি হাতে ফিরুন' : 'বন্দুক হাতে নিন'}
              onClick={(e) => {
                e.stopPropagation();
                gameRef.current?.toggleWeaponMode();
              }}
              className={`${actionCircle} absolute top-2 left-0 h-11 w-11 ${
                weaponMode === 'gun' ? 'border-amber-300 bg-black/60' : ''
              }`}
            >
              {weaponMode === 'gun' ? (
                <GunIcon className="h-5 w-5 text-amber-300" />
              ) : (
                <FistIcon className="h-5 w-5" />
              )}
              {weaponMode === 'gun' && (
                <span className="font-mono-num -mt-0.5 text-[8px] font-bold text-amber-300">
                  {ammo}
                </span>
              )}
            </button>

            {/* বসা (Sit) */}
            <button
              type="button"
              aria-label="বসুন"
              title="বসুন"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ sitToggle: true });
              }}
              className={`${actionCircle} absolute top-0 left-14 h-11 w-11`}
            >
              <Armchair className="h-5 w-5" />
            </button>

            {/* লাফ (Jump) */}
            <button
              type="button"
              aria-label="লাফ দিন"
              title="লাফ দিন"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ jump: true });
              }}
              className={`${actionCircle} absolute top-0 right-0 h-13 w-13 sm:h-14 sm:w-14`}
            >
              <JumpPersonIcon className="h-7 w-7" />
            </button>

            {/* লাথি (Kick) */}
            <button
              type="button"
              aria-label="লাথি দিন"
              title="লাথি দিন"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ kick: true });
              }}
              className={`${actionCircle} absolute top-14 left-0 h-11 w-11`}
            >
              <Footprints className="h-5 w-5" />
            </button>

            {/* দৌড় (Sprint Toggle) */}
            <button
              type="button"
              aria-label="দৌড়ানো"
              title="দৌড়ানো"
              onClick={(e) => {
                e.stopPropagation();
                const next = !sprintActive;
                setSprintActive(next);
                setInput({ sprint: next });
              }}
              className={`${actionCircle} absolute bottom-0 left-7 h-12 w-12 sm:h-13 sm:w-13 ${
                sprintActive ? 'border-amber-300 bg-amber-500/85 text-slate-950' : ''
              }`}
            >
              <RunPersonIcon className="h-6 w-6" />
            </button>

            {/* দরজা / কথা বলা / গাড়ি / ব্যাট অ্যাকশন */}
            <button
              type="button"
              aria-label={
                cricketActive
                  ? 'ব্যাট চালান'
                  : activePrompt?.label ?? 'ইন্টারেক্ট'
              }
              title={activePrompt?.label ?? 'কাজ করুন'}
              onClick={(e) => {
                e.stopPropagation();
                if (activePrompt?.kind === 'vehicle') {
                  setInput({ vehicleToggle: true });
                } else {
                  setInput({ interact: true });
                }
              }}
              className={`${actionCircle} absolute top-14 left-14 h-12 w-12 ${
                activePrompt || cricketActive
                  ? 'border-amber-300 bg-amber-500/90 text-slate-950'
                  : ''
              }`}
            >
              {cricketActive ? (
                <BatIcon className="h-5 w-5" />
              ) : activePrompt?.kind === 'vehicle' ? (
                <Car className="h-5 w-5" />
              ) : activePrompt?.kind === 'door' ? (
                <DoorOpen className="h-5 w-5" />
              ) : activePrompt?.kind === 'npc' ? (
                <MessageCircle className="h-5 w-5" />
              ) : (
                <Hand className="h-5 w-5" />
              )}
            </button>

            {/* বড় প্রাইমারি বাটন: ঘুষি অথবা বন্দুক চালান */}
            <button
              type="button"
              aria-label={weaponMode === 'gun' ? 'গুলি করুন' : 'ঘুষি মারুন'}
              title={weaponMode === 'gun' ? 'গুলি করুন (G)' : 'ঘুষি মারুন (J)'}
              onClick={(e) => {
                e.stopPropagation();
                if (cricketActive) {
                  setInput({ interact: true });
                } else if (weaponMode === 'gun') {
                  setInput({ fireGun: true });
                } else {
                  setInput({ punch: true });
                }
              }}
              className={`${actionCircle} absolute bottom-8 right-12 h-16 w-16 sm:h-[68px] sm:w-[68px] ${
                weaponMode === 'gun' ? 'border-amber-300 bg-black/55' : ''
              }`}
            >
              {cricketActive ? (
                <BatIcon className="h-8 w-8" />
              ) : weaponMode === 'gun' ? (
                <GunIcon className="h-8 w-8 text-amber-300" />
              ) : (
                <FistIcon className="h-8 w-8" />
              )}
            </button>

            {/* নিচু হওয়া (Crouch) */}
            <button
              type="button"
              aria-label="নিচু হোন"
              title="নিচু হোন"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ crouch: true });
              }}
              className={`${actionCircle} absolute bottom-0 right-0 h-12 w-12 sm:h-13 sm:w-13`}
            >
              <CrouchPersonIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
