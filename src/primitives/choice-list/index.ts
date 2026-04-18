import type { PrimitiveDefinition } from '../../types';
import ChoiceListPrimitive, { type ChoiceListProps } from './ChoiceList';

const definition: PrimitiveDefinition<ChoiceListProps> = {
  type: 'choice-list',
  name: '선택 리스트',
  description:
    'A vertical list of pickable option cards. Use when the user needs to choose among alternatives — routes, movies, outfits, recipes, time slots. Each item can have a rank medal (1-3), badge (e.g. calories), and a caution note. Emits an event when tapped so the AI can react.',
  icon: '🗂️',
  isContainer: false,

  propsSchema: {
    items: 'Array of { title, subtitle?, badge?, caution?, rank? (1|2|3) }',
    onPickEvent:
      'Event type to emit on tap. Convention: "<widget-purpose>.picked" e.g. "running.routePicked"',
  },
  defaultProps: { items: [] },

  examples: [
    {
      context: '러닝 경로 3개 추천',
      blueprint: {
        primitive: 'choice-list',
        props: {
          onPickEvent: 'running.routePicked',
          items: [
            { title: '한강뷰 코스', subtitle: '벚꽃과 강바람', badge: '+120 kcal', rank: 1 },
            { title: '카페 투어', subtitle: '유명 커피숍 3곳', badge: '+95 kcal', rank: 2 },
            {
              title: '피톤치드 코스',
              subtitle: '숲길, 오르막 있음',
              badge: '+180 kcal',
              caution: '심박수 체크',
              rank: 3,
            },
          ],
        },
      },
    },
    {
      context: '오늘 저녁 추천',
      blueprint: {
        primitive: 'choice-list',
        props: {
          onPickEvent: 'dinner.picked',
          items: [
            { title: '김치찌개', subtitle: '집에 재료 다 있음', badge: '20분' },
            { title: '파스타', subtitle: '오일 베이스', badge: '15분' },
          ],
        },
      },
    },
  ],

  component: ChoiceListPrimitive,
};

export default definition;
