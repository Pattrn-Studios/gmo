'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'en', flag: '🇬🇧', name: 'English', path: '/' },
  { code: 'fr', flag: '🇫🇷', name: 'Français', path: '/fr' },
]

export function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const currentLang = pathname.startsWith('/fr') ? 'fr' : 'en'
  const currentLanguage = languages.find(l => l.code === currentLang)!

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors text-sm leading-[20px]"
        aria-label="Select language"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {currentLanguage.flag}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 bg-bg-primary border border-line-default rounded-lg shadow-lg overflow-hidden z-50"
          >
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={lang.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${lang.code === currentLang
                    ? 'bg-brand/10 text-brand font-medium'
                    : 'text-text-primary hover:bg-bg-secondary'}
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                {lang.code === currentLang && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
