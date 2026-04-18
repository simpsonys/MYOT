import type { PrimitiveProps } from '../../types';

export interface MapCardProps {
  /** Descriptive caption for the map (e.g. "오늘의 러닝 경로") */
  caption?: string;
  /** Lat/lng center point — we don't render a real map (MVP mocks it) */
  center?: { lat: number; lng: number };
  /** Zoom level for semantic context only */
  zoom?: number;
  /** Seed for mock map visualization (ensures deterministic look) */
  seed?: string;
  /** Total path distance in km */
  distanceKm?: number;
}

/** MVP: render a stylized mock "map" — picsum terrain image as backdrop
 *  with a synthesized path overlay. A real map integration would drop in
 *  Mapbox/Google Maps here, but the AI doesn't need to know that. */
export default function MapCardPrimitive({
  props,
  theme,
}: PrimitiveProps<MapCardProps>) {
  const seed = props.seed ?? 'myot-map';
  const bgUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}-map/640/360?blur=1`;

  // Fake path as an SVG polyline — deterministic based on seed
  const points = makeFakePath(seed);

  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-xl"
      style={{
        background: `linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,97,255,0.1)), url(${bgUrl}) center/cover`,
      }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={theme.accentColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.8))' }}
        />
        <circle cx={points.split(' ')[0].split(',')[0]} cy={points.split(' ')[0].split(',')[1]} r="1.5" fill="#fff" />
      </svg>

      <div className="absolute inset-x-2 bottom-2 flex items-end justify-between">
        {props.caption && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-black/50 text-white">
            📍 {props.caption}
          </span>
        )}
        {props.distanceKm != null && (
          <span
            className="text-[10px] font-mono px-2 py-1 rounded-full bg-black/50"
            style={{ color: theme.accentColor }}
          >
            {props.distanceKm}km
          </span>
        )}
      </div>
    </div>
  );
}

function makeFakePath(seed: string): string {
  // deterministic jitter from seed
  const rng = (i: number) => {
    let h = 0;
    for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k) + i * 7) & 0xffff;
    return (h % 100) / 100;
  };
  const pts: string[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 90 + 5;
    const y = 30 + Math.sin(i * 0.8) * 15 + (rng(i) - 0.5) * 8;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}
