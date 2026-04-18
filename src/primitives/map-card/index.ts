import type { PrimitiveDefinition } from '../../types';
import MapCardPrimitive, { type MapCardProps } from './MapCard';

const definition: PrimitiveDefinition<MapCardProps> = {
  type: 'map-card',
  name: '맵 카드',
  description:
    'A visual map area with optional path overlay. Use for running routes, travel destinations, hiking trails, commute visualization, delivery tracking. Renders a stylized mock map (MVP) — no real map integration needed for the demo.',
  icon: '🗺️',
  isContainer: false,

  propsSchema: {
    caption: 'Short label shown on map (e.g. "오늘의 러닝 경로")',
    center: 'Optional { lat, lng }',
    zoom: 'Zoom level (number)',
    seed: 'Deterministic seed for mock map visual — use same seed for same route',
    distanceKm: 'Total route distance',
  },
  defaultProps: {},

  examples: [
    {
      context: '러닝 위젯의 주 영역',
      blueprint: {
        primitive: 'map-card',
        props: { caption: '오늘의 러닝 경로', seed: 'run-today', distanceKm: 5.2 },
      },
    },
    {
      context: '다음 여행지',
      blueprint: {
        primitive: 'map-card',
        props: { caption: '다음 목적지: 속초', seed: 'sokcho' },
      },
    },
  ],

  component: MapCardPrimitive,
};

export default definition;
