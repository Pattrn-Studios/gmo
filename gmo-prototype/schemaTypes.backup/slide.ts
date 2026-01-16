// schemaTypes/slide.ts

import {defineType, defineField, defineArrayMember} from 'sanity'

export const slide = defineType({
  name: 'slide',
  title: 'GMO Slide',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'chart', title: 'Chart'},
    {name: 'style', title: 'Style'},
  ],
  fields: [
    // CONTENT FIELDS
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Main headline for the slide',
      group: 'content',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Supporting headline',
      group: 'content',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'body',
      title: 'Commentary',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [{title: 'Bullet', value: 'bullet'}],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
          },
        },
      ],
      description: 'Key points (use bullet points for best results)',
      group: 'content',
    }),
    defineField({
      name: 'source',
      title: 'Data Source',
      type: 'string',
      description: 'Attribution (e.g., "Bloomberg, October 2025")',
      group: 'content',
    }),

    // CHART CONFIGURATION
    defineField({
      name: 'chartType',
      title: 'Chart Type',
      type: 'string',
      group: 'chart',
      options: {
        list: [
          {title: 'Line Chart', value: 'line'},
          {title: 'Bar Chart (Vertical)', value: 'column'},
          {title: 'Bar Chart (Horizontal)', value: 'bar'},
          {title: 'Area Chart', value: 'area'},
          {title: 'Stacked Bar', value: 'stackedColumn'},
          {title: 'Stacked Area', value: 'stackedArea'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'line',
    }),
    defineField({
      name: 'chartData',
      title: 'Chart Data (CSV)',
      type: 'text',
      description: 'Paste data from Google Sheets. First row = headers. First column = x-axis.',
      placeholder: `date,fed,ecb,boe
Jan 2022,0.25,0.00,0.25
Apr 2022,0.50,0.00,0.75
Jul 2022,2.50,0.50,1.25`,
      rows: 12,
      group: 'chart',
    }),
    defineField({
      name: 'series',
      title: 'Data Series',
      type: 'array',
      group: 'chart',
      description: 'Configure each line/bar. "Data Column" must match a CSV header.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'seriesItem',
          title: 'Series',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Display name in legend',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'dataColumn',
              title: 'Data Column',
              type: 'string',
              description: 'Column name from CSV',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'colour',
              title: 'Colour',
              type: 'string',
              options: {
                list: [
                  {title: 'Navy (Primary)', value: '#00005E'},
                  {title: 'Teal', value: '#00A3A3'},
                  {title: 'Coral', value: '#FF6B5B'},
                  {title: 'Gold', value: '#E5A93D'},
                  {title: 'Purple', value: '#7B5EA7'},
                  {title: 'Green', value: '#2E8B57'},
                  {title: 'Grey', value: '#6B7280'},
                ],
                layout: 'dropdown',
              },
              initialValue: '#00005E',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'dataColumn',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'xAxisLabel',
      title: 'X-Axis Label',
      type: 'string',
      group: 'chart',
    }),
    defineField({
      name: 'yAxisLabel',
      title: 'Y-Axis Label',
      type: 'string',
      group: 'chart',
    }),
    defineField({
      name: 'yAxisFormat',
      title: 'Y-Axis Format',
      type: 'string',
      group: 'chart',
      options: {
        list: [
          {title: 'Number (1,234)', value: 'number'},
          {title: 'Percentage (12.5%)', value: 'percent'},
          {title: 'Currency ($1,234)', value: 'currency'},
          {title: 'Decimal (1.23)', value: 'decimal'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'number',
    }),

    // STYLE SETTINGS
    defineField({
      name: 'themeColour',
      title: 'Slide Theme',
      type: 'string',
      group: 'style',
      options: {
        list: [
          {title: 'Teal', value: 'teal'},
          {title: 'Coral', value: 'coral'},
          {title: 'Gold', value: 'gold'},
          {title: 'Purple', value: 'purple'},
          {title: 'Navy', value: 'navy'},
        ],
        layout: 'radio',
      },
      initialValue: 'teal',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      group: 'style',
      options: {
        list: [
          {title: 'Chart on Left', value: 'chartLeft'},
          {title: 'Chart on Right', value: 'chartRight'},
          {title: 'Chart Full Width', value: 'chartFull'},
        ],
        layout: 'radio',
      },
      initialValue: 'chartLeft',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      chartType: 'chartType',
    },
    prepare({title, subtitle, chartType}) {
      const chartIcons: Record<string, string> = {
        line: '📈',
        column: '📊',
        bar: '📊',
        area: '📉',
      }
      return {
        title: title || 'Untitled Slide',
        subtitle: `${chartIcons[chartType] || '📊'} ${subtitle || ''}`,
      }
    },
  },
})