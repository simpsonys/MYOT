import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore } from '../store/tvStore';
import { PRESET_WIDGETS, type PresetWidget } from '../data/presetWidgets';
import type { WidgetBlueprint } from '../types';
import { MAIN_PLAYER_ID } from '../store/tvStore';

const COLS = 12;
const ROWS = 8;

/** 위치와 겹치는 모든 위젯 (플레이어 포함) */
function getOverlapping(
  widgets: WidgetBlueprint[],
  col: number,
  row: number,
  colspan: number,
  rowspan: number,
): WidgetBlueprint[] {
  return widgets.filter(
    (w) =>
      col < w.grid.col + w.grid.colspan &&
      col + colspan > w.grid.col &&
      row < w.grid.row + w.grid.rowspan &&
      row + rowspan > w.grid.row,
  );
}

/** 위치와 겹치는 위젯 중 삭제 가능한 것만 (플레이어 제외) */
function getDeletableConflicts(
  widgets: WidgetBlueprint[],
  col: number,
  row: number,
  colspan: number,
  rowspan: number,
): WidgetBlueprint[] {
  return getOverlapping(widgets, col, row, colspan, rowspan).filter(
    (w) => w.id !== MAIN_PLAYER_ID,
  );
}

/**
 * 완전히 비어 있는 자리(플레이어 포함 어떤 위젯과도 겹치지 않음)를 찾는다.
 * 없으면 null.
 */
function findFreeSlot(
  widgets: WidgetBlueprint[],
  colspan: number,
  rowspan: number,
): { col: number; row: number } | null {
  for (let r = 1; r <= ROWS - rowspan + 1; r++) {
    for (let c = 1; c <= COLS - colspan + 1; c++) {
      if (getOverlapping(widgets, c, r, colspan, rowspan).length === 0) {
        return { col: c, row: r };
      }
    }
  }
  return null;
}

/**
 * 빈 자리가 없을 때, 플레이어와 겹치지 않으면서 삭제 대상이 가장 적은 자리를 찾는다.
 * 그런 자리도 없으면 삭제 대상이 가장 적은 자리를 반환한다.
 */
function findBestConflictPosition(
  widgets: WidgetBlueprint[],
  colspan: number,
  rowspan: number,
): { col: number; row: number; conflicts: WidgetBlueprint[] } {
  let best: { col: number; row: number; conflicts: WidgetBlueprint[] } | null = null;

  for (let r = 1; r <= ROWS - rowspan + 1; r++) {
    for (let c = 1; c <= COLS - colspan + 1; c++) {
      const all = getOverlapping(widgets, c, r, colspan, rowspan);
      const hitsPlayer = all.some((w) => w.id === MAIN_PLAYER_ID);
      if (hitsPlayer) continue; // 플레이어를 덮는 위치는 건너뜀

      const deletable = all.filter((w) => w.id !== MAIN_PLAYER_ID);
      if (deletable.length === 0) continue; // 이미 findFreeSlot 에서 걸렸어야 함

      if (best === null || deletable.length < best.conflicts.length) {
        best = { col: c, row: r, conflicts: deletable };
      }
    }
  }

  // 플레이어를 피할 자리가 전혀 없으면(극단적 케이스) 삭제 대상 최소 위치로 폴백
  if (!best) {
    for (let r = 1; r <= ROWS - rowspan + 1; r++) {
      for (let c = 1; c <= COLS - colspan + 1; c++) {
        const deletable = getDeletableConflicts(widgets, c, r, colspan, rowspan);
        if (deletable.length === 0) continue;
        if (best === null || deletable.length < best.conflicts.length) {
          best = { col: c, row: r, conflicts: deletable };
        }
      }
    }
  }

  return best ?? { col: COLS - colspan + 1, row: ROWS - rowspan + 1, conflicts: [] };
}

// ── 카테고리 ──────────────────────────────────────────────────────────

