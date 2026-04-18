import type { PrimitiveDefinition } from '../../types';
import ChatBubblePrimitive, { type ChatBubbleProps } from './ChatBubble';

const definition: PrimitiveDefinition<ChatBubbleProps> = {
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
        props: {
          text: '오늘 5.2km 완주! 어제보다 +0.3km 이에요',
          speaker: 'ai',
          tone: 'celebrate',
        },
      },
    },
    {
      context: '회복 권유',
      blueprint: {
        primitive: 'chat-bubble',
        props: {
          text: '오늘은 푹 쉬세요. 내일 더 잘 달릴 수 있어요',
          speaker: 'ai',
          tone: 'comfort',
        },
      },
    },
  ],

  component: ChatBubblePrimitive,
};

export default definition;
