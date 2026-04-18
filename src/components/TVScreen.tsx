import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore } from '../store/tvStore';
import { WidgetController } from '../runtime/widgetController';

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
      transition: 'background-color 400ms ease',
    }),
    [theme.backgroundColor],
  );

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
                  borderRadius: `${theme.widgetBorderRadius}px`,
                }}
              >
                <WidgetController widget={w} theme={theme} />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {widgets.length === 0 && (
          <div
            className="col-span-12 row-span-8 flex flex-col items-center justify-center text-center"
            style={{ color: theme.mode === 'dark' ? '#C4CAD4' : '#1A1A1A' }}
          >
            <div className="text-6xl mb-4 opacity-30">📺</div>
            <div className="text-lg opacity-60">너만의 TV를 만들어보세요</div>
            <div className="text-sm mt-2 opacity-40">
              아래 입력창에 자연어로 원하는 화면을 설명해주세요
            </div>
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
