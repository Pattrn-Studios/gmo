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
  const bgColor = backgroundColor || '#008252'

  return (
    <section
      data-section-index={index}
      className="relative min-h-[40vh] py-16 sm:py-20 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 max-w-[70%]"
          >
            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg sm:text-xl text-white/80">{subtitle}</p>
            )}
          </motion.div>

          {/* Image */}
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 max-w-[35%]"
            >
              <img
                src={image}
                alt=""
                className="max-h-[250px] w-auto object-contain"
              />
            </motion.div>
          )}
        </div>

        {/* BNP Banner */}
        {showBnpBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-0 left-0 right-0 bg-black/20 py-3 px-6"
          >
            <div className="container flex items-center gap-4">
              <span className="text-white font-semibold">BNP PARIBAS</span>
              <span className="text-white/70">The bank for a changing world</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
