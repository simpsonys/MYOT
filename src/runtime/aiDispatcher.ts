import { useTVStore } from '../store/tvStore';
import { callGemini, type GeminiEnvelope } from '../lib/gemini';
import type { AITraceEntry, AIResponse } from '../types';

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
  const response = (await callGemini({
    userInput,
    currentLayout: { theme: store.theme, widgets: store.widgets },
    mode: isRecommend ? 'recommend' : 'edit',
  })) as GeminiEnvelope;
  const duration = Date.now() - started;

  store.setThinking(false);

  // Record trace
  const trace: AITraceEntry = {
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    userInput,
    mode: isRecommend ? 'recommend' : 'edit',
    rawResponse:
      (response._trace as { rawResponse?: string } | undefined)?.rawResponse,
    parsed: response as unknown as AIResponse,
    durationMs:
      (response._trace as { durationMs?: number } | undefined)?.durationMs ?? duration,
  };
  store.pushTrace(trace);

  switch (response.kind) {
    case 'error': {
      const msg = String(response.message ?? 'AI 에러');
      store.setAiMessage(`⚠️ ${msg}`);
      store.pushMessage({ role: 'ai', text: msg, timestamp: Date.now() });
      return;
    }

    case 'recommendations': {
      const recs = (response.layouts as any[]) ?? [];
      store.setRecommendations(recs as any);
      if (recs[0]) store.applyLayout(recs[0]);
      store.pushMessage({
        role: 'ai',
        text: `${recs.length}개의 레이아웃을 추천했어요`,
        timestamp: Date.now(),
      });
      return;
    }

    case 'layout': {
      const layout = response.layout as any;
      if (!layout) break;
      store.applyLayout(layout);
      store.pushMessage({
        role: 'ai',
        text: layout.aiMessage ?? '완료!',
        timestamp: Date.now(),
      });
      return;
    }

    case 'compose_widget': {
      const widget = response.widget as any;
      const preserve = response.preserveExisting ?? true;
      const aiMsg = response.aiMessage as string | undefined;
      if (widget) {
        store.composeWidget(widget, Boolean(preserve));
      }
      if (aiMsg) store.setAiMessage(aiMsg);
      store.pushMessage({
        role: 'ai',
        text: aiMsg ?? `${widget?.label ?? '위젯'} 조립 완료`,
        timestamp: Date.now(),
      });
      return;
    }

    case 'mutate_widget': {
      const { widgetId, op, aiMessage } = response as any;
      if (!widgetId || !op) break;

      switch (op.type) {
        case 'replace_root':
          store.mutateWidgetRoot(widgetId, op.node);
          break;
        case 'append_child':
          store.mutateWidgetAppend(widgetId, op.parentPath ?? [], op.node);
          break;
        case 'replace_node':
          store.mutateWidgetReplace(widgetId, op.path ?? [], op.node);
          break;
        case 'remove_node':
          store.mutateWidgetRemove(widgetId, op.path ?? []);
          break;
        case 'update_props':
          store.mutateWidgetProps(widgetId, op.path ?? [], op.props ?? {});
          break;
      }

      if (aiMessage) {
        store.setAiMessage(aiMessage);
        store.pushMessage({ role: 'ai', text: aiMessage, timestamp: Date.now() });
      }
      return;
    }

    case 'emit_event': {
      const { event, aiMessage } = response as any;
      if (event) {
        emit({
          type: event.type,
          source: event.source ?? 'orchestrator',
          payload: event.payload,
        });
      }
      if (aiMessage) {
        store.setAiMessage(aiMessage);
        store.pushMessage({ role: 'ai', text: aiMessage, timestamp: Date.now() });
      }
      return;
    }

    default:
      store.setAiMessage(`⚠ 알 수 없는 응답: ${String(response.kind)}`);
  }
}
