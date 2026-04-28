import type { PrimitiveDefinition } from '../../types';
import SparklinePrimitive, { type SparklineProps } from './Sparkline';

const definition: PrimitiveDefinition<SparklineProps> = {
  type: 'sparkline',
  name: '스파크라인',
  description:
    'A mini trend-line chart with a current value label and up/down/flat indicator. Use alongside stat-tile to add temporal context — "the number is X, and it\'s been going up." Great for health metrics, stock prices, step counts, streaks, and any data with a history.',
  icon: '📈',
  isContainer: false,

  propsSchema: {
    data: 'Array of numbers representing the trend history, oldest first (e.g. [60, 63, 61, 67, 72]). Min 2 values.',
    label: 'Small caption label (e.g. "주간 걸음 수", "심박수 추세")',
    value: 'The current / latest value as a formatted string (e.g. "8,412", "72")',
    unit: 'Unit suffix shown beside the value (e.g. "걸음", "bpm", "kcal")',
    trend: '"up" | "down" | "flat" — overrides auto-detected trend from data. Controls color: green/red/gray.',
  },
  defaultProps: { data: [3, 5, 4, 6, 5, 7, 8, 9], label: '추세' },

  examples: [
    {
      context: '주간 걸음 수 추세 위젯',
      blueprint: {
        primitive: 'sparkline',
        props: {
          data: [6200, 7100, 5800, 8300, 7600, 9100, 8412],
          label: '이번 주 걸음 수',
          value: '8,412',
          unit: '걸음',
          trend: 'up',
        },
      },
    },
    {
      context: '걸음 수 숫자 + 추세 나란히 배치',
      blueprint: {
        primitive: 'grid',
        props: { columns: 2, gap: 8 },
        children: [
          { primitive: 'stat-tile', props: { value: '8,412', unit: '걸음', label: '오늘', accent: true } },
          {
            primitive: 'sparkline',
            props: {
              data: [6200, 7100, 5800, 8300, 7600, 9100, 8412],
              label: '7일 추세',
              trend: 'up',
            },
          },
        ],
      },
      rationale: 'stat-tile shows the number; sparkline shows the trend — they complement each other perfectly in a 2-col grid.',
    },
    {
      context: '오늘 심박수 모니터링',
      blueprint: {
        primitive: 'stack',
        children: [
          {
            primitive: 'sparkline',
            props: {
              data: [68, 72, 75, 80, 76, 71, 73, 72],
              label: '심박수 추세',
              value: '72',
              unit: 'bpm',
              trend: 'flat',
            },
          },
          {
            primitive: 'chat-bubble',
            props: { text: '심박수가 안정적이에요. 오늘 컨디션 좋은 날입니다 💪', speaker: 'ai', tone: 'celebrate' },
          },
        ],
      },
    },
  ],

  component: SparklinePrimitive,
};

export default definition;
