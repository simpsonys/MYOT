import type { PrimitiveProps } from '../../types';

export interface TextBlockProps {
  title?: string;
  body: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
}

const BODY_SIZE: Record<string, string> = {
  sm: '0.75rem',
  md: '0.9rem',
  lg: '1.1rem',
};

export default function TextBlockPrimitive({
  props,
  theme,
}: PrimitiveProps<TextBlockProps>) {
  const size = props.size ?? 'md';
  const align = props.align ?? 'left';
  const textColor = theme.mode === 'dark' ? '#FFFFFF' : '#1A1A1A';

  const lines = (props.body ?? '').split(/\\n|\n/);

  return (
    <div
      className="w-full h-full flex flex-col justify-center gap-1.5 rounded-xl px-3 py-2 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.05)',
        color: textColor,
        textAlign: align,
      }}
    >
      {props.title && (
        <div
          className="text-[11px] font-semibold uppercase tracking-widest opacity-60 truncate"
          style={{ color: theme.accentColor }}
        >
          {props.title}
        </div>
      )}
      <div
        className="leading-relaxed overflow-hidden"
        style={{ fontSize: BODY_SIZE[size] }}
      >
        {lines.map((line, i) => (
          <p key={i} className={line === '' ? 'h-2' : 'opacity-90'}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
