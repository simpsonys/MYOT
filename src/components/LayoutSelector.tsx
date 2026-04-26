import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PresetLayout } from '../data/presetLayouts';
import { PRESET_LAYOUTS } from '../data/presetLayouts';
import { MAIN_PLAYER_ID } from '../store/tvStore';
import type { WidgetBlueprint } from '../types';

// ── Mini grid preview ─────────────────────────────────────────────────

const WIDGET_COLORS: Record<string, string> = {
  'video-player': 'rgba(255,255,255,0.12)',
  'clock-face':   'rgba(255,255,255,0.18)',
  'chat-bubble':  'rgba(255,255,255,0.15)',
  'stack':        'rgba(255,255,255,0.13)',
  'stat-row':     'rgba(255,255,255,0.16)',
  'media-bar':    'rgba(255,255,255,0.18)',
  'timeline':     'rgba(255,255,255,0.16)',
  'gauge-bar':    'rgba(255,255,255,0.14)',
};

const WIDGET_ICONS: Record<string, string> = {
  'clock-face': '⏰',
  'chat-bubble': '💬',
  'stack': '💬',
  'stat-row': '📊',
  'media-bar': '🎵',
  'timeline': '📅',
  'gauge-bar': '📏',
};

function MiniPreview({ widgets, accentColor }: { widgets: WidgetBlueprint[]; accentColor: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(8, 1fr)',
        gap: 3,
        width: '100%',
        aspectRatio: '16/9',
        background: '#0A0E1A',
        borderRadius: 10,
        padding: 8,
        overflow: 'hidden',
      }}
    >
      {widgets.map((w) => {
        const isPlayer = w.id === MAIN_PLAYER_ID;
        const primitive = w.root.primitive;
        const bg = isPlayer
          ? `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`
          : (WIDGET_COLORS[primitive] ?? 'rgba(255,255,255,0.1)');
        const icon = isPlayer ? '📺' : (WIDGET_ICONS[primitive] ?? '▪');
        return (
          <div
            key={w.id}
            style={{
              gridColumn: `${w.grid.col} / span ${w.grid.colspan}`,
              gridRow: `${w.grid.row} / span ${w.grid.rowspan}`,
              background: bg,
              borderRadius: 5,
              border: isPlayer ? `1.5px solid ${accentColor}45` : '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isPlayer ? 16 : 10,
              transition: 'opacity 0.2s',
            }}
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
}

// ── Preset card ───────────────────────────────────────────────────────

function PresetCard({
  layout,
  index,
  onSelect,
}: {
  layout: PresetLayout;
  index: number;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onSelect}
      className="flex flex-col gap-4 rounded-2xl cursor-pointer select-none"
      style={{
        background: hovered
          ? `linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))`
          : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${hovered ? layout.theme.accentColor + '60' : 'rgba(255,255,255,0.08)'}`,
        padding: '20px',
        boxShadow: hovered
          ? `0 0 40px ${layout.theme.accentColor}20, 0 20px 40px rgba(0,0,0,0.4)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'border-color 0.25s, box-shadow 0.25s, background 0.25s',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Preview */}
      <MiniPreview widgets={layout.widgets} accentColor={layout.theme.accentColor} />

      {/* Info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{layout.emoji}</span>
          <span className="text-base font-bold text-white">{layout.name}</span>
          <span
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: layout.theme.accentColor + '20',
              color: layout.theme.accentColor,
              border: `1px solid ${layout.theme.accentColor}40`,
            }}
          >
            {layout.tagline}
          </span>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {layout.description}
        </p>
      </div>

      {/* Select button */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
        transition={{ duration: 0.18 }}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-center"
        style={{
          background: layout.theme.accentColor,
          color: layout.theme.backgroundColor,
        }}
      >
        이 레이아웃으로 시작
      </motion.div>
    </motion.div>
  );
}

// ── Main selector ─────────────────────────────────────────────────────

interface Props {
  onSelect: (layout: PresetLayout) => void;
}

export function LayoutSelector({ onSelect }: Props) {
  const [selecting, setSelecting] = useState<string | null>(null);

  const handleSelect = (layout: PresetLayout) => {
    if (selecting) return;
    setSelecting(layout.id);
    setTimeout(() => onSelect(layout), 350);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="layout-selector"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen flex flex-col items-center justify-center px-8 py-12"
        style={{ background: 'linear-gradient(160deg, #060810 0%, #0D1422 50%, #060810 100%)' }}
      >
        {/* Subtle background dots */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3 mb-12 text-center"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-1"
            style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}
          >
            📺
          </div>
          <div>
            <div className="text-3xl font-bold text-white tracking-tight">Myot</div>
            <div
              className="text-[11px] uppercase tracking-[0.25em] mt-1"
              style={{ color: '#00D4FF' }}
            >
              Make Your Own TV
            </div>
          </div>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            레이아웃을 선택하고 시작하세요 — 언제든 발화로 바꿀 수 있습니다
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="w-full grid gap-5"
          style={{
            maxWidth: 960,
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
          animate={{ opacity: selecting ? 0.4 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {PRESET_LAYOUTS.map((layout, i) => (
            <PresetCard
              key={layout.id}
              layout={layout}
              index={i}
              onSelect={() => handleSelect(layout)}
            />
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-[11px] text-center"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          AI가 프리미티브를 조합해 어떤 위젯도 실시간으로 만들어 드립니다
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
