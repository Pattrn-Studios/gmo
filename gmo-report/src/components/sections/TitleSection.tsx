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
  // Build background style matching the original HTML template
  const bgColor = backgroundColor || '#008252'
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: `linear-gradient(135deg, ${bgColor} 0%, #132728 100%)`,
      }

  return (
    <section
      data-section-index={index}
      className="relative min-h-[60vh] flex items-center overflow-hidden"
      style={backgroundStyle}
    >
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {heading || 'Report Title'}
          </h1>

          {subheading && (
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl">
              {subheading}
            </p>
          )}
        </motion.div>
      </div>

      {/* Logo anchored to bottom of section */}
      {companyLogo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 left-6 z-10"
        >
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-12 sm:h-16 w-auto max-w-[200px] object-contain"
          />
        </motion.div>
      )}

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
