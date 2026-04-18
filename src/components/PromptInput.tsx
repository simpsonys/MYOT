import { useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { useTVStore } from '../store/tvStore';
import { dispatchUserUtterance } from '../runtime/aiDispatcher';
import { useEventBus } from '../runtime/eventBus';

const EXAMPLES = [
  '추천 레이아웃 3개 보여줘',
  '러닝 경로 위젯 만들어줘',
  '오늘 운세 위젯도 하나 띄워줘',
  '이 정도면 가뿐한데 더 늘려볼까',
  '아내 사진 크게 왼쪽에',
  '손녀 영상통화 버튼 만들어줘',
  'D-Day 위젯 — 아내 생일까지',
  '블랙 테마, 투명도 50%',
];

export function PromptInput() {
  const [value, setValue] = useState('');
  const isThinking = useTVStore((s) => s.isThinking);
  const { emit } = useEventBus();

  async function submit(text: string) {
    if (!text.trim() || isThinking) return;
    setValue('');
    await dispatchUserUtterance(text, emit);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(value);
    }
  }

  return (
    <div className="w-full">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isThinking}
          placeholder={
            isThinking
              ? 'AI가 프리미티브를 조합 중...'
              : '어떤 위젯을 만들어 드릴까요?'
          }
          className="w-full px-5 py-4 pr-28 rounded-2xl bg-white/5 border border-white/10 focus:border-myot-accent focus:outline-none text-base placeholder:text-white/30 transition-colors"
        />
        <button
          onClick={() => submit(value)}
          disabled={isThinking || !value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-myot-accent text-myot-bg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
        >
          {isThinking ? '...' : '만들기'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {EXAMPLES.map((ex) => (
          <motion.button
            key={ex}
            onClick={() => submit(ex)}
            disabled={isThinking}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-40"
          >
            {ex}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
