import type { PrimitiveDefinition } from '../../types';
import ClockFacePrimitive, { type ClockFaceProps } from './ClockFace';

const definition: PrimitiveDefinition<ClockFaceProps> = {
  type: 'clock-face',
  name: '시계',
  description:
    'A real-time clock that updates every second. Three styles: "analog" (SVG hands), "digital" (large HH:MM), "minimal" (accent-colored digits only). Use for any widget that needs time — morning routines, timers, D-Day countdowns with time remaining, smart home dashboards.',
  icon: '⏰',
  isContainer: false,

  propsSchema: {
    style: '"analog" | "digital" | "minimal" — visual style of the clock',
    showDate: 'boolean — show month/day/weekday below the clock',
    showSeconds: 'boolean — show second hand (analog) or :SS suffix (digital)',
  },
  defaultProps: { style: 'digital', showDate: true, showSeconds: false },

  examples: [
    {
      context: '거실 TV 홈 화면 왼쪽 상단 시계',
      blueprint: {
        primitive: 'clock-face',
        props: { style: 'digital', showDate: true, showSeconds: false },
      },
      rationale: 'Digital is most legible at a distance from a TV sofa.',
    },
    {
      context: '인테리어 감성 아날로그 시계 위젯',
      blueprint: {
        primitive: 'clock-face',
        props: { style: 'analog', showDate: true, showSeconds: true },
      },
    },
    {
      context: '심플한 시간만 표시 (다른 위젯 옆 배치)',
      blueprint: {
        primitive: 'clock-face',
        props: { style: 'minimal', showDate: false, showSeconds: false },
      },
      rationale: 'Minimal keeps visual weight low when paired with busy widgets.',
    },
    {
      context: '아침 루틴 위젯 (시계 + 오늘 일정)',
      blueprint: {
        primitive: 'stack',
        children: [
          { primitive: 'clock-face', props: { style: 'digital', showDate: true } },
          { primitive: 'chat-bubble', props: { text: '좋은 아침이에요! 오늘 일정 확인하세요 ☀️', speaker: 'ai', tone: 'celebrate' } },
        ],
      },
    },
  ],

  component: ClockFacePrimitive,
};

export default definition;
