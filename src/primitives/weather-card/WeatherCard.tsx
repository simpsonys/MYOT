import type { PrimitiveProps } from '../../types';

export interface WeatherCardProps {
  location?: string;
  condition: string;
  temp: number;
  unit?: 'C' | 'F';
  high?: number;
  low?: number;
  humidity?: number;
  wind?: number;
  icon?: string;
}

const CONDITION_ICON: Record<string, string> = {
  맑음: '☀️', sunny: '☀️', clear: '☀️',
  구름: '⛅', cloudy: '⛅', 흐림: '☁️', overcast: '☁️',
  비: '🌧️', rain: '🌧️', rainy: '🌧️', 소나기: '🌦️',
  눈: '❄️', snow: '❄️', snowy: '❄️',
  천둥: '⛈️', storm: '⛈️', thunder: '⛈️',
  안개: '🌫️', fog: '🌫️', foggy: '🌫️',
  바람: '💨', windy: '💨',
};

function resolveIcon(condition: string, override?: string) {
  if (override) return override;
  const lower = condition.toLowerCase();
  for (const [key, val] of Object.entries(CONDITION_ICON)) {
    if (lower.includes(key)) return val;
  }
  return '🌡️';
}

export default function WeatherCardPrimitive({ props, theme }: PrimitiveProps<WeatherCardProps>) {
  const unit = props.unit ?? 'C';
  const icon = resolveIcon(props.condition, props.icon);
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const accent = theme.accentColor;

  return (
    <div
      className="w-full h-full flex flex-col justify-between rounded-xl px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {/* Header: location + condition */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] opacity-50 uppercase tracking-wider">
          {props.location ?? '현재 위치'}
        </span>
        <span className="text-[11px] opacity-60">{props.condition}</span>
      </div>

      {/* Hero: icon + temp */}
      <div className="flex items-center gap-3">
        <span className="text-4xl leading-none">{icon}</span>
        <span
          className="text-5xl font-bold tabular-nums leading-none"
          style={{ color: accent }}
        >
          {props.temp}
          <span className="text-2xl font-normal opacity-60 ml-0.5">°{unit}</span>
        </span>
      </div>

      {/* Footer: high/low + optional extras */}
      <div className="flex items-center gap-3 text-[11px] opacity-60">
        {props.high !== undefined && <span>최고 {props.high}°</span>}
        {props.low !== undefined && <span>최저 {props.low}°</span>}
        {props.humidity !== undefined && <span>💧 {props.humidity}%</span>}
        {props.wind !== undefined && <span>💨 {props.wind}m/s</span>}
      </div>
    </div>
  );
}
