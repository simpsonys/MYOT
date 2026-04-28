import type { PrimitiveDefinition } from '../../types';
import BarChartPrimitive, { type BarChartProps } from './BarChart';

const definition: PrimitiveDefinition<BarChartProps> = {
  type: 'bar-chart',
  name: '막대 그래프',
  description:
    'A bar chart for comparing discrete values across categories. Use for weekly/monthly comparisons, rankings, category breakdowns, or any "which is biggest" question. Set horizontal:true when labels are long or there are many items (5+).',
  icon: '📊',
  isContainer: false,

  propsSchema: {
    items: 'Array of { label: string, value: number, accent?: boolean }. Mark the highlighted bar with accent:true.',
    title: 'Optional chart title shown at the top',
    unit: 'Unit suffix appended to values (e.g. "kcal", "km", "만원")',
    horizontal: 'boolean — render as horizontal bars (default false). Use when labels are long or items >= 5.',
  },
  defaultProps: {
    items: [{ label: '예시', value: 50 }],
  },

  examples: [
    {
      context: '이번 주 일별 걸음 수',
      blueprint: {
        primitive: 'bar-chart',
        props: {
          title: '이번 주 걸음 수',
          unit: '보',
          items: [
            { label: '월', value: 6200 },
            { label: '화', value: 7800 },
            { label: '수', value: 5400 },
            { label: '목', value: 9100 },
            { label: '금', value: 8412, accent: true },
            { label: '토', value: 4300 },
            { label: '일', value: 3100 },
          ],
        },
      },
      rationale: 'Vertical bars with short day labels — the classic weekly comparison layout.',
    },
    {
      context: '카테고리별 이번 달 지출',
      blueprint: {
        primitive: 'bar-chart',
        props: {
          title: '이번 달 지출',
          unit: '만',
          horizontal: true,
          items: [
            { label: '식비', value: 38, accent: true },
            { label: '교통', value: 12 },
            { label: '쇼핑', value: 25 },
            { label: '구독', value: 8 },
            { label: '기타', value: 17 },
          ],
        },
      },
      rationale: 'Horizontal bars suit longer Korean category labels and 5+ items.',
    },
  ],

  component: BarChartPrimitive,
};

export default definition;
