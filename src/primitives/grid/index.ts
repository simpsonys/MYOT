import type { PrimitiveDefinition } from '../../types';
import GridPrimitive, { type GridProps } from './Grid';

const definition: PrimitiveDefinition<GridProps> = {
  type: 'grid',
  name: '그리드',
  description:
    'A 2-D grid container. Use when you need two or more columns — e.g. a 2×2 quad of stat-tiles, a 3-column shortcut row, or an image-frame beside a stat column. Stack handles a single column; grid handles everything else.',
  icon: '▦',
  isContainer: true,

  propsSchema: {
    columns: 'Number of equal-width columns (default 2). Common values: 2, 3, 4.',
    gap: 'Gap between cells in px (default 8)',
  },
  defaultProps: { columns: 2, gap: 8 },

  examples: [
    {
      context: '2×2 핵심 지표 대시보드',
      blueprint: {
        primitive: 'grid',
        props: { columns: 2, gap: 10 },
        children: [
          { primitive: 'stat-tile', props: { value: '8,412', unit: '걸음', label: '오늘', accent: true } },
          { primitive: 'stat-tile', props: { value: '72', unit: 'bpm', label: '심박수' } },
          { primitive: 'stat-tile', props: { value: '1,840', unit: 'kcal', label: '소모' } },
          { primitive: 'stat-tile', props: { value: '6.5', unit: 'h', label: '수면' } },
        ],
      },
      rationale: 'Four stats feel balanced in a 2×2 grid; a flat stat-row with four items becomes too narrow on TV.',
    },
    {
      context: '즐겨찾기 앱 3열 바로가기',
      blueprint: {
        primitive: 'grid',
        props: { columns: 3, gap: 8 },
        children: [
          { primitive: 'action-button', props: { label: 'Netflix', icon: '🎬', onTapEvent: 'app.launch', eventPayload: { app: 'netflix' } } },
          { primitive: 'action-button', props: { label: 'YouTube', icon: '▶️', onTapEvent: 'app.launch', eventPayload: { app: 'youtube' } } },
          { primitive: 'action-button', props: { label: '날씨', icon: '🌤', onTapEvent: 'app.launch', eventPayload: { app: 'weather' } } },
        ],
      },
      rationale: 'Three equal-width buttons in a grid look like a remote control panel — familiar TV UX.',
    },
  ],

  component: GridPrimitive,
};

export default definition;
