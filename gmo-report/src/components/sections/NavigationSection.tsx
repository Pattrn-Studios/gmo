'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface CardImage {
  sectionIndex?: number
  imageUrl?: string
}

interface NavigationSectionProps {
  title?: string
  showPageNumbers?: boolean
  layout?: string
  cardImages?: CardImage[]
  allSections?: any[]
  'data-section-index': number
}

export function NavigationSection({
  title,
  showPageNumbers,
  layout,
  cardImages = [],
  allSections = [],
  'data-section-index': index,
}: NavigationSectionProps) {
  // Build navigation cards from content sections (matching original HTML builder logic)
  const navCards = useMemo(() => {
    // Get all content sections with their original indices
    const contentSections = allSections
      .map((s, originalIndex) => ({ section: s, originalIndex }))
      .filter(item => item.section._type === 'contentSection')
      .map((item, contentIndex) => ({
        title: item.section.title,
        subtitle: item.section.subtitle,
        sectionIndex: item.originalIndex,
        contentIndex: contentIndex + 1, // 1-based for cardImages mapping
      }))

    // Build card image map (sectionIndex is 1-based in cardImages)
    const cardImageMap: Record<number, string> = {}
    if (cardImages) {
      cardImages.forEach(ci => {
        if (ci.sectionIndex && ci.imageUrl) {
          cardImageMap[ci.sectionIndex] = ci.imageUrl
        }
      })
    }

    // Merge content sections with their images
    return contentSections.map(cs => ({
      ...cs,
      imageUrl: cardImageMap[cs.contentIndex],
    }))
  }, [allSections, cardImages])

  const scrollToSection = (sectionIndex: number) => {
    const element = document.querySelector(`[data-section-index="${sectionIndex}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const isCardsLayout = layout === 'cards'
  const hasImages = isCardsLayout && navCards.some(card => card.imageUrl)

  return (
    <section
      data-section-index={index}
      className="py-16 sm:py-20 bg-bg-secondary border-t-4 border-t-brand"
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
          {navCards.map((card, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => scrollToSection(card.sectionIndex)}
              className={`nav-card text-left group relative ${
                card.imageUrl ? 'flex items-stretch p-0 overflow-visible mr-10' : ''
              }`}
            >
              <div className={card.imageUrl ? 'flex-1 p-6 pr-28' : ''}>
                {showPageNumbers && (
                  <span className="text-sm text-brand font-semibold mb-2 block">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                {card.title && (
                  <h4 className="text-lg font-semibold text-brand mb-2 group-hover:opacity-80 transition-colors">
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
