import React, {useMemo} from 'react'
import {ChartRecommendation} from './types'
import {parseCSV} from './utils'
import {ThumbnailsGrid, ThumbnailCard} from './styles'
import {RechartsRenderer} from './RechartsRenderer'

interface Props {
  alternatives: ChartRecommendation[]
  csvData: string
  onSelect: (index: number) => void
}

export function AlternativesThumbnails({alternatives, csvData, onSelect}: Props) {
  const parsedData = useMemo(() => parseCSV(csvData), [csvData])

  if (alternatives.length === 0) return null

  return (
    <div>
      <h4>Alternative Charts</h4>
      <ThumbnailsGrid>
        {alternatives.map((alt, idx) => (
          <ThumbnailCard key={idx} onClick={() => onSelect(idx)}>
            <RechartsRenderer
              chartType={alt.chartType}
              data={parsedData}
              series={alt.series}
              height={150}
              showLegend={false}
              showTooltip={false}
              showAxes={false}
              showGrid={false}
              gaugeValue={alt.gaugeValue}
              gaugeMax={alt.gaugeMax}
            />
            <span>{alt.chartType}</span>
          </ThumbnailCard>
        ))}
      </ThumbnailsGrid>
    </div>
  )
}
