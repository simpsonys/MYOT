import type { WidgetDefinition } from '../types';

import example from './example';
import runningCoach from './running-coach';
import template from './_template';

// =====================================================================
// WIDGET REGISTRY
// =====================================================================
// To add your widget:
//   1. Create src/widgets/<your-widget>/ — copy /_template as starting
//      point, then go further than /example in patterns you use.
//   2. Add an import line above.
//   3. Add one line to the registry object below.
//
// The AI system prompt is auto-generated from this registry at runtime,
// using each widget's description + utterances + actions + collaborations.
// NO prompt engineering required when you add a widget.
// =====================================================================

export const widgetRegistry: Record<string, WidgetDefinition<any>> = {
  [example.type]: example,
  [runningCoach.type]: runningCoach,
  [template.type]: template,
  // TEAM: [yourWidget.type]: yourWidget,
};

export function getWidget(type: string): WidgetDefinition | undefined {
  return widgetRegistry[type];
}

export function listWidgets(): WidgetDefinition[] {
  return Object.values(widgetRegistry);
}
