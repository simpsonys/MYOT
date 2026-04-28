import type { PrimitiveDefinition } from '../../types';
import WeatherCardPrimitive, { type WeatherCardProps } from './WeatherCard';

const definition: PrimitiveDefinition<WeatherCardProps> = {
  type: 'weather-card',
  name: '날씨 카드',
  description:
    'A weather widget showing current temperature, condition icon, and optional high/low/humidity/wind details. Use whenever the user asks about weather, today\'s forecast, or outdoor plans. No API — fill props with realistic placeholder values the AI infers from context.',
  icon: '🌤',
  isContainer: false,

  propsSchema: {
    location: 'City or place name (e.g. "서울", "제주도"). Omit for "현재 위치".',
    condition: 'Weather description in Korean or English (e.g. "맑음", "구름 조금", "소나기"). Used to auto-select the icon.',
    temp: 'Current temperature as a number (no degree sign)',
    unit: '"C" or "F" (default "C")',
    high: 'Forecasted high temperature (optional)',
    low: 'Forecasted low temperature (optional)',
    humidity: 'Humidity percentage 0-100 (optional)',
    wind: 'Wind speed in m/s (optional)',
    icon: 'Override the auto-selected emoji icon (optional)',
  },
  defaultProps: { condition: '맑음', temp: 22 },

  examples: [
    {
      context: '오늘 서울 날씨 위젯',
      blueprint: {
        primitive: 'weather-card',
        props: { location: '서울', condition: '맑음', temp: 24, high: 27, low: 16, humidity: 45 },
      },
    },
    {
      context: '날씨 + AI 코멘트 조합 위젯',
      blueprint: {
        primitive: 'stack',
        children: [
          {
            primitive: 'weather-card',
            props: { location: '부산', condition: '소나기', temp: 19, high: 22, low: 15, humidity: 82, wind: 4 },
          },
          {
            primitive: 'chat-bubble',
            props: { text: '오늘 외출 시 우산 챙기세요! 오후부터 소나기 예보입니다.', speaker: 'ai', tone: 'calm' },
          },
        ],
      },
      rationale: 'weather-card gives the raw data; chat-bubble adds the actionable AI suggestion — classic stack pairing.',
    },
    {
      context: '제주 여행 날씨 + 일정 조합',
      blueprint: {
        primitive: 'grid',
        props: { columns: 2, gap: 8 },
        children: [
          { primitive: 'weather-card', props: { location: '제주', condition: '구름 조금', temp: 21, high: 24, low: 18 } },
          { primitive: 'stat-tile', props: { value: 'D-3', label: '여행까지', accent: true } },
        ],
      },
    },
  ],

  component: WeatherCardPrimitive,
};

export default definition;
