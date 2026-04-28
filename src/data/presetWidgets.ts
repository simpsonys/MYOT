import type { PrimitiveNode, WidgetStyle } from '../types';

export interface PresetWidget {
  templateId: string;
  label: string;
  emoji: string;
  category: '건강' | '미디어' | '생활' | '정보' | '가족';
  tagline: string;
  root: PrimitiveNode;
  style?: WidgetStyle;
}

export const PRESET_WIDGETS: PresetWidget[] = [
  // ── 1. 러닝 대시보드 ──────────────────────────────────────────────
  {
    templateId: 'running-dashboard',
    label: '러닝 대시보드',
    emoji: '🏃',
    category: '건강',
    tagline: '오늘의 러닝 기록 한눈에',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'stat-row',
          children: [
            { primitive: 'stat-tile', props: { value: '5.2', unit: 'km', label: '거리', accent: true } },
            { primitive: 'stat-tile', props: { value: '28', unit: '분', label: '시간' } },
            { primitive: 'stat-tile', props: { value: "5'24\"", label: '페이스' } },
          ],
        },
        {
          primitive: 'progress-ring',
          props: { value: 0.73, centerText: '73%', label: '주간 목표', color: '#00D4FF' },
        },
        {
          primitive: 'chat-bubble',
          props: { text: '오늘도 파이팅! 목표까지 1.8km 남았어요 🏃', speaker: 'ai', tone: 'celebrate' },
        },
      ],
    },
  },

  // ── 2. 음악 플레이어 ──────────────────────────────────────────────
  {
    templateId: 'music-player',
    label: '음악 플레이어',
    emoji: '🎵',
    category: '미디어',
    tagline: '지금 재생 중인 곡과 컨트롤',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'media-bar',
          props: {
            title: 'As It Was',
            subtitle: 'Harry Styles',
            thumbnailSeed: 'music-album-pop',
            isPlaying: true,
            progress: 0.55,
            mediaType: 'music',
          },
        },
        {
          primitive: 'stat-row',
          children: [
            { primitive: 'action-button', props: { label: '이전', icon: '⏮', onTapEvent: 'media.prev', variant: 'ghost' } },
            { primitive: 'action-button', props: { label: '일시정지', icon: '⏸', onTapEvent: 'media.togglePlay', variant: 'primary' } },
            { primitive: 'action-button', props: { label: '다음', icon: '⏭', onTapEvent: 'media.next', variant: 'ghost' } },
          ],
        },
      ],
    },
  },

  // ── 3. 오늘의 날씨 ────────────────────────────────────────────────
  {
    templateId: 'weather-week',
    label: '오늘의 날씨',
    emoji: '🌤️',
    category: '정보',
    tagline: '현재 날씨 + 주간 예보',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'stat-row',
          children: [
            { primitive: 'stat-tile', props: { value: '22', unit: '°C', label: '현재 기온', accent: true } },
            { primitive: 'stat-tile', props: { value: '65', unit: '%', label: '습도' } },
            { primitive: 'stat-tile', props: { value: '4', unit: 'm/s', label: '바람' } },
          ],
        },
        {
          primitive: 'calendar-strip',
          props: {
            title: '이번 주 날씨',
            days: [
              { label: '월', sublabel: '☀️ 22°', active: true },
              { label: '화', sublabel: '⛅ 19°' },
              { label: '수', sublabel: '🌧️ 15°', accent: true },
              { label: '목', sublabel: '⛅ 18°' },
              { label: '금', sublabel: '☀️ 23°' },
              { label: '토', sublabel: '☀️ 25°' },
              { label: '일', sublabel: '🌤️ 21°' },
            ],
          },
        },
        {
          primitive: 'chat-bubble',
          props: { text: '수요일에 비가 오니 우산 챙기세요 ☔', speaker: 'ai', tone: 'caution' },
        },
      ],
    },
  },

  // ── 4. 가족 포토 메모 ─────────────────────────────────────────────
  {
    templateId: 'family-photo-memo',
    label: '가족 포토 메모',
    emoji: '👨‍👩‍👧',
    category: '가족',
    tagline: '가족 사진과 따뜻한 한마디',
    root: {
      primitive: 'stack',
      children: [
        { primitive: 'image-frame', props: { source: 'seed:family-portrait', caption: '우리 가족 ❤️', shape: 'landscape' } },
        { primitive: 'text-block', props: { body: '오늘도 건강하게, 사랑해요 ❤️\n집에 오면 맛있는 거 해줄게요', size: 'md', align: 'center' } },
        { primitive: 'action-button', props: { label: '영상통화 하기', icon: '📞', onTapEvent: 'call.family', variant: 'warm' } },
      ],
    },
  },

  // ── 5. 오늘 루틴 체크 ─────────────────────────────────────────────
  {
    templateId: 'daily-routine',
    label: '오늘 루틴',
    emoji: '✅',
    category: '생활',
    tagline: '하루 일과 진행 상황',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'progress-ring',
          props: { value: 0.4, centerText: '4/10', label: '오늘 할 일', color: '#8B5CF6' },
        },
        {
          primitive: 'timeline',
          props: {
            title: '오늘 일정',
            compact: true,
            items: [
              { time: '07:00', label: '기상 & 스트레칭', done: true },
              { time: '09:00', label: '오전 업무', done: true },
              { time: '12:00', label: '점심 식사', accent: true },
              { time: '14:00', label: '오후 미팅' },
              { time: '18:00', label: '운동 30분' },
              { time: '21:00', label: '독서' },
            ],
          },
        },
      ],
    },
  },

  // ── 6. 건강 목표 트래커 ───────────────────────────────────────────
  {
    templateId: 'health-tracker',
    label: '건강 목표 트래커',
    emoji: '💪',
    category: '건강',
    tagline: '걸음수·칼로리·수분 목표',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'stat-row',
          children: [
            { primitive: 'stat-tile', props: { value: '7,340', label: '걸음수', accent: true } },
            { primitive: 'stat-tile', props: { value: '1,820', unit: 'kcal', label: '소모' } },
          ],
        },
        {
          primitive: 'gauge-bar',
          props: { value: 0.73, label: '걸음 목표', valueLabel: '7,340 / 10,000', color: '#00D4FF' },
        },
        {
          primitive: 'gauge-bar',
          props: { value: 0.5, label: '수분 섭취', valueLabel: '1.0 / 2.0 L', color: '#10B981' },
        },
        {
          primitive: 'chat-bubble',
          props: { text: '걸음 목표 73%! 2,660걸음만 더 걸어요 👟', speaker: 'ai', tone: 'comfort' },
        },
      ],
    },
  },

  // ── 7. 볼 영상 추천 ───────────────────────────────────────────────
  {
    templateId: 'watch-recommendation',
    label: '볼 영상 골라줘',
    emoji: '🍿',
    category: '미디어',
    tagline: 'AI가 추천하는 오늘의 영상',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'chat-bubble',
          props: { text: '오늘 분위기에 맞는 영상을 골라봤어요 🍿', speaker: 'ai', tone: 'neutral' },
        },
        {
          primitive: 'choice-list',
          props: {
            onPickEvent: 'watch.pick',
            items: [
              { title: '기생충', subtitle: '봉준호 감독 · 2019', badge: '아카데미상', rank: 1 },
              { title: '이상한 변호사 우영우', subtitle: 'ENA 드라마 · 16부작', badge: '재방송 추천', rank: 2 },
              { title: '유 퀴즈 온 더 블럭', subtitle: 'tvN 예능 · 최신화', badge: '신규', rank: 3 },
            ],
          },
        },
      ],
    },
  },

  // ── 8. 오늘의 명언 ────────────────────────────────────────────────
  {
    templateId: 'quote-of-day',
    label: '오늘의 명언',
    emoji: '💬',
    category: '생활',
    tagline: '하루를 시작하는 한 마디',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'image-frame',
          props: { source: 'seed:mountain-sunrise', shape: 'landscape' },
        },
        {
          primitive: 'text-block',
          props: {
            title: '오늘의 명언',
            body: '"당신이 할 수 있다고 믿든,\n할 수 없다고 믿든,\n어느 쪽이든 옳다."\n\n— 헨리 포드',
            size: 'md',
            align: 'center',
          },
        },
      ],
    },
  },

  // ── 9. 주간 캘린더 ────────────────────────────────────────────────
  {
    templateId: 'weekly-calendar',
    label: '주간 캘린더',
    emoji: '📅',
    category: '생활',
    tagline: '이번 주 일정 + 오늘 타임라인',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'calendar-strip',
          props: {
            title: '이번 주',
            days: [
              { label: '월', sublabel: '업무', done: true },
              { label: '화', sublabel: '헬스' },
              { label: '수', sublabel: '회의', active: true },
              { label: '목', sublabel: '독서' },
              { label: '금', sublabel: '약속', accent: true },
              { label: '토', sublabel: '휴식' },
              { label: '일', sublabel: '가족' },
            ],
          },
        },
        {
          primitive: 'timeline',
          props: {
            title: '오늘 일정',
            compact: true,
            items: [
              { time: '10:00', label: '팀 미팅', done: true },
              { time: '13:00', label: '점심 - 삼겹살', accent: true },
              { time: '15:00', label: '보고서 작성' },
              { time: '19:00', label: '저녁 운동' },
            ],
          },
        },
      ],
    },
  },

  // ── 10. D-Day 카운터 ──────────────────────────────────────────────
  {
    templateId: 'dday-counter',
    label: 'D-Day 카운터',
    emoji: '🎂',
    category: '가족',
    tagline: '중요한 날까지 남은 시간',
    root: {
      primitive: 'stack',
      children: [
        {
          primitive: 'stat-row',
          children: [
            { primitive: 'stat-tile', props: { value: 'D-14', label: '아내 생일', accent: true } },
            { primitive: 'stat-tile', props: { value: 'D-47', label: '결혼기념일' } },
          ],
        },
        {
          primitive: 'calendar-strip',
          props: {
            title: '다가오는 날',
            days: [
              { label: '오늘', sublabel: '4/28', active: true },
              { label: 'D-14', sublabel: '5/12', accent: true },
              { label: 'D-47', sublabel: '6/14' },
            ],
          },
        },
        {
          primitive: 'chat-bubble',
          props: { text: '아내 생일이 14일 남았어요! 선물 준비하셨나요? 🎁', speaker: 'ai', tone: 'caution' },
        },
        {
          primitive: 'action-button',
          props: { label: '선물 메모하기', icon: '🎁', onTapEvent: 'note.gift', variant: 'warm' },
        },
      ],
    },
  },
];
