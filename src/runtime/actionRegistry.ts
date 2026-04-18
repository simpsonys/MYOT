import type { ActionContext, ActionResult, WidgetAction } from '../types';

// =====================================================================
// Action Registry
// =====================================================================
// Each mounted widget registers its actions here (keyed by widget id).
// The AI orchestrator uses this to invoke actions by name.
//
// NOTE: ActionContext (updateConfig, emit, speak) is bound when the
// widget is mounted — see widgetController.tsx.
// =====================================================================

type BoundAction = (params?: Record<string, unknown>) => Promise<ActionResult> | ActionResult;

interface Registered {
  widgetType: string;
  actions: Record<string, BoundAction>;
}

const registry = new Map<string, Registered>();

export function registerWidgetActions(
  widgetId: string,
  widgetType: string,
  actions: Record<string, WidgetAction>,
  ctx: ActionContext,
) {
  const bound: Record<string, BoundAction> = {};
  for (const [name, action] of Object.entries(actions)) {
    bound[name] = (params) => action.handler(ctx, params);
  }
  registry.set(widgetId, { widgetType, actions: bound });
}

export function unregisterWidgetActions(widgetId: string) {
  registry.delete(widgetId);
}

export async function invokeAction(
  widgetId: string,
  actionName: string,
  params?: Record<string, unknown>,
): Promise<ActionResult> {
  const entry = registry.get(widgetId);
  if (!entry) return { ok: false, error: `Widget ${widgetId} has no registered actions` };
  const action = entry.actions[actionName];
  if (!action) return { ok: false, error: `Action ${actionName} not found on ${widgetId}` };
  try {
    return await action(params);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function getRegisteredWidgetIds(): string[] {
  return Array.from(registry.keys());
}
