import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore, MAIN_PLAYER_ID } from '../store/tvStore';
import { BlueprintRenderer } from '../runtime/blueprintRenderer';

const COLS = 12;
const ROWS = 8;
const AI_MESSAGE_TTL = 4500; // ms

export function TVScreen() {
  const { theme, widgets, aiMessage, removeWidget, setAiMessage } = useTVStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // aiMessage가 새로 설정되면 TTL 후 자동으로 지움
  useEffect(() => {
    if (!aiMessage) return;
    const timer = setTimeout(() => setAiMessage(null), AI_MESSAGE_TTL);
    return () => clearTimeout(timer);
  }, [aiMessage, setAiMessage]);

  const cellStyle = useMemo<React.CSSProperties>(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      gap: '14px',
      padding: '22px',
      width: '100%',
      height: '100%',
      position: 'relative',
      zIndex: 1,
      background: 'transparent', // 배경은 항상 아래 레이어에서 처리
      transition: 'background 600ms ease',
    }),
    [],
  );

  // 배경 이미지가 있으면 위젯을 더 투명하게 해 이미지가 비치도록
  const defaultWidgetBg = theme.widgetBackground
    ?? (theme.backgroundImage ? 'rgba(10, 14, 26, 0.55)' : 'rgba(20, 27, 45, 0.75)');
  const defaultTextColor =
    theme.textPrimaryColor ?? (theme.mode === 'dark' ? '#C4CAD4' : '#1A1A1A');

  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
      style={{ background: theme.backgroundColor, transition: 'background 600ms ease' }}
    >
      {/* ── 배경 이미지 레이어 ──────────────────────────────────────── */}
      <AnimatePresence>
        {theme.backgroundImage && (
          <motion.div
            key={theme.backgroundImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {/* 포스터/백드롭 원본 — 블러 최소화해 이미지 내용 인식 가능하게 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${theme.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(4px)',
                transform: 'scale(1.03)',
                opacity: 0.90,
              }}
            />
            {/* 배경색 경량 블렌드 — 이미지가 충분히 비치도록 (약 25% 덮음) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(160deg, ${theme.backgroundColor}55 0%, ${theme.backgroundColor}33 40%, ${theme.backgroundColor}44 100%)`,
              }}
            />
            {/* 가장자리 비네팅 — 위젯과 자연스럽게 이어지도록 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at center, transparent 40%, ${theme.backgroundColor}88 100%)`,
              }}
            />
            {/* 하단 비네팅 — 하단 배경 표시 공간 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to top, ${theme.backgroundColor}BB 0%, transparent 28%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 위젯 그리드 ─────────────────────────────────────────────── */}
      <div style={cellStyle}>
        <AnimatePresence mode="popLayout">
          {widgets.map((w) => {
            const { col, row, colspan, rowspan } = w.grid;
            return (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                onMouseEnter={() => setHoveredId(w.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  gridColumn: `${col} / span ${colspan}`,
                  gridRow: `${row} / span ${rowspan}`,
                  minWidth: 0,
                  minHeight: 0,
                  overflow: 'hidden',
                  borderRadius: w.id === MAIN_PLAYER_ID ? 12 : `${theme.widgetBorderRadius}px`,
                  background: w.style?.background ?? defaultWidgetBg,
                  opacity: w.style?.opacity ?? theme.widgetOpacity,
                  backdropFilter: w.id === MAIN_PLAYER_ID ? 'none' : 'blur(14px)',
                  padding: w.style?.padding ?? 10,
                  border: w.id === MAIN_PLAYER_ID
                    ? 'none'
                    : `1px solid ${theme.accentColor}35`,
                  boxShadow: w.id === MAIN_PLAYER_ID
                    ? 'none'
                    : `inset 0 1px 0 ${theme.accentColor}20, 0 4px 24px rgba(0,0,0,0.35)`,
                  transition: 'background 600ms ease, border-radius 400ms ease, border-color 600ms ease, box-shadow 600ms ease',
                }}
              >
                <BlueprintRenderer node={w.root} theme={theme} widgetId={w.id} />

                {/* ── 삭제 버튼 — main player 제외, 호버 시 표시 ── */}
                {w.id !== MAIN_PLAYER_ID && (
                  <AnimatePresence>
                    {hoveredId === w.id && (
                      <motion.button
                        key="delete-btn"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWidget(w.id);
                        }}
                        title={`${w.label ?? w.id} 삭제`}
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.65)',
                          border: '1px solid rgba(255,255,255,0.18)',
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 20,
                          backdropFilter: 'blur(6px)',
                          lineHeight: 1,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,50,50,0.85)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.65)';
                          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
                        }}
                      >
                        ✕
                      </motion.button>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {widgets.length === 0 && (
          <div
            className="col-span-12 row-span-8 flex flex-col items-center justify-center text-center"
            style={{ color: defaultTextColor }}
          >
            <div className="text-6xl mb-4 opacity-30">📺</div>
            <div className="text-lg opacity-60">너만의 TV를 만들어보세요</div>
            <div className="text-sm mt-2 opacity-40">
              말하면 AI가 프리미티브를 조합해 위젯을 즉석에서 만듭니다
            </div>
          </div>
        )}
        {widgets.length === 1 && widgets[0].id === MAIN_PLAYER_ID && (
          <div
            className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs"
            style={{
              background: 'rgba(0,0,0,0.45)',
              color: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(6px)',
            }}
          >
            영상을 불러오거나 아래에서 발화해 위젯을 추가하세요
          </div>
        )}
      </div>

      {/* ── AI 메시지 토스트 ─────────────────────────────────────────── */}
      {aiMessage && (
        <motion.div
          key={aiMessage}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 mx-auto max-w-md px-4 py-2.5 rounded-full text-sm text-center backdrop-blur-md"
          style={{
            zIndex: 10,
            background: 'rgba(0,0,0,0.55)',
            color: theme.accentColor,
            border: `1px solid ${theme.accentColor}40`,
          }}
        >
          🤖 {aiMessage}
        </motion.div>
      )}
    </div>
  );
}
