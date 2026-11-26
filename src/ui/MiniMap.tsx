import React, { useEffect, useRef } from 'react';
import { MiniMapMarker } from '../types/game';

interface MiniMapProps {
  playerX: number;
  playerZ: number;
  playerHeading: number;
  markers: MiniMapMarker[];
}

export const MiniMap: React.FC<MiniMapProps> = ({
  playerX,
  playerZ,
  playerHeading,
  markers,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const w = c.width;
    const h = c.height;
    const half = w / 2;
    const scale = 0.62;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.arc(half, half, half - 1, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = 'rgba(20, 34, 20, 0.92)';
    ctx.fillRect(0, 0, w, h);

    const toMap = (wx: number, wz: number): [number, number] => [
      half + (wx - playerX) * scale,
      half + (wz - playerZ) * scale,
    ];

    // Padma River on West
    const [rx] = toMap(-72, 0);
    if (rx > 0) {
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(0, 0, rx, h);
    }

    // Irrigation Canal (z = -38)
    const [, cy] = toMap(0, -38);
    ctx.fillStyle = '#0e7490';
    ctx.fillRect(Math.max(0, rx), cy - 3, w, 6);

    // Village Pond (-26, 22)
    const [px, py] = toMap(-26, 22);
    ctx.fillStyle = '#0e7490';
    ctx.beginPath();
    ctx.arc(px, py, 14 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Paved Highway (x = 68)
    const [hx] = toMap(68, 0);
    ctx.fillStyle = '#475569';
    ctx.fillRect(hx - 3, 0, 6, h);

    // Village Dirt Roads
    const [, ewY] = toMap(0, 6);
    const [nsX] = toMap(12, 0);
    ctx.fillStyle = '#b48f60';
    ctx.fillRect(Math.max(0, rx), ewY - 2, hx - Math.max(0, rx), 4);
    ctx.fillRect(nsX - 2, 0, 4, h);

    // Subtle radar ring
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(half, half, half * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    // Markers
    for (const m of markers) {
      const [mx, my] = toMap(m.x, m.z);
      if (Math.hypot(mx - half, my - half) > half - 5) continue;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(mx, my, m.kind === 'mission' ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
      if (m.kind === 'mission') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Player Arrow at center
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(-playerHeading + Math.PI);
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -6.5);
    ctx.lineTo(4.8, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-4.8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }, [playerX, playerZ, playerHeading, markers]);

  return (
    <div className="relative h-[86px] w-[86px] sm:h-[104px] sm:w-[104px] select-none">
      <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-sm bg-black/80 px-1.5 py-[1px] text-[9px] font-black leading-none text-white border border-white/50">
        N
      </div>
      <canvas
        ref={canvasRef}
        width={104}
        height={104}
        className="h-full w-full rounded-full border-2 border-white/80 bg-black/40 shadow-[0_2px_12px_rgba(0,0,0,0.65)]"
      />
    </div>
  );
};
