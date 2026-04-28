import type { PrimitiveDefinition } from '../../types';
import TextBlockPrimitive, { type TextBlockProps } from './TextBlock';

const definition: PrimitiveDefinition<TextBlockProps> = {
  type: 'text-block',
  name: '텍스트 블록',
  description:
    'Multi-line text display with optional title. Use for quotes, news headlines, memos, recipes, lyrics, descriptions, or any free-form text content. Unlike chat-bubble (conversational, emotional), text-block is neutral and document-like. Supports \\n for line breaks.',
  icon: '📝',
  isContainer: false,

  propsSchema: {
    title: 'Optional small accent-colored heading above the body',
    body: 'Main text content. Use \\n for line breaks.',
    size: '"sm" | "md" | "lg" — font size of the body text',
    align: '"left" | "center" — text alignment',
  },
  defaultProps: { body: '텍스트를 입력하세요', size: 'md', align: 'left' },

  examples: [
    {
      context: '오늘의 명언 위젯',
      blueprint: {
        primitive: 'text-block',
        props: {
          title: '오늘의 명언',
          body: '"당신이 할 수 있다고 생각하든, 할 수 없다고 생각하든 — 당신이 옳다."\n— 헨리 포드',
          size: 'md',
          align: 'center',
        },
      },
    },
    {
      context: '냉장고 재료 메모 위젯',
      blueprint: {
        primitive: 'text-block',
        props: {
          title: '냉장고에 있는 것',
          body: '🥚 달걀 6개\n🥦 브로콜리\n🧀 체다치즈\n🥩 소고기 200g',
          size: 'sm',
          align: 'left',
        },
      },
    },
    {
      context: '넷플릭스 시청 중인 드라마 줄거리 위젯',
      blueprint: {
        primitive: 'stack',
        children: [
          { primitive: 'image-frame', props: { seed: 'drama-poster', shape: 'rounded', caption: '현재 시청 중' } },
          { primitive: 'text-block', props: { title: '줄거리', body: '1990년대 서울을 배경으로 한 가족의 이야기. 매 에피소드마다 반전이 숨어있다.', size: 'sm' } },
        ],
      },
    },
    {
      context: '오늘 요리할 레시피 단계 위젯',
      blueprint: {
        primitive: 'text-block',
        props: {
          title: '오늘 저녁 — 된장찌개',
          body: '1. 두부, 호박, 버섯 손질\n2. 멸치 육수 끓이기\n3. 된장 2큰술 풀기\n4. 재료 넣고 10분 끓이기',
          size: 'sm',
          align: 'left',
        },
      },
    },
  ],

  component: TextBlockPrimitive,
};

export default definition;
