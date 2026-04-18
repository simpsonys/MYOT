import { useEffect, useState } from 'react';
import type { WidgetProps } from '../../types';
import { useWidgetEvent } from '../../runtime/eventBus';

// =====================================================================
// EXAMPLE WIDGET — the reference implementation
// =====================================================================
// This widget has no "real" purpose. It exists so team members can SEE
// every advanced pattern in one place:
//
//   1. Reactive config updates (updateConfig → re-render)
//   2. Subscribing to events from other widgets (useWidgetEvent)
//   3. Visual response to theme changes
//   4. Conditional UI based on its own state
//
// The corresponding index.ts shows how to declare:
//   - utterances (create, modify, invoke_action)
//   - an action the AI can call
//   - a collaboration hint with another (hypothetical) widget
//   - event subscriptions
// =====================================================================

export interface ExampleConfig {
  /** A headline shown at the top */
  title: string;
  /** The mood — changes the widget's visual tone */
  mood: 'calm' | 'energetic' | 'focused' | 'playful';
  /** Counter value; incremented by actions */
  score: number;
}

const MOOD_STYLE: Record<ExampleConfig['mood'], { gradient: string; emoji: string }> = {
  calm: { gradient: 'linear-gradient(135deg, #4A7C9E, #3A5F7E)', emoji: '🌊' },
  energetic: { gradient: 'linear-gradient(135deg, #FF6B6B, #FFB86B)', emoji: '⚡' },
  focused: { gradient: 'linear-gradient(135deg, #2C3E50, #4A5F7E)', emoji: '🎯' },
  playful: { gradient: 'linear-gradient(135deg, #7B61FF, #FF6BCB)', emoji: '🎨' },
};

export default function ExampleWidget({ config, style, theme }: WidgetProps<ExampleConfig>) {
  const mood = MOOD_STYLE[config.mood] ?? MOOD_STYLE.calm;
  const [externalSignal, setExternalSignal] = useState<string | null>(null);

  // Pattern: react to events emitted by other widgets.
  // If any widget emits "demo.pulse", this widget flashes for 1s.
  useWidgetEvent('demo.pulse', (e) => {
    setExternalSignal(`Pulse from ${e.source}`);
  });

  useEffect(() => {
    if (!externalSignal) return;
    const t = setTimeout(() => setExternalSignal(null), 1200);
    return () => clearTimeout(t);
  }, [externalSignal]);

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-4 relative overflow-hidden"
      style={{
        background: style.background ?? mood.gradient,
        color: style.textColor ?? '#FFFFFF',
        opacity: style.opacity ?? theme.widgetOpacity,
        borderRadius: style.borderRadius ?? theme.widgetBorderRadius,
        transition: 'background 400ms ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest opacity-70">
          Example · {config.mood}
        </span>
        <span className="text-2xl">{mood.emoji}</span>
      </div>

      {/* Body */}
      <div>
        <div className="text-xl font-bold leading-tight">{config.title}</div>
        <div
          className="text-5xl font-mono font-bold mt-2 tabular-nums"
          style={{ color: theme.accentColor }}
        >
          {config.score}
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-[10px] opacity-60">
        이 위젯은 utterance · action · event · collaboration 패턴을 전부 보여줘요
      </div>

      {/* Event flash overlay */}
      {externalSignal && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: 'rgba(0, 212, 255, 0.25)',
            animation: 'pulse 1.2s ease-out',
          }}
        >
          <span className="text-xs font-bold bg-black/50 px-3 py-1 rounded-full">
            ⚡ {externalSignal}
          </span>
        </div>
      )}
    </div>
  );
}
