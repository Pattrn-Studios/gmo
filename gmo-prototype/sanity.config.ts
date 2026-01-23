import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {EarthGlobeIcon, DownloadIcon} from '@sanity/icons'
import type {DocumentActionComponent} from 'sanity'
import {useState} from 'react'

export default defineConfig({
  name: 'default',
  title: 'GMO Reports',
  projectId: 'mb7v1vpy',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'report') {
        const ViewLiveReportAction: DocumentActionComponent = (props) => {
          return {
            label: 'View Live Report',
            icon: EarthGlobeIcon,
            onHandle: () => {
              window.open('https://gmo-report.vercel.app', '_blank')
            },
          }
        }

        const ExportPDFAction: DocumentActionComponent = (props) => {
          const [isExporting, setIsExporting] = useState(false)
          const {id, draft, published} = props

          return {
            label: isExporting ? 'Generating PDF...' : 'Export as PDF',
            icon: DownloadIcon,
            disabled: isExporting || (!draft && !published),
            onHandle: async () => {
              setIsExporting(true)

              try {
                const response = await fetch('https://gmo-builder.vercel.app/api/pdf-export', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    reportId: id,
                    options: {
                      optimizeLayout: true,
                    }
                  })
                })

                if (!response.ok) {
                  const error = await response.json()
                  throw new Error(error.error || 'PDF generation failed')
                }

                // Download the PDF
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${(draft || published)?.title || 'report'}.pdf`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

              } catch (error) {
                console.error('PDF export failed:', error)
                alert(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
              } finally {
                setIsExporting(false)
              }
            },
          }
        }

        return [...prev, ViewLiveReportAction, ExportPDFAction]
      }
      return prev
    },
  },
})
