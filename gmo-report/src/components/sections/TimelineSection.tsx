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
      className="py-16 px-4 bg-bg-secondary"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
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

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-line-default -translate-x-1/2 hidden md:block" />

          <div className="space-y-8 md:space-y-0">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`md:flex md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content card */}
                <div className={`md:w-5/12 ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                  <div className="bg-bg-primary rounded-xl p-6 shadow-md">
                    {item.number && (
                      <span className="inline-block px-3 py-1 bg-brand/10 text-brand text-sm font-semibold rounded-full mb-3">
                        {item.number}
                      </span>
                    )}
                    {item.header && (
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        {item.header}
                      </h3>
                    )}
                    {item.body && (
                      <p className="text-text-secondary">{item.body}</p>
                    )}
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex md:w-2/12 justify-center">
                  <div className="w-4 h-4 bg-brand rounded-full border-4 border-bg-primary" />
                </div>

                {/* Image */}
                <div className={`md:w-5/12 mt-4 md:mt-0 ${i % 2 === 0 ? 'md:pl-8' : 'md:pr-8'}`}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.header || ''}
                      className="w-full h-48 object-cover rounded-xl"
                    />
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
