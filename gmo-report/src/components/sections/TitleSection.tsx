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

      {/* White banner with logo and tagline */}
      {companyLogo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 z-10 bg-white"
        >
          <div className="container py-4 flex items-center justify-between">
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-10 sm:h-14 w-auto max-w-[200px] object-contain"
            />
            <span className="text-sm sm:text-base text-text-primary italic hidden sm:block">
              The sustainable investor for a changing world
            </span>
          </div>
        </motion.div>
      )}
    </section>
  )
}
