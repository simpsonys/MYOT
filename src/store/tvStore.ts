import { create } from 'zustand';
import type {
  AITraceEntry,
  ConversationMessage,
  PrimitiveNode,
  SavedLayout,
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
 * Auto-layout: distribute other widgets in the right panel, stacked vertically.
 * Panel width grows as widget count increases so all fit without overlap.
 *
 *  1-2 widgets  → col 9-12 (4 cols)   TV: col 1-8
 *  3-4 widgets  → col 8-12 (5 cols)   TV: col 1-7
 *  5+  widgets  → col 7-12 (6 cols)   TV: col 1-6
 */
function autoLayoutOthers(
  player: WidgetBlueprint,
  others: WidgetBlueprint[],
): WidgetBlueprint[] {
  if (others.length === 0) {
    return [{ ...player, grid: { col: 2, row: 1, colspan: 10, rowspan: 7 } }];
  }

  const rightStart = others.length <= 2 ? 9 : others.length <= 4 ? 8 : 7;
  const rightCols = 13 - rightStart;
  const baseRows = Math.floor(8 / others.length);
  const extra = 8 % others.length;

  let row = 1;
  const laidOut = others.map((w, i) => {
    const rowspan = baseRows + (i < extra ? 1 : 0);
    const result = { ...w, grid: { col: rightStart, row, colspan: rightCols, rowspan } };
    row += rowspan;
    return result;
  });

  return [
    { ...player, grid: { col: 1, row: 1, colspan: rightStart - 1, rowspan: 8 } },
    ...laidOut,
  ];
}

/** Sync solo player grid when no other widgets exist. */
function syncPlayerGrid(widgets: WidgetBlueprint[]): WidgetBlueprint[] {
  const idx = widgets.findIndex((w) => w.id === MAIN_PLAYER_ID);
  if (idx === -1) return widgets;
  const others = widgets.filter((_, i) => i !== idx);
  if (others.length > 0) return widgets; // let autoLayout handle it
  const solo = { col: 2, row: 1, colspan: 10, rowspan: 7 };
  const cur = widgets[idx].grid;
  if (cur.col === solo.col && cur.colspan === solo.colspan) return widgets;
  return widgets.map((w, i) => (i === idx ? { ...w, grid: solo } : w));
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

const SAVED_LAYOUTS_KEY = 'myot-saved-layouts';

function loadSavedLayoutsFromStorage(): SavedLayout[] {
  try {
    const raw = localStorage.getItem(SAVED_LAYOUTS_KEY);
    return raw ? (JSON.parse(raw) as SavedLayout[]) : [];
  } catch {
    return [];
  }
}

function persistSavedLayouts(layouts: SavedLayout[]): void {
  try {
    localStorage.setItem(SAVED_LAYOUTS_KEY, JSON.stringify(layouts));
  } catch {
    // localStorage quota exceeded — silently ignore
  }
}

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
  savedLayouts: SavedLayout[];
  savedLayoutsPanelOpen: boolean;
  widgetGalleryOpen: boolean;

  enterApp: (layout: { theme: Theme; widgets: WidgetBlueprint[] }) => void;
  applyLayout: (layout: TVLayout) => void;
  applyTheme: (theme: Theme) => void;
  composeWidget: (widget: WidgetBlueprint, preserveExisting: boolean) => void;
  mutateWidgetRoot: (widgetId: string, node: PrimitiveNode) => void;
  mutateWidgetAppend: (widgetId: string, parentPath: number[], node: PrimitiveNode) => void;
  mutateWidgetReplace: (widgetId: string, path: number[], node: PrimitiveNode) => void;
  mutateWidgetRemove: (widgetId: string, path: number[]) => void;
  mutateWidgetProps: (widgetId: string, path: number[], props: Record<string, unknown>) => void;
  updateWidgetGrid: (widgetId: string, grid: WidgetBlueprint['grid']) => void;
  setRecommendations: (r: Array<TVLayout & { name: string; description: string }> | null) => void;
  setThinking: (v: boolean) => void;
  pushMessage: (m: ConversationMessage) => void;
  removeWidget: (widgetId: string) => void;
  clearWidgets: () => void;
  updateWidgetGrid: (widgetId: string, grid: WidgetBlueprint['grid']) => void;
  updateTheme: (patch: Partial<Theme>) => void;
  setAiMessage: (m: string | null) => void;
  pushTrace: (entry: AITraceEntry) => void;
  clearTrace: () => void;
  toggleDevTools: () => void;
  saveCurrentLayout: (name: string) => void;
  loadSavedLayout: (id: string) => void;
  deleteSavedLayout: (id: string) => void;
  toggleSavedLayoutsPanel: () => void;
  toggleWidgetGallery: () => void;
  placeWidget: (widget: WidgetBlueprint) => void;
}

export const useTVStore = create<TVStore>((set, get) => ({
  theme: DEFAULT_THEME,
  widgets: [DEFAULT_PLAYER_WIDGET],
  conversation: [],
  isThinking: false,
  recommendations: null,
  aiMessage: null,
  trace: [],
  devToolsOpen: false,
  watchHistory: MOCK_WATCH_HISTORY,
  layoutSelected: false,
  savedLayouts: loadSavedLayoutsFromStorage(),
  savedLayoutsPanelOpen: false,
  widgetGalleryOpen: false,

  enterApp: ({ theme, widgets }) =>
    set({
      layoutSelected: true,
      theme: { ...DEFAULT_THEME, ...theme },
      widgets,
      aiMessage: null,
      recommendations: null,
      conversation: [
        {
          role: 'ai',
          text: '안녕하세요! 저는 Myot AI예요 👋 말씀만 하시면 TV 홈 화면을 꾸며드릴게요. 어떤 위젯을 만들어 볼까요?',
          timestamp: Date.now(),
        },
      ],
    }),

  applyLayout: (layout) =>
    set((s) => {
      const presetPlayer = layout.widgets.find((w) => w.id === MAIN_PLAYER_ID);
      const existingPlayer = s.widgets.find((w) => w.id === MAIN_PLAYER_ID) ?? DEFAULT_PLAYER_WIDGET;
      const player = presetPlayer ?? existingPlayer;
      const otherWidgets = layout.widgets.filter((w) => w.id !== MAIN_PLAYER_ID);
      const widgets = presetPlayer
        ? [player, ...otherWidgets]
        : autoLayoutOthers(player, otherWidgets);
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

  // 새 위젯 추가 시 autoLayoutOthers로 겹침 없이 자동 배치
  composeWidget: (widget, preserveExisting) =>
    set((s) => {
      const player = s.widgets.find((w) => w.id === MAIN_PLAYER_ID);
      const existingOthers = (preserveExisting ? s.widgets : []).filter(
        (w) => w.id !== MAIN_PLAYER_ID && w.id !== widget.id,
      );
      if (!player) return { widgets: [...existingOthers, widget] };
      return { widgets: autoLayoutOthers(player, [...existingOthers, widget]) };
    }),

  mutateWidgetRoot: (widgetId, node) =>
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === widgetId ? { ...w, root: node } : w)),
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

  // 드래그·리사이즈 후 그리드 직접 업데이트 (TV player 제외)
  updateWidgetGrid: (widgetId, grid) =>
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === widgetId ? { ...w, grid } : w)),
    })),

  setRecommendations: (r) => set({ recommendations: r }),
  setThinking: (v) => set({ isThinking: v }),
  pushMessage: (m) => set((s) => ({ conversation: [...s.conversation, m] })),

  // 위젯 삭제 후 나머지 재배치
  removeWidget: (widgetId) =>
    set((s) => {
      if (widgetId === MAIN_PLAYER_ID) {
        return { widgets: s.widgets.filter((w) => w.id !== MAIN_PLAYER_ID) };
      }
      const player = s.widgets.find((w) => w.id === MAIN_PLAYER_ID);
      const remaining = s.widgets.filter(
        (w) => w.id !== widgetId && w.id !== MAIN_PLAYER_ID,
      );
      if (!player) return { widgets: remaining };
      return { widgets: autoLayoutOthers(player, remaining) };
    }),

  clearWidgets: () =>
    set({
      widgets: [{ ...DEFAULT_PLAYER_WIDGET, grid: { col: 2, row: 1, colspan: 10, rowspan: 7 } }],
      aiMessage: null,
    }),

  updateWidgetGrid: (widgetId, grid) =>
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === widgetId ? { ...w, grid } : w)),
    })),

  updateTheme: (patch) => set((s) => ({ theme: { ...s.theme, ...patch } })),
  setAiMessage: (m) => set({ aiMessage: m }),
  pushTrace: (e) => set((s) => ({ trace: [...s.trace.slice(-49), e] })),
  clearTrace: () => set({ trace: [] }),
  toggleDevTools: () => set((s) => ({ devToolsOpen: !s.devToolsOpen })),

  saveCurrentLayout: (name) => {
    const { theme, widgets } = get();
    const newEntry: SavedLayout = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || '이름 없는 레이아웃',
      savedAt: Date.now(),
      theme,
      widgets,
    };
    set((s) => {
      const updated = [newEntry, ...s.savedLayouts];
      persistSavedLayouts(updated);
      return { savedLayouts: updated, aiMessage: `💾 "${newEntry.name}" 저장됨` };
    });
  },

  loadSavedLayout: (id) => {
    const { savedLayouts } = get();
    const found = savedLayouts.find((l) => l.id === id);
    if (!found) return;
    // Reuse applyLayout logic: merge with default theme, sync player grid
    const presetPlayer = found.widgets.find((w) => w.id === MAIN_PLAYER_ID);
    const otherWidgets = found.widgets.filter((w) => w.id !== MAIN_PLAYER_ID);
    const player = presetPlayer ?? DEFAULT_PLAYER_WIDGET;
    const widgets = presetPlayer
      ? [player, ...otherWidgets]
      : syncPlayerGrid([player, ...otherWidgets]);
    set({
      theme: { ...DEFAULT_THEME, ...found.theme },
      widgets,
      aiMessage: `📂 "${found.name}" 불러옴`,
      recommendations: null,
      savedLayoutsPanelOpen: false,
    });
  },

  deleteSavedLayout: (id) => {
    set((s) => {
      const updated = s.savedLayouts.filter((l) => l.id !== id);
      persistSavedLayouts(updated);
      return { savedLayouts: updated };
    });
  },

  toggleSavedLayoutsPanel: () =>
    set((s) => ({ savedLayoutsPanelOpen: !s.savedLayoutsPanelOpen })),

  toggleWidgetGallery: () =>
    set((s) => ({ widgetGalleryOpen: !s.widgetGalleryOpen })),

  placeWidget: (widget) =>
    set((s) => ({ widgets: [...s.widgets, widget] })),
}));
