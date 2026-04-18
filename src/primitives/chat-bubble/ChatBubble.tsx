import type { PrimitiveProps } from '../../types';

export interface ChatBubbleProps {
  text: string;
  speaker?: 'ai' | 'user' | 'system';
  tone?: 'neutral' | 'celebrate' | 'caution' | 'comfort';
}

const TONE_EMOJI: Record<NonNullable<ChatBubbleProps['tone']>, string> = {
  neutral: '💬',
  celebrate: '🎉',
  caution: '⚠️',
  comfort: '💙',
};

const SPEAKER_PREFIX: Record<NonNullable<ChatBubbleProps['speaker']>, string> = {
  ai: '🤖',
  user: '👤',
  system: '✨',
};

export default function ChatBubblePrimitive({
  props,
  theme,
}: PrimitiveProps<ChatBubbleProps>) {
  const speaker = props.speaker ?? 'ai';
  const tone = props.tone ?? 'neutral';
  const isAI = speaker === 'ai' || speaker === 'system';

  const bg =
    tone === 'celebrate'
      ? 'linear-gradient(135deg, rgba(255,215,61,0.25), rgba(255,107,107,0.15))'
      : tone === 'caution'
      ? 'rgba(255,107,107,0.2)'
      : tone === 'comfort'
      ? 'rgba(0,212,255,0.15)'
      : 'rgba(0,0,0,0.3)';

  return (
    <div
      className="w-full rounded-xl px-3 py-2 text-sm leading-snug"
      style={{
        background: bg,
        color: isAI ? theme.accentColor : '#FFFFFF',
      }}
    >
      <span className="opacity-70 mr-1 text-xs">
        {SPEAKER_PREFIX[speaker]} {TONE_EMOJI[tone]}
      </span>
      {props.text}
    </div>
  );
}
