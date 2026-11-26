import * as THREE from 'three';

export interface TextureLibrary {
  corrugatedTin: THREE.CanvasTexture;
  corrugatedTinGreen: THREE.CanvasTexture;
  corrugatedTinRed: THREE.CanvasTexture;
  bambooWeave: THREE.CanvasTexture;
  mudPlaster: THREE.CanvasTexture;
  redBrick: THREE.CanvasTexture;
  dirtRoad: THREE.CanvasTexture;
  asphaltRoad: THREE.CanvasTexture;
  grassGround: THREE.CanvasTexture;
  paddyField: THREE.CanvasTexture;
  lungiCheck: THREE.CanvasTexture;
  lungiBlue: THREE.CanvasTexture;
  sareePattern: THREE.CanvasTexture;
  woodPlank: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  createSignTexture: (bnTitle: string, enSub: string, bgHex?: string, fgHex?: string) => THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

function configureColorTex(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  maxAnisotropy = 8
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function seededNoise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

export function createProceduralTextureLibrary(maxAnisotropy: number): TextureLibrary {
  const created: THREE.CanvasTexture[] = [];
  const track = (t: THREE.CanvasTexture) => {
    created.push(t);
    return t;
  };

  // 1. Corrugated Tin Roof (Galvanized Zinc + Painted Variants)
  const makeTin = (baseHex: [number, number, number], rustAmount: number) => {
    const [c, ctx] = makeCanvas(256, 256);
    for (let x = 0; x < 256; x++) {
      const wave = Math.sin((x / 256) * Math.PI * 2 * 16);
      const shade = 0.8 + wave * 0.18;
      for (let y = 0; y < 256; y += 2) {
        const n = seededNoise(x, y);
        const isRust = n < rustAmount && (y % 64 < 12 || n < rustAmount * 0.45);
        const r = isRust ? 128 + n * 40 : Math.min(255, baseHex[0] * shade + (n - 0.5) * 14);
        const g = isRust ? 68 + n * 25 : Math.min(255, baseHex[1] * shade + (n - 0.5) * 14);
        const b = isRust ? 42 + n * 20 : Math.min(255, baseHex[2] * shade + (n - 0.5) * 14);
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.fillRect(x, y, 1, 2);
      }
    }
    // Horizontal overlap seam
    ctx.fillStyle = 'rgba(20, 20, 20, 0.25)';
    ctx.fillRect(0, 126, 256, 4);
    return track(configureColorTex(c, 2, 2, maxAnisotropy));
  };

  const corrugatedTin = makeTin([182, 190, 196], 0.08);
  const corrugatedTinGreen = makeTin([46, 118, 78], 0.04);
  const corrugatedTinRed = makeTin([156, 54, 46], 0.05);

  // 2. Woven Bamboo Mat (Bera)
  const [bamC, bamCtx] = makeCanvas(256, 256);
  bamCtx.fillStyle = '#9e7b47';
  bamCtx.fillRect(0, 0, 256, 256);
  const strip = 16;
  for (let y = 0; y < 256; y += strip) {
    for (let x = 0; x < 256; x += strip) {
      const parity = ((x / strip + y / strip) | 0) % 2 === 0;
      const n = seededNoise(x, y) * 22;
      bamCtx.fillStyle = parity
        ? `rgb(${182 + n},${144 + n * 0.8},${86 + n * 0.5})`
        : `rgb(${146 + n},${112 + n * 0.7},${64 + n * 0.4})`;
      bamCtx.fillRect(x + 1, y + 1, strip - 2, strip - 2);
      bamCtx.fillStyle = 'rgba(45,30,10,0.28)';
      bamCtx.fillRect(x, y, strip, 1);
      bamCtx.fillRect(x, y, 1, strip);
    }
  }
  const bambooWeave = track(configureColorTex(bamC, 2, 2, maxAnisotropy));

  // 3. Earthen Mud Plaster (Mati)
  const [mudC, mudCtx] = makeCanvas(256, 256);
  mudCtx.fillStyle = '#a8845e';
  mudCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4200; i++) {
    const x = seededNoise(i, 1) * 256;
    const y = seededNoise(i, 2) * 256;
    const v = seededNoise(i, 3);
    mudCtx.fillStyle = v > 0.5 ? 'rgba(210,180,140,0.16)' : 'rgba(92,66,42,0.18)';
    mudCtx.fillRect(x, y, 3 + v * 5, 2 + v * 3);
  }
  const mudPlaster = track(configureColorTex(mudC, 2, 2, maxAnisotropy));

  // 4. Red Brick Wall
  const [brkC, brkCtx] = makeCanvas(256, 256);
  brkCtx.fillStyle = '#c5bfb5'; // mortar
  brkCtx.fillRect(0, 0, 256, 256);
  const bh = 24;
  const bw = 56;
  for (let row = 0; row < 12; row++) {
    const offset = (row % 2) * (bw / 2);
    for (let col = -1; col < 6; col++) {
      const n = seededNoise(col + row * 7, row);
      const r = 158 + ((n * 35) | 0);
      const g = 66 + ((n * 22) | 0);
      const b = 48 + ((n * 18) | 0);
      brkCtx.fillStyle = `rgb(${r},${g},${b})`;
      brkCtx.fillRect(col * bw + offset + 2, row * bh + 2, bw - 4, bh - 4);
    }
  }
  const redBrick = track(configureColorTex(brkC, 2, 2, maxAnisotropy));

  // 5. Village Kacha Dirt Road
  const [drtC, drtCtx] = makeCanvas(256, 256);
  drtCtx.fillStyle = '#9c7d56';
  drtCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5500; i++) {
    const x = seededNoise(i, 11) * 256;
    const y = seededNoise(i, 12) * 256;
    const v = seededNoise(i, 13);
    drtCtx.fillStyle = v > 0.55 ? 'rgba(186,154,110,0.22)' : 'rgba(90,68,45,0.2)';
    drtCtx.fillRect(x, y, 2 + v * 4, 2 + v * 4);
  }
  // Subtle wheel tracks
  drtCtx.fillStyle = 'rgba(72, 54, 34, 0.22)';
  drtCtx.fillRect(46, 0, 34, 256);
  drtCtx.fillRect(176, 0, 34, 256);
  const dirtRoad = track(configureColorTex(drtC, 1, 14, maxAnisotropy));

