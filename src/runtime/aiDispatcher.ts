import { useTVStore } from '../store/tvStore';
import { invokeAction } from './actionRegistry';
import { callGemini, type GeminiEnvelope } from '../lib/gemini';
import type { AITraceEntry, AIResponse } from '../types';

// =====================================================================
// AI Dispatcher
// =====================================================================
// Single entry point: user speaks → this runs the orchestrator and
// dispatches the response to the right runtime subsystem.
//
//   layout          → tvStore.applyLayout
//   recommendations → tvStore.setRecommendations
//   invoke_action   → actionRegistry.invokeAction (may emit events)
//   emit_event      → eventBus.emit (via passed-in emitter)
//   error           → speak the error
//
// This keeps the UI layer dumb — any component just calls dispatch().
// =====================================================================

type Emit = (e: { type: string; source: string; payload?: unknown }) => void;

export async function dispatchUserUtterance(
  userInput: string,
  emit: Emit,
): Promise<void> {
  const store = useTVStore.getState();
  const isRecommend = /추천|레이아웃.*(개|보여)|제안/.test(userInput);

  store.setThinking(true);
  store.pushMessage({ role: 'user', text: userInput, timestamp: Date.now() });

  const started = Date.now();
  const response = await callGemini({
    userInput,
    currentLayout: { theme: store.theme, widgets: store.widgets },
    mode: isRecommend ? 'recommend' : 'edit',
  });
  const duration = Date.now() - started;

  store.setThinking(false);

  // Type narrow the envelope
  const envelope = response as GeminiEnvelope;

  // Record trace entry
  const trace: AITraceEntry = {
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    userInput,
    mode: isRecommend ? 'recommend' : 'edit',
    rawResponse: envelope._trace?.rawResponse,
    parsed: envelope as unknown as AIResponse,
    durationMs: envelope._trace?.durationMs ?? duration,
  };
  store.pushTrace(trace);

  switch (envelope.kind) {
    case 'error': {
      const msg = (envelope as any).message ?? 'AI 에러';
      store.setAiMessage(`⚠️ ${msg}`);
      store.pushMessage({ role: 'ai', text: msg, timestamp: Date.now() });
      return;
    }

    case 'recommendations': {
      const recs = (envelope as any).layouts ?? [];
      store.setRecommendations(recs);
      if (recs[0]) store.applyLayout(recs[0]);
      store.pushMessage({
        role: 'ai',
        text: `${recs.length}개의 레이아웃을 추천했어요`,
        timestamp: Date.now(),
      });
      return;
    }

    case 'layout': {
      const layout = (envelope as any).layout;
      if (!layout) break;
      store.applyLayout(layout);
      store.pushMessage({
        role: 'ai',
        text: layout.aiMessage ?? '완료!',
        timestamp: Date.now(),
      });
      return;
    }

    case 'invoke_action': {
      const { widgetId, actionName, params, aiMessage } = envelope as any;
      const result = await invokeAction(widgetId, actionName, params);
      if (aiMessage) store.setAiMessage(aiMessage);
      store.pushMessage({
        role: 'ai',
        text: result.ok
          ? aiMessage ?? `${actionName} 실행 완료`
          : `⚠ 액션 실행 실패: ${result.error}`,
        timestamp: Date.now(),
      });
      return;
    }

    case 'emit_event': {
      const { event, aiMessage } = envelope as any;
      if (event) emit({ type: event.type, source: event.source ?? 'orchestrator', payload: event.payload });
      if (aiMessage) {
        store.setAiMessage(aiMessage);
        store.pushMessage({ role: 'ai', text: aiMessage, timestamp: Date.now() });
      }
      return;
    }

    default:
      store.setAiMessage(`⚠ 알 수 없는 응답: ${envelope.kind}`);
  }
}
