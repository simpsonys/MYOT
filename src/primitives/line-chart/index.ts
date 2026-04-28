import type { PrimitiveDefinition } from '../../types';
import LineChartPrimitive, { type LineChartProps } from './LineChart';

const definition: PrimitiveDefinition<LineChartProps> = {
  type: 'line-chart',
  name: '시계열 그래프',
  description:
    'A multi-series time-series line chart with optional x-axis labels, gradient fill, and a legend. Use when the user wants to see how something changes over time — body weight, sleep hours, mood score, stock price, monthly spending. Supports multiple series for comparison (e.g. this month vs last month).',
  icon: '📉',
  isContainer: false,

  propsSchema: {
    series: 'Array of { label: string, data: number[], color?: string (hex) }. Each series is one line.',
    labels: 'X-axis labels, one per data point (e.g. ["1월","2월","3월"] or ["월","화","수","목","금"])',
    title: 'Optional chart title',
    unit: 'Unit shown in tooltips/labels (e.g. "kg", "시간", "점")',
    showDots: 'boolean — show data point dots (default true). Set false for dense data (20+ points).',
  },
  defaultProps: {
    series: [{ label: '데이터', data: [3, 5, 4, 7, 6, 8] }],
  },

  examples: [
    {
      context: '최근 7일 수면 시간 추이',
      blueprint: {
        primitive: 'line-chart',
        props: {
          title: '수면 시간',
          unit: 'h',
          labels: ['월', '화', '수', '목', '금', '토', '일'],
          series: [
            { label: '수면', data: [6.5, 7.2, 5.8, 7.0, 6.3, 8.1, 7.5] },
          ],
        },
      },
    },
    {
      context: '이번 달 vs 지난 달 칼로리 소모 비교',
      blueprint: {
        primitive: 'line-chart',
        props: {
          title: '칼로리 소모 비교',
          unit: 'kcal',
          labels: ['1주', '2주', '3주', '4주'],
          series: [
            { label: '이번 달', data: [1820, 2100, 1950, 2300], color: '#60a5fa' },
            { label: '지난 달', data: [1600, 1750, 1900, 1800], color: '#f472b6' },
          ],
        },
      },
      rationale: 'Two-series comparison with distinct colors and a legend — shows progress at a glance.',
    },
    {
      context: '체중 변화 + AI 코멘트',
      blueprint: {
        primitive: 'stack',
        children: [
          {
            primitive: 'line-chart',
            props: {
              title: '체중 변화',
              unit: 'kg',
              labels: ['3월', '4월', '5월', '6월', '7월'],
              series: [{ label: '체중', data: [74.2, 73.5, 72.8, 72.1, 71.6] }],
            },
          },
          {
            primitive: 'chat-bubble',
            props: {
              text: '꾸준히 감량 중이에요! 이번 달 -0.5kg, 목표까지 1.6kg 남았어요 💪',
              speaker: 'ai',
              tone: 'celebrate',
            },
          },
        ],
      },
    },
  ],

  component: LineChartPrimitive,
};

export default definition;