const CATEGORIES = ['전체', '건강', '미디어', '생활', '정보', '가족'] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
  건강: '#10B981',
  미디어: '#8B5CF6',
  생활: '#F59E0B',
  정보: '#3B82F6',
  가족: '#EC4899',
};

// ── WidgetCard ────────────────────────────────────────────────────────

function WidgetCard({
  widget,
  accentColor,
  onAdd,
  added,
}: {
  widget: PresetWidget;
  accentColor: string;
  onAdd: () => void;
  added: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const categoryColor = CATEGORY_COLORS[widget.category] ?? accentColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? categoryColor + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        userSelect: 'none',
      }}
      onClick={onAdd}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: categoryColor + '18',
          border: `1px solid ${categoryColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {widget.emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
            {widget.label}
          </span>
          <span
            style={{
              fontSize: 9,
              padding: '1px 6px',
              borderRadius: 20,
              background: categoryColor + '20',
              color: categoryColor,
              border: `1px solid ${categoryColor}35`,
              fontWeight: 500,
              letterSpacing: '0.04em',
            }}
          >
            {widget.category}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
          {widget.tagline}
        </div>
      </div>

      <motion.div
        animate={{
          background: added ? '#10B981' : hovered ? accentColor : 'rgba(255,255,255,0.08)',
          color: added || hovered ? '#000' : 'rgba(255,255,255,0.5)',
        }}
        transition={{ duration: 0.18 }}
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {added ? '✓' : '+'}
      </motion.div>
    </motion.div>
  );
}

// ── 확인 모달 ─────────────────────────────────────────────────────────

interface ConfirmPending {
  blueprint: WidgetBlueprint;
  conflicts: WidgetBlueprint[];
}

function ConfirmModal({
  pending,
  accentColor,
  onConfirm,
  onCancel,
}: {
  pending: ConfirmPending;
  accentColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        borderRadius: 20,
        background: 'rgba(8,12,24,0.97)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 24px',
        gap: 20,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 32 }}>⚠️</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
          자리가 이미 차 있어요
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          <strong style={{ color: 'rgba(255,255,255,0.75)' }}>
            {`"${pending.blueprint.label}"`}
          </strong>
          을(를) 추가하려면<br />
          아래 위젯을 먼저 지워야 해요.
        </div>
      </div>

      {/* 충돌 위젯 목록 */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {pending.conflicts.map((w) => (
          <div
            key={w.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 10,
              background: 'rgba(255,80,80,0.1)',
              border: '1px solid rgba(255,80,80,0.25)',
            }}
          >
            <span style={{ fontSize: 14 }}>🗑️</span>
            <span style={{ fontSize: 12, color: 'rgba(255,180,180,0.9)', fontWeight: 500 }}>
              {w.label ?? w.id}
            </span>
          </div>
        ))}
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 10,
            border: 'none',
            background: accentColor,
            color: '#000',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'filter 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
        >
          지우고 추가하기
        </button>
      </div>
    </motion.div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────

export function WidgetGallery() {
  const { theme, widgets, widgetGalleryOpen, toggleWidgetGallery, placeWidget, removeWidget } =
    useTVStore();
  const [filter, setFilter] = useState<CategoryFilter>('전체');
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  const [confirmPending, setConfirmPending] = useState<ConfirmPending | null>(null);

  if (!widgetGalleryOpen) return null;

  const filtered =
    filter === '전체' ? PRESET_WIDGETS : PRESET_WIDGETS.filter((w) => w.category === filter);

  function markAdded(templateId: string) {
    setRecentlyAdded((prev) => {
      const next = new Set(prev);
      next.add(templateId);
      setTimeout(() => {
        setRecentlyAdded((s) => {
          const n = new Set(s);
          n.delete(templateId);
          return n;
        });
      }, 1800);
      return next;
    });
  }

  function handleAdd(widget: PresetWidget) {
    const colspan = 4;
    const rowspan = 4;
    const freeSlot = findFreeSlot(widgets, colspan, rowspan);

    const blueprint: WidgetBlueprint = {
      id: `${widget.templateId}-${Date.now()}`,
      label: widget.label,
      grid: freeSlot
        ? { col: freeSlot.col, row: freeSlot.row, colspan, rowspan }
        : { col: 1, row: 1, colspan, rowspan }, // 임시값, 확인 후 덮어씀
      root: widget.root,
      style: widget.style,
    };

    if (freeSlot) {
      // 빈 자리 있음 → 바로 추가
      placeWidget(blueprint);
      markAdded(widget.templateId);
    } else {
      // 빈 자리 없음 → 충돌이 가장 적은 위치를 찾아 확인 요청
      const { col, row, conflicts } = findBestConflictPosition(widgets, colspan, rowspan);
      blueprint.grid = { col, row, colspan, rowspan };
      setConfirmPending({ blueprint, conflicts });
    }
  }

  function handleConfirm() {
    if (!confirmPending) return;
    confirmPending.conflicts.forEach((w) => removeWidget(w.id));
    placeWidget(confirmPending.blueprint);

    const templateId = confirmPending.blueprint.id.split('-')[0];
    markAdded(templateId);
    setConfirmPending(null);
  }

  return (
    <AnimatePresence>
      {widgetGalleryOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(3px)',
            }}
            onClick={() => {
              if (confirmPending) {
                setConfirmPending(null);
              } else {
                toggleWidgetGallery();
              }
            }}
          />

          {/* 패널 */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              position: 'fixed',
              top: 72,
              right: 6,
              zIndex: 50,
              width: 340,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              background: theme.mode === 'dark' ? 'rgba(12,18,34,0.97)' : 'rgba(240,242,248,0.97)',
              border: `1px solid ${theme.accentColor}30`,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* 확인 모달 (오버레이) */}
            <AnimatePresence>
              {confirmPending && (
                <ConfirmModal
                  pending={confirmPending}
                  accentColor={theme.accentColor}
                  onConfirm={handleConfirm}
                  onCancel={() => setConfirmPending(null)}
                />
              )}
            </AnimatePresence>

            {/* 헤더 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: `1px solid ${theme.accentColor}18`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🧩</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                  위젯 갤러리
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: '1px 7px',
                    borderRadius: 20,
                    background: theme.accentColor + '20',
                    color: theme.accentColor,
                    border: `1px solid ${theme.accentColor}40`,
                    fontWeight: 500,
                  }}
                >
                  {PRESET_WIDGETS.length}개
                </span>
              </div>
              <button
                onClick={toggleWidgetGallery}
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 18,
                  lineHeight: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                ×
              </button>
            </div>

            {/* 카테고리 필터 */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                padding: '10px 14px',
                borderBottom: `1px solid ${theme.accentColor}12`,
                flexWrap: 'wrap',
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 20,
                    border: `1px solid ${filter === cat ? theme.accentColor + '60' : 'rgba(255,255,255,0.1)'}`,
                    background: filter === cat ? theme.accentColor + '20' : 'transparent',
                    color: filter === cat ? theme.accentColor : 'rgba(255,255,255,0.45)',
                    cursor: 'pointer',
                    fontWeight: filter === cat ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 위젯 목록 */}
            <div
              style={{
                maxHeight: 420,
                overflowY: 'auto',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((widget) => (
                  <WidgetCard
                    key={widget.templateId}
                    widget={widget}
                    accentColor={theme.accentColor}
                    onAdd={() => handleAdd(widget)}
                    added={recentlyAdded.has(widget.templateId)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* 푸터 힌트 */}
            <div
              style={{
                padding: '10px 16px',
                borderTop: `1px solid ${theme.accentColor}12`,
                fontSize: 10,
                color: 'rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}
            >
              클릭하면 현재 화면에 위젯이 추가됩니다 · 발화로도 만들 수 있어요
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
