import type { PrimitiveDefinition } from '../../types';
import StackPrimitive, { type StackProps } from './Stack';

const definition: PrimitiveDefinition<StackProps> = {
  type: 'stack',
  name: '스택',
  description:
    'A vertical container for composing widget layouts. This is the most common root primitive — wrap a header, body, and commentary inside a stack to create full widgets.',
  icon: '▤',
  isContainer: true,

  propsSchema: {
    gap: 'Gap between children in px (default 8)',
    align:
      '"start" | "center" | "between" | "end" — vertical distribution (default "between")',
  },
  defaultProps: { gap: 8, align: 'between' },

  examples: [
    {
      context: 'Complete running widget — stat row + map + chat bubble',
      blueprint: {
        primitive: 'stack',
        children: [
          {
            primitive: 'stat-row',
            children: [
              { primitive: 'stat-tile', props: { value: '5.2', unit: 'km', label: '거리', accent: true } },
              { primitive: 'stat-tile', props: { value: '28', unit: 'min', label: '시간' } },
              { primitive: 'stat-tile', props: { value: "5'24\"", unit: '/km', label: '페이스' } },
            ],
          },
          {
            primitive: 'map-card',
            props: {
              caption: '오늘의 추천 코스', distanceKm: 5.2,
              center: { lat: 37.513, lng: 126.994 }, zoom: 14,
              route: [
                { lat: 37.5165, lng: 126.983 }, { lat: 37.5148, lng: 126.991 },
                { lat: 37.5126, lng: 126.999 }, { lat: 37.5108, lng: 127.010 },
              ],
            },
          },
          {
            primitive: 'chat-bubble',
            props: {
              text: '오늘 5.2km 완주! 어제보다 +0.3km 🎉',
              speaker: 'ai',
              tone: 'celebrate',
            },
          },
        ],
      },
      rationale:
        'Stack is the outer frame. Stat-row gives a quick-glance header. Map is the hero visual. Chat-bubble adds the "living" conversational touch.',
    },
  ],

  component: StackPrimitive,
};

export default definition;
