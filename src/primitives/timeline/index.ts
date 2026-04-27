import type { PrimitiveDefinition } from '../../types';
import TimelinePrimitive, { type TimelineProps } from './Timeline';

const definition: PrimitiveDefinition<TimelineProps> = {
  type: 'timeline',
  name: '타임라인',
  description:
    'A vertical list of time-stamped events with a connecting line and dot indicators. Use for schedules, watch history, workout logs, daily routines, D-Day countdowns, or any ordered event list. Supports done (strikethrough) and accent (highlight) states per item.',
  icon: '📅',
  isContainer: false,

  propsSchema: {
    items: 'Array of { time: string, label: string, done?: boolean, accent?: boolean }. "accent" highlights the item in the accent color (use for "now" or important events).',
    title: 'Optional section heading',
    compact: 'boolean — tighter row height for dense schedules',
  },
  defaultProps: {
    items: [
      { time: '09:00', label: '일정 항목 1' },
      { time: '11:00', label: '일정 항목 2', accent: true },
      { time: '14:00', label: '일정 항목 3' },
    ],
  },

  examples: [
    {
      context: '오늘 하루 일정 위젯',
      blueprint: {
        primitive: 'timeline',
        props: {
          title: '오늘 일정',
          items: [
            { time: '08:00', label: '기상 & 스트레칭', done: true },
            { time: '09:30', label: '팀 스탠드업 미팅', done: true },
            { time: '12:00', label: '점심 — 구내식당', accent: true },
            { time: '14:00', label: '디자인 리뷰' },
            { time: '18:00', label: '퇴근 러닝 5km' },
          ],
        },
      },
    },
    {
      context: '오늘 시청 기록 타임라인',
      blueprint: {
        primitive: 'timeline',
        props: {
          title: '오늘 시청 기록',
          compact: true,
          items: [
            { time: '09:15', label: '뉴스 — MBC 아침뉴스', done: true },
            { time: '12:40', label: '유튜브 — 요리 레시피', done: true },
            { time: '20:00', label: '넷플릭스 — 오징어게임 S2', accent: true },
            { time: '22:30', label: '다음 에피소드 예정' },
          ],
        },
      },
    },
    {
      context: '운동 루틴 체크리스트',
      blueprint: {
        primitive: 'stack',
        children: [
          {
            primitive: 'timeline',
            props: {
              title: '오늘 운동 루틴',
              compact: true,
              items: [
                { time: '5분', label: '준비운동', done: true },
                { time: '20분', label: '유산소 (트레드밀)', done: true },
                { time: '15분', label: '상체 웨이트', accent: true },
                { time: '10분', label: '하체 웨이트' },
                { time: '5분', label: '쿨다운 스트레칭' },
              ],
            },
          },
          { primitive: 'progress-ring', props: { value: 0.4, centerText: '2/5', label: '완료' } },
        ],
      },
    },
    {
      context: '결혼기념일 D-Day 카운트다운 (날짜 목록)',
      blueprint: {
        primitive: 'timeline',
        props: {
          title: '다가오는 날들',
          items: [
            { time: 'D-3', label: '아내 생일 🎂', accent: true },
            { time: 'D-15', label: '결혼기념일 💍' },
            { time: 'D-30', label: '가족 여행 출발 ✈️' },
          ],
        },
      },
    },
  ],

  component: TimelinePrimitive,
};

export default definition;
