import type { PrimitiveProps } from '../../types';

export interface GaugeBarProps {
  value: number; // 0..1
  label?: string;
  valueLabel?: string;
  color?: string;
  segments?: string[]; // e.g. ["낮음", "보통", "높음"]
}

export default function GaugeBarPrimitive({
  props,
  theme,
}: PrimitiveProps<GaugeBarProps>) {
  const value = Math.min(1, Math.max(0, props.value ?? 0));
  const pct = Math.round(value * 100);
  const fillColor = props.color ?? theme.accentColor;
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const segments = props.segments;

  return (
    <div
      className="w-full h-full flex flex-col justify-center gap-2 rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between text-[11px]">
        {props.label && (
          <span className="opacity-60 uppercase tracking-wide font-medium">{props.label}</span>
        )}
        <span className="font-bold tabular-nums" style={{ color: fillColor }}>
          {props.valueLabel ?? `${pct}%`}
        </span>
      </div>

      {/* Bar track */}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height: 10, background: 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${fillColor}99, ${fillColor})`,
          }}
        />
        {/* Glow tip */}
        {pct > 2 && (
          <div
            className="absolute top-0 h-full w-3 rounded-full"
            style={{
              left: `calc(${pct}% - 6px)`,
              background: fillColor,
              filter: `blur(4px)`,
              opacity: 0.7,
            }}
          />
        )}
      </div>

      {/* Segment labels */}
      {segments && segments.length > 1 && (
        <div className="flex justify-between text-[10px] opacity-40">
          {segments.map((seg, i) => (
            <span key={i}>{seg}</span>
          ))}
        </div>
      )}
    </div>
  );
}
