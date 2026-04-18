import type { PrimitiveProps } from '../../types';

export interface ActionButtonProps {
  label: string;
  icon?: string; // emoji or 1-2 char
  /** Event to emit on tap */
  onTapEvent?: string;
  /** Payload to include in the emitted event */
  eventPayload?: Record<string, unknown>;
  variant?: 'primary' | 'ghost' | 'danger' | 'warm';
}

export default function ActionButtonPrimitive({
  props,
  emit,
  widgetId,
  theme,
}: PrimitiveProps<ActionButtonProps>) {
  const variant = props.variant ?? 'primary';

  const bg =
    variant === 'primary'
      ? theme.accentColor
      : variant === 'danger'
      ? '#FF6B6B'
      : variant === 'warm'
      ? 'linear-gradient(135deg, #FFB86B, #FF6B6B)'
      : 'rgba(255,255,255,0.08)';
  const color =
    variant === 'primary'
      ? theme.backgroundColor
      : variant === 'ghost'
      ? theme.accentColor
      : '#FFFFFF';

  return (
    <button
      onClick={() => {
        if (props.onTapEvent) {
          emit({
            type: props.onTapEvent,
            payload: { ...props.eventPayload, widgetId },
          });
        }
      }}
      className="w-full h-full rounded-xl font-bold transition hover:brightness-110 active:scale-95 flex flex-col items-center justify-center gap-1 px-3 py-2"
      style={{ background: bg, color }}
    >
      {props.icon && <span className="text-2xl leading-none">{props.icon}</span>}
      <span className="text-sm">{props.label}</span>
    </button>
  );
}
