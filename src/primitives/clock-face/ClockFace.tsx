import { useState, useEffect } from 'react';
import type { PrimitiveProps } from '../../types';

export interface ClockFaceProps {
  style?: 'analog' | 'digital' | 'minimal';
  showDate?: boolean;
  showSeconds?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export default function ClockFacePrimitive({
  props,
  theme,
}: PrimitiveProps<ClockFaceProps>) {
  const clockStyle = props.style ?? 'digital';
  const showDate = props.showDate ?? true;
  const showSeconds = props.showSeconds ?? false;

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';

  const dateStr = showDate
    ? `${now.getMonth() + 1}월 ${now.getDate()}일 (${DAY_KO[now.getDay()]})`
    : null;

  if (clockStyle === 'analog') {
    const hourDeg = ((h % 12) / 12) * 360 + (m / 60) * 30;
    const minDeg = (m / 60) * 360 + (s / 60) * 6;
    const secDeg = (s / 60) * 360;

    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-1 rounded-xl p-2"
        style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
      >
        <svg viewBox="0 0 100 100" className="w-full flex-1" style={{ maxHeight: '85%' }}>
          {/* Face */}
          <circle cx="50" cy="50" r="46" fill="rgba(0,0,0,0.25)" stroke={theme.accentColor} strokeWidth="1.5" strokeOpacity="0.5" />
          {/* Hour markers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const x1 = 50 + 38 * Math.cos(angle);
            const y1 = 50 + 38 * Math.sin(angle);
            const x2 = 50 + 44 * Math.cos(angle);
            const y2 = 50 + 44 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={textColor} strokeWidth={i % 3 === 0 ? 2 : 1} strokeOpacity="0.5" />;
          })}
          {/* Hour hand */}
          <line
            x1="50" y1="50"
            x2={50 + 24 * Math.sin((hourDeg * Math.PI) / 180)}
            y2={50 - 24 * Math.cos((hourDeg * Math.PI) / 180)}
            stroke={textColor} strokeWidth="3.5" strokeLinecap="round"
          />
          {/* Minute hand */}
          <line
            x1="50" y1="50"
            x2={50 + 34 * Math.sin((minDeg * Math.PI) / 180)}
            y2={50 - 34 * Math.cos((minDeg * Math.PI) / 180)}
            stroke={textColor} strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Second hand */}
          {showSeconds && (
            <line
              x1="50" y1="50"
              x2={50 + 36 * Math.sin((secDeg * Math.PI) / 180)}
              y2={50 - 36 * Math.cos((secDeg * Math.PI) / 180)}
              stroke={theme.accentColor} strokeWidth="1.2" strokeLinecap="round"
            />
          )}
          <circle cx="50" cy="50" r="2.5" fill={theme.accentColor} />
        </svg>
        {dateStr && (
          <div className="text-[11px] opacity-60 tracking-wide">{dateStr}</div>
        )}
      </div>
    );
  }

  if (clockStyle === 'minimal') {
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-xl"
        style={{ color: textColor }}
      >
        <span
          className="font-bold tabular-nums tracking-tight leading-none"
          style={{ fontSize: 'clamp(2rem, 8vw, 5rem)', color: theme.accentColor }}
        >
          {pad(h)}:{pad(m)}
        </span>
      </div>
    );
  }

  // digital (default)
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      <div
        className="font-bold tabular-nums tracking-tight leading-none"
        style={{ fontSize: 'clamp(1.8rem, 6vw, 4rem)' }}
      >
        {pad(h)}
        <span style={{ color: theme.accentColor, opacity: s % 2 === 0 ? 1 : 0.3 }}>:</span>
        {pad(m)}
        {showSeconds && (
          <span className="text-[0.5em] opacity-70 ml-1">{pad(s)}</span>
        )}
      </div>
      {dateStr && (
        <div className="text-[11px] opacity-60 tracking-wide">{dateStr}</div>
      )}
    </div>
  );
}
