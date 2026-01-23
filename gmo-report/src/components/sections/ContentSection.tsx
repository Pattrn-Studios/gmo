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
  gaugeMax?: number
  chartSource?: string
  layout?: string
  colorTheme?: string
  sectionImage?: string
  'data-section-index': number
}

// Color theme mapping matching original HTML template
const COLOR_THEMES: Record<string, { background: string; text: string }> = {
  blue: { background: '#7CC5D9', text: '#FFFFFF' },
  green: { background: '#008252', text: '#FFFFFF' },
  orange: { background: '#E8967B', text: '#FFFFFF' },
  brown: { background: '#A8887A', text: '#FFFFFF' },
  mint: { background: '#9DD9C7', text: '#1A1A1A' },
  none: { background: 'transparent', text: 'inherit' },
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
  gaugeMax,
  chartSource,
  layout = 'chartFull',
  colorTheme = 'none',
  sectionImage,
  'data-section-index': index,
}: ContentSectionProps) {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.none
  const parsedData = chartData ? parseCSV(chartData) : []
  const hasColorTheme = colorTheme && colorTheme !== 'none'
  // Handle both naming conventions (chartLeft/chartRight and chart-left/chart-right)
  const isChartLayout = ['chartLeft', 'chartRight', 'chart-left', 'chart-right'].includes(layout || '')
  const chartOnLeft = layout === 'chartLeft' || layout === 'chart-left'

  // Determine layout class
  const getLayoutClass = () => {
    if (isChartLayout) {
      return chartOnLeft
        ? 'grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-start'
        : 'grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start'
    }
    return ''
  }

  // Determine container class
  const containerClass = hasChart || sectionImage ? 'container' : 'container-narrow'

  return (
    <section
      data-section-index={index}
      className="py-20 sm:py-24 border-b border-[#E0E0E0] last:border-b-0"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <div className={containerClass}>
        {/* Section header with underline */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-header mb-12 sm:mb-16"
          >
            {title && (
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                style={{
                  color: hasColorTheme ? theme.text : 'inherit',
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="text-xl sm:text-2xl font-light mt-4"
                style={{
                  color: hasColorTheme ? theme.text : 'var(--color-text-secondary)',
                  opacity: hasColorTheme ? 0.9 : 1,
                }}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Content area */}
        <div className={getLayoutClass()}>
          {/* Chart */}
          {hasChart && chartData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`chart-wrapper lg:sticky lg:top-6 ${chartOnLeft ? 'order-1' : 'order-2'}`}
              style={{ minHeight: '400px' }}
            >
              <RechartsRenderer
                chartType={(chartType || 'line') as ChartType}
                data={parsedData}
                series={chartSeries || []}
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
                yAxisFormat={yAxisFormat}
                gaugeMax={gaugeMax}
                height={380}
              />
              {chartSource && (
                <p
                  className="text-sm mt-4 italic"
                  style={{
                    color: hasColorTheme ? theme.text : 'var(--color-text-secondary)',
                    opacity: hasColorTheme ? 0.8 : 1,
                  }}
                >
                  Source: {chartSource}
                </p>
              )}
            </motion.div>
          )}

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`content-block ${isChartLayout ? (chartOnLeft ? 'order-2' : 'order-1') : ''}`}
          >
            {content?.map((block: any, i: number) => {
              if (block._type === 'block') {
                const style = block.style || 'normal'

                if (style === 'h3') {
                  return (
                    <h3 key={i} className="text-xl font-semibold mb-4 mt-8 first:mt-0">
                      {block.children?.map((child: any) => child.text).join('')}
                    </h3>
                  )
                }

                if (style === 'h4') {
                  return (
                    <h4 key={i} className="text-lg font-semibold mb-3 mt-6 first:mt-0">
                      {block.children?.map((child: any) => child.text).join('')}
                    </h4>
                  )
                }

                // Check if this is a list item
                if (block.listItem) {
                  return (
                    <li key={i} className="py-4 pl-6 relative border-b border-[#F0F0F0] last:border-b-0 list-none">
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: hasColorTheme ? 'currentColor' : 'var(--gmo-green)' }}
                      />
                      {block.children?.map((child: any) => child.text).join('')}
                    </li>
                  )
                }

                return (
                  <p key={i} className="mb-6 last:mb-0">
                    {block.children?.map((child: any) => child.text).join('')}
                  </p>
                )
              }
              return null
            })}
          </motion.div>

          {/* Section image (when no chart) */}
          {sectionImage && !hasChart && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <img
                src={sectionImage}
                alt=""
                className="max-w-full max-h-[300px] mx-auto object-contain rounded-lg"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
