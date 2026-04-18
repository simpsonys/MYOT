import { useState } from 'react';
import { useTVStore } from '../../store/tvStore';
import { summarizeTree } from '../../runtime/treeOps';

export function BlueprintViewer() {
  const widgets = useTVStore((s) => s.widgets);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (widgets.length === 0) {
    return (
      <div className="text-xs opacity-40 italic">
        현재 화면에 위젯이 없어요. 발화를 입력해 AI 가 조립한 위젯의 블루프린트 트리를 여기서 볼 수 있어요.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs opacity-60">
        AI가 조립한 {widgets.length} 개 위젯의 현재 블루프린트 트리.
      </div>
      {widgets.map((w) => (
        <div
          key={w.id}
          className="rounded-lg border border-white/10 bg-white/5 overflow-hidden"
        >
          <button
            onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/5 text-xs"
          >
            <div className="text-left">
              <div className="font-bold">{w.label ?? w.id}</div>
              <div className="text-[10px] opacity-50 font-mono">
                {w.id} · grid ({w.grid.col},{w.grid.row}) {w.grid.colspan}×{w.grid.rowspan}
              </div>
            </div>
            <span className="text-[10px] opacity-60">
              root: {w.root.primitive}
            </span>
          </button>
          {expandedId === w.id && (
            <div className="px-3 pb-3 pt-2 border-t border-white/10 space-y-2">
              <div>
                <div className="uppercase text-[10px] tracking-widest opacity-50 mb-1">
                  Tree (compact)
                </div>
                <pre className="text-[10px] font-mono whitespace-pre-wrap bg-black/40 p-2 rounded">
                  {summarizeTree(w.root)}
                </pre>
              </div>
              <div>
                <div className="uppercase text-[10px] tracking-widest opacity-50 mb-1">
                  Full JSON
                </div>
                <pre className="text-[10px] font-mono whitespace-pre-wrap break-words bg-black/40 p-2 rounded max-h-60 overflow-auto">
                  {JSON.stringify(w.root, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
