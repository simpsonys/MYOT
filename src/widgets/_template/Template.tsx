import type { WidgetProps } from '../../types';

// -----------------------------------------------------------------------
// Template Widget (copy me to make a new widget)
// -----------------------------------------------------------------------
// This is the minimum shape of a widget's React component. Fill this in
// with whatever UI your widget needs. See /widgets/example/ for a fuller
// demonstration of utterances, actions, events, and collaboration.
// -----------------------------------------------------------------------

export interface TemplateConfig {
  label: string;
}

export default function TemplateWidget({ config, style, theme }: WidgetProps<TemplateConfig>) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center rounded-2xl p-4"
      style={{
        background: style.background ?? 'rgba(20, 27, 45, 0.6)',
        color: style.textColor ?? (theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A'),
        opacity: style.opacity ?? theme.widgetOpacity,
        borderRadius: style.borderRadius ?? theme.widgetBorderRadius,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="text-xs uppercase tracking-widest opacity-60">Template</div>
      <div className="text-2xl font-bold mt-2" style={{ color: theme.accentColor }}>
        {config.label}
      </div>
      <div className="text-[10px] opacity-40 mt-3">Copy me. Make something unexpected.</div>
    </div>
  );
}
