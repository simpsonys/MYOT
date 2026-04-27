import type { PrimitiveDefinition } from '../../types';
import GaugeBarPrimitive, { type GaugeBarProps } from './GaugeBar';

const definition: PrimitiveDefinition<GaugeBarProps> = {
  type: 'gauge-bar',
  name: '게이지 바',
  description:
    'Horizontal progress/fill bar with label, value label, and optional segment zones. Unlike progress-ring (circular, compact), gauge-bar is horizontal and ideal for wide cells — budget tracking, calorie goals, battery, completion rate. Supports gradient fill with glow tip.',
  icon: '📏',
  isContainer: false,

  propsSchema: {
    value: 'Fill ratio 0..1',
    label: 'Left-side caption (e.g. "이번 달 예산")',
    valueLabel: 'Right-side value text (e.g. "72만 / 100만원"). Defaults to percentage.',
    color: 'Optional hex fill color override',
    segments: 'Optional array of zone labels e.g. ["낮음","보통","높음"] shown below the bar',
  },
  defaultProps: { value: 0.5, label: 'Progress' },

  examples: [
    {
      context: '이번 달 생활비 예산 현황',
      blueprint: {
        primitive: 'gauge-bar',
        props: {
          value: 0.72,
          label: '이번 달 예산',
          valueLabel: '72만 / 100만원',
          segments: ['시작', '중간', '마감'],
        },
      },
    },
    {
      context: '오늘 칼로리 목표 달성률',
      blueprint: {
        primitive: 'gauge-bar',
        props: {
          value: 0.58,
          label: '칼로리',
          valueLabel: '1,160 / 2,000 kcal',
          color: '#FF9F43',
        },
      },
    },
    {
      context: '스마트홈 배터리 현황 위젯',
      blueprint: {
        primitive: 'stack',
        children: [
          { primitive: 'gauge-bar', props: { value: 0.82, label: '거실 청소기', valueLabel: '82%', color: '#00D4FF' } },
          { primitive: 'gauge-bar', props: { value: 0.45, label: '로봇청소기', valueLabel: '45%', color: '#FFD93D' } },
          { primitive: 'gauge-bar', props: { value: 0.12, label: '도어락', valueLabel: '12% ⚠', color: '#FF6B6B' } },
        ],
      },
    },
    {
      context: '운동 강도 구간 표시',
      blueprint: {
        primitive: 'gauge-bar',
        props: {
          value: 0.75,
          label: '심박수 존',
          valueLabel: '148 bpm',
          color: '#FF6B6B',
          segments: ['회복', '유산소', '무산소', '최대'],
        },
      },
    },
  ],

  component: GaugeBarPrimitive,
};

export default definition;
