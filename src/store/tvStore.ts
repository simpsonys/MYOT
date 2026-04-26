import { create } from 'zustand';
import type {
  AITraceEntry,
  ConversationMessage,
  PrimitiveNode,
  Theme,
  TVLayout,
  WatchHistoryItem,
  WidgetBlueprint,
} from '../types';
import {
  appendChild,
  removeNode,
  replaceNode,
  updateProps,
} from '../runtime/treeOps';
import { MOCK_WATCH_HISTORY } from '../data/watchHistory';

// =====================================================================
// Main TV Player — always present, resizes around other widgets
// =====================================================================

export const MAIN_PLAYER_ID = 'main-tv-player';

const DEFAULT_PLAYER_WIDGET: WidgetBlueprint = {
  id: MAIN_PLAYER_ID,
  label: 'TV 플레이어',
  grid: { col: 1, row: 1, colspan: 12, rowspan: 8 },
  root: { primitive: 'video-player' },
  style: { background: 'transparent', opacity: 1, padding: 0 },
};

/**
 * Compute how many columns the TV player should occupy given the other
 * widgets on screen.  New widgets are expected on the right portion of
 * the grid, so we find the left-most column they start at and give the
 * player everything to the left of it (minimum 5 cols).
 */
function computePlayerColspan(others: WidgetBlueprint[]): number {
  if (others.length === 0) return 12;
  const minCol = Math.min(...others.map((w) => w.grid.col));
  return Math.max(5, minCol - 1);
}

/** Return a new widgets array with the player's grid updated to fit. */
function syncPlayerGrid(widgets: WidgetBlueprint[]): WidgetBlueprint[] {
  const idx = widgets.findIndex((w) => w.id === MAIN_PLAYER_ID);
  if (idx === -1) return widgets;
  const others = widgets.filter((_, i) => i !== idx);
  const colspan = computePlayerColspan(others);
  if (widgets[idx].grid.colspan === colspan) return widgets;
  return widgets.map((w, i) =>
    i === idx ? { ...w, grid: { col: 1, row: 1, colspan, rowspan: 8 } } : w,
  );
}

// =====================================================================

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
  watchHistory: WatchHistoryItem[];
  layoutSelected: boolean;

  enterApp: (layout: { theme: Theme; widgets: WidgetBlueprint[] }) => void;
  applyLayout: (layout: TVLayout) => void;
  applyTheme: (theme: Theme) => void;
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
  // Start with default player widget; layoutSelected=false shows the LayoutSelector
  widgets: [DEFAULT_PLAYER_WIDGET],
  conversation: [],
  isThinking: false,
  recommendations: null,
  aiMessage: null,
  trace: [],
  devToolsOpen: false,
  watchHistory: MOCK_WATCH_HISTORY,
  layoutSelected: false,

  enterApp: ({ theme, widgets }) =>
    set({
      layoutSelected: true,
      theme: { ...DEFAULT_THEME, ...theme },
      widgets,
      aiMessage: null,
      recommendations: null,
    }),

  applyLayout: (layout) =>
    set((s) => {
      // If preset includes main-tv-player, use its grid as-is.
      // If not (AI layout reset), restore the current player and sync grid.
      const presetPlayer = layout.widgets.find((w) => w.id === MAIN_PLAYER_ID);
      const existingPlayer = s.widgets.find((w) => w.id === MAIN_PLAYER_ID) ?? DEFAULT_PLAYER_WIDGET;
      const player = presetPlayer ?? existingPlayer;
      const otherWidgets = layout.widgets.filter((w) => w.id !== MAIN_PLAYER_ID);
      const widgets = presetPlayer
        ? [player, ...otherWidgets]
        : syncPlayerGrid([player, ...otherWidgets]);
      return {
        theme: { ...DEFAULT_THEME, ...layout.theme },
        widgets,
        aiMessage: layout.aiMessage ?? null,
        recommendations: null,
      };
    }),

  applyTheme: (theme) =>
    set((s) => ({
      theme: { ...s.theme, ...theme },
      aiMessage: theme.themeName ? `✨ ${theme.themeName} 적용됨` : null,
    })),

  composeWidget: (widget, preserveExisting) =>
    set((s) => {
      // Always keep the TV player even when preserveExisting is false
      const player = s.widgets.find((w) => w.id === MAIN_PLAYER_ID) ?? DEFAULT_PLAYER_WIDGET;
      const base = preserveExisting
        ? s.widgets
        : [player];
      const next = base.filter((w) => w.id !== widget.id);
      return { widgets: syncPlayerGrid([...next, widget]) };
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

  clearWidgets: () =>
    set({
      // Reset to only the TV player at full screen
      widgets: [{ ...DEFAULT_PLAYER_WIDGET, grid: { col: 1, row: 1, colspan: 12, rowspan: 8 } }],
      aiMessage: null,
    }),

  updateTheme: (patch) => set((s) => ({ theme: { ...s.theme, ...patch } })),
  setAiMessage: (m) => set({ aiMessage: m }),
  pushTrace: (e) => set((s) => ({ trace: [...s.trace.slice(-49), e] })),
  clearTrace: () => set({ trace: [] }),
  toggleDevTools: () => set((s) => ({ devToolsOpen: !s.devToolsOpen })),
}));
