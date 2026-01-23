// schemaTypes/report.ts
import {defineType, defineField} from 'sanity'

export const report = defineType({
  name: 'report',
  title: 'GMO Report',
  type: 'document',
  icon: () => '📊',
  fields: [
    defineField({
      name: 'title',
      title: 'Report Title',
      type: 'string',
      description: 'e.g., "Global Market Outlook - January 2026"',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'Auto-generated URL-friendly version of title',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publicationDate',
      title: 'Publication Date',
      type: 'date',
      description: 'Report release date',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString().split('T')[0],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'Primary author or team',
      initialValue: 'AXA Investment Managers',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Review', value: 'review'},
          {title: 'Approved', value: 'approved'},
          {title: 'Published', value: 'published'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Optional cover image for the report',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'summary',
      title: 'Executive Summary',
      type: 'text',
      description: 'Brief overview of the report (2-3 sentences)',
      rows: 4,
    }),
    defineField({
      name: 'sections',
      title: 'Report Sections',
      type: 'array',
      description: 'Add sections to build your report',
      of: [
        {type: 'titleSection'},
        {type: 'routingSection'},
        {type: 'navigationSection'},
        {type: 'contentSection'},
        {type: 'headerSection'},
        {type: 'timelineSection'},
        {type: 'chartInsightsSection'},
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publicationDate',
      status: 'status',
      media: 'coverImage',
    },
    prepare({title, date, status, media}) {
      const statusEmoji = {
        draft: '📝',
        review: '👀',
        approved: '✅',
        published: '🌍',
      }
      return {
        title: title || 'Untitled Report',
        subtitle: `${statusEmoji[status as keyof typeof statusEmoji] || '📄'} ${date || 'No date'} • ${status || 'draft'}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Publication Date, New',
      name: 'publicationDateDesc',
      by: [{field: 'publicationDate', direction: 'desc'}],
    },
    {
      title: 'Publication Date, Old',
      name: 'publicationDateAsc',
      by: [{field: 'publicationDate', direction: 'asc'}],
    },
  ],
})