import { useEffect, useRef, useState } from 'react';
import { useBusEvent } from '../../runtime/eventBus';
import type { PrimitiveProps } from '../../types';

export interface CountdownTimerProps {
  durationSeconds: number;
  label?: string;
  onDoneEvent?: string;
  onStartEvent?: string;
  autoStart?: boolean;
}

type Status = 'idle' | 'running' | 'paused' | 'done';

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CountdownTimerPrimitive({
  props,
  theme,
  emit,
  widgetId,
}: PrimitiveProps<CountdownTimerProps>) {
  const total = Math.max(1, props.durationSeconds ?? 60);
  const [remaining, setRemaining] = useState(total);
  const [status, setStatus] = useState<Status>(props.autoStart ? 'running' : 'idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accent = theme.accentColor;
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';

  // Tick
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!);
            setStatus('done');
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  // Emit done event
  useEffect(() => {
    if (status === 'done' && props.onDoneEvent) {
      emit({ type: props.onDoneEvent, payload: { widgetId, label: props.label } });
    }
  }, [status]);

  // Listen for external start trigger (e.g. from action-button)
  useBusEvent(props.onStartEvent ?? '__none__', () => {
    if (status !== 'running') {
      setRemaining(total);
      setStatus('running');
    }
  });

  function handleToggle() {
    if (status === 'done') {
      setRemaining(total);
      setStatus('idle');
    } else if (status === 'running') {
      setStatus('paused');
    } else {
      setStatus('running');
    }
  }

  const progress = remaining / total;
  const R = 36;
  const circ = 2 * Math.PI * R;
  const dash = circ * progress;

  const isDone = status === 'done';
  const isRunning = status === 'running';
  const displayColor = isDone ? '#4ade80' : isRunning ? accent : `${accent}99`;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {props.label && (
        <span className="text-[10px] opacity-50 uppercase tracking-wider">{props.label}</span>
      )}

      {/* Ring + time */}
      <div className="relative flex items-center justify-center" style={{ width: 92, height: 92 }}>
        <svg width={92} height={92} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Track */}
          <circle
            cx={46} cy={46} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={6}
          />
          {/* Progress arc */}
          <circle
            cx={46} cy={46} r={R}
            fill="none"
            stroke={displayColor}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 46 46)"
            style={{ transition: 'stroke-dasharray 0.9s linear', filter: isRunning ? `drop-shadow(0 0 6px ${accent})` : undefined }}
          />
        </svg>

        {/* Center text */}
        <div className="flex flex-col items-center z-10">
          <span
            className="text-xl font-bold tabular-nums leading-none"
            style={{ color: displayColor }}
          >
            {isDone ? '완료!' : fmt(remaining)}
          </span>
          {!isDone && (
            <span className="text-[9px] opacity-30 mt-0.5">
              / {fmt(total)}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold transition hover:brightness-110 active:scale-95"
          style={{ background: isDone ? '#4ade8033' : `${accent}33`, color: isDone ? '#4ade80' : accent }}
        >
          {isDone ? '↺ 다시' : isRunning ? '⏸ 일시정지' : '▶ 시작'}
        </button>
        {status !== 'idle' && !isDone && (
          <button
            onClick={() => { setRemaining(total); setStatus('idle'); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:brightness-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.08)', color: `${textColor}99` }}
          >
            ↺
          </button>
        )}
      </div>
    </div>
  );
}
