import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { WidgetEvent } from '../types';

// =====================================================================
// Event Bus (React Context + Custom Hook)
// =====================================================================
// Any widget can emit or subscribe to events.
// Use '*' to subscribe to everything (useful for Dev Tools).
//
// Design choices:
//  - Subscriptions live in a ref (no re-renders when subs change)
//  - History is capped at 100 entries (visible in Dev Tools)
//  - Events are synchronous — handlers run in emit order
// =====================================================================

type Handler = (e: WidgetEvent) => void;

interface EventBusContextValue {
  emit: (event: Omit<WidgetEvent, 'timestamp'>) => void;
  subscribe: (type: string, handler: Handler) => () => void;
  history: WidgetEvent[];
  clearHistory: () => void;
}

const Ctx = createContext<EventBusContextValue | null>(null);

const MAX_HISTORY = 100;

export function EventBusProvider({ children }: PropsWithChildren) {
  const subscribersRef = useRef<Map<string, Set<Handler>>>(new Map());
  const [history, setHistory] = useState<WidgetEvent[]>([]);

  const emit = useCallback((partial: Omit<WidgetEvent, 'timestamp'>) => {
    const event: WidgetEvent = { ...partial, timestamp: Date.now() };
    setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), event]);

    const typedSubs = subscribersRef.current.get(event.type);
    typedSubs?.forEach((h) => {
      try {
        h(event);
      } catch (err) {
        console.error(`[EventBus] handler for ${event.type} threw:`, err);
      }
    });

    const wildcardSubs = subscribersRef.current.get('*');
    wildcardSubs?.forEach((h) => {
      try {
        h(event);
      } catch (err) {
        console.error(`[EventBus] wildcard handler threw:`, err);
      }
    });
  }, []);

  const subscribe = useCallback((type: string, handler: Handler) => {
    const map = subscribersRef.current;
    const subs = map.get(type) ?? new Set();
    subs.add(handler);
    map.set(type, subs);
    return () => {
      subs.delete(handler);
      if (subs.size === 0) map.delete(type);
    };
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo<EventBusContextValue>(
    () => ({ emit, subscribe, history, clearHistory }),
    [emit, subscribe, history, clearHistory],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEventBus(): EventBusContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useEventBus must be used inside <EventBusProvider>');
  return v;
}

/**
 * Convenience hook for widgets: subscribe to a specific event type.
 *
 * @example
 *   useWidgetEvent('weather.changed', (e) => {
 *     if (e.payload.condition === 'rain') adjustMyState();
 *   });
 */
export function useWidgetEvent(type: string, handler: Handler) {
  const { subscribe } = useEventBus();
  // Keep latest handler in ref so effect deps stay stable
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  useEffect(() => {
    return subscribe(type, (e) => handlerRef.current(e));
  }, [type, subscribe]);
}
