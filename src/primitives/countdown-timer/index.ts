import type { PrimitiveDefinition } from '../../types';
import CountdownTimerPrimitive, { type CountdownTimerProps } from './CountdownTimer';

const definition: PrimitiveDefinition<CountdownTimerProps> = {
  type: 'countdown-timer',
  name: '카운트다운 타이머',
  description:
    'A self-contained countdown timer with a circular progress ring. Shows remaining time, supports start/pause/reset controls, and emits an event when the timer reaches zero. Can also be started externally via a bus event (pair with action-button using onStartEvent). Perfect for cooking, exercise intervals, productivity sprints, or any timed task.',
  icon: '⏱',
  isContainer: false,

  propsSchema: {
    durationSeconds: 'Timer duration in seconds (e.g. 900 for 15 min, 3600 for 1 hour)',
    label: 'Small caption label shown above the ring (e.g. "오븐 타이머", "휴식 시간")',
    onDoneEvent: 'Event type emitted when countdown reaches zero (e.g. "timer.baking.done")',
    onStartEvent: 'Bus event type that triggers the timer to start (allows action-button to start it remotely)',
    autoStart: 'boolean — start the timer immediately on render (default false)',
  },
  defaultProps: { durationSeconds: 300, label: '타이머' },

  examples: [
    {
      context: '오븐 15분 베이킹 타이머',
      blueprint: {
        primitive: 'countdown-timer',
        props: {
          durationSeconds: 900,
          label: '오븐 타이머',
          onDoneEvent: 'timer.baking.done',
          onStartEvent: 'timer.baking.start',
        },
      },
    },
    {
      context: '운동 세트 휴식 타이머 (60초, 자동 시작)',
      blueprint: {
        primitive: 'countdown-timer',
        props: {
          durationSeconds: 60,
          label: '세트 간 휴식',
          onDoneEvent: 'workout.rest.done',
          autoStart: true,
        },
      },
    },
    {
      context: '베이킹 키친 대시보드 — 체크리스트 + 타이머 + 이미지',
      blueprint: {
        primitive: 'grid',
        props: { columns: 2, gap: 10 },
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
                { label: '타히니', sublabel: '2큰술' },
              ],
            },
          },
          {
            primitive: 'stack',
            children: [
              {
                primitive: 'countdown-timer',
                props: {
                  durationSeconds: 900,
                  label: '오븐 타이머',
                  onDoneEvent: 'timer.baking.done',
                  onStartEvent: 'timer.baking.start',
                },
              },
              {
                primitive: 'action-button',
                props: {
                  label: '15분 타이머 시작',
                  icon: '🍪',
                  variant: 'warm',
                  onTapEvent: 'timer.baking.start',
                },
              },
            ],
          },
        ],
      },
      rationale: 'checklist on the left for prep tracking, timer+button on the right for baking — the full hands-free kitchen dashboard.',
    },
  ],

  component: CountdownTimerPrimitive,
};

export default definition;
