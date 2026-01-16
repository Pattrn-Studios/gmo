// schemaTypes/titleSection.ts
import {defineType, defineField} from 'sanity'

export const titleSection = defineType({
  name: 'titleSection',
  title: 'Title Section',
  type: 'object',
  icon: () => '📰',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Main title for this section',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      description: 'Optional subtitle',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: [
          {title: 'Primary Green', value: '#3E7274'},
          {title: 'Coast Blue', value: '#3D748F'},
          {title: 'Metallic Copper', value: '#AC5359'},
          {title: 'White', value: '#FFFFFF'},
        ],
        layout: 'radio',
      },
      initialValue: '#3E7274',
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'subheading',
    },
    prepare({title, subtitle}) {
      return {
        title: `📰 ${title || 'Untitled'}`,
        subtitle: subtitle || 'Title Section',
      }
    },
  },
})