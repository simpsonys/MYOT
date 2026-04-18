import { create } from 'zustand';
import type {
  AITraceEntry,
  ConversationMessage,
  PrimitiveNode,
  Theme,
  TVLayout,
  WidgetBlueprint,
} from '../types';
import {
  appendChild,
  removeNode,
  replaceNode,
  updateProps,
} from '../runtime/treeOps';

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
  widgets: WidgetBlueprint[];
  conversation: ConversationMessage[];
  isThinking: boolean;
  recommendations: Array<TVLayout & { name: string; description: string }> | null;
  aiMessage: string | null;
  trace: AITraceEntry[];
  devToolsOpen: boolean;

  applyLayout: (layout: TVLayout) => void;
  composeWidget: (widget: WidgetBlueprint, preserveExisting: boolean) => void;
  mutateWidgetRoot: (widgetId: string, node: PrimitiveNode) => void;
  mutateWidgetAppend: (widgetId: string, parentPath: number[], node: PrimitiveNode) => void;
  mutateWidgetReplace: (widgetId: string, path: number[], node: PrimitiveNode) => void;
  mutateWidgetRemove: (widgetId: string, path: number[]) => void;
  mutateWidgetProps: (widgetId: string, path: number[], props: Record<string, unknown>) => void;
  setRecommendations: (r: Array<TVLayout & { name: string; description: string }> | null) => void;
  setThinking: (v: boolean) => void;
  pushMessage: (m: ConversationMessage) => void;
  clearWidgets: () => void;
  updateTheme: (patch: Partial<Theme>) => void;
  setAiMessage: (m: string | null) => void;
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

  composeWidget: (widget, preserveExisting) =>
    set((s) => {
      const base = preserveExisting ? s.widgets : [];
      // Replace if same id already exists
      const next = base.filter((w) => w.id !== widget.id);
      return { widgets: [...next, widget] };
    }),

  mutateWidgetRoot: (widgetId, node) =>
    set((s) => ({
      widgets: s.widgets.map((w) =>
        w.id === widgetId ? { ...w, root: node } : w,
      ),
    })),

  mutateWidgetAppend: (widgetId, parentPath, node) =>
    set((s) => ({
      widgets: s.widgets.map((w) =>
        w.id === widgetId ? { ...w, root: appendChild(w.root, parentPath, node) } : w,
      ),
    })),

  mutateWidgetReplace: (widgetId, path, node) =>
    set((s) => ({
      widgets: s.widgets.map((w) =>
        w.id === widgetId ? { ...w, root: replaceNode(w.root, path, node) } : w,
      ),
    })),

  mutateWidgetRemove: (widgetId, path) =>
    set((s) => ({
      widgets: s.widgets.map((w) =>
        w.id === widgetId ? { ...w, root: removeNode(w.root, path) } : w,
      ),
    })),

  mutateWidgetProps: (widgetId, path, props) =>
    set((s) => ({
      widgets: s.widgets.map((w) =>
        w.id === widgetId ? { ...w, root: updateProps(w.root, path, props) } : w,
      ),
    })),

  setRecommendations: (r) => set({ recommendations: r }),
  setThinking: (v) => set({ isThinking: v }),
  pushMessage: (m) => set((s) => ({ conversation: [...s.conversation, m] })),
  clearWidgets: () => set({ widgets: [], aiMessage: null }),
  updateTheme: (patch) => set((s) => ({ theme: { ...s.theme, ...patch } })),
  setAiMessage: (m) => set({ aiMessage: m }),
  pushTrace: (e) => set((s) => ({ trace: [...s.trace.slice(-49), e] })),
  clearTrace: () => set({ trace: [] }),
  toggleDevTools: () => set((s) => ({ devToolsOpen: !s.devToolsOpen })),
}));
