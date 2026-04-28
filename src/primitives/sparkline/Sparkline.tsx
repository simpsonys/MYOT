import type { PrimitiveProps } from '../../types';

export interface SparklineProps {
  data: number[];
  label?: string;
  value?: string;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
}

function buildPath(data: number[], w: number, h: number): string {
  if (data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  return 'M' + points.join('L');
}

const TREND_ICON = { up: '↑', down: '↓', flat: '→' } as const;
const TREND_COLOR = { up: '#4ade80', down: '#f87171', flat: '#94a3b8' } as const;

export default function SparklinePrimitive({ props, theme }: PrimitiveProps<SparklineProps>) {
  const data = props.data?.length >= 2 ? props.data : [3, 5, 4, 7, 6, 8, 7, 9];
  const trend = props.trend ?? (data[data.length - 1] >= data[0] ? 'up' : 'down');
  const lineColor = TREND_COLOR[trend];
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const W = 200;
  const H = 56;
  const path = buildPath(data, W, H);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const lastY = 4 + (1 - (data[data.length - 1] - min) / (max - min || 1)) * (H - 8);

  return (
    <div
      className="w-full h-full flex flex-col justify-between rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        {props.label && (
          <span className="text-[10px] opacity-50 uppercase tracking-wider">{props.label}</span>
        )}
        <span
          className="text-[11px] font-semibold"
          style={{ color: lineColor }}
        >
          {TREND_ICON[trend]} {trend === 'up' ? '상승' : trend === 'down' ? '하락' : '보합'}
        </span>
      </div>

      {/* Current value */}
      {props.value && (
        <div className="flex items-baseline gap-0.5">
          <span className="text-xl font-bold tabular-nums" style={{ color: lineColor }}>
            {props.value}
          </span>
          {props.unit && <span className="text-[11px] opacity-50">{props.unit}</span>}
        </div>
      )}

      {/* SVG sparkline */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 48 }}
      >
        {/* Gradient fill under the line */}
        <defs>
          <linearGradient id={`spark-fill-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path}L${200 - 4},${H}L4,${H}Z`}
          fill={`url(#spark-fill-${trend})`}
        />
        <path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dot on latest value */}
        <circle
          cx={W - 4}
          cy={lastY}
          r={3}
          fill={lineColor}
          style={{ filter: `drop-shadow(0 0 4px ${lineColor})` }}
        />
      </svg>
    </div>
  );
}
