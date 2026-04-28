import type { ComponentType, ReactNode } from 'react';

// =====================================================================
// MYOT HYBRID COMPOSABLE PRIMITIVES ARCHITECTURE
// =====================================================================
// Layers (outer → inner):
//
//   1. TV Canvas  (12×8 grid)
//   2. Widgets    (cells in the grid — NO predefined widgets in code;
//                   they are composed at runtime from primitives)
//   3. Primitives (the atomic building blocks team members create)
//
// User utterance → AI orchestrator → emits a WIDGET BLUEPRINT which is
// a tree of primitives. The runtime materializes this tree into React.
//
// Creating a brand-new widget means the AI emits a blueprint it has
// never emitted before — it's composing primitives in a new way.
// No code generation, no eval, no sandbox. Just data-driven composition.
// =====================================================================

// ---------------------------------------------------------------------
// Theme & style (unchanged from prior architecture)
// ---------------------------------------------------------------------

export interface Theme {
  mode: 'dark' | 'light';
  backgroundColor: string;
  accentColor: string;
  secondaryAccentColor?: string;
  widgetBackground?: string;
  textPrimaryColor?: string;
  widgetOpacity: number;
  widgetBorderRadius: number;
  fontStyle?: 'modern' | 'classic' | 'minimal';
  /** AI가 생성한 테마의 이름 (예: "사냥개들 분위기") */
  themeName?: string;
  /** 컨텐츠 기반 테마 배경 이미지 URL — TVScreen에서 반투명 레이어로 렌더링 */
  backgroundImage?: string;
  /** 배경 이미지에서 추출된 색상 팔레트 — 위젯 테두리에 순환 적용 */
  palette?: string[];
}

export interface WatchHistoryItem {
  title: string;
  titleEn?: string;
  type: 'movie' | 'tv' | 'variety' | 'anime' | 'documentary';
  platform?: string;
  watchedAt?: string;
}

export interface WidgetStyle {
  background?: string;
  textColor?: string;
  opacity?: number;
  borderRadius?: number;
  /** Internal padding of the widget shell */
  padding?: number;
}

// =====================================================================
// PRIMITIVES — the atomic building blocks
// =====================================================================
// A primitive is a pure, composable React component that can:
//   - Render itself given props
//   - Contain children (other primitives, recursively)
//   - Emit events to the bus
//   - Be animated by the runtime
// =====================================================================

/** A primitive instance in a widget blueprint — it's data, not JSX. */
export interface PrimitiveNode {
  /** Primitive type id, e.g. "stat-tile", "chat-bubble" */
  primitive: string;
  /** Props for this instance — must match the primitive's propsSchema */
  props?: Record<string, unknown>;
  /** Child primitives (for container primitives like stat-row, stack) */
  children?: PrimitiveNode[];
  /** Optional id for addressing this node by AI actions */
  id?: string;
}

export interface PrimitiveProps<TProps = Record<string, unknown>> {
  props: TProps;
  children?: ReactNode;
  theme: Theme;
  /** The widget this primitive belongs to (for event.source tagging) */
  widgetId: string;
  /** Emit a bus event */
  emit: (event: { type: string; payload?: unknown }) => void;
}

export interface PrimitiveDefinition<TProps = Record<string, unknown>> {
  /** Unique id (kebab-case) */
  type: string;
  /** Display name for Dev Tools */
  name: string;
  /** One-line description injected into AI prompt */
  description: string;
  /** Icon for Dev Tools (emoji ok) */
  icon: string;
  /** Whether this primitive accepts children (container vs leaf) */
  isContainer: boolean;
  /** Props schema — field name to human description. The AI reads this
   *  to know what props to set. Keep values simple and scalar. */
  propsSchema: Record<string, string>;
  /** Default props when AI doesn't specify */
  defaultProps: TProps;
  /** Example blueprints — few-shot examples showing how this primitive
   *  is typically composed with others. CRITICAL for AI learning. */
  examples: PrimitiveExample[];
  /** The React component */
  component: ComponentType<PrimitiveProps<TProps>>;
}

