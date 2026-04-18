import { useState } from 'react';
import { callGemini } from '../../lib/gemini';
import { useTVStore } from '../../store/tvStore';

export function UtteranceTester() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [promptPreview, setPromptPreview] = useState<string | null>(null);
  const { theme, widgets } = useTVStore();

  async function test() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    const res = await callGemini({
      userInput: input,
      currentLayout: { theme, widgets },
      mode: 'edit',
    });
    setLoading(false);
    setResult(res);
  }

  async function showPrompt() {
    const res = await callGemini({
      userInput: 'dummy',
      currentLayout: { theme, widgets },
      mode: 'edit',
      dryRun: true,
    });
    if (
      'systemPromptPreview' in res &&
      typeof res.systemPromptPreview === 'string'
    ) {
      setPromptPreview(res.systemPromptPreview);
    }
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="opacity-60">
        발화를 넣으면 AI가 어떤 블루프린트를 만들지 실제 TV에 적용하지 않고 확인할 수 있어요.
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && test()}
          placeholder="발화 입력..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-myot-accent focus:outline-none"
        />
        <button
          onClick={test}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-myot-accent text-myot-bg font-bold disabled:opacity-40"
        >
          {loading ? '...' : '테스트'}
        </button>
      </div>

      {result && (
        <div className="rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed max-h-64 overflow-auto">
          <div className="mb-1 opacity-60">AI 응답 (JSON):</div>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="pt-2 border-t border-white/10">
        <button
          onClick={showPrompt}
          className="text-[11px] underline opacity-60 hover:opacity-100"
        >
          {promptPreview ? '시스템 프롬프트 접기' : '현재 AI 시스템 프롬프트 보기'}
        </button>
        {promptPreview && (
          <div className="mt-2 rounded-lg bg-black/40 p-3 font-mono text-[10px] leading-relaxed max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{promptPreview}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
