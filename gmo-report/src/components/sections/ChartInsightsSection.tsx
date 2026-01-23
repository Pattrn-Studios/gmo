'use client'

import { motion } from 'framer-motion'
import { RechartsRenderer } from '@/components/charts/RechartsRenderer'
import { ChartType } from '@/components/charts/types'
import { parseCSV } from '@/lib/utils'

interface Insight {
  icon?: string
  heading?: string
  body?: string
}

interface ChartInsightsSectionProps {
  title?: string
  subtitle?: string
  chartType?: string
  chartData?: string
  chartSeries?: Array<{ label: string; dataColumn: string; colour?: string }>
  xAxisLabel?: string
  yAxisLabel?: string
  yAxisFormat?: 'number' | 'percent' | 'currency'
  chartSource?: string
  insights?: Insight[]
  insightsPosition?: 'left' | 'right' | 'top' | 'bottom'
  colorTheme?: string
  'data-section-index': number
}

// Color theme mapping
const COLOR_THEMES: Record<string, { background: string; text: string }> = {
  blue: { background: '#7CC5D9', text: '#FFFFFF' },
  green: { background: '#008252', text: '#FFFFFF' },
  orange: { background: '#E8967B', text: '#FFFFFF' },
  brown: { background: '#A8887A', text: '#FFFFFF' },
  mint: { background: '#9DD9C7', text: '#1A1A1A' },
  none: { background: '#F7F5F3', text: '#1A1A1A' },
}

export function ChartInsightsSection({
  title,
  subtitle,
  chartType,
  chartData,
  chartSeries,
  xAxisLabel,
  yAxisLabel,
  yAxisFormat,
  chartSource,
  insights = [],
  insightsPosition = 'right',
  colorTheme = 'none',
  'data-section-index': index,
}: ChartInsightsSectionProps) {
  const parsedData = chartData ? parseCSV(chartData) : []
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.none
  const validInsights = insights.filter(Boolean)

  // Determine grid layout based on insights position
  const getLayoutClass = () => {
    switch (insightsPosition) {
      case 'left':
        return 'grid lg:grid-cols-[300px_1fr] gap-8'
      case 'right':
        return 'grid lg:grid-cols-[1fr_300px] gap-8'
      case 'top':
      case 'bottom':
        return 'grid grid-cols-1 gap-8'
      default:
        return 'grid lg:grid-cols-[1fr_300px] gap-8'
    }
  }

  const InsightsPanel = () => (
    <motion.div
      initial={{ opacity: 0, x: insightsPosition === 'left' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-lg p-6 sm:p-7"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {title && (
        <h4 className="text-sm font-bold uppercase tracking-wide mb-4 opacity-80">
          Key Insights
        </h4>
      )}
      <ul className="space-y-4">
        {validInsights.map((insight, i) => (
          <li key={i} className="relative pl-5">
            <span
              className="absolute left-0 top-2 w-2 h-2 rounded-full"
              style={{ backgroundColor: 'currentColor', opacity: 0.6 }}
            />
            <div>
              {insight.heading && (
                <h5 className="font-semibold mb-1">{insight.heading}</h5>
              )}
              {insight.body && (
                <p className="text-sm opacity-80">{insight.body}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  )

  const ChartPanel = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="chart-wrapper"
      style={{ minHeight: '450px' }}
    >
      {chartData && (
        <RechartsRenderer
          chartType={(chartType || 'line') as ChartType}
          data={parsedData}
          series={chartSeries || []}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          yAxisFormat={yAxisFormat}
          height={400}
        />
      )}
      {chartSource && (
        <p className="text-sm text-text-secondary mt-4 italic">
          Source: {chartSource}
        </p>
      )}
    </motion.div>
  )

  return (
    <section
      data-section-index={index}
      className="py-20 sm:py-24"
    >
      <div className="container">
        {/* Section header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header mb-12"
          >
            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-text-secondary">{subtitle}</p>
            )}
          </motion.div>
        )}

        {/* Layout based on insights position */}
        <div className={getLayoutClass()}>
          {insightsPosition === 'left' || insightsPosition === 'top' ? (
            <>
              <InsightsPanel />
              <ChartPanel />
            </>
          ) : (
            <>
              <ChartPanel />
              <InsightsPanel />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
