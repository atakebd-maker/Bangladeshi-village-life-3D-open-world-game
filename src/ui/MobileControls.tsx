import React, { useRef, useState } from 'react';
import {
  Armchair,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  Car,
  Footprints,
  Hand,
  LogOut,
  Shield,
  Volume2,
  Wind,
  Zap,
} from 'lucide-react';
import { GameManager } from '../core/GameManager';
import { InteractionPrompt } from '../types/game';

interface MobileControlsProps {
  gameRef: React.MutableRefObject<GameManager | null>;
  isDriving: boolean;
  activePrompt: InteractionPrompt | null;
  cricketActive: boolean;
}

const FistIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 11V7a2 2 0 0 0-4 0v3" />
    <path d="M14 10V6a2 2 0 0 0-4 0v4" />
    <path d="M10 10V7a2 2 0 0 0-4 0v6a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-2a2 2 0 0 0-2-2Z" />
  </svg>
);

const BatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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

  // Virtual Joystick Handlers
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
    const maxR = 40;
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

  // Open-Area Touch/Mouse Camera Look
  const handleLookDown = (e: React.PointerEvent<HTMLDivElement>) => {
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

  const iconBtn =
    'flex flex-col items-center justify-center rounded-full border-2 border-white/25 bg-slate-950/70 text-white active:scale-90 transition-transform select-none touch-none shadow-lg';

  return (
    <div
      onPointerDown={handleLookDown}
      onPointerMove={handleLookMove}
      onPointerUp={handleLookUp}
      onPointerCancel={handleLookUp}
      className="fixed inset-0 z-10 pointer-events-auto"
    >
      {/* Left Thumb Zone: Virtual Joystick or Vehicle Steering */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
        {isDriving ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Steer Left"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ steer: -1 });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ steer: 0 });
              }}
              onPointerLeave={() => setInput({ steer: 0 })}
              className="flex h-14 w-16 items-center justify-center rounded-2xl border-2 border-white/25 bg-slate-950/80 text-white active:scale-95 active:border-amber-400 shadow-xl"
            >
              <ArrowLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              aria-label="Steer Right"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ steer: 1 });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ steer: 0 });
              }}
              onPointerLeave={() => setInput({ steer: 0 })}
              className="flex h-14 w-16 items-center justify-center rounded-2xl border-2 border-white/25 bg-slate-950/80 text-white active:scale-95 active:border-amber-400 shadow-xl"
            >
              <ArrowRight className="h-7 w-7" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div
              onPointerDown={handleJoyDown}
              onPointerMove={handleJoyMove}
              onPointerUp={handleJoyUp}
              onPointerCancel={handleJoyUp}
              className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/25 bg-slate-950/50 touch-none shadow-inner"
            >
              {/* Directional cross notches */}
              <div className="pointer-events-none absolute inset-3 rounded-full border border-white/10" />
              <div
                className="h-12 w-12 rounded-full border-2 border-amber-300/90 bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg"
                style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
              />
            </div>

            {/* Sprint Lock Toggle Icon next to Joystick (Free Fire style) */}
            <button
              type="button"
              aria-label="Toggle Sprint"
              title="Sprint"
              onClick={(e) => {
                e.stopPropagation();
                const next = !sprintActive;
                setSprintActive(next);
                setInput({ sprint: next });
              }}
              className={`${iconBtn} h-11 w-11 ${
                sprintActive
                  ? 'border-amber-400 bg-amber-500/90 text-slate-950'
                  : 'border-white/25'
              }`}
            >
              <Zap className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Right Thumb Zone: Free Fire / GTA Style Professional Icon Controls */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
        {isDriving ? (
          <div className="flex items-end gap-2.5">
            <button
              type="button"
              aria-label="Horn"
              title="Horn"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ horn: true });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ horn: false });
              }}
              className={`${iconBtn} h-12 w-12`}
            >
              <Volume2 className="h-5 w-5 text-amber-300" />
            </button>

            <button
              type="button"
              aria-label="Brake or Reverse"
              title="Brake / Reverse"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ brake: 1 });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ brake: 0 });
              }}
              onPointerLeave={() => setInput({ brake: 0 })}
              className="flex h-16 w-14 flex-col items-center justify-center rounded-2xl border-2 border-red-400/70 bg-red-950/85 text-red-200 active:scale-95 active:bg-red-700 shadow-xl"
            >
              <PedalIcon className="h-6 w-6" />
              <span className="mt-0.5 text-[9px] font-bold tracking-wider">BRAKE</span>
            </button>

            <button
              type="button"
              aria-label="Accelerate"
              title="Gas"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ throttle: 1 });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ throttle: 0 });
              }}
              onPointerLeave={() => setInput({ throttle: 0 })}
              className="flex h-20 w-16 flex-col items-center justify-center rounded-2xl border-2 border-emerald-400/80 bg-emerald-900/90 text-emerald-100 active:scale-95 active:bg-emerald-600 shadow-xl"
            >
              <PedalIcon className="h-7 w-7" />
              <span className="mt-0.5 text-[9px] font-bold tracking-wider">GAS</span>
            </button>

            <button
              type="button"
              aria-label="Exit Vehicle"
              title="Exit Vehicle"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ vehicleToggle: true });
              }}
              className={`${iconBtn} h-12 w-12 border-amber-400/80 bg-amber-500 text-slate-950`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="relative h-[168px] w-[196px]">
            {/* Top-left of cluster: Sit */}
            <button
              type="button"
              aria-label="Sit"
              title="Sit"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ sitToggle: true });
              }}
              className={`${iconBtn} absolute top-0 left-0 h-11 w-11`}
            >
              <Armchair className="h-5 w-5 text-slate-200" />
            </button>

            {/* Top-middle: Crouch */}
            <button
              type="button"
              aria-label="Crouch"
              title="Crouch"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ crouch: true });
              }}
              className={`${iconBtn} absolute top-0 left-14 h-11 w-11`}
            >
              <ArrowDownToLine className="h-5 w-5 text-slate-200" />
            </button>

            {/* Top-right: Jump */}
            <button
              type="button"
              aria-label="Jump"
              title="Jump"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ jump: true });
              }}
              className={`${iconBtn} absolute top-0 right-0 h-12 w-12 border-emerald-400/75 bg-emerald-950/85`}
            >
              <ArrowUpFromLine className="h-5 w-5 text-emerald-300" />
            </button>

            {/* Middle-left: Block */}
            <button
              type="button"
              aria-label="Block"
              title="Block"
              onPointerDown={(e) => {
                e.stopPropagation();
                setInput({ block: true });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setInput({ block: false });
              }}
              onPointerLeave={() => setInput({ block: false })}
              className={`${iconBtn} absolute top-14 left-0 h-11 w-11`}
            >
              <Shield className="h-5 w-5 text-sky-300" />
            </button>

            {/* Middle-center: Dodge */}
            <button
              type="button"
              aria-label="Dodge"
              title="Dodge"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ dodge: true });
              }}
              className={`${iconBtn} absolute top-14 left-14 h-11 w-11`}
            >
              <Wind className="h-5 w-5 text-cyan-300" />
            </button>

            {/* Bottom-left: Kick */}
            <button
              type="button"
              aria-label="Kick"
              title="Kick"
              onClick={(e) => {
                e.stopPropagation();
                setInput({ kick: true });
              }}
              className={`${iconBtn} absolute bottom-0 left-0 h-12 w-12 border-orange-400/60`}
            >
              <Footprints className="h-5 w-5 text-orange-300" />
            </button>

            {/* Bottom-middle: Contextual Interact / Enter Vehicle / Cricket Bat */}
            <button
              type="button"
              aria-label={
                cricketActive
                  ? 'Swing Bat'
                  : activePrompt?.kind === 'vehicle'
                    ? 'Drive Vehicle'
                    : 'Interact'
              }
              title={activePrompt?.label ?? 'Interact'}
              onClick={(e) => {
                e.stopPropagation();
                if (activePrompt?.kind === 'vehicle') {
                  setInput({ vehicleToggle: true });
                } else {
                  setInput({ interact: true });
                }
              }}
              className={`${iconBtn} absolute bottom-0 left-14 h-12 w-12 ${
                activePrompt || cricketActive
                  ? 'border-amber-300 bg-amber-500 text-slate-950'
                  : 'border-white/25 text-slate-300'
              }`}
            >
              {cricketActive ? (
                <BatIcon className="h-5 w-5" />
              ) : activePrompt?.kind === 'vehicle' ? (
                <Car className="h-5 w-5" />
              ) : (
                <Hand className="h-5 w-5" />
              )}
            </button>

            {/* Bottom-right Primary Action: Punch / Bat */}
            <button
              type="button"
              aria-label="Punch"
              title="Punch"
              onClick={(e) => {
                e.stopPropagation();
                if (cricketActive) {
                  setInput({ interact: true });
                } else {
                  setInput({ punch: true });
                }
              }}
              className={`${iconBtn} absolute bottom-0 right-0 h-16 w-16 border-amber-400/85 bg-gradient-to-b from-amber-500/90 to-orange-600/90 text-white`}
            >
              {cricketActive ? (
                <BatIcon className="h-7 w-7" />
              ) : (
                <FistIcon className="h-7 w-7" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
