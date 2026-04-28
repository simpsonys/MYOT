import { useTVStore } from '../store/tvStore';
import { callGemini, type GeminiEnvelope } from '../lib/gemini';
import { generateThemeFromText, generateThemeFromContent } from '../lib/themeGenerator';
import type { AITraceEntry, AIResponse, Theme } from '../types';

type Emit = (e: { type: string; source: string; payload?: unknown }) => void;


/** "테마 생성/변경" 의도 감지 — 단순 조회("현재 테마가 뭐야")는 제외 */
function isThemeGenerationRequest(input: string): boolean {
  return /테마/.test(input) && /(생성|만들어|만들어줘|바꿔|변경|적용|새로|다른|추천)/.test(input);
}

/** 시청이력 기반 테마 감지 */
function isContentBasedTheme(input: string): boolean {
  return /최근|시청|컨텐츠|내가 본|봤던|넷플릭스|왓챠|티빙|내 취향/.test(input);
}

export async function dispatchUserUtterance(
  userInput: string,
  emit: Emit,
): Promise<void> {
  const store = useTVStore.getState();

  store.setThinking(true);
  store.pushMessage({ role: 'user', text: userInput, timestamp: Date.now() });

  // ── 테마 생성 경로 ──────────────────────────────────────────────────
  if (isThemeGenerationRequest(userInput)) {
    const started = Date.now();
    const isContent = isContentBasedTheme(userInput);

    try {
      const result = isContent
        ? await generateThemeFromContent(userInput, store.watchHistory)
        : await generateThemeFromText(userInput);

      store.setThinking(false);
      const duration = Date.now() - started;

      if (!result) {
        store.setAiMessage('⚠️ 테마 생성에 실패했어요');
        store.pushMessage({ role: 'ai', text: '테마 생성에 실패했어요', timestamp: Date.now() });
        return;
      }

      // 컨텐츠 기반 테마: backdrop(가로) → 없으면 poster(세로)를 배경 이미지로 설정
      const bgImage = isContent
        ? (result.backdropUrl ?? result.posterUrl ?? undefined)
        : undefined;

      const themeWithName: Theme = {
        ...result.theme,
        themeName: result.themeName,
        backgroundImage: bgImage,
      };
      store.applyTheme(themeWithName);

      const aiMsg = result.aiMessage ?? `${result.themeName ?? '새 테마'} 생성 완료!`;
      store.pushMessage({ role: 'ai', text: aiMsg, timestamp: Date.now() });

      // Trace 기록 (generate_theme 응답 형식으로)
      const trace: AITraceEntry = {
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        userInput,
        mode: 'edit',
        parsed: {
          kind: 'generate_theme',
          theme: themeWithName,
          themeName: result.themeName,
          aiMessage: aiMsg,
        } as AIResponse,
        durationMs: duration,
      };
      store.pushTrace(trace);
    } catch {
      store.setThinking(false);
      store.setAiMessage('⚠️ 테마 생성 중 오류가 발생했어요');
      store.pushMessage({ role: 'ai', text: '테마 생성 중 오류가 발생했어요', timestamp: Date.now() });
    }
    return;
  }

  // ── 기존 위젯/레이아웃 경로 ────────────────────────────────────────
  const isRecommend = /추천|레이아웃.*(개|보여)|제안/.test(userInput);

  const started = Date.now();
  const response = (await callGemini({
    userInput,
    currentLayout: { theme: store.theme, widgets: store.widgets },
    mode: isRecommend ? 'recommend' : 'edit',
  })) as GeminiEnvelope;
  const duration = Date.now() - started;

  store.setThinking(false);

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

      store.pushMessage({
        role: 'ai',
        text: aiMessage ?? '수정 완료!',
        timestamp: Date.now(),
      });
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
      store.pushMessage({
        role: 'ai',
        text: aiMessage ?? '이벤트를 전송했어요',
        timestamp: Date.now(),
      });
      return;
    }

    // 오케스트레이터가 generate_theme를 직접 반환하는 경우에 대비한 핸들러
    case 'generate_theme': {
      const { theme, themeName, aiMessage } = response as any;
      if (theme) {
        store.applyTheme({ ...theme, themeName });
      }
      store.pushMessage({
        role: 'ai',
        text: aiMessage ?? `${themeName ?? '새 테마'} 적용 완료!`,
        timestamp: Date.now(),
      });
      return;
    }

    default:
      store.setAiMessage(`⚠ 알 수 없는 응답: ${String(response.kind)}`);
  }
}
