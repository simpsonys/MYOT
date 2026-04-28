import type { PrimitiveProps } from '../../types';

export interface CalendarStripDay {
  label: string;
  sublabel?: string;
  active?: boolean;
  accent?: boolean;
}

export interface CalendarStripProps {
  title?: string;
  days: CalendarStripDay[];
}

export default function CalendarStripPrimitive({
  props,
  theme,
}: PrimitiveProps<CalendarStripProps>) {
  const days = props.days ?? [];

  return (
    <div
      className="w-full h-full rounded-xl px-3 py-3"
      style={{
        background: 'rgba(255,255,255,0.05)',
        color: theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A',
      }}
    >
      {props.title && (
        <div className="mb-3 text-[10px] uppercase tracking-[0.22em] opacity-60">
          {props.title}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {days.map((day, i) => {
          const isActive = Boolean(day.active);
          const isAccent = Boolean(day.accent);
          const borderColor = isActive
            ? `${theme.accentColor}55`
            : 'rgba(255,255,255,0.08)';
          const background = isActive
            ? `linear-gradient(180deg, ${theme.accentColor}22, rgba(255,255,255,0.06))`
            : 'rgba(255,255,255,0.04)';
          const labelColor = isAccent || isActive ? theme.accentColor : undefined;

          return (
            <div
              key={`${day.label}-${i}`}
              className="min-w-[76px] flex-1 rounded-xl px-3 py-2 border"
              style={{
                borderColor,
                background,
              }}
            >
              <div
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: labelColor }}
              >
                {day.label}
              </div>
              {day.sublabel && (
                <div className="mt-2 text-xs leading-snug opacity-75">
                  {day.sublabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