  // 6. Paved Asphalt Highway
  const [aspC, aspCtx] = makeCanvas(256, 256);
  aspCtx.fillStyle = '#3c4148';
  aspCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4500; i++) {
    const x = seededNoise(i, 21) * 256;
    const y = seededNoise(i, 22) * 256;
    const v = seededNoise(i, 23);
    aspCtx.fillStyle = v > 0.5 ? 'rgba(95,102,110,0.22)' : 'rgba(25,28,32,0.25)';
    aspCtx.fillRect(x, y, 2, 2);
  }
  // Dashed center line
  aspCtx.fillStyle = '#eab308';
  aspCtx.fillRect(123, 18, 10, 92);
  aspCtx.fillRect(123, 146, 10, 92);
  // White shoulder stripes
  aspCtx.fillStyle = 'rgba(235,240,245,0.65)';
  aspCtx.fillRect(10, 0, 6, 256);
  aspCtx.fillRect(240, 0, 6, 256);
  const asphaltRoad = track(configureColorTex(aspC, 1, 16, maxAnisotropy));

  // 7. Natural Lush Village Grass Ground
  const [grsC, grsCtx] = makeCanvas(512, 512);
  grsCtx.fillStyle = '#4f7a38';
  grsCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 16000; i++) {
    const x = seededNoise(i, 31) * 512;
    const y = seededNoise(i, 32) * 512;
    const v = seededNoise(i, 33);
    if (v > 0.72) {
      grsCtx.fillStyle = 'rgba(116, 158, 68, 0.28)';
    } else if (v > 0.35) {
      grsCtx.fillStyle = 'rgba(60, 102, 42, 0.25)';
    } else {
      grsCtx.fillStyle = 'rgba(98, 86, 54, 0.16)';
    }
    grsCtx.fillRect(x, y, 3 + v * 4, 2 + v * 5);
  }
  const grassGround = track(configureColorTex(grsC, 28, 28, maxAnisotropy));

  // 8. Paddy Field Soil & Water Rows
  const [padC, padCtx] = makeCanvas(256, 256);
  padCtx.fillStyle = '#3f5f2f';
  padCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    padCtx.fillStyle = 'rgba(72, 114, 48, 0.42)';
    padCtx.fillRect(0, y, 256, 8);
    padCtx.fillStyle = 'rgba(34, 52, 40, 0.35)';
    padCtx.fillRect(0, y + 10, 256, 4);
  }
  const paddyField = track(configureColorTex(padC, 4, 4, maxAnisotropy));

  // 9. Lungi Plaid Patterns
  const makeLungi = (bg: string, stripeA: string, stripeB: string) => {
    const [c, ctx] = makeCanvas(128, 128);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 128; i += 16) {
      ctx.fillStyle = stripeA;
      ctx.fillRect(i, 0, 4, 128);
      ctx.fillRect(0, i, 128, 4);
      ctx.fillStyle = stripeB;
      ctx.fillRect(i + 8, 0, 2, 128);
      ctx.fillRect(0, i + 8, 128, 2);
    }
    return track(configureColorTex(c, 2, 2, maxAnisotropy));
  };
  const lungiCheck = makeLungi('#8b1e24', 'rgba(245, 224, 175, 0.42)', 'rgba(24, 48, 86, 0.55)');
  const lungiBlue = makeLungi('#1d4473', 'rgba(232, 240, 248, 0.38)', 'rgba(20, 24, 32, 0.45)');

  // 10. Traditional Saree Fabric + Woven Gold Border
  const [sarC, sarCtx] = makeCanvas(128, 128);
  sarCtx.fillStyle = '#b91c1c';
  sarCtx.fillRect(0, 0, 128, 128);
  sarCtx.fillStyle = '#f59e0b';
  sarCtx.fillRect(0, 102, 128, 22);
  sarCtx.fillStyle = '#fef3c7';
  for (let x = 4; x < 128; x += 12) {
    sarCtx.fillRect(x, 106, 5, 5);
    sarCtx.fillRect(x + 3, 114, 4, 4);
  }
  const sareePattern = track(configureColorTex(sarC, 1, 1, maxAnisotropy));

  // 11. Boat / Bench Wood Plank
  const [wdC, wdCtx] = makeCanvas(256, 256);
  wdCtx.fillStyle = '#7c4d2b';
  wdCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    const shade = seededNoise(y, 44) * 20 - 10;
    wdCtx.fillStyle = `rgb(${124 + shade},${77 + shade * 0.7},${43 + shade * 0.4})`;
    wdCtx.fillRect(0, y + 1, 256, 30);
    wdCtx.fillStyle = 'rgba(30,15,5,0.45)';
    wdCtx.fillRect(0, y, 256, 2);
  }
  const woodPlank = track(configureColorTex(wdC, 1, 1, maxAnisotropy));

  // 12. Soft Radial Contact Shadow
  const [shC, shCtx] = makeCanvas(128, 128);
  const grad = shCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  shCtx.fillStyle = grad;
  shCtx.fillRect(0, 0, 128, 128);
  const contactShadow = track(new THREE.CanvasTexture(shC));
  contactShadow.colorSpace = THREE.SRGBColorSpace;

  const createSignTexture = (
    bnTitle: string,
    enSub: string,
    bgHex = '#14532d',
    fgHex = '#fef9c3'
  ) => {
    const [c, ctx] = makeCanvas(512, 160);
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 160);
    ctx.strokeStyle = fgHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 144);
    ctx.fillStyle = fgHex;
    ctx.textAlign = 'center';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(bnTitle, 256, 74);
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(enSub, 256, 122);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    created.push(tex);
    return tex;
  };

  return {
    corrugatedTin,
    corrugatedTinGreen,
    corrugatedTinRed,
    bambooWeave,
    mudPlaster,
    redBrick,
    dirtRoad,
    asphaltRoad,
    grassGround,
    paddyField,
    lungiCheck,
    lungiBlue,
    sareePattern,
    woodPlank,
    contactShadow,
    createSignTexture,
    dispose: () => {
      created.forEach((t) => t.dispose());
    },
  };
}
