'use client'

import { motion } from 'framer-motion'

interface TimelineItem {
  number?: string
  image?: string
  header?: string
  body?: string
}

interface TimelineSectionProps {
  title?: string
  subtitle?: string
  items?: TimelineItem[]
  'data-section-index': number
}

export function TimelineSection({
  title,
  subtitle,
  items = [],
  'data-section-index': index,
}: TimelineSectionProps) {
  return (
    <section
      data-section-index={index}
      className="py-20 sm:py-24 bg-bg-secondary"
    >
      <div className="container">
        {/* Section header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header text-center mb-16"
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

        {/* Timeline - Horizontal layout matching original */}
        <div className="relative">
          {/* Horizontal track line */}
          <div className="absolute top-[60px] left-0 right-0 h-1 bg-[#008252] hidden lg:block" />

          <div className="flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 min-w-[180px] max-w-[280px] mx-auto lg:mx-0 text-center"
              >
                {/* Number/icon at top */}
                {item.number && (
                  <div className="text-4xl sm:text-5xl font-bold text-[#008252] mb-4">
                    {item.number}
                  </div>
                )}

                {/* Image (circular) */}
                {item.image && (
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
                    <img
                      src={item.image}
                      alt={item.header || ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="mt-4">
                  {item.header && (
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {item.header}
                    </h3>
                  )}
                  {item.body && (
                    <p className="text-sm text-text-secondary">{item.body}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
