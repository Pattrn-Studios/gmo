'use client'

import { useState, useEffect } from 'react'
import { getLatestReport, Report } from '@/lib/sanity'
import { ReportLayout } from '@/components/layout/ReportLayout'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

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
  )
}
