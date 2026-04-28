import type { PrimitiveDefinition } from '../../types';
import AmbientWaterPrimitive, { type AmbientWaterProps } from './AmbientWater';

const definition: PrimitiveDefinition<AmbientWaterProps> = {
  type: 'ambient-water',
  name: '물멍',
  description: '멍때리기용 물 애니메이션. 파도, 잔물결, 빗속 물가 씬을 표현합니다.',
  icon: '🌊',
  isContainer: false,

  propsSchema: {
    scene:   '"wave" | "ripple" | "rain" — animation style (default: "wave")',
    palette: '"ocean" | "teal" | "night" — color theme (default: "ocean")',
    label:   'optional caption shown at the bottom (string)',
  },
  defaultProps: {
    scene: 'wave',
    palette: 'ocean',
  },

  examples: [
    {
      context: '물멍 위젯 — 잔잔한 파도',
      blueprint: {
        primitive: 'ambient-water',
        props: { scene: 'wave', palette: 'ocean', label: '물멍' },
      },
    },
    {
      context: '빗소리 물멍 — 빗속 호수 표면',
      blueprint: {
        primitive: 'ambient-water',
        props: { scene: 'rain', palette: 'night', label: '빗소리' },
      },
    },
    {
      context: '잔물결 — 고요한 수면',
      blueprint: {
        primitive: 'ambient-water',
        props: { scene: 'ripple', palette: 'teal' },
      },
    },
  ],

  component: AmbientWaterPrimitive,
};

export default definition;
