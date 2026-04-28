import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore, MAIN_PLAYER_ID } from '../store/tvStore';
import { BlueprintRenderer } from '../runtime/blueprintRenderer';

const PRIMITIVE_TILES = [
  { icon: '📊', label: 'stat-tile' },
  { icon: '🗺️', label: 'map-card' },
  { icon: '💬', label: 'chat-bubble' },
  { icon: '▤', label: 'stack' },
  { icon: '⭕', label: 'progress' },
  { icon: '🖼️', label: 'image' },
];

function AssemblingOverlay({ accentColor }: { accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
      style={{ background: 'rgba(8, 12, 24, 0.82)', backdropFilter: 'blur(3px)' }}
    >
      {/* Primitive tiles grid */}
      <div className="grid grid-cols-3 gap-3">
        {PRIMITIVE_TILES.map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: [0, 1, 0.6], scale: [0.6, 1.05, 1], y: [10, -2, 0] }}
            transition={{ delay: i * 0.18, duration: 0.5, repeat: Infinity, repeatDelay: PRIMITIVE_TILES.length * 0.18 + 0.8 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
            style={{
              background: `${accentColor}14`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            <span className="text-xl">{tile.icon}</span>
            <span className="text-[9px] font-mono opacity-60" style={{ color: accentColor }}>
              {tile.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Connecting pulse line */}
      <motion.div
        className="h-px w-40 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Status text */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        <span className="text-xs opacity-50 ml-1 text-white">AI가 프리미티브를 조합 중</span>
      </div>
    </motion.div>
  );
}

const COLS = 12;
const ROWS = 8;

export function TVScreen() {
  const { theme, widgets, aiMessage, isThinking, setAiMessage, conversation } = useTVStore();

  // Auto-dismiss toast after 4.5 s
  useEffect(() => {
    if (!aiMessage) return;
    const t = setTimeout(() => setAiMessage(null), 4500);
    return () => clearTimeout(t);
  }, [aiMessage, setAiMessage]);

  const lastUserMsg = isThinking
    ? [...conversation].reverse().find((m) => m.role === 'user')?.text ?? null
    : null;

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
                style={{
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
                  // 테마 accentColor 기반 테두리 + 발광
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

      {/* ── AI 조합 중 오버레이 ─────────────────────────────────────── */}
      <AnimatePresence>
        {isThinking && <AssemblingOverlay accentColor={theme.accentColor} />}
      </AnimatePresence>

      {/* ── TV-scoped fullscreen portal target ──────────────────────── */}
      <div id="tv-fullscreen-portal" className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }} />

      {/* ── 사용자 발화 말풍선 ──────────────────────────────────────── */}
      <AnimatePresence>
        {lastUserMsg && (
          <motion.div
            key={lastUserMsg}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute bottom-14 left-0 right-0 flex justify-center pointer-events-none"
            style={{ zIndex: 30 }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm max-w-sm"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
              }}
            >
              <span className="text-base">🙋</span>
              <span className="truncate">{lastUserMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
