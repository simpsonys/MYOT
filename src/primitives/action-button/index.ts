import type { PrimitiveDefinition } from '../../types';
import ActionButtonPrimitive, { type ActionButtonProps } from './ActionButton';

const definition: PrimitiveDefinition<ActionButtonProps> = {
  type: 'action-button',
  name: '액션 버튼',
  description:
    'A large tappable button with icon + label. Emits an event when tapped. Use for launching apps (YouTube, Netflix), triggering workflows (call family, start workout), or committing to a choice. The emitted event lets the AI react to user interaction.',
  icon: '🔘',
  isContainer: false,

  propsSchema: {
    label: 'Button text',
    icon: 'Emoji or 1-2 chars (e.g. "📞", "▶️", "N")',
    onTapEvent: 'Event type to emit on tap',
    eventPayload: 'Extra data included in the event',
    variant: '"primary" | "ghost" | "danger" | "warm" — styling',
  },
  defaultProps: { label: 'Tap' },

  examples: [
    {
      context: 'YouTube 런처',
      blueprint: {
        primitive: 'action-button',
        props: {
          label: 'YouTube',
          icon: '▶️',
          onTapEvent: 'app.launch',
          eventPayload: { app: 'youtube' },
          variant: 'danger',
        },
      },
    },
    {
      context: '원터치 손녀 영상통화',
      blueprint: {
        primitive: 'action-button',
        props: {
          label: '손녀에게 전화',
          icon: '📞',
          onTapEvent: 'call.start',
          eventPayload: { contact: 'granddaughter' },
          variant: 'warm',
        },
      },
    },
  ],

  component: ActionButtonPrimitive,
};

export default definition;
