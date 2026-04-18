import type { PrimitiveProps } from '../../types';

export interface StatRowProps {
  /** Optional gap in px (default 8) */
  gap?: number;
}

/** A horizontal flex container. Usually holds stat-tile children but can
 *  hold anything. The "row" name hints composition; the implementation
 *  is just flex-row. */
export default function StatRowPrimitive({
  children,
}: PrimitiveProps<StatRowProps>) {
  return (
    <div
      className="w-full flex flex-row items-stretch"
      style={{ gap: '8px' }}
    >
      {Array.isArray(children)
        ? children.map((c, i) => (
            <div key={i} className="flex-1 min-w-0">
              {c}
            </div>
          ))
        : children}
    </div>
  );
}
