// schemaTypes/timelineSection.ts
import {defineType, defineField} from 'sanity'

export const timelineSection = defineType({
  name: 'timelineSection',
  title: 'Timeline Section',
  type: 'object',
  icon: () => '📅',
  description: 'Horizontal timeline with 3-6 elements (responsive: vertical on mobile)',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Main heading for the timeline section',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional supporting text',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'items',
      title: 'Timeline Items',
      type: 'array',
      description: 'Add 3-6 timeline events',
      validation: (Rule) => Rule.min(3).max(6),
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'number',
              title: 'Number',
              type: 'string',
              description: 'Display number (e.g., "01", "02")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              description: 'Optional illustration for this timeline item',
              options: {hotspot: true},
            }),
            defineField({
              name: 'header',
              title: 'Header',
              type: 'string',
              description: 'Title for this timeline item',
              validation: (Rule) => Rule.required().max(100),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              description: 'Description text for this timeline item',
              rows: 3,
            }),
          ],
          preview: {
            select: {
              title: 'header',
              number: 'number',
              media: 'image',
            },
            prepare({title, number, media}) {
              return {
                title: `${number || '?'}: ${title || 'Untitled'}`,
                media,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare({title, items}) {
      const count = items?.length || 0
      return {
        title: `📅 ${title || 'Timeline'}`,
        subtitle: `${count} item${count !== 1 ? 's' : ''}`,
      }
    },
  },
})
