import { useState } from 'react';
import { listWidgets } from '../../widgets/registry';
import type { WidgetDefinition } from '../../types';

// =====================================================================
// Widget Inspector
// =====================================================================
// Developer-facing view showing every registered widget's contract:
//   - description, utterances, actions, collaborations, listened events
// Lets teammates see "what has the AI learned about my widget?" at a
// glance — the best debugging tool when your widget isn't getting called.
// =====================================================================

export function WidgetInspector() {
  const widgets = listWidgets();
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="text-xs opacity-60">
        {widgets.length} 개 위젯이 등록되어 있어요. 각 위젯의 AI 계약을 확인하세요.
      </div>
      {widgets.map((w) => (
        <div
          key={w.type}
          className="rounded-lg border border-white/10 bg-white/5 overflow-hidden"
        >
          <button
            onClick={() => setExpandedType(expandedType === w.type ? null : w.type)}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{w.icon}</span>
              <div className="text-left">
                <div className="text-sm font-bold">{w.name}</div>
                <div className="text-[10px] opacity-50 font-mono">{w.type}</div>
              </div>
            </div>
            <Badges w={w} />
          </button>
          {expandedType === w.type && <InspectorBody w={w} />}
        </div>
      ))}
    </div>
  );
}

function Badges({ w }: { w: WidgetDefinition }) {
  return (
    <div className="flex items-center gap-1">
      <Badge label={`${w.utterances.length} utterances`} />
      {w.actions && <Badge label={`${Object.keys(w.actions).length} actions`} />}
      {w.collaboratesWith && w.collaboratesWith.length > 0 && (
        <Badge label={`${w.collaboratesWith.length} collabs`} />
      )}
      {w.listensFor && w.listensFor.length > 0 && (
        <Badge label={`listens ${w.listensFor.length}`} />
      )}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 whitespace-nowrap">
      {label}
    </span>
  );
}

function InspectorBody({ w }: { w: WidgetDefinition }) {
  return (
    <div className="px-3 pb-3 space-y-3 text-xs border-t border-white/10 pt-3">
      <Section title="Description">
        <div className="opacity-80">{w.description}</div>
      </Section>

      <Section title={`Utterances (${w.utterances.length})`}>
        <div className="space-y-1.5">
          {w.utterances.map((u, i) => (
            <div key={i} className="rounded bg-white/5 p-2">
              <div className="font-bold">"{u.user}"</div>
              <div className="opacity-60 mt-0.5">
                → {u.intent}
                {u.action && ` · ${u.action}`}
                {u.emits && ` · emit ${u.emits.type}`}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {w.actions && Object.keys(w.actions).length > 0 && (
        <Section title={`Actions (${Object.keys(w.actions).length})`}>
          <div className="space-y-1">
            {Object.entries(w.actions).map(([name, a]) => (
              <div key={name} className="rounded bg-white/5 p-2">
                <div className="font-mono font-bold text-myot-accent">
                  {name}({a.params ? Object.keys(a.params).join(', ') : ''})
                </div>
                <div className="opacity-60 mt-0.5">{a.description}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {w.collaboratesWith && w.collaboratesWith.length > 0 && (
        <Section title="Collaborations">
          <div className="space-y-1">
            {w.collaboratesWith.map((c, i) => (
              <div key={i} className="rounded bg-white/5 p-2">
                <div className="opacity-80">
                  ↔ <span className="font-mono">{c.withType}</span>
                </div>
                <div className="opacity-60 mt-0.5">when {c.when}</div>
                <div className="opacity-80 mt-0.5">→ {c.behavior}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {w.listensFor && w.listensFor.length > 0 && (
        <Section title="Listens for">
          <div className="flex flex-wrap gap-1">
            {w.listensFor.map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-myot-accent/20 text-myot-accent"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="uppercase text-[10px] tracking-widest opacity-50 mb-1">{title}</div>
      {children}
    </div>
  );
}
