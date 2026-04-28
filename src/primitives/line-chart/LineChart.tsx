import type { PrimitiveProps } from '../../types';

export interface LineChartSeries {
  label: string;
  data: number[];
  color?: string;
}

export interface LineChartProps {
  series: LineChartSeries[];
  labels?: string[];
  title?: string;
  unit?: string;
  showDots?: boolean;
}

const FALLBACK_COLORS = ['#60a5fa', '#f472b6', '#34d399', '#fb923c', '#a78bfa'];

function buildPolyline(data: number[], allMin: number, allMax: number, W: number, H: number): string {
  const range = allMax - allMin || 1;
  const padX = 8;
  const padY = 8;
  return data
    .map((v, i) => {
      const x = padX + (i / (data.length - 1)) * (W - padX * 2);
      const y = padY + (1 - (v - allMin) / range) * (H - padY * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function getPoints(data: number[], allMin: number, allMax: number, W: number, H: number) {
  const range = allMax - allMin || 1;
  const padX = 8;
  const padY = 8;
  return data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * (W - padX * 2),
    y: padY + (1 - (v - allMin) / range) * (H - padY * 2),
  }));
}

export default function LineChartPrimitive({ props, theme }: PrimitiveProps<LineChartProps>) {
  const series = props.series ?? [];
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const showDots = props.showDots ?? true;
  const W = 280;
  const H = 100;

  const allValues = series.flatMap((s) => s.data);
  const allMin = Math.min(...allValues, 0);
  const allMax = Math.max(...allValues, 1);

  const labels = props.labels ?? [];
  const maxLen = Math.max(...series.map((s) => s.data.length), 0);

  return (
    <div
      className="w-full h-full flex flex-col gap-1.5 rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {props.title && (
        <div className="text-[10px] opacity-50 uppercase tracking-wider">{props.title}</div>
      )}

      {/* Chart area */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full flex-1"
        style={{ minHeight: 60 }}
      >
        <defs>
          {series.map((s, si) => {
            const color = s.color ?? FALLBACK_COLORS[si % FALLBACK_COLORS.length];
            return (
              <linearGradient key={si} id={`line-fill-${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={8} y1={8 + t * (H - 16)}
            x2={W - 8} y2={8 + t * (H - 16)}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {series.map((s, si) => {
          if (s.data.length < 2) return null;
          const color = s.color ?? FALLBACK_COLORS[si % FALLBACK_COLORS.length];
          const polyline = buildPolyline(s.data, allMin, allMax, W, H);
          const pts = getPoints(s.data, allMin, allMax, W, H);
          const fillPath = `M${pts[0].x},${H} ` + pts.map((p) => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length - 1].x},${H} Z`;

          return (
            <g key={si}>
              <path d={fillPath} fill={`url(#line-fill-${si})`} />
              <polyline
                points={polyline}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {showDots &&
                pts.map((p, pi) => (
                  <circle key={pi} cx={p.x} cy={p.y} r={2.5} fill={color} opacity={0.85} />
                ))}
            </g>
          );
        })}
      </svg>

      {/* X-axis labels */}
      {labels.length > 0 && (
        <div className="flex justify-between px-1">
          {Array.from({ length: maxLen }).map((_, i) => (
            <span key={i} className="text-[9px] opacity-40 text-center flex-1">
              {labels[i] ?? ''}
            </span>
          ))}
        </div>
      )}

      {/* Legend */}
      {series.length > 1 && (
        <div className="flex gap-3 flex-wrap">
          {series.map((s, si) => {
            const color = s.color ?? FALLBACK_COLORS[si % FALLBACK_COLORS.length];
            return (
              <div key={si} className="flex items-center gap-1">
                <div className="w-3 h-0.5 rounded-full" style={{ background: color }} />
                <span className="text-[9px] opacity-60">{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
