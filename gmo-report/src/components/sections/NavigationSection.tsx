'use client'

import { motion } from 'framer-motion'

interface CardImage {
  sectionIndex?: number
  imageUrl?: string
  title?: string
  subtitle?: string
}

interface NavigationSectionProps {
  title?: string
  showPageNumbers?: boolean
  layout?: string
  cardImages?: CardImage[]
  'data-section-index': number
}

export function NavigationSection({
  title,
  showPageNumbers,
  layout,
  cardImages = [],
  'data-section-index': index,
}: NavigationSectionProps) {
  const scrollToSection = (sectionIndex: number) => {
    const element = document.querySelector(`[data-section-index="${sectionIndex}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const hasImages = cardImages.some(card => card.imageUrl)

  return (
    <section
      data-section-index={index}
      className="py-16 sm:py-20 bg-bg-secondary border-t-4 border-t-[#008252]"
    >
      <div className="container">
        {title && (
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-text-primary mb-12"
          >
            {title}
          </motion.h3>
        )}

        <div
          className={`grid gap-6 ${
            hasImages
              ? 'grid-cols-1 md:grid-cols-2 gap-12'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {cardImages.map((card, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => card.sectionIndex !== undefined && scrollToSection(card.sectionIndex)}
              className={`nav-card text-left group relative ${
                card.imageUrl ? 'flex items-stretch p-0 overflow-visible mr-10' : ''
              }`}
            >
              <div className={card.imageUrl ? 'flex-1 p-6 pr-28' : ''}>
                {showPageNumbers && card.sectionIndex !== undefined && (
                  <span className="text-sm text-[#008252] font-semibold mb-2 block">
                    {String(card.sectionIndex + 1).padStart(2, '0')}
                  </span>
                )}
                {card.title && (
                  <h4 className="text-lg font-semibold text-[#008252] mb-2 group-hover:text-[#3E7274] transition-colors">
                    {card.title}
                  </h4>
                )}
                {card.subtitle && (
                  <p className="text-sm text-text-secondary">{card.subtitle}</p>
                )}
              </div>

              {card.imageUrl && (
                <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-[40%] h-[120%] overflow-visible">
                  <img
                    src={card.imageUrl}
                    alt={card.title || `Section ${card.sectionIndex}`}
                    className="w-full h-full object-contain object-center"
                  />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
