import { create } from 'zustand';
import type {
  AITraceEntry,
  ConversationMessage,
  Theme,
  TVLayout,
  WidgetInstance,
} from '../types';

const DEFAULT_THEME: Theme = {
  mode: 'dark',
  backgroundColor: '#0A0E1A',
  accentColor: '#00D4FF',
  widgetOpacity: 1,
  widgetBorderRadius: 16,
  fontStyle: 'modern',
};

interface TVStore {
  theme: Theme;
  widgets: WidgetInstance[];
  conversation: ConversationMessage[];
  isThinking: boolean;
  recommendations: Array<TVLayout & { name: string; description: string }> | null;
  aiMessage: string | null;
  trace: AITraceEntry[];
  devToolsOpen: boolean;

  applyLayout: (layout: TVLayout) => void;
  setRecommendations: (r: Array<TVLayout & { name: string; description: string }> | null) => void;
  setThinking: (v: boolean) => void;
  pushMessage: (m: ConversationMessage) => void;
  clearWidgets: () => void;
  updateTheme: (patch: Partial<Theme>) => void;
  setAiMessage: (m: string | null) => void;
  updateWidgetConfig: (id: string, patch: Record<string, unknown>) => void;
  pushTrace: (entry: AITraceEntry) => void;
  clearTrace: () => void;
  toggleDevTools: () => void;
}

export const useTVStore = create<TVStore>((set) => ({
  theme: DEFAULT_THEME,
  widgets: [],
  conversation: [],
  isThinking: false,
  recommendations: null,
  aiMessage: null,
  trace: [],
  devToolsOpen: false,

  applyLayout: (layout) =>
    set({
      theme: { ...DEFAULT_THEME, ...layout.theme },
      widgets: layout.widgets,
      aiMessage: layout.aiMessage ?? null,
      recommendations: null,
    }),
  setRecommendations: (r) => set({ recommendations: r }),
  setThinking: (v) => set({ isThinking: v }),
  pushMessage: (m) => set((s) => ({ conversation: [...s.conversation, m] })),
  clearWidgets: () => set({ widgets: [], aiMessage: null }),
  updateTheme: (patch) => set((s) => ({ theme: { ...s.theme, ...patch } })),
  setAiMessage: (m) => set({ aiMessage: m }),
  updateWidgetConfig: (id, patch) =>
    set((s) => ({
      widgets: s.widgets.map((w) =>
        w.id === id ? { ...w, config: { ...w.config, ...patch } } : w,
      ),
    })),
  pushTrace: (entry) =>
    set((s) => ({ trace: [...s.trace.slice(-49), entry] })),
  clearTrace: () => set({ trace: [] }),
  toggleDevTools: () => set((s) => ({ devToolsOpen: !s.devToolsOpen })),
}));
