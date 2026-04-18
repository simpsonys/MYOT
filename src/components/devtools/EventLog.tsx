import { useEventBus } from '../../runtime/eventBus';
import { useTVStore } from '../../store/tvStore';

export function EventLog() {
  const { history, clearHistory } = useEventBus();
  const reversed = [...history].reverse();

  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="opacity-60">
          위젯이 발생시킨 이벤트들 ({history.length})
        </div>
        <button
          onClick={clearHistory}
          className="text-[10px] opacity-50 hover:opacity-100 underline"
        >
          비우기
        </button>
      </div>
      {reversed.length === 0 ? (
        <div className="opacity-40 italic">아직 이벤트가 없어요</div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-auto">
          {reversed.map((e, i) => (
            <div key={i} className="rounded bg-white/5 px-2 py-1.5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-myot-accent">{e.type}</span>
                <span className="text-[10px] opacity-40">
                  {new Date(e.timestamp ?? 0).toLocaleTimeString('ko-KR')}
                </span>
              </div>
              <div className="opacity-60 text-[10px]">from {e.source}</div>
              {e.payload != null && (
                <pre className="text-[10px] mt-1 opacity-70 whitespace-pre-wrap break-words">
                  {JSON.stringify(e.payload)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AITraceViewer() {
  const { trace, clearTrace } = useTVStore();
  const reversed = [...trace].reverse();

  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="opacity-60">최근 AI 결정 트레이스 ({trace.length})</div>
        <button
          onClick={clearTrace}
          className="text-[10px] opacity-50 hover:opacity-100 underline"
        >
          비우기
        </button>
      </div>
      {reversed.length === 0 ? (
        <div className="opacity-40 italic">아직 AI 호출이 없어요</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-auto">
          {reversed.map((t) => {
            const parsed = t.parsed as any;
            return (
              <div key={t.id} className="rounded bg-white/5 p-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold">"{t.userInput}"</span>
                  <span className="text-[10px] opacity-40">{t.durationMs}ms</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      parsed?.kind === 'invoke_action'
                        ? 'bg-purple-500/30 text-purple-200'
                        : parsed?.kind === 'layout'
                        ? 'bg-cyan-500/30 text-cyan-200'
                        : parsed?.kind === 'recommendations'
                        ? 'bg-amber-500/30 text-amber-200'
                        : 'bg-rose-500/30 text-rose-200'
                    }`}
                  >
                    {parsed?.kind}
                  </span>
                  {parsed?.kind === 'invoke_action' && (
                    <span className="font-mono text-[10px] opacity-70">
                      {parsed.widgetId}.{parsed.actionName}()
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
