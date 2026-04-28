/**
 * Client-side image collage builder using the browser Canvas API.
 *
 * Takes a list of image URLs (TMDB backdrop/poster), arranges them in a
 * mosaic layout, and exports both a JPEG data-URL and a colour palette
 * extracted from the composite.
 */

const CW = 960;  // canvas width
const CH = 540;  // canvas height  (16:9)
const GAP = 3;   // pixel gap between panels

export interface CollageResult {
  url: string;      // JPEG data URL
  palette: string[]; // 5 hex colours sampled from the composite
}

// ── Image loading ─────────────────────────────────────────────────────

function loadImage(src: string, timeoutMs = 6000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const t = setTimeout(() => resolve(null), timeoutMs);
    img.onload = () => { clearTimeout(t); resolve(img); };
    img.onerror = () => { clearTimeout(t); resolve(null); };
    img.src = src;
  });
}

// ── Drawing helper — object-fit: cover for a rect ────────────────────

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
}

// ── Collage layouts ───────────────────────────────────────────────────

type Rect = [number, number, number, number]; // x, y, w, h

function layout(count: number): Rect[] {
  const W = CW, H = CH, g = GAP;
  switch (count) {
    case 1:
      return [[0, 0, W, H]];
    case 2:
      return [[0, 0, W * 0.6 - g / 2, H], [W * 0.6 + g / 2, 0, W * 0.4 - g / 2, H]];
    case 3:
      return [
        [0, 0, W * 0.58, H],
        [W * 0.58 + g, 0, W * 0.42 - g, H / 2 - g / 2],
        [W * 0.58 + g, H / 2 + g / 2, W * 0.42 - g, H / 2 - g / 2],
      ];
    case 4:
      return [
        [0, 0, W * 0.58, H * 0.55],
        [0, H * 0.55 + g, W * 0.58, H * 0.45 - g],
        [W * 0.58 + g, 0, W * 0.42 - g, H / 2 - g / 2],
        [W * 0.58 + g, H / 2 + g / 2, W * 0.42 - g, H / 2 - g / 2],
      ];
    default: {
      // 5+: big left + right column of up to 4
      const right = Math.min(count - 1, 4);
      const cellH = (H - (right - 1) * g) / right;
      const rects: Rect[] = [[0, 0, W * 0.58, H]];
      for (let i = 0; i < right; i++) {
        rects.push([W * 0.58 + g, i * (cellH + g), W * 0.42 - g, cellH]);
      }
      return rects;
    }
  }
}

// ── Colour palette extraction ─────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function boostVibrance(r: number, g: number, b: number): [number, number, number] {
  const avg = (r + g + b) / 3;
  const factor = 1.35;
  return [
    Math.min(255, Math.max(0, Math.round(avg + (r - avg) * factor))),
    Math.min(255, Math.max(0, Math.round(avg + (g - avg) * factor))),
    Math.min(255, Math.max(0, Math.round(avg + (b - avg) * factor))),
  ];
}

function extractPalette(ctx: CanvasRenderingContext2D, count = 5): string[] {
  // Sample from 5 distinct zones of the canvas
  const zones: [number, number][] = [
    [CW * 0.15, CH * 0.25],  // top-left area
    [CW * 0.75, CH * 0.2],   // top-right area
    [CW * 0.3,  CH * 0.7],   // bottom-left area
    [CW * 0.8,  CH * 0.65],  // bottom-right area
    [CW * 0.5,  CH * 0.5],   // center
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const [sx, sy] = zones[i % zones.length];
    // Average a 20×20 block to reduce noise
    const d = ctx.getImageData(Math.round(sx - 10), Math.round(sy - 10), 20, 20).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let j = 0; j < d.length; j += 4) {
      const br = (d[j] + d[j + 1] + d[j + 2]) / 3;
      if (br > 20 && br < 240) { r += d[j]; g += d[j + 1]; b += d[j + 2]; n++; }
    }
    if (n === 0) { colors.push('#00D4FF'); continue; }
    const [vr, vg, vb] = boostVibrance(
      Math.round(r / n),
      Math.round(g / n),
      Math.round(b / n),
    );
    colors.push(rgbToHex(vr, vg, vb));
  }
  return colors;
}

// ── Public API ────────────────────────────────────────────────────────

export async function buildCollage(imageUrls: string[]): Promise<CollageResult> {
  const canvas = document.createElement('canvas');
  canvas.width = CW;
  canvas.height = CH;
  const ctx = canvas.getContext('2d')!;

  // Dark fallback background
  ctx.fillStyle = '#0A0E1A';
  ctx.fillRect(0, 0, CW, CH);

  if (imageUrls.length === 0) {
    return { url: canvas.toDataURL('image/jpeg', 0.82), palette: ['#00D4FF'] };
  }

  // Load images (parallel, with timeout)
  const loaded = (await Promise.all(imageUrls.map(loadImage))).filter(
    (img): img is HTMLImageElement => img !== null,
  );

  if (loaded.length === 0) {
    return { url: canvas.toDataURL('image/jpeg', 0.82), palette: ['#00D4FF'] };
  }

  const rects = layout(loaded.length);
  loaded.forEach((img, i) => {
    if (!rects[i]) return;
    const [x, y, w, h] = rects[i];
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    coverDraw(ctx, img, x, y, w, h);
    ctx.restore();
  });

  // Subtle dark vignette so text/widgets remain readable
  const vignette = ctx.createRadialGradient(CW / 2, CH / 2, CH * 0.25, CW / 2, CH / 2, CW * 0.75);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CW, CH);

  const palette = extractPalette(ctx);
  return { url: canvas.toDataURL('image/jpeg', 0.82), palette };
}
