import type { PrimitiveExample } from '../src/types';

export interface PrimitiveDataDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  isContainer: boolean;
  propsSchema: Record<string, string>;
  defaultProps: Record<string, unknown>;
  examples: PrimitiveExample[];
}

export const primitiveDataRegistry: PrimitiveDataDefinition[] = [
  {
    type: 'stack',
    name: '스택',
    description:
      'A vertical container for composing widget layouts. This is the most common root primitive — wrap a header, body, and commentary inside a stack to create full widgets.',
    icon: '▤',
    isContainer: true,
    propsSchema: {
      gap: 'Gap between children in px (default 8)',
      align: '"start" | "center" | "between" | "end" — vertical distribution (default "between")',
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
              props: { caption: '오늘의 경로', seed: 'run-today', distanceKm: 5.2 },
            },
            {
              primitive: 'chat-bubble',
              props: { text: '오늘 5.2km 완주! 어제보다 +0.3km 🎉', speaker: 'ai', tone: 'celebrate' },
            },
          ],
        },
        rationale:
          'Stack is the outer frame. Stat-row gives a quick-glance header. Map is the hero visual. Chat-bubble adds the "living" conversational touch.',
      },
    ],
  },
  {
    type: 'stat-row',
    name: '스탯 열',
    description:
      'A horizontal container that evenly distributes its children. Typically holds 2-4 stat-tile children for a dashboard header. This is a CONTAINER primitive — AI must populate children.',
    icon: '▭',
    isContainer: true,
    propsSchema: { gap: 'Gap between children in px (default 8)' },
    defaultProps: {},
    examples: [
      {
        context: '러닝 대시보드 상단 3연 스탯',
        blueprint: {
          primitive: 'stat-row',
          children: [
            { primitive: 'stat-tile', props: { value: '5.2', unit: 'km', label: '거리', accent: true } },
            { primitive: 'stat-tile', props: { value: '28', unit: 'min', label: '시간' } },
            { primitive: 'stat-tile', props: { value: "5'24\"", unit: '/km', label: '페이스' } },
          ],
        },
      },
    ],
  },
  {
    type: 'stat-tile',
    name: '스탯 타일',
    description:
      'A single stat with a big number and a label. Use for any scalar metric — distance, time, temperature, count, score, price, percentage, streak days, etc. Compose 3-4 of these in a stat-row for a dashboard header.',
    icon: '📊',
    isContainer: false,
    propsSchema: {
      value: 'The headline number or short text (string or number)',
      unit: 'Optional unit suffix like "km", "kcal", "°C", "%"',
      label: 'Small caption above/below the number',
      accent: 'boolean — render value in theme accent color for emphasis',
    },
    defaultProps: { value: '0', label: 'Stat', accent: false },
    examples: [
      {
        context: '러닝 거리 표시',
        blueprint: { primitive: 'stat-tile', props: { value: '5.2', unit: 'km', label: '거리', accent: true } },
      },
      {
        context: '오늘의 기분 점수',
        blueprint: { primitive: 'stat-tile', props: { value: '87', unit: '/ 100', label: 'Vibe Score' } },
      },
      {
        context: 'D-Day 카운터',
        blueprint: { primitive: 'stat-tile', props: { value: 'D-12', label: '아내 생일까지', accent: true } },
      },
    ],
  },
  {
    type: 'chat-bubble',
    name: '챗 버블',
    description:
      'A speech bubble for conversational, emotional commentary. Use to make a widget feel alive — every "Living Widget" should have at least one of these. Pair with stats or lists to create coach/companion widgets.',
    icon: '💬',
    isContainer: false,
    propsSchema: {
      text: 'The message (Korean ok)',
      speaker: '"ai" | "user" | "system" — who is talking',
      tone: '"neutral" | "celebrate" | "caution" | "comfort" — sets the bubble color',
    },
    defaultProps: { text: '...', speaker: 'ai', tone: 'neutral' },
    examples: [
      {
        context: '러닝 완주 축하',
        blueprint: {
          primitive: 'chat-bubble',
          props: { text: '오늘 5.2km 완주! 어제보다 +0.3km 이에요', speaker: 'ai', tone: 'celebrate' },
        },
      },
      {
        context: '회복 권유',
        blueprint: {
          primitive: 'chat-bubble',
          props: { text: '오늘은 푹 쉬세요. 내일 더 잘 달릴 수 있어요', speaker: 'ai', tone: 'comfort' },
        },
      },
    ],
  },
  {
    type: 'choice-list',
    name: '선택 리스트',
    description:
      'A vertical list of pickable option cards. Use when the user needs to choose among alternatives — routes, movies, outfits, recipes, time slots. Each item can have a rank medal (1-3), badge (e.g. calories), and a caution note. Emits an event when tapped so the AI can react.',
    icon: '🗂️',
    isContainer: false,
    propsSchema: {
      items: 'Array of { title, subtitle?, badge?, caution?, rank? (1|2|3) }',
      onPickEvent: 'Event type to emit on tap. Convention: "<widget-purpose>.picked" e.g. "running.routePicked"',
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
              { title: '피톤치드 코스', subtitle: '숲길, 오르막 있음', badge: '+180 kcal', caution: '심박수 체크', rank: 3 },
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
  },
  {
    type: 'map-card',
    name: '맵 카드',
    description:
      'A visual map area with optional path overlay. Use for running routes, travel destinations, hiking trails, commute visualization, delivery tracking. Renders a stylized mock map (MVP) — no real map integration needed for the demo.',
    icon: '🗺️',
    isContainer: false,
    propsSchema: {
      caption: 'Short label shown on map (e.g. "오늘의 러닝 경로")',
      center: 'Optional { lat, lng }',
      zoom: 'Zoom level (number)',
      seed: 'Deterministic seed for mock map visual — use same seed for same route',
      distanceKm: 'Total route distance',
    },
    defaultProps: {},
    examples: [
      {
        context: '러닝 위젯의 주 영역',
        blueprint: {
          primitive: 'map-card',
          props: { caption: '오늘의 러닝 경로', seed: 'run-today', distanceKm: 5.2 },
        },
      },
      {
        context: '다음 여행지',
        blueprint: {
          primitive: 'map-card',
          props: { caption: '다음 목적지: 속초', seed: 'sokcho' },
        },
      },
    ],
  },
  {
    type: 'image-frame',
    name: '이미지 프레임',
    description:
      'Display an image with optional caption. Use for photos (family, wife, kids, pets), avatars, illustrations, placeholders. For MVP demos use "seed:<word>" to get a deterministic mock image from picsum.',
    icon: '🖼️',
    isContainer: false,
    propsSchema: {
      source: 'URL or "seed:<word>" for mock (e.g. "seed:wife", "seed:family")',
      caption: 'Optional caption overlay',
      shape: '"square" | "circle" | "portrait" | "landscape" | "fill" (default)',
    },
    defaultProps: { source: 'seed:placeholder' },
    examples: [
      {
        context: '가족 사진',
        blueprint: {
          primitive: 'image-frame',
          props: { source: 'seed:family', caption: '우리 가족', shape: 'landscape' },
        },
      },
      {
        context: '원터치 연락처 아바타',
        blueprint: {
          primitive: 'image-frame',
          props: { source: 'seed:granddaughter', caption: '손녀', shape: 'circle' },
        },
      },
      {
        context: '운세 위젯의 타로 카드',
        blueprint: {
          primitive: 'image-frame',
          props: { source: 'seed:tarot-star', caption: 'The Star', shape: 'portrait' },
        },
      },
    ],
  },
  {
    type: 'action-button',
    name: '액션 버튼',
    description:
      'A large tappable button with icon + label. Emits an event when tapped. Use for launching apps (YouTube, Netflix), triggering workflows (call family, start workout), or committing to a choice. The emitted event lets the AI react to user interaction.',
    icon: '🔘',
    isContainer: false,
    propsSchema: {
      label: 'Button text',
      icon: 'Emoji or 1-2 chars (e.g. "📞", "▶️", "N")',
      onTapEvent: 'Event type to emit on tap',
      eventPayload: 'Extra data included in the event',
      variant: '"primary" | "ghost" | "danger" | "warm" — styling',
    },
    defaultProps: { label: 'Tap' },
    examples: [
      {
        context: 'YouTube 런처',
        blueprint: {
          primitive: 'action-button',
          props: { label: 'YouTube', icon: '▶️', onTapEvent: 'app.launch', eventPayload: { app: 'youtube' }, variant: 'danger' },
        },
      },
      {
        context: '원터치 손녀 영상통화',
        blueprint: {
          primitive: 'action-button',
          props: { label: '손녀에게 전화', icon: '📞', onTapEvent: 'call.start', eventPayload: { contact: 'granddaughter' }, variant: 'warm' },
        },
      },
    ],
  },
  {
    type: 'progress-ring',
    name: '프로그레스 링',
    description:
      'A circular progress indicator with center text. Use for percentages, completion ratios, daily goals, battery-like metrics, countdowns. Works well in small grid cells (2x2 or 3x3).',
    icon: '⭕',
    isContainer: false,
    propsSchema: {
      value: 'Number 0..1',
      centerText: 'Text inside the ring (defaults to percentage)',
      label: 'Small label below',
      color: 'Optional hex color override',
    },
    defaultProps: { value: 0, label: 'Progress' },
    examples: [
      {
        context: '일일 걸음 목표',
        blueprint: { primitive: 'progress-ring', props: { value: 0.73, centerText: '7.3k', label: '걸음' } },
      },
      {
        context: '하루 무드 스코어',
        blueprint: { primitive: 'progress-ring', props: { value: 0.87, centerText: '87', label: 'Vibe' } },
      },
    ],
  },
];
