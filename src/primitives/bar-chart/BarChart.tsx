import type { PrimitiveProps } from '../../types';

export interface BarChartItem {
  label: string;
  value: number;
  accent?: boolean;
}

export interface BarChartProps {
  items: BarChartItem[];
  title?: string;
  unit?: string;
  horizontal?: boolean;
}

export default function BarChartPrimitive({ props, theme }: PrimitiveProps<BarChartProps>) {
  const items = props.items ?? [];
  const max = Math.max(...items.map((i) => i.value), 1);
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const accent = theme.accentColor;
  const isHorizontal = props.horizontal ?? false;

  return (
    <div
      className="w-full h-full flex flex-col gap-2 rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {props.title && (
        <div className="text-[10px] opacity-50 uppercase tracking-wider">{props.title}</div>
      )}

      {isHorizontal ? (
        /* Horizontal bars */
        <div className="flex flex-col gap-2 flex-1 justify-around">
          {items.map((item, i) => {
            const pct = (item.value / max) * 100;
            const color = item.accent ? accent : `${accent}88`;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] opacity-60 w-10 shrink-0 text-right truncate">
                  {item.label}
                </span>
                <div
                  className="flex-1 rounded-full overflow-hidden"
                  style={{ height: 10, background: 'rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <span className="text-[10px] font-semibold tabular-nums w-8 shrink-0" style={{ color }}>
                  {item.value}{props.unit ?? ''}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vertical bars */
        <div className="flex items-end gap-1.5 flex-1">
          {items.map((item, i) => {
            const pct = (item.value / max) * 100;
            const color = item.accent ? accent : `${accent}88`;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0 h-full justify-end">
                <span className="text-[9px] font-semibold tabular-nums opacity-80" style={{ color }}>
                  {item.value}{props.unit ?? ''}
                </span>
                <div
                  className="w-full rounded-t-md transition-all duration-700"
                  style={{
                    height: `${pct}%`,
                    minHeight: 4,
                    background: item.accent
                      ? `linear-gradient(180deg, ${color}, ${color}99)`
                      : `rgba(255,255,255,0.15)`,
                    boxShadow: item.accent ? `0 0 8px ${color}66` : undefined,
                  }}
                />
                <span className="text-[9px] opacity-50 truncate max-w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
