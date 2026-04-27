import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TVScreen } from './components/TVScreen';
import { PromptInput } from './components/PromptInput';
import { RecommendationPanel } from './components/RecommendationPanel';
import { DevToolsPanel } from './components/devtools/DevToolsPanel';
import { LayoutSelector } from './components/LayoutSelector';
import { EventBusProvider } from './runtime/eventBus';
import { listPrimitives } from './primitives/registry';
import { useTVStore } from './store/tvStore';
import type { PresetLayout } from './data/presetLayouts';

// ── Main app shell ────────────────────────────────────────────────────

function Shell() {
  const primitives = listPrimitives();
  const toggleDevTools = useTVStore((s) => s.toggleDevTools);
  const theme = useTVStore((s) => s.theme);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleDevTools();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleDevTools]);

  return (
    <motion.div
      key="shell"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="min-h-screen flex flex-col"
      style={{ background: theme.backgroundColor, transition: 'background 600ms ease' }}
    >
      <header
        className="px-6 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: theme.accentColor + '22', border: `1px solid ${theme.accentColor}30` }}
          >
            📺
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white">Myot</div>
            <div
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: theme.accentColor }}
            >
              Make Your Own TV
            </div>
          </div>
        </div>
        <div className="text-[11px] flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <span>{primitives.length} primitives</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span className="font-mono">⌘K DevTools</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col gap-5">
        <TVScreen />
        <div>
          <PromptInput />
          <RecommendationPanel />
        </div>
      </main>

      <footer
        className="px-6 py-2.5 text-[10px] text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}
      >
        위젯은 코드에 없습니다 — AI가 프리미티브를 조합해 실시간 생성합니다
      </footer>

      <DevToolsPanel />
    </motion.div>
  );
}

// ── Router ────────────────────────────────────────────────────────────

function AppRouter() {
  const layoutSelected = useTVStore((s) => s.layoutSelected);
  const enterApp = useTVStore((s) => s.enterApp);

  const handleSelect = (preset: PresetLayout) => {
    enterApp({ theme: preset.theme, widgets: preset.widgets });
  };

  return (
    <AnimatePresence mode="wait">
      {layoutSelected ? (
        <Shell key="shell" />
      ) : (
        <motion.div key="selector" exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }}>
          <LayoutSelector onSelect={handleSelect} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Entry point ───────────────────────────────────────────────────────

export default function App() {
  return (
    <EventBusProvider>
      <AppRouter />
    </EventBusProvider>
  );
}
