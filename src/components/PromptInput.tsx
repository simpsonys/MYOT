import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
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

declare global {
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((ev: Event) => void) | null;
    onend: ((ev: Event) => void) | null;
    onresult: ((ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function PromptInput() {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const isThinking = useTVStore((s) => s.isThinking);
  const { emit } = useEventBus();

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ko-KR'; // Set language to Korean

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        setValue(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // If there's a final transcript, submit it
        if (value.trim() && !isThinking) {
          submit(value);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    } else {
      console.warn('Speech Recognition not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [value, isThinking, emit]); // Depend on value to ensure submit uses the latest recognized text

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setValue(''); // Clear previous input
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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
          disabled={isThinking || isListening}
          placeholder={
            isListening
              ? '음성 입력 중...'
              : isThinking
              ? 'AI가 프리미티브를 조합 중...'
              : '어떤 위젯을 만들어 드릴까요?'
          }
          className="w-full px-5 py-4 pr-36 rounded-2xl bg-white/5 border border-white/10 focus:border-myot-accent focus:outline-none text-base placeholder:text-white/30 transition-colors"
        />
        <button
          onClick={() => submit(value)}
          disabled={isThinking || !value.trim() || isListening}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-myot-accent text-myot-bg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
        >
          {isThinking ? '...' : '만들기'}
        </button>
        <button
          onClick={toggleListening}
          disabled={isThinking}
          className="absolute right-20 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isListening ? '🔴' : '🎤'}
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
