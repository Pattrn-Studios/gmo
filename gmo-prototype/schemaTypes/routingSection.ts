// schemaTypes/routingSection.ts
import {defineType, defineField} from 'sanity'

export const routingSection = defineType({
  name: 'routingSection',
  title: 'Routing Section',
  type: 'object',
  icon: () => '🔗',
  description: 'Internal navigation/links between sections',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Title shown in navigation',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Link Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'targetSection',
              title: 'Target Section',
              type: 'string',
              description: 'Section ID to link to',
            },
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Optional emoji or icon',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      links: 'links',
    },
    prepare({title, links}) {
      return {
        title: `🔗 ${title || 'Routing'}`,
        subtitle: `${links?.length || 0} links`,
      }
    },
  },
})