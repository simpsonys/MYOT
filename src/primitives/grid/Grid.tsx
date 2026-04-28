import type { PrimitiveProps } from '../../types';

export interface GridProps {
  columns?: number;
  gap?: number;
}

export default function GridPrimitive({ props, children }: PrimitiveProps<GridProps>) {
  const cols = props.columns ?? 2;
  const gap = props.gap ?? 8;

  return (
    <div
      className="w-full h-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {Array.isArray(children)
        ? children.map((c, i) => <div key={i} className="min-w-0 min-h-0">{c}</div>)
        : children}
    </div>
  );
}
