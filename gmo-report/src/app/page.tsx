'use client'

import { useState, useEffect } from 'react'
import { getLatestReport, Report } from '@/lib/sanity'
import { ReportLayout } from '@/components/layout/ReportLayout'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import Link from 'next/link'

export default function HomePage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLatestReport()
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">No report found</p>
      </div>
    )
  }

  return (
    <>
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <div className="px-3 py-1.5 bg-brand text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-1.5">
          <span>🇬🇧</span>
          <span>English</span>
        </div>
        <Link
          href="/fr"
          className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm text-text-secondary rounded-full shadow-lg hover:bg-white transition-colors"
        >
          🇫🇷 Français
        </Link>
      </div>

      <ReportLayout report={report}>
        {report.sections?.map((section: any, index: number) => (
          <SectionRenderer
            key={index}
            section={section}
            index={index}
            allSections={report.sections}
          />
        ))}
      </ReportLayout>
    </>
  )
}
