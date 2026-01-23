'use client'

import { TitleSection } from './TitleSection'
import { ContentSection } from './ContentSection'
import { TimelineSection } from './TimelineSection'
import { ChartInsightsSection } from './ChartInsightsSection'
import { NavigationSection } from './NavigationSection'
import { HeaderSection } from './HeaderSection'

interface SectionRendererProps {
  section: any
  index: number
}

export function SectionRenderer({ section, index }: SectionRendererProps) {
  const sectionProps = {
    ...section,
    'data-section-index': index,
  }

  switch (section._type) {
    case 'titleSection':
      return <TitleSection {...sectionProps} />

    case 'contentSection':
      return <ContentSection {...sectionProps} />

    case 'timelineSection':
      return <TimelineSection {...sectionProps} />

    case 'chartInsightsSection':
      return <ChartInsightsSection {...sectionProps} />

    case 'navigationSection':
      return <NavigationSection {...sectionProps} />

    case 'headerSection':
      return <HeaderSection {...sectionProps} />

    default:
      console.warn(`Unknown section type: ${section._type}`)
      return null
  }
}
