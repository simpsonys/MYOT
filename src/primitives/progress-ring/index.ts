import type { PrimitiveDefinition } from '../../types';
import ProgressRingPrimitive, { type ProgressRingProps } from './ProgressRing';

const definition: PrimitiveDefinition<ProgressRingProps> = {
  type: 'progress-ring',
  name: '프로그레스 링',
  description:
    'A circular progress indicator with center text. Use for percentages, completion ratios, daily goals, battery-like metrics, countdowns. Works well in small grid cells (2x2 or 3x3).',
  icon: '⭕',
  isContainer: false,

  propsSchema: {
    value: 'Number 0..1',
    centerText: 'Text inside the ring (defaults to percentage)',
    label: 'Small label below',
    color: 'Optional hex color override',
  },
  defaultProps: { value: 0, label: 'Progress' },

  examples: [
    {
      context: '일일 걸음 목표',
      blueprint: {
        primitive: 'progress-ring',
        props: { value: 0.73, centerText: '7.3k', label: '걸음' },
      },
    },
    {
      context: '하루 무드 스코어',
      blueprint: {
        primitive: 'progress-ring',
        props: { value: 0.87, centerText: '87', label: 'Vibe' },
      },
    },
  ],

  component: ProgressRingPrimitive,
};

export default definition;
