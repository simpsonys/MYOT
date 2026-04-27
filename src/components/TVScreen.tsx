import { useEffect, useRef, useState } from 'react';
import ReactGridLayout, { type Layout } from 'react-grid-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore, MAIN_PLAYER_ID } from '../store/tvStore';
import { BlueprintRenderer } from '../runtime/blueprintRenderer';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const COLS = 12;
const ROWS = 8;
const GAP = 12;       // margin between widgets (px)
const PAD = 18;       // container padding (px)
const AI_TTL = 4500;  // ms before AI toast disappears

export function TVScreen() {
  const { theme, widgets, aiMessage, removeWidget, setAiMessage, updateWidgetGrid } =
    useTVStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(960);

  // rowHeight computed so the full grid fits exactly in a 16:9 box
  const rowHeight = Math.max(
    16,
    Math.floor((containerWidth * (9 / 16) - 2 * PAD - (ROWS - 1) * GAP) / ROWS),
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!aiMessage) return;
    const t = setTimeout(() => setAiMessage(null), AI_TTL);
    return () => clearTimeout(t);
  }, [aiMessage, setAiMessage]);

  // ── RGL layout 매핑 ───────────────────────────────────────────────
  const rglLayout: Layout[] = widgets.map((w) => ({
    i: w.id,
    x: w.grid.col - 1,
    y: w.grid.row - 1,
    w: w.grid.colspan,
    h: w.grid.rowspan,
    static: w.id === MAIN_PLAYER_ID,
    isDraggable: w.id !== MAIN_PLAYER_ID,
    isResizable: w.id !== MAIN_PLAYER_ID,
    minW: 2,
    minH: 1,
  }));

  const handleLayoutChange = (layout: Layout[]) => {
    layout.forEach((item) => {
      if (item.i === MAIN_PLAYER_ID) return;
      const w = widgets.find((w) => w.id === item.i);
      if (!w) return;
      const next = { col: item.x + 1, row: item.y + 1, colspan: item.w, rowspan: item.h };
      if (
        w.grid.col !== next.col ||
        w.grid.row !== next.row ||
        w.grid.colspan !== next.colspan ||
        w.grid.rowspan !== next.rowspan
      ) {
        updateWidgetGrid(item.i, next);
      }
    });
  };

  const defaultWidgetBg = theme.widgetBackground
    ?? (theme.backgroundImage ? 'rgba(10,14,26,0.55)' : 'rgba(20,27,45,0.75)');

  return (
    <div
      ref={containerRef}
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
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${theme.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(4px)', transform: 'scale(1.03)', opacity: 0.9 }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${theme.backgroundColor}55 0%, ${theme.backgroundColor}33 40%, ${theme.backgroundColor}44 100%)` }} />
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, transparent 40%, ${theme.backgroundColor}88 100%)` }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${theme.backgroundColor}BB 0%, transparent 28%)` }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RGL 위젯 그리드 ─────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {containerWidth > 0 && (
          <ReactGridLayout
            layout={rglLayout}
            cols={COLS}
            rowHeight={rowHeight}
            width={containerWidth}
            margin={[GAP, GAP]}
            containerPadding={[PAD, PAD]}
            onLayoutChange={handleLayoutChange}
            isDraggable
            isResizable
            resizeHandles={['se']}
            compactType={null}
            preventCollision
          >
            {widgets.map((w) => {
              const isPlayer = w.id === MAIN_PLAYER_ID;
              return (
                <div
                  key={w.id}
                  onMouseEnter={() => setHoveredId(w.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position: 'relative',
                    height: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    borderRadius: isPlayer ? 12 : theme.widgetBorderRadius,
                    background: w.style?.background ?? defaultWidgetBg,
                    opacity: w.style?.opacity ?? theme.widgetOpacity,
                    backdropFilter: isPlayer ? 'none' : 'blur(14px)',
                    padding: w.style?.padding ?? 10,
                    border: isPlayer ? 'none' : `1px solid ${theme.accentColor}35`,
                    boxShadow: isPlayer
                      ? 'none'
                      : `inset 0 1px 0 ${theme.accentColor}20, 0 4px 24px rgba(0,0,0,0.35)`,
                    transition:
                      'background 600ms ease, border-radius 400ms ease, border-color 600ms ease',
                  }}
                >
                  <BlueprintRenderer node={w.root} theme={theme} widgetId={w.id} />

                  {/* ── 삭제 버튼 ── */}
                  {!isPlayer && (
                    <AnimatePresence>
                      {hoveredId === w.id && (
                        <motion.button
                          key="del"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.15 }}
                          onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }}
                          title={`${w.label ?? w.id} 삭제`}
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'rgba(0,0,0,0.65)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            color: 'rgba(255,255,255,0.75)',
                            fontSize: 11, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 20, backdropFilter: 'blur(6px)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220,50,50,0.85)';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.65)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                          }}
                        >
                          ✕
                        </motion.button>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </ReactGridLayout>
        )}

        {/* 솔로 플레이어 힌트 */}
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
