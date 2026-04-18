import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore } from '../../store/tvStore';
import { WidgetInspector } from './WidgetInspector';
import { UtteranceTester } from './UtteranceTester';
import { EventLog, AITraceViewer } from './EventLog';

type Tab = 'inspector' | 'tester' | 'events' | 'trace';

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'inspector', label: 'Inspector', icon: '🔍' },
  { id: 'tester', label: 'Tester', icon: '🧪' },
  { id: 'events', label: 'Events', icon: '📡' },
  { id: 'trace', label: 'AI Trace', icon: '🧠' },
];

export function DevToolsPanel() {
  const { devToolsOpen, toggleDevTools } = useTVStore();
  const [tab, setTab] = useState<Tab>('inspector');

  return (
    <>
      <button
        onClick={toggleDevTools}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-myot-accent text-myot-bg font-bold shadow-lg hover:scale-110 transition"
        title="Dev Tools (Ctrl/Cmd+K)"
      >
        {devToolsOpen ? '×' : '⚙'}
      </button>

      <AnimatePresence>
        {devToolsOpen && (
          <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed top-0 right-0 h-full w-[420px] bg-myot-bg/98 backdrop-blur-xl border-l border-white/10 z-30 flex flex-col"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">🛠 Playground Dev Tools</div>
                <div className="text-[10px] opacity-50">
                  팀원용 디버깅 & 실험 도구
                </div>
              </div>
              <button
                onClick={toggleDevTools}
                className="text-xl opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>

            <div className="flex border-b border-white/10">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium transition ${
                    tab === t.id
                      ? 'bg-white/10 text-myot-accent'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="mr-1">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-4">
              {tab === 'inspector' && <WidgetInspector />}
              {tab === 'tester' && <UtteranceTester />}
              {tab === 'events' && <EventLog />}
              {tab === 'trace' && <AITraceViewer />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
