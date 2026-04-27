import type { PrimitiveDefinition } from '../../types';
import VideoPlayerPrimitive, { type VideoPlayerProps } from './VideoPlayer';

const definition: PrimitiveDefinition<VideoPlayerProps> = {
  type: 'video-player',
  name: 'TV 플레이어',
  description:
    'The main TV screen that plays local video/audio files. This is a SYSTEM widget (id: "main-tv-player") always present on screen. It accepts drag-and-drop or file picker to load any local video. Do NOT compose new instances of this primitive — it is pre-placed. Instead, use other primitives for companion widgets around it.',
  icon: '📺',
  isContainer: false,

  propsSchema: {},
  defaultProps: {},

  examples: [],

  component: VideoPlayerPrimitive,
};

export default definition;
