import type { PrimitiveProps } from '../../types';

export interface StatTileProps {
  value: string | number;
  unit?: string;
  label: string;
  accent?: boolean;
}

export default function StatTilePrimitive({
  props,
  theme,
}: PrimitiveProps<StatTileProps>) {
  return (
    <div
      className="w-full h-full flex flex-col justify-center rounded-xl px-3 py-2"
      style={{
        background: 'rgba(255,255,255,0.05)',
        color: theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A',
      }}
    >
      <div className="text-[10px] opacity-60 uppercase tracking-wider">
        {props.label}
      </div>
      <div className="flex items-baseline gap-0.5 mt-0.5">
        <span
          className="text-2xl font-bold tabular-nums leading-tight"
          style={{ color: props.accent ? theme.accentColor : undefined }}
        >
          {props.value}
        </span>
        {props.unit && <span className="text-xs opacity-60">{props.unit}</span>}
      </div>
    </div>
  );
}
