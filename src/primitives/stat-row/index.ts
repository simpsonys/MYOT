import type { PrimitiveDefinition } from '../../types';
import StatRowPrimitive, { type StatRowProps } from './StatRow';

const definition: PrimitiveDefinition<StatRowProps> = {
  type: 'stat-row',
  name: '스탯 열',
  description:
    'A horizontal container that evenly distributes its children. Typically holds 2-4 stat-tile children for a dashboard header. This is a CONTAINER primitive — AI must populate children.',
  icon: '▭',
  isContainer: true,

  propsSchema: {
    gap: 'Gap between children in px (default 8)',
  },
  defaultProps: {},

  examples: [
    {
      context: '러닝 대시보드 상단 3연 스탯',
      blueprint: {
        primitive: 'stat-row',
        children: [
          { primitive: 'stat-tile', props: { value: '5.2', unit: 'km', label: '거리', accent: true } },
          { primitive: 'stat-tile', props: { value: '28', unit: 'min', label: '시간' } },
          { primitive: 'stat-tile', props: { value: "5'24\"", unit: '/km', label: '페이스' } },
        ],
      },
    },
  ],

  component: StatRowPrimitive,
};

export default definition;
