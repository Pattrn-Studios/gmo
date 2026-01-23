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
  'data-section-index': number
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
  'data-section-index': index,
}: ChartInsightsSectionProps) {
  const parsedData = chartData ? parseCSV(chartData) : []

  return (
    <section
      data-section-index={index}
      className="py-16 px-4 bg-bg-primary"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-text-secondary">{subtitle}</p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart - takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg"
          >
            {chartData && (
              <RechartsRenderer
                chartType={(chartType || 'line') as ChartType}
                data={parsedData}
                series={chartSeries || []}
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
                yAxisFormat={yAxisFormat}
                height={450}
              />
            )}
            {chartSource && (
              <p className="text-sm text-gray-500 mt-4">Source: {chartSource}</p>
            )}
          </motion.div>

          {/* Insights panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {insights.filter(Boolean).map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="bg-bg-secondary rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  {insight.icon && (
                    <img
                      src={insight.icon}
                      alt=""
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                  )}
                  <div>
                    {insight.heading && (
                      <h3 className="font-semibold text-text-primary mb-1">
                        {insight.heading}
                      </h3>
                    )}
                    {insight.body && (
                      <p className="text-sm text-text-secondary">{insight.body}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
