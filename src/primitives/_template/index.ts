import type { PrimitiveDefinition } from '../../types';
import TemplatePrimitive, { type TemplateProps } from './Template';

const definition: PrimitiveDefinition<TemplateProps> = {
  type: 'template',
  name: '템플릿',
  description: 'A placeholder primitive. Copy this to build a new atom.',
  icon: '📋',
  isContainer: false,

  propsSchema: {
    label: 'Text to display (string)',
  },
  defaultProps: { label: 'Template' },

  examples: [
    {
      context: 'Placeholder slot in a widget during scaffolding',
      blueprint: { primitive: 'template', props: { label: 'TODO' } },
    },
  ],

  component: TemplatePrimitive,
};

export default definition;
