import type { PrimitiveProps } from '../../types';

export interface ProgressRingProps {
  /** 0-1 fill ratio */
  value: number;
  /** Text shown inside the ring */
  centerText?: string;
  /** Small label below the number */
  label?: string;
  /** Optional override for the progress color */
  color?: string;
}

export default function ProgressRingPrimitive({
  props,
  theme,
}: PrimitiveProps<ProgressRingProps>) {
  const v = Math.max(0, Math.min(1, props.value ?? 0));
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = c * v;
  const color = props.color ?? theme.accentColor;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
      <div className="relative">
        <svg width={96} height={96} viewBox="0 0 96 96">
          <circle
            cx={48}
            cy={48}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={8}
          />
          <circle
            cx={48}
            cy={48}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 48 48)"
            style={{ transition: 'stroke-dasharray 500ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color }}
          >
            {props.centerText ?? `${Math.round(v * 100)}%`}
          </span>
        </div>
      </div>
      {props.label && (
        <div className="text-[10px] opacity-60 uppercase tracking-widest">
          {props.label}
        </div>
      )}
    </div>
  );
}
