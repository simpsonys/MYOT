import type { PrimitiveProps } from '../../types';

export interface TimelineItem {
  time: string;
  label: string;
  done?: boolean;
  accent?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  title?: string;
  compact?: boolean;
}

export default function TimelinePrimitive({
  props,
  theme,
}: PrimitiveProps<TimelineProps>) {
  const items = props.items ?? [];
  const compact = props.compact ?? false;
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';

  return (
    <div
      className="w-full h-full flex flex-col rounded-xl px-3 py-2 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {props.title && (
        <div
          className="text-[11px] font-semibold uppercase tracking-widest opacity-60 mb-2"
          style={{ color: theme.accentColor }}
        >
          {props.title}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto gap-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const isDone = item.done ?? false;
          const isAccent = item.accent ?? false;

          return (
            <div key={i} className="flex items-stretch" style={{ minHeight: compact ? 28 : 36 }}>
              {/* Time column */}
              <div
                className="flex-shrink-0 text-right pr-2 flex items-center justify-end"
                style={{ width: 44, minWidth: 44 }}
              >
                <span
                  className="text-[10px] tabular-nums"
                  style={{
                    color: isAccent ? theme.accentColor : textColor,
                    opacity: isDone ? 0.35 : isAccent ? 1 : 0.6,
                    fontWeight: isAccent ? 700 : 400,
                  }}
                >
                  {item.time}
                </span>
              </div>

              {/* Timeline line + dot */}
              <div className="flex flex-col items-center mx-2" style={{ width: 14 }}>
                <div
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    marginTop: compact ? 10 : 14,
                    background: isDone
                      ? 'rgba(255,255,255,0.2)'
                      : isAccent
                      ? theme.accentColor
                      : `${theme.accentColor}66`,
                    boxShadow: isAccent && !isDone ? `0 0 6px ${theme.accentColor}` : undefined,
                  }}
                />
                {!isLast && (
                  <div
                    className="flex-1 w-px"
                    style={{ background: 'rgba(255,255,255,0.1)', minHeight: 4 }}
                  />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 flex items-center pb-1">
                <span
                  className="text-[12px] leading-tight"
                  style={{
                    opacity: isDone ? 0.35 : 0.9,
                    color: isAccent ? theme.accentColor : textColor,
                    fontWeight: isAccent ? 600 : 400,
                    textDecoration: isDone ? 'line-through' : undefined,
                  }}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
