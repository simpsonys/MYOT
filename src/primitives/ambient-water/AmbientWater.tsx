import { useEffect, useRef } from 'react';
import type { PrimitiveProps } from '../../types';

export interface AmbientWaterProps {
  scene?: 'wave' | 'ripple' | 'rain';
  palette?: 'ocean' | 'teal' | 'night';
  label?: string;
}

interface Ripple {
  x: number; y: number;
  r: number; maxR: number;
  life: number; maxLife: number;
}

const BG: Record<string, string> = {
  ocean: 'linear-gradient(to bottom, #001e38 0%, #000b18 100%)',
  teal:  'linear-gradient(to bottom, #001e1e 0%, #000b0b 100%)',
  night: 'linear-gradient(to bottom, #080015 0%, #020008 100%)',
};

const WAVE_FILLS: Record<string, string[]> = {
  ocean: ['rgba(25,110,200,0.45)', 'rgba(15,80,165,0.38)', 'rgba(8,55,130,0.32)'],
  teal:  ['rgba(0,160,145,0.45)', 'rgba(0,125,110,0.38)', 'rgba(0,90,78,0.32)'],
  night: ['rgba(65,25,190,0.40)', 'rgba(45,12,155,0.33)', 'rgba(25,6,110,0.27)'],
};

const RIPPLE_COLOR: Record<string, string> = {
  ocean: '100,190,255',
  teal:  '80,220,200',
  night: '150,100,255',
};

export default function AmbientWaterPrimitive({ props }: PrimitiveProps<AmbientWaterProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const tRef = useRef(0);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let nextRipple = 0;

    function spawnRipple(w: number, h: number, yMin: number, yMax: number) {
      ripplesRef.current.push({
        x: w * (0.1 + Math.random() * 0.8),
        y: h * (yMin + Math.random() * (yMax - yMin)),
        r: 0,
        maxR: 50 + Math.random() * 70,
        life: 0,
        maxLife: 90 + Math.random() * 60,
      });
    }

    function drawWaves(w: number, h: number, t: number, palette: string) {
      const fills = WAVE_FILLS[palette];
      const layers = [
        { amp: h * 0.055, freq: 0.007, spd: 0.35, yBase: h * 0.48, fill: fills[0] },
        { amp: h * 0.045, freq: 0.010, spd: 0.55, yBase: h * 0.54, fill: fills[1] },
        { amp: h * 0.035, freq: 0.013, spd: 0.80, yBase: h * 0.60, fill: fills[2] },
      ];

      for (const l of layers) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const y = l.yBase
            + Math.sin(x * l.freq + t * l.spd) * l.amp
            + Math.sin(x * l.freq * 1.7 + t * l.spd * 1.4 + 2.1) * l.amp * 0.45;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = l.fill;
        ctx.fill();
      }
    }

    function drawRipples(rippleColor: string) {
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.life++;
        rp.r = (rp.life / rp.maxLife) * rp.maxR;
        if (rp.life >= rp.maxLife) { ripples.splice(i, 1); continue; }

        const alpha = Math.pow(1 - rp.life / rp.maxLife, 2) * 0.55;
        // Elliptical ripple (perspective distortion)
        const ry = rp.r * 0.32;

        ctx.save();
        ctx.strokeStyle = `rgba(${rippleColor},${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rp.r, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (rp.r > 18) {
          ctx.strokeStyle = `rgba(${rippleColor},${alpha * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, rp.r * 0.55, ry * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    function drawRain(w: number, h: number, t: number) {
      ctx.save();
      ctx.strokeStyle = 'rgba(200,225,255,0.13)';
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 45; i++) {
        const spd = 5 + (i * 73 % 5);
        const startX = (i * 139 + 17) % w;
        const y = (t * spd + i * 220) % (h + 60) - 30;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX - 1, y + 11);
        ctx.stroke();
      }
      ctx.restore();
    }

    function tick() {
      tRef.current++;
      const t = tRef.current;
      const p = propsRef.current;
      const scene = p.scene ?? 'wave';
      const palette = p.palette ?? 'ocean';
      const rc = RIPPLE_COLOR[palette];

      const w = canvas!.width;
      const h = canvas!.height;
      ctx.clearRect(0, 0, w, h);

      if (scene === 'wave') {
        drawWaves(w, h, t, palette);
        if (t >= nextRipple) {
          spawnRipple(w, h, 0.45, 0.7);
          nextRipple = t + 150 + Math.floor(Math.random() * 180);
        }
        drawRipples(rc);

      } else if (scene === 'ripple') {
        if (t >= nextRipple) {
          spawnRipple(w, h, 0.2, 0.8);
          nextRipple = t + 80 + Math.floor(Math.random() * 100);
        }
        drawRipples(rc);

      } else if (scene === 'rain') {
        drawWaves(w, h, t, palette);
        drawRain(w, h, t);
        if (t >= nextRipple) {
          spawnRipple(w, h, 0.5, 0.85);
          nextRipple = t + 25 + Math.floor(Math.random() * 35);
        }
        drawRipples(rc);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      ripplesRef.current = [];
      tRef.current = 0;
    };
  }, []);

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden relative"
      style={{ background: BG[props.palette ?? 'ocean'] }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {props.label && (
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {props.label}
          </span>
        </div>
      )}
    </div>
  );
}
