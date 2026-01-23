'use client'

import { motion } from 'framer-motion'

interface CardImage {
  sectionIndex?: number
  imageUrl?: string
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

  return (
    <section
      data-section-index={index}
      className="py-16 px-4 bg-bg-secondary"
    >
      <div className="max-w-6xl mx-auto">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-12"
          >
            {title}
          </motion.h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cardImages.map((card, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => card.sectionIndex !== undefined && scrollToSection(card.sectionIndex)}
              className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow aspect-[4/3] group"
            >
              {card.imageUrl && (
                <img
                  src={card.imageUrl}
                  alt={`Section ${card.sectionIndex}`}
                  className="w-full h-full object-cover"
                />
              )}
              {showPageNumbers && card.sectionIndex !== undefined && (
                <span className="absolute top-2 left-2 bg-brand text-white text-sm font-bold px-2 py-1 rounded">
                  {card.sectionIndex + 1}
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
