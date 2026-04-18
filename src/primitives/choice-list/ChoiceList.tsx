import type { PrimitiveProps } from '../../types';

export interface ChoiceListItem {
  title: string;
  subtitle?: string;
  badge?: string; // e.g. "+120 kcal", "30분"
  caution?: string;
  rank?: 1 | 2 | 3; // medal emoji
}

export interface ChoiceListProps {
  items: ChoiceListItem[];
  /** Event type to emit when user taps an item, payload = { index, item } */
  onPickEvent?: string;
}

const RANK_EMOJI: Record<1 | 2 | 3, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function ChoiceListPrimitive({
  props,
  widgetId,
  emit,
  theme,
}: PrimitiveProps<ChoiceListProps>) {
  const items = props.items ?? [];
  return (
    <div className="w-full h-full flex flex-col gap-1.5 overflow-y-auto">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() =>
            props.onPickEvent &&
            emit({
              type: props.onPickEvent,
              payload: { index: i, item, widgetId },
            })
          }
          className="text-left rounded-lg px-3 py-2 text-xs border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition"
          style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A' }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold truncate">
              {item.rank && `${RANK_EMOJI[item.rank]} `}
              {item.title}
            </span>
            {item.badge && (
              <span
                className="text-[10px] opacity-80 whitespace-nowrap"
                style={{ color: theme.accentColor }}
              >
                {item.badge}
              </span>
            )}
          </div>
          {item.subtitle && (
            <div className="text-[11px] opacity-75 mt-0.5">{item.subtitle}</div>
          )}
          {item.caution && (
            <div className="text-[10px] mt-1 text-amber-300">
              ⚠ {item.caution}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
