import { getLatestReport } from '@/lib/sanity'
import { ReportLayout } from '@/components/layout/ReportLayout'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

export default async function HomePage() {
  const report = await getLatestReport()

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
        <SectionRenderer key={index} section={section} index={index} />
      ))}
    </ReportLayout>
  )
}
