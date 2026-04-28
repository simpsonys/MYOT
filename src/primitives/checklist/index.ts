import type { PrimitiveDefinition } from '../../types';
import ChecklistPrimitive, { type ChecklistProps } from './Checklist';

const definition: PrimitiveDefinition<ChecklistProps> = {
  type: 'checklist',
  name: '체크리스트',
  description:
    'An interactive checklist where each item can be individually tapped to check/uncheck. Unlike choice-list (single pick), checklist supports multi-item completion tracking — ideal for recipe ingredients, shopping lists, packing lists, to-dos, or step-by-step tasks. Shows a progress bar and emits an event when all items are checked.',
  icon: '✅',
  isContainer: false,

  propsSchema: {
    items: 'Array of { label: string, sublabel?: string, done?: boolean }. sublabel can hold quantity or notes (e.g. "200g").',
    title: 'Optional header label (e.g. "재료 체크리스트", "쇼핑 목록")',
    onCompleteEvent: 'Event type to emit when ALL items are checked (e.g. "checklist.complete"). Optional.',
  },
  defaultProps: {
    items: [{ label: '항목 1' }],
  },

  examples: [
    {
      context: '두바이 쫀득 쿠키 재료 체크리스트',
      blueprint: {
        primitive: 'checklist',
        props: {
          title: '재료 체크리스트',
          onCompleteEvent: 'ingredients.ready',
          items: [
            { label: '밀가루', sublabel: '200g' },
            { label: '버터', sublabel: '100g, 실온' },
            { label: '설탕', sublabel: '80g' },
            { label: '달걀', sublabel: '1개' },
            { label: '딸기', sublabel: '8~10개, 세척' },
            { label: '청포도', sublabel: '한 줌' },
            { label: '타히니 페이스트', sublabel: '2큰술' },
            { label: '카다멈 파우더', sublabel: '1/4 tsp' },
          ],
        },
      },
    },
    {
      context: '베이킹 체크리스트 + 타이머 조합 위젯',
      blueprint: {
        primitive: 'stack',
        children: [
          {
            primitive: 'checklist',
            props: {
              title: '재료 체크리스트',
              items: [
                { label: '밀가루', sublabel: '200g' },
                { label: '버터', sublabel: '100g' },
                { label: '설탕', sublabel: '80g' },
                { label: '딸기', sublabel: '10개' },
                { label: '청포도', sublabel: '한 줌' },
              ],
            },
          },
          {
            primitive: 'countdown-timer',
            props: { durationSeconds: 900, label: '오븐 타이머', onDoneEvent: 'timer.baking.done' },
          },
        ],
      },
      rationale: 'checklist handles prep tracking; countdown-timer handles baking time — together they cover the full baking workflow.',
    },
  ],

  component: ChecklistPrimitive,
};

export default definition;
