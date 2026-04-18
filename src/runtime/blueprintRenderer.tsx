import { memo, useMemo } from 'react';
import type { PrimitiveNode, Theme } from '../types';
import { getPrimitive } from '../primitives/registry';
import { useEventBus } from './eventBus';

// =====================================================================
// BlueprintRenderer
// =====================================================================
// Walks a PrimitiveNode tree and materializes it as React elements.
// This is the heart of the Hybrid architecture — at runtime, a "widget"
// is whatever the AI composed into a tree of primitives.
//
// Each primitive is given:
//   - its own props
//   - an `emit(evt)` callback tagged with the owning widget's id
//   - the active theme
//   - already-rendered children (if it's a container)
// =====================================================================

interface Props {
  node: PrimitiveNode;
  theme: Theme;
  widgetId: string;
}

function RenderNodeImpl({ node, theme, widgetId }: Props) {
  const { emit: emitRaw } = useEventBus();
  const emit = useMemo(
    () => (evt: { type: string; payload?: unknown }) =>
      emitRaw({ type: evt.type, source: widgetId, payload: evt.payload }),
    [emitRaw, widgetId],
  );

  const def = getPrimitive(node.primitive);
  if (!def) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[10px] text-red-400 bg-red-950/30 rounded p-2">
        Unknown primitive: <strong className="ml-1">{node.primitive}</strong>
      </div>
    );
  }

  // Merge defaults with AI-provided props
  const mergedProps = { ...def.defaultProps, ...(node.props ?? {}) };

  const Cmp = def.component;

  // Render children recursively if container
  const renderedChildren = def.isContainer
    ? node.children?.map((child, i) => (
        <BlueprintRenderer
          key={i}
          node={child}
          theme={theme}
          widgetId={widgetId}
        />
      ))
    : undefined;

  return (
    <Cmp
      props={mergedProps}
      theme={theme}
      widgetId={widgetId}
      emit={emit}
    >
      {renderedChildren}
    </Cmp>
  );
}

export const BlueprintRenderer = memo(RenderNodeImpl);
