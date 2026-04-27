import type { PrimitiveDefinition } from '../../types';
import CalendarStripPrimitive, {
  type CalendarStripProps,
} from './CalendarStrip';

const definition: PrimitiveDefinition<CalendarStripProps> = {
  type: 'calendar-strip',
  name: 'Calendar Strip',
  description:
    'A compact horizontal timeline for upcoming days. Use for weekly schedules, countdown windows, birthdays, workouts, travel dates, and any widget that should show a short run of days at a glance.',
  icon: 'CS',
  isContainer: false,

  propsSchema: {
    title: 'Optional short section title such as "This Week" or "Birthday Countdown"',
    days:
      'Array of { label, sublabel?, active?, accent? }. label is the day text, sublabel is a short event note, active highlights today, accent highlights important dates.',
  },
  defaultProps: {
    title: 'This Week',
    days: [
      { label: 'Mon', sublabel: 'Planning', active: true },
      { label: 'Tue', sublabel: 'Gym' },
      { label: 'Wed', sublabel: 'Dinner', accent: true },
      { label: 'Thu', sublabel: 'Focus' },
      { label: 'Fri', sublabel: 'Birthday', accent: true },
    ],
  },

  examples: [
    {
      context: 'Weekly family schedule strip under a chat bubble',
      blueprint: {
        primitive: 'calendar-strip',
        props: {
          title: 'This Week',
          days: [
            { label: 'Mon', sublabel: 'School', active: true },
            { label: 'Tue', sublabel: 'Gym' },
            { label: 'Wed', sublabel: 'Parents', accent: true },
            { label: 'Thu', sublabel: 'Movie' },
            { label: 'Fri', sublabel: 'Dinner' },
          ],
        },
      },
      rationale:
        'Use when the widget needs a quick time-based overview instead of one isolated number.',
    },
    {
      context: 'Birthday countdown window',
      blueprint: {
        primitive: 'calendar-strip',
        props: {
          title: 'Birthday Week',
          days: [
            { label: 'D-3', sublabel: 'Buy cake' },
            { label: 'D-2', sublabel: 'Call florist' },
            { label: 'D-1', sublabel: 'Wrap gift', accent: true },
            { label: 'D-Day', sublabel: 'Birthday', active: true, accent: true },
          ],
        },
      },
      rationale:
        'Compact D-day windows work well when each day carries one concrete preparation task.',
    },
    {
      context: 'Complete weekly planner widget with narrative guidance and one highlighted next event',
      blueprint: {
        primitive: 'stack',
        props: { gap: 10, align: 'start' },
        children: [
          {
            primitive: 'chat-bubble',
            props: {
              text: 'This week stays calm until Friday, so keep the birthday dinner prep visible.',
              speaker: 'ai',
              tone: 'comfort',
            },
          },
          {
            primitive: 'calendar-strip',
            props: {
              title: 'This Week',
              days: [
                { label: 'Mon', sublabel: 'School', active: true },
                { label: 'Tue', sublabel: 'Gym' },
                { label: 'Wed', sublabel: 'Parents', accent: true },
                { label: 'Thu', sublabel: 'Movie' },
                { label: 'Fri', sublabel: 'Birthday', accent: true },
              ],
            },
          },
          {
            primitive: 'stat-tile',
            props: {
              label: 'Next Event',
              value: 'Fri',
              unit: 'Birthday',
              accent: true,
            },
          },
        ],
      },
      rationale:
        'The bubble adds guidance, the strip shows the weekly flow, and the stat-tile calls out the single most important upcoming day.',
    },
    {
      context: 'Workout planning widget with short timeline and momentum message',
      blueprint: {
        primitive: 'stack',
        props: { gap: 12, align: 'start' },
        children: [
          {
            primitive: 'calendar-strip',
            props: {
              title: 'Next 5 Days',
              days: [
                { label: 'Mon', sublabel: 'Run', active: true },
                { label: 'Tue', sublabel: 'Recovery' },
                { label: 'Wed', sublabel: 'Intervals', accent: true },
                { label: 'Thu', sublabel: 'Walk' },
                { label: 'Fri', sublabel: 'Long Run', accent: true },
              ],
            },
          },
          {
            primitive: 'chat-bubble',
            props: {
              text: 'Your hardest session is Wednesday, so keep Tuesday light and save energy.',
              speaker: 'ai',
              tone: 'celebrate',
            },
          },
        ],
      },
      rationale:
        'Use calendar-strip first when the main job is sequencing multiple days, then add a chat-bubble for coaching tone.',
    },
    {
      context: 'Travel countdown widget with image, short timeline, and D-day summary',
      blueprint: {
        primitive: 'stack',
        props: { gap: 10, align: 'start' },
        children: [
          {
            primitive: 'image-frame',
            props: {
              source: 'seed:beach-trip',
              caption: 'Jeju Weekend',
              shape: 'landscape',
            },
          },
          {
            primitive: 'calendar-strip',
            props: {
              title: 'Trip Window',
              days: [
                { label: 'D-3', sublabel: 'Pack' },
                { label: 'D-2', sublabel: 'Tickets', accent: true },
                { label: 'D-1', sublabel: 'Check weather' },
                { label: 'D-Day', sublabel: 'Flight', active: true, accent: true },
              ],
            },
          },
          {
            primitive: 'stat-tile',
            props: {
              label: 'Countdown',
              value: 'D-3',
              accent: true,
            },
          },
        ],
      },
      rationale:
        'Pair the strip with a hero image when the widget should feel aspirational, then anchor urgency with one bold D-day stat.',
    },
  ],

  component: CalendarStripPrimitive,
};

export default definition;
