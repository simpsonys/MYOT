import { useState } from 'react';
import { listPrimitives } from '../../primitives/registry';
import type { PrimitiveDefinition } from '../../types';

export function PrimitiveInspector() {
  const primitives = listPrimitives();
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="text-xs opacity-60">
        {primitives.length} 개의 프리미티브가 등록되어 있어요. AI 가 이것들을 조합해 위젯을 만듭니다.
      </div>
      {primitives.map((p) => (
        <div
          key={p.type}
          className="rounded-lg border border-white/10 bg-white/5 overflow-hidden"
        >
          <button
            onClick={() => setExpandedType(expandedType === p.type ? null : p.type)}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{p.icon}</span>
              <div className="text-left">
                <div className="text-sm font-bold flex items-center gap-1.5">
                  {p.name}
                  {p.isContainer && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-myot-purple/30 text-myot-purple">
                      CONTAINER
                    </span>
                  )}
                </div>
                <div className="text-[10px] opacity-50 font-mono">{p.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                {p.examples.length} ex
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                {Object.keys(p.propsSchema).length} props
              </span>
            </div>
          </button>
          {expandedType === p.type && <InspectorBody p={p} />}
        </div>
      ))}
    </div>
  );
}

function InspectorBody({ p }: { p: PrimitiveDefinition }) {
  return (
    <div className="px-3 pb-3 space-y-3 text-xs border-t border-white/10 pt-3">
      <Section title="Description">
        <div className="opacity-80">{p.description}</div>
      </Section>

      <Section title="Props">
        <div className="space-y-1">
          {Object.entries(p.propsSchema).map(([k, v]) => (
            <div key={k} className="rounded bg-white/5 p-2">
              <div className="font-mono font-bold text-myot-accent">{k}</div>
              <div className="opacity-60 mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={`Composition Examples (${p.examples.length})`}>
        <div className="space-y-2">
          {p.examples.map((ex, i) => (
            <div key={i} className="rounded bg-white/5 p-2">
              <div className="font-bold opacity-90">{ex.context}</div>
              <pre className="text-[10px] opacity-70 mt-1 whitespace-pre-wrap break-words font-mono">
                {JSON.stringify(ex.blueprint, null, 2)}
              </pre>
              {ex.rationale && (
                <div className="text-[10px] opacity-60 mt-1 italic">
                  💡 {ex.rationale}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
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
