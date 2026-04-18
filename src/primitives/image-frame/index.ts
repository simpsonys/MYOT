import type { PrimitiveDefinition } from '../../types';
import ImageFramePrimitive, { type ImageFrameProps } from './ImageFrame';

const definition: PrimitiveDefinition<ImageFrameProps> = {
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

  component: ImageFramePrimitive,
};

export default definition;
