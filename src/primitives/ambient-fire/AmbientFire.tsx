import { useEffect, useRef } from 'react';
import type { PrimitiveProps } from '../../types';

export interface AmbientFireProps {
  intensity?: 'low' | 'medium' | 'high';
  palette?: 'warm' | 'blue' | 'purple';
  label?: string;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
}

const PALETTES: Record<string, [number, number, number][]> = {
  warm:   [[255, 252, 180], [255, 160, 30], [240, 60, 20], [110, 15, 5]],
  blue:   [[200, 240, 255], [70, 170, 245], [20, 100, 200], [5, 35, 100]],
  purple: [[245, 220, 255], [190, 100, 210], [140, 30, 170], [45, 8, 75]],
};

const BG: Record<string, string> = {
  warm:   'radial-gradient(ellipse at bottom, #1c0700 0%, #060100 100%)',
  blue:   'radial-gradient(ellipse at bottom, #001525 0%, #000508 100%)',
  purple: 'radial-gradient(ellipse at bottom, #0f0020 0%, #040008 100%)',
};

function lerp3(a: [number, number, number], b: [number, number, number], t: number): string {
  return `${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)}`;
}

export default function AmbientFirePrimitive({ props }: PrimitiveProps<AmbientFireProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
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

    function spawn(w: number, h: number, spd: number, sz: number): Particle {
      return {
        x: w / 2 + (Math.random() - 0.5) * w * 0.38,
        y: h * 0.88 + (Math.random() - 0.5) * h * 0.04,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(spd * 0.7 + Math.random() * spd),
        life: 0,
        maxLife: 55 + Math.random() * 75,
        size: sz * (0.45 + Math.random() * 0.9),
      };
    }

    function tick() {
      const p = propsRef.current;
      const pal = PALETTES[p.palette ?? 'warm'];
      const cfg =
        p.intensity === 'low'  ? { n: 38, spd: 0.8, sz: 9 } :
        p.intensity === 'high' ? { n: 130, spd: 2.0, sz: 18 } :
                                 { n: 72, spd: 1.3, sz: 13 };

      const w = canvas!.width;
      const h = canvas!.height;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const pts = particlesRef.current;
      while (pts.length < cfg.n) {
        const np = spawn(w, h, cfg.spd, cfg.sz);
        np.life = Math.random() * np.maxLife;
        pts.push(np);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const pt = pts[i];
        pt.life += 1;
        pt.x += pt.vx + Math.sin(pt.life * 0.09 + i * 0.7) * 0.28;
        pt.y += pt.vy;

        if (pt.life >= pt.maxLife || pt.y < -pt.size) {
          pts[i] = spawn(w, h, cfg.spd, cfg.sz);
          continue;
        }

        const lr = pt.life / pt.maxLife;
        const alpha = lr < 0.12
          ? lr / 0.12
          : Math.pow(1 - (lr - 0.12) / 0.88, 1.8);

        const ci = lr * (pal.length - 1);
        const lo = Math.min(Math.floor(ci), pal.length - 2);
        const rgb = lerp3(pal[lo], pal[lo + 1], ci - lo);

        const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size);
        grd.addColorStop(0,   `rgba(${rgb},${alpha})`);
        grd.addColorStop(0.5, `rgba(${rgb},${alpha * 0.3})`);
        grd.addColorStop(1,   `rgba(${rgb},0)`);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      particlesRef.current = [];
    };
  }, []);

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden relative"
      style={{ background: BG[props.palette ?? 'warm'] }}
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
