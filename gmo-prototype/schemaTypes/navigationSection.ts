// schemaTypes/navigationSection.ts
import {defineType, defineField} from 'sanity'

export const navigationSection = defineType({
  name: 'navigationSection',
  title: 'Navigation Section',
  type: 'object',
  icon: () => '🗂️',
  description: 'Table of contents - auto-generates from section titles',
  fields: [
    defineField({
      name: 'title',
      title: 'Navigation Title',
      type: 'string',
      initialValue: 'In This Report',
    }),
    defineField({
      name: 'showPageNumbers',
      title: 'Show Page Numbers',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Vertical List', value: 'vertical'},
          {title: 'Horizontal Grid', value: 'grid'},
          {title: 'Cards', value: 'cards'},
        ],
        layout: 'radio',
      },
      initialValue: 'vertical',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: `🗂️ ${title || 'Navigation'}`,
        subtitle: 'Table of Contents',
      }
    },
  },
})