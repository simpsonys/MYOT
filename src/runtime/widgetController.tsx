import { useEffect, useMemo } from 'react';
import { useTVStore } from '../store/tvStore';
import { getWidget } from '../widgets/registry';
import type { Theme, WidgetEvent, WidgetInstance } from '../types';
import { useEventBus } from './eventBus';
import { registerWidgetActions, unregisterWidgetActions } from './actionRegistry';

interface Props {
  widget: WidgetInstance;
  theme: Theme;
}

/**
 * WidgetController wraps a widget instance and:
 *   1. Registers its actions with a live ActionContext bound to this instance
 *   2. Subscribes to any events the widget's definition says it listens for
 *   3. Renders the actual widget component
 *
 * This is the glue between a widget's static declaration and its runtime
 * behavior. Team members never touch this — it "just works" because their
 * widget's index.ts declares what it wants.
 */
export function WidgetController({ widget, theme }: Props) {
  const def = getWidget(widget.type);
  const { emit, subscribe } = useEventBus();
  const updateWidgetConfig = useTVStore((s) => s.updateWidgetConfig);
  const setAiMessage = useTVStore((s) => s.setAiMessage);

  // Build ActionContext & register actions
  const actionCtx = useMemo(
    () => ({
      widgetId: widget.id,
      currentConfig: widget.config,
      theme,
      updateConfig: (patch: Record<string, unknown>) =>
        updateWidgetConfig(widget.id, patch),
      emit: (e: WidgetEvent) => emit({ ...e, source: widget.id }),
      speak: (msg: string) => setAiMessage(msg),
    }),
    [widget.id, widget.config, theme, updateWidgetConfig, emit, setAiMessage],
  );

  useEffect(() => {
    if (!def || !def.actions) return;
    registerWidgetActions(widget.id, def.type, def.actions, actionCtx);
    return () => unregisterWidgetActions(widget.id);
  }, [def, widget.id, actionCtx]);

  // Subscribe to listened event types (if widget declared any)
  useEffect(() => {
    if (!def?.listensFor?.length) return;
    const unsubs = def.listensFor.map((type) =>
      subscribe(type, (event) => {
        // Widget-level listeners emit events visible in the dev log, but
        // actual response logic belongs inside the widget component via
        // useWidgetEvent. This global subscribe is here for telemetry.
        console.debug(`[Widget:${widget.id}] observed ${type}`, event);
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [def, widget.id, subscribe]);

  if (!def) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-950/30 text-red-400 text-xs rounded-xl p-3">
        Unknown widget type: <strong className="ml-1">{widget.type}</strong>
      </div>
    );
  }

  const Cmp = def.component;
  const mergedConfig = { ...def.defaultConfig, ...widget.config };

  return (
    <Cmp
      id={widget.id}
      config={mergedConfig}
      style={widget.style ?? {}}
      theme={theme}
    />
  );
}
