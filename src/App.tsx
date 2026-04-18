import { useEffect } from 'react';
import { TVScreen } from './components/TVScreen';
import { PromptInput } from './components/PromptInput';
import { RecommendationPanel } from './components/RecommendationPanel';
import { DevToolsPanel } from './components/devtools/DevToolsPanel';
import { EventBusProvider } from './runtime/eventBus';
import { listWidgets } from './widgets/registry';
import { useTVStore } from './store/tvStore';

function Shell() {
  const widgets = listWidgets();
  const toggleDevTools = useTVStore((s) => s.toggleDevTools);

  // Keyboard: Cmd/Ctrl+K toggles Dev Tools
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
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-myot-accent/20 flex items-center justify-center text-xl">
            📺
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">Myot</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-myot-accent">
              Playground · Make Your Own TV
            </div>
          </div>
        </div>
        <div className="text-xs opacity-50 flex items-center gap-3">
          <span>{widgets.length} widgets</span>
          <span className="opacity-50">·</span>
          <span className="font-mono">⌘K for DevTools</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        <TVScreen />
        <div>
          <PromptInput />
          <RecommendationPanel />
        </div>
      </main>

      <footer className="px-6 py-3 text-[10px] opacity-40 text-center border-t border-white/5">
        Self-describing widget playground · Powered by Gemini · {widgets.map((w) => w.name).join(' · ')}
      </footer>

      <DevToolsPanel />
    </div>
  );
}

export default function App() {
  return (
    <EventBusProvider>
      <Shell />
    </EventBusProvider>
  );
}
