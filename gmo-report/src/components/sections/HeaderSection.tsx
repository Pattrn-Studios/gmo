'use client'

import { motion } from 'framer-motion'

interface HeaderSectionProps {
  title?: string
  subtitle?: string
  image?: string
  showBnpBanner?: boolean
  backgroundColor?: string
  'data-section-index': number
}

export function HeaderSection({
  title,
  subtitle,
  image,
  showBnpBanner,
  backgroundColor,
  'data-section-index': index,
}: HeaderSectionProps) {
  return (
    <section
      data-section-index={index}
      className="py-12 px-4"
      style={{ backgroundColor: backgroundColor || '#008252' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-white/80">{subtitle}</p>
            )}
          </motion.div>

          {image && (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              src={image}
              alt=""
              className="h-16 w-auto object-contain"
            />
          )}
        </div>

        {showBnpBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-4 border-t border-white/20"
          >
            <span className="text-white font-semibold">BNP PARIBAS</span>
            <span className="text-white/70 ml-2">The bank for a changing world</span>
          </motion.div>
        )}
      </div>
    </section>
  )
}
