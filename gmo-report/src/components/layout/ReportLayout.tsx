'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TableOfContents } from './TableOfContents'
import { ThemeToggle } from './ThemeToggle'
import { Footer } from './Footer'
import { Report } from '@/lib/sanity'

interface ReportLayoutProps {
  report: Report
  children: ReactNode
}

export function ReportLayout({ report, children }: ReportLayoutProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(progress)
      setShowBackToTop(scrollTop > 500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll spy for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-section-index'))
            if (!isNaN(index)) {
              setActiveSection(index)
            }
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    // Small delay to ensure sections are rendered
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-section-index]').forEach((el) => {
        observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Scroll progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent">
        <div
          className="h-full bg-brand transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Fixed header */}
      <header className="fixed top-1 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-sm border-b border-line-default">
        <div className="container py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text-primary truncate">
            {report?.title || 'Report'}
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex pt-14">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden lg:block fixed left-0 top-14 w-72 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-line-default bg-bg-primary">
          <div className="p-6">
            <TableOfContents
              sections={report?.sections || []}
              activeSection={activeSection}
            />
          </div>
        </aside>

        {/* Main content with page transition */}
        <main className="flex-1 lg:ml-72">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
          <Footer reportTitle={report?.title} />
        </main>
      </div>

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:bg-brand/90 hover:scale-110 transition-transform"
            aria-label="Back to top"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
