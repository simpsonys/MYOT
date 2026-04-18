import type { PrimitiveProps } from '../../types';

// -----------------------------------------------------------------------
// Primitive Template — copy this folder to make a new primitive
// -----------------------------------------------------------------------
// A primitive is a PURE, COMPOSABLE atom. It should:
//   - Do one thing well (display text, show an image, collect a choice)
//   - Work at any size (grid cell can be 2×2 or 8×6)
//   - Respect theme (mode, accentColor)
//   - NOT know about "widgets" — it's an atom, not a molecule
//
// See /primitives/stat-tile or /primitives/chat-bubble for fuller examples.
// -----------------------------------------------------------------------

export interface TemplateProps {
  label: string;
}

export default function TemplatePrimitive({
  props,
  theme,
}: PrimitiveProps<TemplateProps>) {
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-xl p-3"
      style={{
        background: 'rgba(255,255,255,0.05)',
        color: theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A',
      }}
    >
      <span style={{ color: theme.accentColor }}>{props.label}</span>
    </div>
  );
}
