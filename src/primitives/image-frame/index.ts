import type { PrimitiveDefinition } from '../../types';
import ImageFramePrimitive, { type ImageFrameProps } from './ImageFrame';

const definition: PrimitiveDefinition<ImageFrameProps> = {
  type: 'image-frame',
  name: '이미지 프레임',
  description:
    'Display an image with optional caption. Use for character illustrations, avatars, landscapes, placeholders. For character/avatar images use DiceBear adventurer URL (e.g. "https://api.dicebear.com/8.x/adventurer/svg?seed=Sakura&backgroundColor=ffd5dc"). For scenery/objects use "seed:<word>" to get a deterministic mock image from picsum.',
  icon: '🖼️',
  isContainer: false,

  propsSchema: {
    source: 'URL or "seed:<word>" for scenery mock. For character illustration use DiceBear: "https://api.dicebear.com/8.x/adventurer/svg?seed=<name>&backgroundColor=ffd5dc"',
    caption: 'Optional caption overlay',
    shape: '"square" | "circle" | "portrait" | "landscape" | "fill" (default)',
  },
  defaultProps: { source: 'seed:placeholder' },

  examples: [
    {
      context: '아름다운 여성 캐릭터 그림',
      blueprint: {
        primitive: 'image-frame',
        props: { source: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Sakura&backgroundColor=ffd5dc', caption: '오늘도 좋은 하루 ✨', shape: 'portrait' },
      },
    },
    {
      context: '원터치 연락처 아바타',
      blueprint: {
        primitive: 'image-frame',
        props: { source: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Hana&backgroundColor=b6e3f4', caption: '손녀', shape: 'circle' },
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

  component: ImageFramePrimitive,
};

export default definition;
