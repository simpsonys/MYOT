import type { PrimitiveProps } from '../../types';

export interface ImageFrameProps {
  /** URL or seed. If source starts with "seed:" uses picsum.photos */
  source: string;
  caption?: string;
  /** Shape — square, circle, portrait (3:4), landscape (16:9) */
  shape?: 'square' | 'circle' | 'portrait' | 'landscape' | 'fill';
}

export default function ImageFramePrimitive({
  props,
}: PrimitiveProps<ImageFrameProps>) {
  const url = props.source.startsWith('seed:')
    ? `https://picsum.photos/seed/${encodeURIComponent(props.source.slice(5))}/600/600`
    : props.source;
  const shape = props.shape ?? 'fill';

  const aspectClass =
    shape === 'square'
      ? 'aspect-square'
      : shape === 'portrait'
      ? 'aspect-[3/4]'
      : shape === 'landscape'
      ? 'aspect-video'
      : '';
  const roundClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div
      className={`${aspectClass} ${roundClass} relative overflow-hidden w-full h-full`}
    >
      <img
        src={url}
        alt={props.caption ?? 'image'}
        className="w-full h-full object-cover"
      />
      {props.caption && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs font-medium"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
            color: '#FFFFFF',
          }}
        >
          {props.caption}
        </div>
      )}
    </div>
  );
}
