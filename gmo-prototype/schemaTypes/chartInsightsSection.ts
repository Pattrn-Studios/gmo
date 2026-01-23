// schemaTypes/chartInsightsSection.ts
import {defineType, defineField} from 'sanity'
import {ChartBuilderInput} from '../components/ChartBuilder/ChartBuilderInput'

export const chartInsightsSection = defineType({
  name: 'chartInsightsSection',
  title: 'Chart Insights Section',
  type: 'object',
  icon: () => '📈',
  description: 'Chart-focused layout with positionable insights panel',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Main section heading',
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
      name: 'chartConfig',
      title: 'Chart Configuration',
      type: 'object',
      description: 'Upload an Excel or CSV file to generate a chart with AI-powered recommendations',
      components: {
        input: ChartBuilderInput,
      },
      fields: [
        defineField({name: 'chartType', title: 'Chart Type', type: 'string'}),
        defineField({name: 'chartData', title: 'Chart Data', type: 'text'}),
        defineField({
          name: 'chartSeries',
          title: 'Data Series',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'label', title: 'Label', type: 'string'},
                {name: 'dataColumn', title: 'Data Column', type: 'string'},
                {name: 'colour', title: 'Color', type: 'string'},
              ],
            },
          ],
        }),
        defineField({name: 'xAxisLabel', title: 'X-Axis Label', type: 'string'}),
        defineField({name: 'yAxisLabel', title: 'Y-Axis Label', type: 'string'}),
        defineField({name: 'yAxisFormat', title: 'Y-Axis Format', type: 'string'}),
      ],
    }),
    defineField({
      name: 'chartSource',
      title: 'Chart Source',
      type: 'string',
      description: 'Data attribution (e.g., "Source: Bloomberg, 2025")',
    }),
    defineField({
      name: 'insightsPosition',
      title: 'Insights Position',
      type: 'string',
      description: 'Where to display the insights panel relative to the chart',
      options: {
        list: [
          {title: 'Right', value: 'right'},
          {title: 'Left', value: 'left'},
          {title: 'Top', value: 'top'},
          {title: 'Bottom', value: 'bottom'},
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({
      name: 'insightsColor',
      title: 'Insights Background Color',
      type: 'string',
      description: 'Background color for the insights panel (text will be white)',
      options: {
        list: [
          {title: 'Green (#008252)', value: 'green'},
          {title: 'Blue (#7CC5D9)', value: 'blue'},
          {title: 'Orange (#E8967B)', value: 'orange'},
          {title: 'Brown (#A8887A)', value: 'brown'},
        ],
        layout: 'radio',
      },
      initialValue: 'green',
    }),
    defineField({
      name: 'insights',
      title: 'Key Insights',
      type: 'array',
      description: 'Bullet points for the insights panel',
      of: [{type: 'string'}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      position: 'insightsPosition',
      color: 'insightsColor',
    },
    prepare({title, position, color}) {
      const colorEmoji: Record<string, string> = {
        green: '🟢',
        blue: '🔵',
        orange: '🟠',
        brown: '🟤',
      }
      return {
        title: `📈 ${title || 'Chart Insights'}`,
        subtitle: `Insights: ${position || 'right'} ${colorEmoji[color] || ''}`,
      }
    },
  },
})
