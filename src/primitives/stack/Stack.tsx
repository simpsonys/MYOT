import type { PrimitiveProps } from '../../types';

export interface StackProps {
  gap?: number;
  /** How to size the stack vertically */
  align?: 'start' | 'center' | 'between' | 'end';
}

/** Vertical flex container. The default root primitive for most widgets.
 *  If a widget has a header, some stats, and a bubble — they're usually
 *  wrapped in a stack. */
export default function StackPrimitive({
  props,
  children,
}: PrimitiveProps<StackProps>) {
  const align = props.align ?? 'between';
  const justify =
    align === 'start'
      ? 'justify-start'
      : align === 'center'
      ? 'justify-center'
      : align === 'end'
      ? 'justify-end'
      : 'justify-between';

  return (
    <div
      className={`w-full h-full flex flex-col ${justify}`}
      style={{ gap: `${props.gap ?? 8}px` }}
    >
      {children}
    </div>
  );
}
