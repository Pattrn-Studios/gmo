'use client'

import { motion } from 'framer-motion'

interface TitleSectionProps {
  heading?: string
  subheading?: string
  backgroundImage?: string
  backgroundColor?: string
  companyLogo?: string
  'data-section-index': number
}

export function TitleSection({
  heading,
  subheading,
  backgroundImage,
  backgroundColor,
  companyLogo,
  'data-section-index': index,
}: TitleSectionProps) {
  return (
    <section
      data-section-index={index}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: backgroundColor || '#008252',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 text-center px-4 max-w-4xl"
      >
        {companyLogo && (
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-16 mx-auto mb-8 object-contain"
          />
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          {heading || 'Report Title'}
        </h1>

        {subheading && (
          <p className="text-xl md:text-2xl text-white/90">
            {subheading}
          </p>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-3 bg-white/70 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}