export interface PrimitiveExample {
  /** What kind of widget/situation this example is useful for */
  context: string;
  /** The blueprint fragment showing this primitive in action */
  blueprint: PrimitiveNode;
  /** Why this composition works (for AI reasoning) */
  rationale?: string;
}

// =====================================================================
// WIDGET BLUEPRINT — what AI emits
// =====================================================================
// A "widget" is transient — it exists because AI composed one. It has
// no predefined TypeScript type, no matching file in /widgets. It's
// pure data that the runtime interprets.
// =====================================================================

export interface WidgetBlueprint {
  /** Unique id, AI should pick something descriptive */
  id: string;
  /** Grid placement on the 12×8 canvas */
  grid: { col: number; row: number; colspan: number; rowspan: number };
  /** Root primitive node — usually a container */
  root: PrimitiveNode;
  /** Optional shell styling (widget frame bg/opacity) */
  style?: WidgetStyle;
  /** Optional semantic label for Dev Tools + trace (e.g. "오늘 운세") */
  label?: string;
  /** Event types this widget's primitives want to observe — the runtime
   *  subscribes and can re-render the widget with updated blueprint. */
  listensFor?: string[];
}

// =====================================================================
// TV STATE
// =====================================================================

export interface TVLayout {
  theme: Theme;
  widgets: WidgetBlueprint[];
  aiMessage?: string;
}

export interface SavedLayout {
  id: string;
  name: string;
  savedAt: number;
  theme: Theme;
  widgets: WidgetBlueprint[];
}

export interface ConversationMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

// =====================================================================
// AI RESPONSE KINDS
// =====================================================================
// Four response types — all describe state transitions as DATA:
//
//   layout             — replace the entire TV state (theme + widgets)
//   compose_widget     — add a new widget blueprint to screen (the
//                         canonical "말하면 만들어진다" case)
//   mutate_widget      — update an existing widget's blueprint tree
//                         (add/remove/modify a primitive node within it)
//   recommendations    — 3 alternative layouts to preview
//   emit_event         — broadcast an event for widgets to react to
//   error              — AI failure or invalid output
// =====================================================================

export interface BusEvent {
  type: string;
  source: string;
  payload?: unknown;
  timestamp?: number;
}

export type AIResponse =
  | { kind: 'layout'; layout: TVLayout }
  | {
      kind: 'recommendations';
      layouts: Array<TVLayout & { name: string; description: string }>;
    }
  | {
      /** Add a new widget to the canvas — the AI just invented it */
      kind: 'compose_widget';
      widget: WidgetBlueprint;
      preserveExisting: boolean; // true = keep other widgets, false = replace all
      aiMessage?: string;
    }
  | {
      /** Modify an existing widget's internal primitive tree */
      kind: 'mutate_widget';
      widgetId: string;
      /** Operation: replace the root, or append/replace/remove a child at path */
      op:
        | { type: 'replace_root'; node: PrimitiveNode }
        | { type: 'append_child'; parentPath: number[]; node: PrimitiveNode }
        | { type: 'replace_node'; path: number[]; node: PrimitiveNode }
        | { type: 'remove_node'; path: number[] }
        | { type: 'update_props'; path: number[]; props: Record<string, unknown> };
      aiMessage?: string;
    }
  | { kind: 'emit_event'; event: BusEvent; aiMessage?: string }
  | {
      kind: 'generate_theme';
      theme: Theme;
      themeName?: string;
      aiMessage?: string;
    }
  | { kind: 'error'; message: string };

// =====================================================================
// DEV TOOLS
// =====================================================================

export interface AITraceEntry {
  id: string;
  timestamp: number;
  userInput: string;
  mode: 'edit' | 'recommend' | 'dry_run';
  rawResponse?: string;
  parsed: AIResponse;
  durationMs: number;
}
