import { useState } from 'react';
import type { WidgetProps } from '../../types';
import { useWidgetEvent } from '../../runtime/eventBus';

// =====================================================================
// RUNNING COACH — the differentiation showcase
// =====================================================================
// This is Myot's "Living Widget" — a widget that doesn't just display
// data, it converses with the user. It demonstrates:
//   - Multiple action types (data modification, recommendation list)
//   - Reaction to the user's emotional utterances ("가뿐한데", "힘들어")
//   - Suggestion cards that the user can pick from
// =====================================================================

export interface RouteSuggestion {
  name: string;
  vibe: string;
  extraKm: number;
  extraKcal: number;
  caution?: string;
}

export interface RunningCoachConfig {
  distanceKm: number;
  durationMin: number;
  avgPaceMinKm: number;
  commentary: string;
  /** If set, coach is suggesting routes — widget shows them as cards */
  suggestions: RouteSuggestion[] | null;
  /** Recovery mode — coach recommends rest */
  recoveryMode: boolean;
}

export default function RunningCoachWidget({
  config,
  style,
  theme,
}: WidgetProps<RunningCoachConfig>) {
  const [weatherHint, setWeatherHint] = useState<string | null>(null);

  // Collaborate with a hypothetical weather widget via the event bus.
  // If a weather widget exists and emits a rain event, the coach adjusts
  // its commentary. This is how cross-widget orchestration works WITHOUT
  // tight coupling.
  useWidgetEvent('weather.changed', (e) => {
    const p = e.payload as { condition?: string } | undefined;
    if (p?.condition === 'rain') setWeatherHint('☔ 실내 러닝 머신 추천');
    else setWeatherHint(null);
  });

  const pace = config.avgPaceMinKm;
  const paceMin = Math.floor(pace);
  const paceSec = Math.round((pace - paceMin) * 60);

  return (
    <div
      className="w-full h-full p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background:
          style.background ??
          'linear-gradient(135deg, rgba(123, 97, 255, 0.25), rgba(0, 212, 255, 0.12))',
        color: style.textColor ?? (theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A'),
        opacity: style.opacity ?? theme.widgetOpacity,
        borderRadius: style.borderRadius ?? theme.widgetBorderRadius,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏃</span>
          <span className="text-xs uppercase tracking-widest opacity-70">오늘의 러닝</span>
        </div>
        {config.recoveryMode && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200">
            회복 모드
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="거리" value={config.distanceKm.toFixed(1)} unit="km" accent={theme.accentColor} />
        <Stat label="시간" value={String(config.durationMin)} unit="min" accent={theme.accentColor} />
        <Stat
          label="페이스"
          value={`${paceMin}'${String(paceSec).padStart(2, '0')}"`}
          unit="/km"
          accent={theme.accentColor}
        />
      </div>

      {/* Coach commentary bubble */}
      <div
        className="rounded-xl px-3 py-2 text-sm"
        style={{ background: 'rgba(0,0,0,0.3)', color: theme.accentColor }}
      >
        <span className="text-xs opacity-70 mr-1">🤖</span>
        {config.commentary}
      </div>

      {/* Suggestion cards */}
      {config.suggestions && config.suggestions.length > 0 && (
        <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-y-auto">
          {config.suggestions.map((s, i) => (
            <div
              key={i}
              className="rounded-lg px-3 py-2 text-xs border border-white/10 bg-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {s.name}
                </span>
                <span className="text-[10px] opacity-70">
                  +{s.extraKm}km · +{s.extraKcal}kcal
                </span>
              </div>
              <div className="text-[11px] opacity-75 mt-0.5">{s.vibe}</div>
              {s.caution && (
                <div className="text-[10px] mt-1 text-amber-300">⚠ {s.caution}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Weather collaboration badge */}
      {weatherHint && (
        <div className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded-full bg-black/40">
          {weatherHint}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg bg-white/5 px-2 py-1.5">
      <div className="text-[10px] opacity-60 uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-0.5 mt-0.5">
        <span className="text-lg font-bold tabular-nums" style={{ color: accent }}>
          {value}
        </span>
        <span className="text-[10px] opacity-60">{unit}</span>
      </div>
    </div>
  );
}
