import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore } from '../store/tvStore';
import { buildShareUrl } from '../utils/shareLayout';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SavedLayoutsPanel() {
  const { theme, widgets, savedLayouts, savedLayoutsPanelOpen, saveCurrentLayout, loadSavedLayout, deleteSavedLayout, toggleSavedLayoutsPanel } = useTVStore();
  const [saveName, setSaveName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyUrl(layoutTheme: typeof theme, layoutWidgets: typeof widgets, id: string) {
    const url = buildShareUrl({ theme: layoutTheme, widgets: layoutWidgets });
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  if (!savedLayoutsPanelOpen) return null;

  function handleSave() {
    saveCurrentLayout(saveName);
    setSaveName('');
  }

  function handleDelete(id: string) {
    if (confirmDeleteId === id) {
      deleteSavedLayout(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  }

  return (
    <AnimatePresence>
      {savedLayoutsPanelOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
            onClick={toggleSavedLayoutsPanel}
          />

          {/* 패널 */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed top-[72px] right-6 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: theme.mode === 'dark' ? 'rgba(14, 20, 38, 0.97)' : 'rgba(240, 242, 248, 0.97)',
              border: `1px solid ${theme.accentColor}30`,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* 헤더 */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: `1px solid ${theme.accentColor}18` }}
            >
              <span className="text-sm font-semibold text-white/80">저장된 레이아웃</span>
              <button
                onClick={toggleSavedLayoutsPanel}
                className="text-white/40 hover:text-white/70 transition text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* 현재 레이아웃 저장 */}
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.accentColor}18` }}>
              <div className="text-[11px] text-white/40 mb-2 uppercase tracking-widest">현재 화면 저장</div>
              <div className="flex gap-2">
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="레이아웃 이름..."
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none placeholder:text-white/25 text-white/80 transition-colors"
                />
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition hover:brightness-110"
                  style={{
                    background: theme.accentColor,
                    color: theme.backgroundColor,
                  }}
                >
                  저장
                </button>
              </div>

              {/* 현재 화면 공유 링크 복사 */}
              <button
                onClick={() => copyUrl(theme, widgets, '__current__')}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition hover:brightness-110"
                style={{
                  background: `${theme.accentColor}14`,
                  border: `1px solid ${theme.accentColor}30`,
                  color: copiedId === '__current__' ? '#4ade80' : theme.accentColor,
                }}
              >
                <span>{copiedId === '__current__' ? '✓' : '📤'}</span>
                <span>{copiedId === '__current__' ? '링크 복사됨!' : '현재 화면 공유 링크 복사'}</span>
              </button>
            </div>

            {/* 저장 목록 */}
            <div className="max-h-72 overflow-y-auto">
              {savedLayouts.length === 0 ? (
                <div className="px-4 py-8 text-center text-white/25 text-sm">
                  저장된 레이아웃이 없어요
                </div>
              ) : (
                <ul className="py-1">
                  {savedLayouts.map((layout) => (
                    <li
                      key={layout.id}
                      className="group flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 transition"
                    >
                      {/* 색상 미리보기 */}
                      <div
                        className="w-7 h-7 rounded-md shrink-0 border border-white/10"
                        style={{ background: layout.theme.backgroundColor }}
                      >
                        <div
                          className="w-full h-full rounded-md opacity-70"
                          style={{
                            background: `linear-gradient(135deg, ${layout.theme.accentColor}55, transparent)`,
                          }}
                        />
                      </div>

                      {/* 이름 + 날짜 */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80 truncate">{layout.name}</div>
                        <div className="text-[10px] text-white/30">
                          {formatDate(layout.savedAt)} · 위젯 {layout.widgets.length}개
                        </div>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => loadSavedLayout(layout.id)}
                          className="px-2 py-1 rounded text-[11px] font-medium transition"
                          style={{
                            background: `${theme.accentColor}22`,
                            color: theme.accentColor,
                          }}
                        >
                          불러오기
                        </button>
                        <button
                          onClick={() => copyUrl(layout.theme, layout.widgets, layout.id)}
                          className="px-2 py-1 rounded text-[11px] font-medium transition"
                          style={{
                            background: copiedId === layout.id ? '#4ade8022' : 'rgba(255,255,255,0.05)',
                            color: copiedId === layout.id ? '#4ade80' : 'rgba(255,255,255,0.5)',
                          }}
                          title="공유 링크 복사"
                        >
                          {copiedId === layout.id ? '✓' : '공유'}
                        </button>
                        <button
                          onClick={() => handleDelete(layout.id)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                            confirmDeleteId === layout.id
                              ? 'bg-red-500/30 text-red-400'
                              : 'bg-white/5 text-white/40 hover:text-red-400'
                          }`}
                          title={confirmDeleteId === layout.id ? '한 번 더 클릭해 삭제' : '삭제'}
                        >
                          {confirmDeleteId === layout.id ? '확인' : '×'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
