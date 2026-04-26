import type { PrimitiveDefinition } from '../../types';
import MediaBarPrimitive, { type MediaBarProps } from './MediaBar';

const definition: PrimitiveDefinition<MediaBarProps> = {
  type: 'media-bar',
  name: '미디어 바',
  description:
    'Now-playing display for music, video, or podcast. Shows thumbnail, title, subtitle, play/pause button, and a progress bar. Emits "media.togglePlay" on button press. Use for "지금 뭐 틀어?", "음악 위젯", "넷플릭스 시청 중" type requests.',
  icon: '🎵',
  isContainer: false,

  propsSchema: {
    title: 'Track, movie, or episode title',
    subtitle: 'Artist name, channel, or show name',
    thumbnailUrl: 'Direct image URL for album art / thumbnail (optional)',
    thumbnailSeed: 'Seed string for auto-generated placeholder thumbnail (used if thumbnailUrl not set)',
    isPlaying: 'boolean — current playback state',
    progress: 'number 0..1 — playback position',
    mediaType: '"music" | "video" | "podcast" — changes the icon',
  },
  defaultProps: {
    title: '재생 중인 미디어',
    isPlaying: true,
    progress: 0.35,
    mediaType: 'music',
  },

  examples: [
    {
      context: '지금 듣는 음악 위젯',
      blueprint: {
        primitive: 'media-bar',
        props: {
          title: 'Blinding Lights',
          subtitle: 'The Weeknd',
          thumbnailSeed: 'weeknd-blinding',
          isPlaying: true,
          progress: 0.6,
          mediaType: 'music',
        },
      },
    },
    {
      context: '넷플릭스 시청 중 위젯',
      blueprint: {
        primitive: 'media-bar',
        props: {
          title: '오징어 게임 시즌 2',
          subtitle: 'Netflix · EP.5',
          thumbnailSeed: 'squid-game-s2',
          isPlaying: false,
          progress: 0.42,
          mediaType: 'video',
        },
      },
    },
    {
      context: '팟캐스트 청취 위젯',
      blueprint: {
        primitive: 'media-bar',
        props: {
          title: '세상을 바꾼 기술',
          subtitle: 'IT 인사이더 EP.87',
          isPlaying: true,
          progress: 0.2,
          mediaType: 'podcast',
        },
      },
    },
    {
      context: '음악 + 재생 컨트롤 풀 위젯',
      blueprint: {
        primitive: 'stack',
        children: [
          {
            primitive: 'media-bar',
            props: { title: 'As It Was', subtitle: 'Harry Styles', isPlaying: true, progress: 0.55, mediaType: 'music' },
          },
          {
            primitive: 'stat-row',
            children: [
              { primitive: 'action-button', props: { label: '이전', icon: '⏮', onTapEvent: 'media.prev', variant: 'ghost' } },
              { primitive: 'action-button', props: { label: '다음', icon: '⏭', onTapEvent: 'media.next', variant: 'ghost' } },
            ],
          },
        ],
      },
    },
  ],

  component: MediaBarPrimitive,
};

export default definition;
