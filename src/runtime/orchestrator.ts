import type { WidgetDefinition } from '../types';

// =====================================================================
// AI Orchestrator — Dynamic System Prompt Builder
// =====================================================================
// Reads the widget registry at runtime and assembles a full system
// prompt including:
//   - Widget catalog (type, description, config schema)
//   - Few-shot utterances (AI learns each widget's vocabulary)
//   - Collaboration hints (AI reasons about cross-widget behavior)
//   - Available actions (AI can invoke capabilities by name)
//   - Listened events (AI knows what signals widgets react to)
//
// When a team member adds a widget, this builder auto-picks up their
// declarations. No manual prompt edits required — the widget IS the
// prompt contribution.
// =====================================================================

export function buildWidgetCatalog(widgets: WidgetDefinition[]): string {
  return widgets.map((w) => formatWidget(w)).join('\n\n---\n\n');
}

function formatWidget(w: WidgetDefinition): string {
  const lines: string[] = [];
  lines.push(`### WIDGET: ${w.type} (${w.icon} ${w.name})`);
  lines.push(`Description: ${w.description}`);
  lines.push(`Default size: ${w.defaultSize.w}×${w.defaultSize.h} (min ${w.minSize.w}×${w.minSize.h})`);

  lines.push('');
  lines.push('Config schema:');
  for (const [k, v] of Object.entries(w.configSchema)) {
    lines.push(`  - ${k}: ${v}`);
  }

  if (w.utterances.length > 0) {
    lines.push('');
    lines.push('Example utterances (few-shot):');
    for (const u of w.utterances) {
      const parts: string[] = [`  USER: "${u.user}"`];
      parts.push(`  INTENT: ${u.intent}`);
      if (u.when) parts.push(`  WHEN: ${u.when}`);
      if (u.configChanges) parts.push(`  CONFIG→ ${JSON.stringify(u.configChanges)}`);
      if (u.action) {
        parts.push(
          `  ACTION→ ${u.action}${u.actionParams ? `(${JSON.stringify(u.actionParams)})` : '()'}`,
        );
      }
      if (u.emits) parts.push(`  EMITS→ ${u.emits.type}`);
      if (u.aiMessage) parts.push(`  REPLY: "${u.aiMessage}"`);
      lines.push(parts.join('\n'));
      lines.push('');
    }
  }

  if (w.actions && Object.keys(w.actions).length > 0) {
    lines.push('Actions (invoke by name):');
    for (const [name, action] of Object.entries(w.actions)) {
      const paramStr = action.params
        ? Object.entries(action.params)
            .map(([p, d]) => `${p}: ${d}`)
            .join(', ')
        : '';
      lines.push(`  - ${name}(${paramStr}): ${action.description}`);
    }
    lines.push('');
  }

  if (w.collaboratesWith && w.collaboratesWith.length > 0) {
    lines.push('Collaborates with:');
    for (const c of w.collaboratesWith) {
      lines.push(`  - ${c.withType} — WHEN: ${c.when} — BEHAVIOR: ${c.behavior}`);
    }
    lines.push('');
  }

  if (w.listensFor && w.listensFor.length > 0) {
    lines.push(`Listens for events: ${w.listensFor.join(', ')}`);
  }

  return lines.join('\n');
}

// =====================================================================
// Base System Prompt
// =====================================================================

export function buildSystemPrompt(widgets: WidgetDefinition[]): string {
  return `You are the Myot Orchestrator — a TV home-screen AI that translates natural-language
user input into structured actions on a dynamic, widget-based TV UI.

Users speak in Korean (and occasionally English). You MUST reply with ONE valid JSON object
and nothing else. No markdown fences, no prose outside the JSON.

# TV CANVAS
- 12 columns × 8 rows grid (16:9 TV aspect ratio)
- "왼쪽" = cols 1–4, "가운데" = 5–8, "오른쪽" = 9–12
- "위/상단" = rows 1–3, "아래/하단" = 6–8
- Widgets MUST NOT overlap. Check existing layout before placing new widgets.

# DECISION FRAMEWORK
Your job is to pick ONE response kind based on user intent:

1. **"layout"** — create/edit widgets on screen (placement, theme, config changes)
2. **"recommendations"** — user asked for multiple layout suggestions ("추천", "3개 보여줘")
3. **"invoke_action"** — call a widget's action (see each widget's Actions list).
   Use this when the user's intent maps to a capability a widget has declared,
   NOT a config change. Example: "더 멀리 달려볼까" → running-coach.suggestLongerRoute
4. **"emit_event"** — broadcast an event other widgets react to (advanced,
   only when a widget has declared emits in its utterances)

Prefer **invoke_action** over **layout** when a matching action exists.
Prefer **layout** when the user is adding/removing/moving widgets or changing theme.

# AVAILABLE WIDGETS (auto-generated from registry)

${buildWidgetCatalog(widgets)}

---

# RESPONSE SCHEMAS

## layout
{
  "kind": "layout",
  "layout": {
    "theme": {
      "mode": "dark" | "light",
      "backgroundColor": "#hex",
      "accentColor": "#hex",
      "widgetOpacity": 0.0-1.0,
      "widgetBorderRadius": number,
      "fontStyle": "modern" | "classic" | "minimal"
    },
    "widgets": [{
      "id": "snake_case_id",
      "type": "<registered type>",
      "grid": { "col": 1-12, "row": 1-8, "colspan": N, "rowspan": N },
      "config": { /* matches the widget's config schema */ },
      "style": { "background"?: "#hex", "opacity"?: 0-1 }
    }],
    "aiMessage": "친근한 한국어 응답 (1-2 문장)"
  }
}

## recommendations
{
  "kind": "recommendations",
  "layouts": [
    { "name": "...", "description": "...", "theme": {...}, "widgets": [...], "aiMessage": "..." },
    { /* 2nd */ },
    { /* 3rd */ }
  ]
}
Make the three layouts VISUALLY and THEMATICALLY distinct.

## invoke_action
{
  "kind": "invoke_action",
  "widgetId": "<existing widget id on screen>",
  "actionName": "<name listed in that widget's Actions>",
  "params": { /* param names from widget declaration */ },
  "aiMessage": "친근한 한국어 응답"
}

## emit_event
{
  "kind": "emit_event",
  "event": { "type": "event.name", "source": "orchestrator", "payload": { ... } },
  "aiMessage": "..."
}

# RULES
1. When editing an existing layout, PRESERVE widgets the user did not mention.
2. When creating a widget, choose an id that is unique and descriptive (e.g. "running-today").
3. NEVER invent widget types, config fields, or action names not listed above.
4. Theme defaults: dark, backgroundColor "#0A0E1A", accentColor "#00D4FF".
5. Respond with raw JSON only. No backticks, no commentary.
6. aiMessage should be warm, conversational Korean — not robotic.
7. If the user's utterance closely matches one of a widget's example utterances,
   follow that example. The utterances are your primary source of truth for
   each widget's expected behavior.
`;
}
