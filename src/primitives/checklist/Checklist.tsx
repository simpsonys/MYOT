import { useState } from 'react';
import type { PrimitiveProps } from '../../types';

export interface ChecklistItem {
  label: string;
  sublabel?: string;
  done?: boolean;
}

export interface ChecklistProps {
  items: ChecklistItem[];
  title?: string;
  onCompleteEvent?: string;
}

export default function ChecklistPrimitive({ props, theme, emit, widgetId }: PrimitiveProps<ChecklistProps>) {
  const [checked, setChecked] = useState<boolean[]>(
    () => (props.items ?? []).map((i) => i.done ?? false),
  );

  const items = props.items ?? [];
  const doneCount = checked.filter(Boolean).length;
  const allDone = doneCount === items.length && items.length > 0;
  const accent = theme.accentColor;
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';

  function toggle(idx: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      const newDone = next.filter(Boolean).length;
      if (newDone === items.length && props.onCompleteEvent) {
        emit({ type: props.onCompleteEvent, payload: { widgetId } });
      }
      return next;
    });
  }

  return (
    <div
      className="w-full h-full flex flex-col gap-1.5 rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        {props.title && (
          <span className="text-[10px] opacity-50 uppercase tracking-wider">{props.title}</span>
        )}
        <span
          className="text-[10px] font-semibold tabular-nums"
          style={{ color: allDone ? '#4ade80' : accent }}
        >
          {doneCount} / {items.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: items.length > 0 ? `${(doneCount / items.length) * 100}%` : '0%',
            background: allDone ? '#4ade80' : accent,
          }}
        />
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1 flex-1 overflow-hidden">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 active:scale-[0.98]"
            style={{ opacity: checked[i] ? 0.45 : 1 }}
          >
            {/* Checkbox */}
            <div
              className="w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-all"
              style={{
                borderColor: checked[i] ? accent : 'rgba(255,255,255,0.3)',
                background: checked[i] ? accent : 'transparent',
              }}
            >
              {checked[i] && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline points="2,5 4,7.5 8,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Label */}
            <div className="flex flex-col min-w-0">
              <span
                className="text-[12px] font-medium truncate"
                style={{ textDecoration: checked[i] ? 'line-through' : 'none' }}
              >
                {item.label}
              </span>
              {item.sublabel && (
                <span className="text-[10px] opacity-40 truncate">{item.sublabel}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
