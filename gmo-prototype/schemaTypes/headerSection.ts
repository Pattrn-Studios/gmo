// schemaTypes/headerSection.ts
import {defineType, defineField} from 'sanity'

export const headerSection = defineType({
  name: 'headerSection',
  title: 'Header Section',
  type: 'object',
  icon: () => '🎯',
  description: 'Full-bleed section divider with title, subtitle, image, and optional BNP banner',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Main header text',
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
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Decorative image/illustration (displayed on right side)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'showBnpBanner',
      title: 'Show BNP Banner',
      type: 'boolean',
      description: 'Display BNP Paribas banner at bottom of section',
      initialValue: true,
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Section background color (text will be white)',
      options: {
        list: [
          {title: 'Blue (#7CC5D9)', value: 'blue'},
          {title: 'Green (#008252)', value: 'green'},
          {title: 'Orange (#E8967B)', value: 'orange'},
          {title: 'Brown (#A8887A)', value: 'brown'},
          {title: 'Mint (#9DD9C7)', value: 'mint'},
        ],
        layout: 'radio',
      },
      initialValue: 'blue',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      backgroundColor: 'backgroundColor',
    },
    prepare({title, subtitle, backgroundColor}) {
      const colorEmoji: Record<string, string> = {
        blue: '🔵',
        green: '🟢',
        orange: '🟠',
        brown: '🟤',
        mint: '🟩',
      }
      return {
        title: `🎯 ${title || 'Header Section'}`,
        subtitle: `${colorEmoji[backgroundColor] || '⬜'} ${subtitle || 'Section divider'}`,
      }
    },
  },
})
