import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TVScreen } from './components/TVScreen';
import { PromptInput } from './components/PromptInput';
import { RecommendationPanel } from './components/RecommendationPanel';
import { DevToolsPanel } from './components/devtools/DevToolsPanel';
import { LayoutSelector } from './components/LayoutSelector';
import { SavedLayoutsPanel } from './components/SavedLayoutsPanel';
import { WidgetGallery } from './components/WidgetGallery';
import { EventBusProvider } from './runtime/eventBus';
import { listPrimitives } from './primitives/registry';
import { useTVStore } from './store/tvStore';
import type { PresetLayout } from './data/presetLayouts';
import { getSharedLayoutFromUrl, clearShareParam } from './utils/shareLayout';
import type { Theme, WidgetBlueprint } from './types';

// ── Main app shell ────────────────────────────────────────────────────

function Shell() {
  const primitives = listPrimitives();
  const toggleDevTools = useTVStore((s) => s.toggleDevTools);
  const toggleSavedLayoutsPanel = useTVStore((s) => s.toggleSavedLayoutsPanel);
  const toggleWidgetGallery = useTVStore((s) => s.toggleWidgetGallery);
  const savedLayouts = useTVStore((s) => s.savedLayouts);
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
        <div className="flex items-center gap-3">
          <button
            onClick={toggleWidgetGallery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition hover:brightness-110"
            style={{
              background: `${theme.accentColor}18`,
              border: `1px solid ${theme.accentColor}30`,
              color: theme.accentColor,
            }}
          >
            <span>🧩</span>
            <span>위젯 갤러리</span>
          </button>
          <button
            onClick={toggleSavedLayoutsPanel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition hover:brightness-110"
            style={{
              background: `${theme.accentColor}18`,
              border: `1px solid ${theme.accentColor}30`,
              color: theme.accentColor,
            }}
          >
            <span>💾</span>
            <span>저장 / 불러오기</span>
            {savedLayouts.length > 0 && (
              <span
                className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: theme.accentColor, color: theme.backgroundColor }}
              >
                {savedLayouts.length}
              </span>
            )}
          </button>
          <div className="text-[11px] flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <span>{primitives.length} primitives</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span className="font-mono">⌘K DevTools</span>
          </div>
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
      <SavedLayoutsPanel />
      <WidgetGallery />
    </motion.div>
  );
}

// ── Shared layout import prompt ───────────────────────────────────────

interface SharedPromptProps {
  sharedLayout: { theme: Theme; widgets: WidgetBlueprint[] };
  onAccept: () => void;
  onDecline: () => void;
}

function SharedLayoutPrompt({ sharedLayout, onAccept, onDecline }: SharedPromptProps) {
  const { theme } = sharedLayout;
  return (
    <motion.div
      key="shared-prompt"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0A0E1A' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(14,20,38,0.97)',
          border: `1px solid ${theme.accentColor}40`,
        }}
      >
        {/* 미리보기 색상 띠 */}
        <div
          className="h-2"
          style={{
            background: `linear-gradient(90deg, ${theme.backgroundColor}, ${theme.accentColor})`,
          }}
        />

        <div className="px-6 py-6">
          {/* 아이콘 + 제목 */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${theme.accentColor}22`, border: `1px solid ${theme.accentColor}40` }}
            >
              📺
            </div>
            <div>
              <div className="text-white font-semibold text-sm">친구의 레이아웃</div>
              <div className="text-white/40 text-[11px]">공유된 Myot 화면이에요</div>
            </div>
          </div>

          {/* 레이아웃 정보 */}
          <div
            className="rounded-xl px-4 py-3 mb-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-sm" style={{ background: theme.backgroundColor, border: `1px solid ${theme.accentColor}60` }} />
              <div className="w-4 h-4 rounded-sm" style={{ background: theme.accentColor }} />
              <div className="text-white/40 text-[11px] ml-1">{theme.mode === 'dark' ? '다크' : '라이트'} 테마</div>
            </div>
            <div className="text-white/50 text-[11px]">
              위젯 {sharedLayout.widgets.length}개
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={onDecline}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
            >
              무시하기
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition hover:brightness-110"
              style={{ background: theme.accentColor, color: theme.backgroundColor }}
            >
              불러오기
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Router ────────────────────────────────────────────────────────────

function AppRouter() {
  const layoutSelected = useTVStore((s) => s.layoutSelected);
  const enterApp = useTVStore((s) => s.enterApp);
  const [sharedLayout, setSharedLayout] = useState<{ theme: Theme; widgets: WidgetBlueprint[] } | null>(null);

  useEffect(() => {
    const layout = getSharedLayoutFromUrl();
    if (layout) {
      setSharedLayout(layout);
      clearShareParam();
    }
  }, []);

  const handleSelect = (preset: PresetLayout) => {
    enterApp({ theme: preset.theme, widgets: preset.widgets });
  };

  if (sharedLayout && !layoutSelected) {
    return (
      <AnimatePresence mode="wait">
        <SharedLayoutPrompt
          key="shared"
          sharedLayout={sharedLayout}
          onAccept={() => {
            enterApp({ theme: sharedLayout.theme, widgets: sharedLayout.widgets });
            setSharedLayout(null);
          }}
          onDecline={() => setSharedLayout(null)}
        />
      </AnimatePresence>
    );
  }

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
