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
      name: 'backgroundType',
      title: 'Background Type',
      type: 'string',
      description: 'Choose between solid color or hero image background',
      options: {
        list: [
          {title: 'Solid Color', value: 'color'},
          {title: 'Hero Image', value: 'image'},
        ],
        layout: 'radio',
      },
      initialValue: 'color',
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
      hidden: ({parent}) => parent?.backgroundType === 'image',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      description: 'Full-width hero image with dark tint overlay for text legibility',
      options: {
        hotspot: true,
      },
      hidden: ({parent}) => parent?.backgroundType !== 'image',
    }),
    defineField({
      name: 'companyLogo',
      title: 'Company Logo',
      type: 'image',
      description: 'Logo displayed in bottom left corner',
      options: {
        hotspot: true,
      },
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