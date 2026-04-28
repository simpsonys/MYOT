import { lazy, Suspense, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { PrimitiveProps, PrimitiveNode } from '../../types';
import { useTVStore } from '../../store/tvStore';

export interface RoutePoint { lat: number; lng: number; }

export interface MultiRoute {
  route: RoutePoint[];
  label: string;
  color?: string;
  distanceKm?: number;
}

export interface MapCardProps {
  caption?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  route?: RoutePoint[];
  distanceKm?: number;
  multiRoutes?: MultiRoute[];
  seed?: string;
}

export const ROUTE_PALETTE = ['#00D4FF', '#FF6B35', '#4ADE80', '#A78BFA', '#FBBF24'];

const LeafletMap = lazy(() => import('./LeafletMap'));

export default function MapCardPrimitive(args: PrimitiveProps<MapCardProps>) {
  const { props, theme, emit, widgetId } = args;
  const [closed, setClosed] = useState(false);
  const hasMulti = !!props.multiRoutes?.length;
  const mutateWidgetReplace = useTVStore((s) => s.mutateWidgetReplace);
  const widgets = useTVStore((s) => s.widgets);

  // ── Multi-route: fullscreen portal overlay ──────────────────────────
  if (hasMulti && !closed) {
    const tvPortal = document.getElementById('tv-fullscreen-portal') ?? document.body;
    return createPortal(
      <FullscreenCourseMap
        multiRoutes={props.multiRoutes!}
        accentColor={theme.accentColor}
        onClose={() => setClosed(true)}
        onSelect={(i) => {
          const course = props.multiRoutes![i];
          emit({ type: 'course.selected', payload: { index: i, ...course } });

          // Find this map-card node in the widget tree and replace with single-route
          const widget = widgets.find((w) => w.id === widgetId);
          if (widget) {
            const path = findMapCardPath(widget.root) ?? [];
            const center = course.route[Math.floor(course.route.length / 2)];
            const newNode: PrimitiveNode = {
              primitive: 'map-card',
              props: {
                caption: course.label,
                distanceKm: course.distanceKm,
                center,
                zoom: 14,
                route: course.route,
              },
            };
            mutateWidgetReplace(widgetId, path, newNode);
          }
          setClosed(true);
        }}
        args={args}
      />,
      tvPortal,
    );
  }

  if (hasMulti && closed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs opacity-30 text-white">
        코스 선택 완료
      </div>
    );
  }

  // ── Single route: inline map ────────────────────────────────────────
  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl">
      <Suspense fallback={<MockMap seed={props.seed} />}>
        <LeafletMap {...args} />
      </Suspense>

      <div className="absolute inset-x-2 bottom-2 flex items-end justify-between pointer-events-none z-[1000]">
        {props.caption && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-black/60 text-white">
            📍 {props.caption}
          </span>
        )}
        {props.distanceKm != null && (
          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-black/60"
            style={{ color: theme.accentColor }}>
            {props.distanceKm}km
          </span>
        )}
      </div>
    </div>
  );
}

// ── Fullscreen course map overlay ────────────────────────────────────────────

function FullscreenCourseMap({
  multiRoutes, accentColor, onClose, onSelect, args,
}: {
  multiRoutes: MultiRoute[];
  accentColor: string;
  onClose: () => void;
  onSelect: (i: number) => void;
  args: PrimitiveProps<MapCardProps>;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  // Build modified props: highlight hovered route
  const displayRoutes: MultiRoute[] = multiRoutes.map((r, i) => ({
    ...r,
    color: r.color ?? ROUTE_PALETTE[i % ROUTE_PALETTE.length],
  }));

  const mapArgs: PrimitiveProps<MapCardProps> = {
    ...args,
    props: { ...args.props, multiRoutes: displayRoutes },
  };

  return (
    <AnimatePresence>
      <motion.div
        key="fullscreen-course-map"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'absolute', inset: 0, zIndex: 9999, pointerEvents: 'auto' }}
      >
        {/* Map fills viewport */}
        <Suspense fallback={<div className="w-full h-full bg-[#0A0E1A]" />}>
          <LeafletMap {...mapArgs} />
        </Suspense>

        {/* Top-right close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10001] w-9 h-9 flex items-center justify-center rounded-full text-white text-lg font-bold transition hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.65)', border: `1px solid ${accentColor}40` }}
        >
          ✕
        </button>

        {/* Bottom course selection panel */}
        <div
          className="absolute bottom-0 left-0 right-0 z-[10000] px-6 py-5 flex flex-col gap-3"
          style={{ background: 'linear-gradient(to top, rgba(8,12,24,0.96) 70%, transparent)' }}
        >
          <p className="text-xs text-white/50 mb-1">달리고 싶은 코스를 선택하세요</p>
          <div className="flex gap-3 flex-wrap">
            {displayRoutes.map((r, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => onSelect(i)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-white transition"
                style={{
                  background: hovered === i
                    ? `${r.color}28`
                    : 'rgba(255,255,255,0.07)',
                  border: `1.5px solid ${hovered === i ? r.color + 'CC' : r.color + '55'}`,
                  boxShadow: hovered === i ? `0 0 16px ${r.color}44` : 'none',
                }}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span>{r.label}</span>
                {r.distanceKm && (
                  <span className="text-[11px] opacity-60 ml-1">{r.distanceKm}km</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function findMapCardPath(node: PrimitiveNode, path: number[] = []): number[] | null {
  if (node.primitive === 'map-card') return path;
  for (let i = 0; i < (node.children?.length ?? 0); i++) {
    const result = findMapCardPath(node.children![i], [...path, i]);
    if (result !== null) return result;
  }
  return null;
}

function MockMap({ seed = 'myot-map' }: { seed?: string }) {
  return (
    <div className="w-full h-full" style={{
      background: `linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,97,255,0.1)),
        url(https://picsum.photos/seed/${encodeURIComponent(seed)}-map/640/360?blur=1) center/cover`,
    }} />
  );
}
