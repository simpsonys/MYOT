import type { PrimitiveDefinition } from '../../types';
import StatTilePrimitive, { type StatTileProps } from './StatTile';

const definition: PrimitiveDefinition<StatTileProps> = {
  type: 'stat-tile',
  name: '스탯 타일',
  description:
    'A single stat with a big number and a label. Use for any scalar metric — distance, time, temperature, count, score, price, percentage, streak days, etc. Compose 3-4 of these in a stat-row for a dashboard header.',
  icon: '📊',
  isContainer: false,

  propsSchema: {
    value: 'The headline number or short text (string or number)',
    unit: 'Optional unit suffix like "km", "kcal", "°C", "%"',
    label: 'Small caption above/below the number',
    accent: 'boolean — render value in theme accent color for emphasis',
  },
  defaultProps: { value: '0', label: 'Stat', accent: false },

  examples: [
    {
      context: '러닝 거리 표시',
      blueprint: {
        primitive: 'stat-tile',
        props: { value: '5.2', unit: 'km', label: '거리', accent: true },
      },
    },
    {
      context: '오늘의 기분 점수',
      blueprint: {
        primitive: 'stat-tile',
        props: { value: '87', unit: '/ 100', label: 'Vibe Score' },
      },
    },
    {
      context: 'D-Day 카운터',
      blueprint: {
        primitive: 'stat-tile',
        props: { value: 'D-12', label: '아내 생일까지', accent: true },
      },
    },
  ],

  component: StatTilePrimitive,
};

export default definition;
