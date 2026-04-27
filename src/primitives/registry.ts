import type { PrimitiveDefinition } from '../types';

import template from './_template';
import statTile from './stat-tile';
import statRow from './stat-row';
import stack from './stack';
import chatBubble from './chat-bubble';
import choiceList from './choice-list';
import mapCard from './map-card';
import imageFrame from './image-frame';
import actionButton from './action-button';
import progressRing from './progress-ring';
import videoPlayer from './video-player';
import clockFace from './clock-face';
import textBlock from './text-block';
import mediaBar from './media-bar';
import gaugeBar from './gauge-bar';
import timeline from './timeline';

// =====================================================================
// PRIMITIVE REGISTRY
// =====================================================================
// To add your primitive:
//   1. cp -r src/primitives/_template src/primitives/<your-primitive>
//   2. Build your Primitive.tsx and index.ts
//   3. Add one import + one registry line below.
//
// The AI's system prompt is regenerated from this registry on EVERY
// request. Add a primitive → AI can immediately compose widgets with it.
// =====================================================================

export const primitiveRegistry: Record<string, PrimitiveDefinition<any>> = {
  [stack.type]: stack,
  [statRow.type]: statRow,
  [statTile.type]: statTile,
  [chatBubble.type]: chatBubble,
  [choiceList.type]: choiceList,
  [mapCard.type]: mapCard,
  [imageFrame.type]: imageFrame,
  [actionButton.type]: actionButton,
  [progressRing.type]: progressRing,
  [videoPlayer.type]: videoPlayer,
  [clockFace.type]: clockFace,
  [textBlock.type]: textBlock,
  [mediaBar.type]: mediaBar,
  [gaugeBar.type]: gaugeBar,
  [timeline.type]: timeline,
  [template.type]: template,
  // TEAM: add your primitive here → [myPrim.type]: myPrim,
};

export function getPrimitive(type: string): PrimitiveDefinition | undefined {
  return primitiveRegistry[type];
}

export function listPrimitives(): PrimitiveDefinition[] {
  return Object.values(primitiveRegistry);
}
