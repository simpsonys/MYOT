import type { Theme, WidgetBlueprint } from '../types';
import { MAIN_PLAYER_ID } from '../store/tvStore';

export interface PresetLayout {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  theme: Theme;
  widgets: WidgetBlueprint[];
}

const player = (colspan: number, rowspan: number, col = 1, row = 1): WidgetBlueprint => ({
  id: MAIN_PLAYER_ID,
  label: 'TV 플레이어',
  grid: { col, row, colspan, rowspan },
  root: { primitive: 'video-player' },
  style: { background: 'transparent', opacity: 1, padding: 0 },
});

// ── Preset 1: 홈 시어터 ──────────────────────────────────────────
// TV가 화면의 2/3 차지 + 오른쪽에 시계 & 환영 위젯

const HOME_THEATER: PresetLayout = {
  id: 'home-theater',
  name: '홈 시어터',
  emoji: '🎬',
  tagline: 'TV가 주인공',
  description: '대형 TV 화면 옆에 시계와 AI 코멘트가 함께',
  theme: {
    mode: 'dark',
    backgroundColor: '#0A0E1A',
    accentColor: '#00D4FF',
    widgetBackground: 'rgba(14,20,38,0.75)',
    textPrimaryColor: '#C4CAD4',
    widgetOpacity: 0.95,
    widgetBorderRadius: 16,
    fontStyle: 'modern',
  },
  widgets: [
    player(8, 7),
    {
      id: 'ht-clock',
      label: '시계',
      grid: { col: 9, row: 1, colspan: 4, rowspan: 3 },
      root: { primitive: 'clock-face', props: { style: 'digital', showDate: true, showSeconds: false } },
    },
    {
      id: 'ht-welcome',
      label: '웰컴',
      grid: { col: 9, row: 4, colspan: 4, rowspan: 5 },
      root: {
        primitive: 'stack',
        children: [
          {
            primitive: 'chat-bubble',
            props: { text: '안녕하세요! 영상을 불러오거나 아래 발화창으로 위젯을 추가해보세요 😊', speaker: 'ai', tone: 'neutral' },
          },
          {
            primitive: 'action-button',
            props: { label: '위젯 추가하기', icon: '✨', onTapEvent: 'ui.openPrompt', variant: 'ghost' },
          },
        ],
      },
    },
  ],
};

// ── Preset 2: 시네마 와이드 ──────────────────────────────────────
// TV가 전체 너비 상단 6행 + 하단에 미디어 정보 & 빠른 스탯

const CINEMA_WIDE: PresetLayout = {
  id: 'cinema-wide',
  name: '시네마 와이드',
  emoji: '🎞',
  tagline: '와이드 스크린',
  description: '전체 너비 TV 화면 + 하단 미디어 정보 바',
  theme: {
    mode: 'dark',
    backgroundColor: '#060810',
    accentColor: '#FF6B35',
    widgetBackground: 'rgba(12,14,22,0.8)',
    textPrimaryColor: '#D4C8B8',
    widgetOpacity: 0.9,
    widgetBorderRadius: 12,
    fontStyle: 'minimal',
  },
  widgets: [
    player(12, 6),
    {
      id: 'cw-media',
      label: '미디어 정보',
      grid: { col: 1, row: 7, colspan: 6, rowspan: 2 },
      root: {
        primitive: 'media-bar',
        props: { title: '재생할 영상을 선택하세요', subtitle: 'Myot Player', isPlaying: false, progress: 0, mediaType: 'video' },
      },
    },
    {
      id: 'cw-stats',
      label: '빠른 정보',
      grid: { col: 7, row: 7, colspan: 6, rowspan: 2 },
      root: {
        primitive: 'stat-row',
        children: [
          { primitive: 'clock-face', props: { style: 'minimal', showDate: false, showSeconds: false } },
          { primitive: 'stat-tile', props: { value: '—', label: '오늘 시청', unit: '편' } },
          { primitive: 'stat-tile', props: { value: '24°', unit: 'C', label: '실내 온도', accent: true } },
        ],
      },
    },
  ],
};

// ── Preset 3: 스마트 대시보드 ────────────────────────────────────
// TV 왼쪽 7칸 + 오른쪽에 시계·일정·게이지 수직 배치

const SMART_DASHBOARD: PresetLayout = {
  id: 'smart-dashboard',
  name: '스마트 대시보드',
  emoji: '📊',
  tagline: 'TV + 정보 한눈에',
  description: '아날로그 시계·일정·목표 게이지가 TV 옆에',
  theme: {
    mode: 'dark',
    backgroundColor: '#0D1117',
    accentColor: '#8B5CF6',
    widgetBackground: 'rgba(17,22,32,0.8)',
    textPrimaryColor: '#C9D1D9',
    widgetOpacity: 0.92,
    widgetBorderRadius: 18,
    fontStyle: 'modern',
  },
  widgets: [
    player(7, 8),
    {
      id: 'sd-clock',
      label: '아날로그 시계',
      grid: { col: 8, row: 1, colspan: 5, rowspan: 3 },
      root: { primitive: 'clock-face', props: { style: 'analog', showDate: true, showSeconds: true } },
    },
    {
      id: 'sd-timeline',
      label: '오늘 일정',
      grid: { col: 8, row: 4, colspan: 5, rowspan: 3 },
      root: {
        primitive: 'timeline',
        props: {
          title: '오늘 일정',
          compact: true,
          items: [
            { time: '오전', label: '일정을 발화로 추가해보세요', accent: true },
            { time: '오후', label: '"오늘 오후 3시 회의 추가해줘"' },
            { time: '저녁', label: '자유롭게 편집 가능합니다' },
          ],
        },
      },
    },
    {
      id: 'sd-goal',
      label: '오늘의 목표',
      grid: { col: 8, row: 7, colspan: 5, rowspan: 2 },
      root: {
        primitive: 'gauge-bar',
        props: { value: 0.05, label: '오늘의 목표', valueLabel: '발화로 업데이트하세요', color: '#8B5CF6' },
      },
    },
  ],
};

export const PRESET_LAYOUTS: PresetLayout[] = [HOME_THEATER, CINEMA_WIDE, SMART_DASHBOARD];
