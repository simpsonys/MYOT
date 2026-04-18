import type { WidgetDefinition } from '../../types';
import ExampleWidget, { type ExampleConfig } from './Example';

// =====================================================================
// EXAMPLE WIDGET DEFINITION — read this to learn every pattern
// =====================================================================
//
// What this teaches:
//   1. Utterances with all intent types (create, modify, invoke_action)
//   2. Declared actions the AI can call by name
//   3. A collaboration hint with another widget
//   4. Event listeners (listensFor)
//
// Copy these patterns into your own widget. Then go further — your
// widget should be surprising, not a copy of this one.
// =====================================================================

const definition: WidgetDefinition<ExampleConfig> = {
  type: 'example',
  name: '예제',
  description:
    'A reference widget demonstrating all Myot patterns. Shows a title, a mood-based gradient, and a score. Use when the user wants to play with the system or explicitly requests "example".',
  icon: '🧪',

  defaultSize: { w: 3, h: 3 },
  minSize: { w: 2, h: 2 },

  configSchema: {
    title: 'Headline text (string)',
    mood: '"calm" | "energetic" | "focused" | "playful"',
    score: 'Integer counter',
  },
  defaultConfig: {
    title: 'Hello, Myot',
    mood: 'calm',
    score: 0,
  },

  component: ExampleWidget,

  // -------------------------------------------------------------------
  // UTTERANCES — Teach the AI how users will talk to this widget.
  //
  // Principle: write utterances the way YOUR TARGET USER talks, not how
  // a programmer would. The AI pattern-matches against these at runtime,
  // so diverse, natural phrasings beat formal commands every time.
  // -------------------------------------------------------------------
  utterances: [
    {
      user: '예제 위젯 띄워줘',
      intent: 'create',
      configChanges: { title: 'Hello, Myot', mood: 'calm', score: 0 },
      aiMessage: '예제 위젯을 꺼냈어요',
    },
    {
      user: '분위기 신나게 바꿔줘',
      intent: 'modify',
      when: 'example widget is already on screen',
      configChanges: { mood: 'energetic' },
      aiMessage: '분위기를 신나게 바꿨어요 ⚡',
    },
    {
      user: '점수 올려줘',
      intent: 'invoke_action',
      when: 'example widget is on screen',
      action: 'incrementScore',
      actionParams: { by: 1 },
      aiMessage: '점수를 올렸어요',
    },
    {
      user: '축하 한번 해줘',
      intent: 'invoke_action',
      action: 'celebrate',
      aiMessage: '🎉 축하합니다!',
    },
  ],

  // -------------------------------------------------------------------
  // ACTIONS — Named capabilities the AI can invoke.
  //
  // Actions receive an ActionContext with { updateConfig, emit, speak }.
  // They can mutate this widget's config OR emit an event for OTHER
  // widgets to react to. This is how cross-widget orchestration happens.
  // -------------------------------------------------------------------
  actions: {
    incrementScore: {
      description: 'Increase the score by a given amount (default 1)',
      params: { by: 'integer — amount to add' },
      handler: (ctx, params) => {
        const by = Number(params?.by ?? 1);
        const next = Number(ctx.currentConfig.score ?? 0) + by;
        ctx.updateConfig({ score: next });
        ctx.speak(`점수가 ${next} 이 됐어요`);
        return { ok: true, message: `Score now ${next}` };
      },
    },
    celebrate: {
      description: 'Emit a global pulse event — other widgets can react',
      handler: (ctx) => {
        ctx.emit({ type: 'demo.pulse', source: ctx.widgetId, payload: { reason: 'celebration' } });
        ctx.speak('🎉 모두에게 펄스를 보냈어요!');
        return { ok: true };
      },
    },
  },

  // -------------------------------------------------------------------
  // COLLABORATIONS — Declarative relationships with other widgets.
  // The AI treats these as soft suggestions when composing layouts.
  // -------------------------------------------------------------------
  collaboratesWith: [
    {
      withType: 'running-coach',
      when: 'user completes a run',
      behavior: 'Increment score to reflect daily achievement',
    },
  ],

  // -------------------------------------------------------------------
  // LISTENS FOR — Event types this widget observes.
  // Documentation for the AI; actual handling is in the component via
  // useWidgetEvent().
  // -------------------------------------------------------------------
  listensFor: ['demo.pulse'],
};

export default definition;
