import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore, MAIN_PLAYER_ID } from '../store/tvStore';
import { BlueprintRenderer } from '../runtime/blueprintRenderer';

const COLS = 12;
const ROWS = 8;

export function TVScreen() {
  const { theme, widgets, aiMessage } = useTVStore();

  const cellStyle = useMemo<React.CSSProperties>(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      gap: '12px',
      padding: '20px',
      width: '100%',
      height: '100%',
      background: theme.backgroundColor,
      transition: 'background 600ms ease, background-color 600ms ease',
    }),
    [theme.backgroundColor],
  );

  const defaultWidgetBg = theme.widgetBackground ?? 'rgba(20, 27, 45, 0.6)';
  const defaultTextColor =
    theme.textPrimaryColor ?? (theme.mode === 'dark' ? '#C4CAD4' : '#1A1A1A');

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
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
                  backdropFilter: w.id === MAIN_PLAYER_ID ? 'none' : 'blur(8px)',
                  padding: w.style?.padding ?? 10,
                  transition: 'background 600ms ease, border-radius 400ms ease',
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
        {/* Hint overlay when TV player has no content and no other widgets */}
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

      {aiMessage && (
        <motion.div
          key={aiMessage}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 mx-auto max-w-md px-4 py-2.5 rounded-full text-sm text-center backdrop-blur-md"
          style={{
            background: 'rgba(0,0,0,0.5)',
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
