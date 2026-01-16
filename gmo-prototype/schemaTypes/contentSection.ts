// schemaTypes/contentSection.ts

import {defineType, defineField, defineArrayMember} from 'sanity'

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

    // CHART TYPE
    defineField({
      name: 'chartType',
      title: 'Chart Type',
      type: 'string',
      options: {
        list: [
          {title: 'Line Chart', value: 'line'},
          {title: 'Column Chart (Vertical)', value: 'column'},
          {title: 'Bar Chart (Horizontal)', value: 'bar'},
          {title: 'Area Chart', value: 'area'},
          {title: 'Stacked Column', value: 'stackedColumn'},
          {title: 'Stacked Area', value: 'stackedArea'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'line',
      hidden: ({parent}: any) => !parent?.hasChart,
    }),
    
    // CHART DATA (CSV)
    defineField({
      name: 'chartData',
      title: 'Chart Data (CSV)',
      type: 'text',
      description: 'Paste CSV data. First row = headers, first column = x-axis. From Chart Agent JSON, copy the "chartData" value.',
      placeholder: `date,series1,series2
2024-01,100,150
2024-02,110,160
2024-03,120,170`,
      rows: 10,
      hidden: ({parent}: any) => !parent?.hasChart,
    }),
    
    // CHART SERIES
    defineField({
      name: 'chartSeries',
      title: 'Data Series',
      type: 'array',
      description: 'Add one item per data series from Chart Agent JSON. Data Column must exactly match CSV header (case-sensitive).',
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
              validation: (Rule: any) => Rule.required(),
            }),
            defineField({
              name: 'dataColumn',
              title: 'Data Column',
              type: 'string',
              description: 'Must match a column name from your CSV',
              validation: (Rule: any) => Rule.required(),
            }),
            defineField({
              name: 'colour',
              title: 'Color',
              type: 'string',
              options: {
                list: [
                  {title: 'Primary Green', value: '#3E7274'},
                  {title: 'Coast Blue', value: '#3D748F'},
                  {title: 'Metallic Copper', value: '#AC5359'},
                  {title: 'Orange', value: '#F1875A'},
                  {title: 'Light Green', value: '#76BCA3'},
                  {title: 'Dark Blue', value: '#132728'},
                ],
                layout: 'dropdown',
              },
              initialValue: '#3E7274',
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
      hidden: ({parent}: any) => !parent?.hasChart,
    }),
    
    // X-AXIS LABEL
    defineField({
      name: 'xAxisLabel',
      title: 'X-Axis Label',
      type: 'string',
      description: 'Label for horizontal axis (leave blank to hide)',
      hidden: ({parent}: any) => !parent?.hasChart,
    }),
    
    // Y-AXIS LABEL
    defineField({
      name: 'yAxisLabel',
      title: 'Y-Axis Label',
      type: 'string',
      description: 'Label for vertical axis (leave blank to hide)',
      hidden: ({parent}: any) => !parent?.hasChart,
    }),
    
    // Y-AXIS FORMAT
    defineField({
      name: 'yAxisFormat',
      title: 'Y-Axis Format',
      type: 'string',
      options: {
        list: [
          {title: 'Number (1,234)', value: 'number'},
          {title: 'Percentage (12.5%)', value: 'percent'},
          {title: 'Currency ($1,234)', value: 'currency'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'number',
      hidden: ({parent}: any) => !parent?.hasChart,
    }),
    
    // CHART SOURCE
    defineField({
      name: 'chartSource',
      title: 'Chart Source',
      type: 'string',
      description: 'Data source attribution (e.g., "Bloomberg, December 2025")',
      hidden: ({parent}: any) => !parent?.hasChart,
    }),
    
    // LAYOUT
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
      initialValue: 'chartLeft',
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