import type { ComponentType } from 'react';

// =====================================================================
// CORE TYPES
// =====================================================================

export interface WidgetStyle {
  background?: string;
  textColor?: string;
  opacity?: number;
  borderRadius?: number;
}

export interface Theme {
  mode: 'dark' | 'light';
  backgroundColor: string;
  accentColor: string;
  widgetOpacity: number;
  widgetBorderRadius: number;
  fontStyle?: 'modern' | 'classic' | 'minimal';
}

export interface WidgetProps<TConfig = Record<string, unknown>> {
  id: string;
  config: TConfig;
  style: WidgetStyle;
  theme: Theme;
}

// =====================================================================
// SELF-DESCRIBING WIDGET CONTRACT
// =====================================================================
// A widget isn't just a React component — it's a self-describing entity
// that teaches the AI orchestrator:
//   1. WHEN it should be used (description + utterances)
//   2. HOW it can be controlled (actions)
//   3. WHOM it collaborates with (collaboratesWith)
//   4. WHAT events it reacts to (listensFor)
//
// The orchestrator reads these at runtime and builds the AI system
// prompt dynamically — so adding a widget = teaching the AI a new skill
// with ZERO prompt engineering.
// =====================================================================

export interface UtteranceExample {
  user: string;
  intent: 'create' | 'modify' | 'react' | 'query' | 'invoke_action' | 'emit_event';
  when?: string;
  configChanges?: Record<string, unknown>;
  action?: string;
  actionParams?: Record<string, unknown>;
  emits?: { type: string; payload?: unknown };
  aiMessage?: string;
}

export interface CollaborationHint {
  withType: string;
  when: string;
  behavior: string;
}

export interface ActionContext<TConfig = Record<string, unknown>> {
  widgetId: string;
  currentConfig: TConfig;
  theme: Theme;
  updateConfig: (patch: Partial<TConfig>) => void;
  emit: (event: WidgetEvent) => void;
  speak: (message: string) => void;
}

export type ActionResult =
  | { ok: true; message?: string; configPatch?: Record<string, unknown> }
  | { ok: false; error: string };

export interface WidgetAction<TConfig = Record<string, unknown>> {
  description: string;
  params?: Record<string, string>;
  handler: (
    ctx: ActionContext<TConfig>,
    params?: Record<string, unknown>,
  ) => Promise<ActionResult> | ActionResult;
}

export interface WidgetEvent {
  type: string;
  source: string;
  payload?: unknown;
  timestamp?: number;
}

export interface WidgetDefinition<TConfig = Record<string, unknown>> {
  type: string;
  name: string;
  description: string;
  icon: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  configSchema: Record<string, string>;
  defaultConfig: TConfig;
  component: ComponentType<WidgetProps<TConfig>>;

  // Self-description for the AI orchestrator
  utterances: UtteranceExample[];
  collaboratesWith?: CollaborationHint[];
  actions?: Record<string, WidgetAction<TConfig>>;
  listensFor?: string[];
}

// =====================================================================
// TV STATE
// =====================================================================

export interface WidgetInstance {
  id: string;
  type: string;
  grid: { col: number; row: number; colspan: number; rowspan: number };
  config: Record<string, unknown>;
  style: WidgetStyle;
}

export interface TVLayout {
  theme: Theme;
  widgets: WidgetInstance[];
  aiMessage?: string;
}

export interface ConversationMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

// =====================================================================
// AI ORCHESTRATION
// =====================================================================

export type AIResponse =
  | { kind: 'layout'; layout: TVLayout }
  | {
      kind: 'recommendations';
      layouts: Array<TVLayout & { name: string; description: string }>;
    }
  | {
      kind: 'invoke_action';
      widgetId: string;
      actionName: string;
      params?: Record<string, unknown>;
      aiMessage?: string;
    }
  | { kind: 'emit_event'; event: WidgetEvent; aiMessage?: string }
  | { kind: 'error'; message: string };

export interface AITraceEntry {
  id: string;
  timestamp: number;
  userInput: string;
  mode: 'edit' | 'recommend' | 'dry_run';
  rawResponse?: string;
  parsed: AIResponse;
  durationMs: number;
}
