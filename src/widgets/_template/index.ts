import type { WidgetDefinition } from '../../types';
import TemplateWidget, { type TemplateConfig } from './Template';

// -----------------------------------------------------------------------
// Template Widget Definition (bare minimum)
// -----------------------------------------------------------------------
// Read this first. Then look at /widgets/example/ for a rich one.
//
// A widget definition is a CONTRACT WITH THE AI. The fields below are
// what the orchestrator reads to build its system prompt at runtime.
// -----------------------------------------------------------------------

const definition: WidgetDefinition<TemplateConfig> = {
  type: 'template',
  name: '템플릿',
  description: 'A placeholder widget. Copy this folder and build something the world has not seen.',
  icon: '📋',

  defaultSize: { w: 3, h: 2 },
  minSize: { w: 2, h: 2 },

  configSchema: {
    label: 'The text to display (string)',
  },
  defaultConfig: { label: 'Hello Myot' },

  component: TemplateWidget,

  // ---- Teach the AI when to use you ----
  utterances: [
    {
      user: '템플릿 위젯 보여줘',
      intent: 'create',
      configChanges: { label: 'Hello Myot' },
      aiMessage: '템플릿을 띄웠어요',
    },
  ],

  // Optional: actions, collaboratesWith, listensFor — see /widgets/example/
};

export default definition;
