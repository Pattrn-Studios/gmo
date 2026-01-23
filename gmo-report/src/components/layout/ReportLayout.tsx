'use client'

import { ReactNode, useState, useEffect } from 'react'
import { TableOfContents } from './TableOfContents'
import { ThemeToggle } from './ThemeToggle'
import { Report } from '@/lib/sanity'

interface ReportLayoutProps {
  report: Report
  children: ReactNode
}

export function ReportLayout({ report, children }: ReportLayoutProps) {
  const [activeSection, setActiveSection] = useState(0)

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

    document.querySelectorAll('[data-section-index]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-sm border-b border-line-default">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text-primary truncate">
            {report?.title || 'Report'}
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex pt-16">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden lg:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] overflow-y-auto border-r border-line-default bg-bg-primary p-4">
          <TableOfContents
            sections={report?.sections || []}
            activeSection={activeSection}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          {children}
        </main>
      </div>

      {/* Scroll progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50">
        <div
          className="h-full bg-brand transition-all duration-150"
          style={{ width: '0%' }}
          id="scroll-progress"
        />
      </div>
    </div>
  )
}
