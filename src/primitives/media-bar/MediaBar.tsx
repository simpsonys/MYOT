import type { PrimitiveProps } from '../../types';

export interface MediaBarProps {
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  thumbnailSeed?: string;
  isPlaying?: boolean;
  progress?: number; // 0..1
  mediaType?: 'music' | 'video' | 'podcast';
}

const TYPE_ICON: Record<string, string> = {
  music: '🎵',
  video: '🎬',
  podcast: '🎙️',
};

export default function MediaBarPrimitive({
  props,
  theme,
  emit,
  widgetId,
}: PrimitiveProps<MediaBarProps>) {
  const isPlaying = props.isPlaying ?? false;
  const progress = Math.min(1, Math.max(0, props.progress ?? 0));
  const mediaType = props.mediaType ?? 'music';
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';

  const seed = props.thumbnailSeed ?? props.title ?? 'media';
  const thumbUrl = props.thumbnailUrl ?? `https://picsum.photos/seed/${encodeURIComponent(seed)}/80/80`;

  return (
    <div
      className="w-full h-full flex flex-col justify-between rounded-xl px-3 py-2 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.05)', color: textColor }}
    >
      {/* Top: thumbnail + info + play button */}
      <div className="flex items-center gap-3 flex-1 min-h-0">
        {/* Thumbnail */}
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.1)' }}
        >
          <img
            src={thumbUrl}
            alt={props.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] opacity-50">{TYPE_ICON[mediaType]}</span>
            <span className="text-sm font-semibold truncate">{props.title}</span>
          </div>
          {props.subtitle && (
            <div className="text-[11px] opacity-60 truncate mt-0.5">{props.subtitle}</div>
          )}
        </div>

        {/* Play/Pause button */}
        <button
          onClick={() =>
            emit({ type: 'media.togglePlay', payload: { isPlaying: !isPlaying, widgetId } })
          }
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition hover:brightness-110 active:scale-95"
          style={{ background: theme.accentColor, color: theme.backgroundColor }}
        >
          <span className="text-base leading-none">{isPlaying ? '⏸' : '▶'}</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: theme.accentColor }}
          />
        </div>
      </div>
    </div>
  );
}
