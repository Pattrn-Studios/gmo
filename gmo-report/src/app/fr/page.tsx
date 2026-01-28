'use client'

import { useState, useEffect } from 'react'
import { Report } from '@/lib/sanity'
import { ReportLayout } from '@/components/layout/ReportLayout'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import Link from 'next/link'

const TRANSLATION_API_URL = 'https://gmo-builder.vercel.app/api/translate-json'

export default function FrenchPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTranslatedReport() {
      try {
        const response = await fetch(TRANSLATION_API_URL)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Translation failed (${response.status})`)
        }

        const data = await response.json()
        setReport(data.report)
      } catch (err) {
        console.error('Translation fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load translation')
      } finally {
        setLoading(false)
      }
    }

    fetchTranslatedReport()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Chargement de la traduction...</p>
          <p className="text-xs text-text-secondary mt-2">La traduction peut prendre quelques secondes</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de traduction</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            ← Voir la version anglaise
          </Link>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <p className="text-lg text-text-secondary mb-4">Aucun rapport trouvé</p>
          <Link
            href="/"
            className="text-brand hover:underline"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Language Badge */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link
          href="/"
          className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm text-text-secondary rounded-full shadow-lg hover:bg-white transition-colors"
        >
          🇬🇧 English
        </Link>
        <div className="px-3 py-1.5 bg-brand text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-1.5">
          <span>🇫🇷</span>
          <span>Français</span>
        </div>
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

        {/* Translation Notice */}
        <div className="max-w-3xl mx-auto px-6 py-8 my-12">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-6 rounded-r-lg">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              <span>Traduction automatique</span>
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Ce rapport a été traduit automatiquement de l'anglais vers le français à l'aide
              de l'intelligence artificielle. Bien que nous nous efforcions d'assurer l'exactitude,
              certaines nuances peuvent différer de l'original.
            </p>
            <Link
              href="/"
              className="text-sm text-brand hover:underline font-medium"
            >
              Voir la version anglaise →
            </Link>
          </div>
        </div>
      </ReportLayout>
    </>
  )
}
