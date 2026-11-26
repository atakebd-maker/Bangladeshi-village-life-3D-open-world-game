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
    const scale = 0.62; // 1 meter -> 0.62 px

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#182818';
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
    ctx.fillStyle = '#a18058';
    ctx.fillRect(Math.max(0, rx), ewY - 2, hx - Math.max(0, rx), 4);
    ctx.fillRect(nsX - 2, 0, 4, h);

    // Markers
    for (const m of markers) {
      const [mx, my] = toMap(m.x, m.z);
      if (mx < 2 || mx > w - 2 || my < 2 || my > h - 2) continue;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(mx, my, m.kind === 'mission' ? 4 : 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player Arrow at center
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(-playerHeading + Math.PI);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4.5, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-4.5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [playerX, playerZ, playerHeading, markers]);

  return (
    <canvas
      ref={canvasRef}
      width={112}
      height={112}
      className="h-[96px] w-[96px] sm:h-[112px] sm:w-[112px] rounded-xl border-2 border-slate-700 bg-slate-900 shadow-lg"
    />
  );
};
