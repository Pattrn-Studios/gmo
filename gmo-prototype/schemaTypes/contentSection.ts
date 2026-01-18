// schemaTypes/contentSection.ts

import {defineType, defineField, defineArrayMember} from 'sanity'
import {ChartBuilderInput} from '../components/ChartBuilder/ChartBuilderInput'

export const contentSection = defineType({
  name: 'contentSection',
  title: 'Content Section',
  type: 'object',
  fields: [
    // CONTENT FIELDS
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Main section heading',
      validation: (Rule: any) => Rule.required().max(100),
    }),

    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Supporting text under the title',
      validation: (Rule: any) => Rule.max(200),
    }),

    defineField({
      name: 'content',
      title: 'Content',
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
      description: 'Main content - use bullet points for key insights',
    }),

    // CHART TOGGLE
    defineField({
      name: 'hasChart',
      title: 'Include Chart',
      type: 'boolean',
      description: 'Toggle to add a chart to this section',
      initialValue: false,
    }),

    // NEW: Chart Builder Component (replaces individual chart fields)
    defineField({
      name: 'chartConfig',
      title: 'Chart Configuration',
      type: 'object',
      description: 'Upload an Excel or CSV file to generate a chart with AI-powered recommendations',
      hidden: ({parent}: any) => !parent?.hasChart,
      components: {
        input: ChartBuilderInput
      },
      fields: [
        defineField({name: 'chartType', type: 'string'}),
        defineField({name: 'chartData', type: 'text'}),
        defineField({
          name: 'chartSeries',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              {name: 'label', type: 'string'},
              {name: 'dataColumn', type: 'string'},
              {name: 'colour', type: 'string'}
            ]
          }]
        }),
        defineField({name: 'xAxisLabel', type: 'string'}),
        defineField({name: 'yAxisLabel', type: 'string'}),
        defineField({name: 'yAxisFormat', type: 'string'}),
      ]
    }),

    // CHART SOURCE (Remains separate - not part of AI analysis)
    defineField({
      name: 'chartSource',
      title: 'Chart Source',
      type: 'string',
      description: 'Data source attribution (e.g., "Bloomberg, December 2025")',
      hidden: ({parent}: any) => !parent?.hasChart,
    }),

    // LAYOUT (Remains separate - user choice after chart creation)
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Chart on Left', value: 'chartLeft'},
          {title: 'Chart on Right', value: 'chartRight'},
          {title: 'Chart Full Width (Below Content)', value: 'chartFull'},
        ],
        layout: 'radio',
      },
      initialValue: 'chartRight',
      hidden: ({parent}: any) => !parent?.hasChart,
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      hasChart: 'hasChart',
    },
    prepare({title, subtitle, hasChart}: any) {
      return {
        title: title || 'Untitled Section',
        subtitle: hasChart ? `📊 ${subtitle || 'With chart'}` : subtitle || 'Text only',
      }
    },
  },
})