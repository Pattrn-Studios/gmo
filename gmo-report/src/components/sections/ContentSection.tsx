'use client'

import { motion } from 'framer-motion'
import { RechartsRenderer } from '@/components/charts/RechartsRenderer'
import { ChartType } from '@/components/charts/types'
import { parseCSV } from '@/lib/utils'

interface ContentSectionProps {
  title?: string
  subtitle?: string
  content?: any[]
  hasChart?: boolean
  chartType?: string
  chartData?: string
  chartSeries?: Array<{ label: string; dataColumn: string; colour?: string }>
  xAxisLabel?: string
  yAxisLabel?: string
  yAxisFormat?: 'number' | 'percent' | 'currency'
  chartSource?: string
  layout?: string
  colorTheme?: string
  sectionImage?: string
  'data-section-index': number
}

// Color theme mapping
const COLOR_THEMES: Record<string, { bg: string; text: string }> = {
  blue: { bg: '#7CC5D9', text: '#FFFFFF' },
  green: { bg: '#008252', text: '#FFFFFF' },
  orange: { bg: '#E8967B', text: '#FFFFFF' },
  brown: { bg: '#A8887A', text: '#FFFFFF' },
  mint: { bg: '#9DD9C7', text: '#1A1A1A' },
  none: { bg: 'transparent', text: 'inherit' },
}

export function ContentSection({
  title,
  subtitle,
  content,
  hasChart,
  chartType,
  chartData,
  chartSeries,
  xAxisLabel,
  yAxisLabel,
  yAxisFormat,
  chartSource,
  layout = 'full',
  colorTheme = 'none',
  sectionImage,
  'data-section-index': index,
}: ContentSectionProps) {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.none
  const parsedData = chartData ? parseCSV(chartData) : []
  const isChartLayout = layout === 'chart-left' || layout === 'chart-right'
  const chartOnLeft = layout === 'chart-left'

  return (
    <section
      data-section-index={index}
      className="py-16 px-4"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-lg opacity-80">{subtitle}</p>
          )}
        </motion.div>

        {/* Content area */}
        <div className={`${isChartLayout ? 'grid md:grid-cols-2 gap-8' : ''}`}>
          {/* Chart */}
          {hasChart && chartData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`bg-white rounded-xl p-6 shadow-lg ${chartOnLeft ? 'order-1' : 'order-2'}`}
            >
              <RechartsRenderer
                chartType={(chartType || 'line') as ChartType}
                data={parsedData}
                series={chartSeries || []}
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
                yAxisFormat={yAxisFormat}
                height={400}
              />
              {chartSource && (
                <p className="text-sm text-gray-500 mt-4">Source: {chartSource}</p>
              )}
            </motion.div>
          )}

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`prose prose-lg max-w-none ${isChartLayout ? (chartOnLeft ? 'order-2' : 'order-1') : ''}`}
          >
            {content?.map((block: any, i: number) => {
              if (block._type === 'block') {
                const Tag = block.style === 'h3' ? 'h3' : block.style === 'h4' ? 'h4' : 'p'
                return (
                  <Tag key={i} className={block.style === 'h3' ? 'text-xl font-semibold mb-3' : ''}>
                    {block.children?.map((child: any) => child.text).join('')}
                  </Tag>
                )
              }
              return null
            })}
          </motion.div>

          {/* Section image */}
          {sectionImage && !hasChart && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden"
            >
              <img src={sectionImage} alt="" className="w-full h-auto" />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
