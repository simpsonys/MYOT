import type { PrimitiveDefinition } from '../../types';
import AmbientFirePrimitive, { type AmbientFireProps } from './AmbientFire';

const definition: PrimitiveDefinition<AmbientFireProps> = {
  type: 'ambient-fire',
  name: '불멍',
  description: '멍때리기용 불꽃 애니메이션. 타오르는 파티클이 화면을 채웁니다.',
  icon: '🔥',
  isContainer: false,

  propsSchema: {
    intensity: '"low" | "medium" | "high" — flame density and speed (default: "medium")',
    palette:   '"warm" | "blue" | "purple" — color theme of the fire (default: "warm")',
    label:     'optional caption shown at the bottom (string)',
  },
  defaultProps: {
    intensity: 'medium',
    palette: 'warm',
  },

  examples: [
    {
      context: '불멍 위젯 — 따뜻한 불꽃',
      blueprint: {
        primitive: 'ambient-fire',
        props: { intensity: 'medium', palette: 'warm', label: '불멍' },
      },
    },
    {
      context: '강렬한 불꽃 — 높은 밀도',
      blueprint: {
        primitive: 'ambient-fire',
        props: { intensity: 'high', palette: 'warm' },
      },
    },
    {
      context: '파란 불꽃 — 신비로운 분위기',
      blueprint: {
        primitive: 'ambient-fire',
        props: { intensity: 'medium', palette: 'blue', label: '파란 불꽃' },
      },
    },
  ],

  component: AmbientFirePrimitive,
};

export default definition;
