import { useState, useRef, useCallback, useEffect } from 'react';
import type { PrimitiveProps } from '../../types';

export interface VideoPlayerProps {
  // No configurable props — file loading is handled internally via drag/drop or file picker
}

export default function VideoPlayerPrimitive({
  theme,
  emit,
  widgetId,
}: PrimitiveProps<VideoPlayerProps>) {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objUrlRef = useRef<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) return;
      if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
      const url = URL.createObjectURL(file);
      objUrlRef.current = url;
      setSrc(url);
      setFileName(file.name.replace(/\.[^.]+$/, ''));
      setProgress(0);
      setIsPlaying(true);
      emit({ type: 'media.loaded', payload: { widgetId, title: file.name } });
    },
    [emit, widgetId],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      emit({ type: 'media.play', payload: { widgetId, title: fileName } });
    } else {
      v.pause();
      emit({ type: 'media.pause', payload: { widgetId } });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const revealControls = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2500);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${String(ss).padStart(2, '0')}`;
  };

  // ── Placeholder (no file loaded) ─────────────────────────────────
  if (!src) {
    return (
      <div
        className="w-full h-full relative flex flex-col items-center justify-center gap-3 select-none cursor-pointer overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0A0E1A 0%, #111827 100%)',
          border: isDragging
            ? `2px dashed ${theme.accentColor}`
            : '2px dashed rgba(255,255,255,0.07)',
          borderRadius: 12,
          transition: 'border-color 0.2s',
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* TV scan-line texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px)',
          }}
        />

        <div
          className="text-5xl transition-transform duration-200"
          style={{ opacity: isDragging ? 1 : 0.35, transform: isDragging ? 'scale(1.15)' : 'scale(1)' }}
        >
          📺
        </div>
        <div
          className="text-sm font-semibold"
          style={{ color: isDragging ? theme.accentColor : 'rgba(255,255,255,0.55)' }}
        >
          {isDragging ? '놓으세요!' : '영상 파일 열기'}
        </div>
        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          클릭하거나 드래그 · MP4 · MOV · MKV · AVI
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  // ── Video player ─────────────────────────────────────────────────
  return (
    <div
      className="w-full h-full relative overflow-hidden bg-black"
      style={{ borderRadius: 12 }}
      onMouseMove={revealControls}
      onMouseEnter={revealControls}
      onMouseLeave={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        autoPlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          setDuration(videoRef.current?.duration ?? 0);
        }}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (v && v.duration) setProgress(v.currentTime / v.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          emit({ type: 'media.ended', payload: { widgetId, title: fileName } });
        }}
        onClick={togglePlay}
        style={{ cursor: 'pointer' }}
      />

      {/* Controls overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 45%)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* File name */}
        <div className="px-3 pt-1">
          <div
            className="text-[11px] font-medium truncate"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {fileName}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="mx-3 mt-2 mb-1 h-1.5 rounded-full cursor-pointer group"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: theme.accentColor,
              transition: 'width 0.25s linear',
            }}
          />
        </div>

        {/* Time + buttons */}
        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition hover:brightness-125 active:scale-95 flex-shrink-0"
            style={{ background: theme.accentColor, color: theme.backgroundColor }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {fmt(progress * duration)} / {fmt(duration)}
          </div>

          <div className="flex-1" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="text-[11px] px-2 py-1 rounded transition hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            📁 바꾸기
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
