import React, {useMemo} from 'react'
import {ChartRecommendation} from './types'
import {parseCSV} from './utils'
import {PreviewContainer, ReasoningBox} from './styles'
import {RechartsRenderer} from './RechartsRenderer'

interface Props {
  recommendation: ChartRecommendation
  csvData: string
}

export function ChartPreview({recommendation, csvData}: Props) {
  const parsedData = useMemo(() => parseCSV(csvData), [csvData])

  return (
    <PreviewContainer>
      <h3>Recommended Chart</h3>
      <RechartsRenderer
        chartType={recommendation.chartType}
        data={parsedData}
        series={recommendation.series}
        xAxisLabel={recommendation.xAxisLabel}
        yAxisLabel={recommendation.yAxisLabel}
        yAxisFormat={recommendation.yAxisFormat}
        height={400}
        gaugeValue={recommendation.gaugeValue}
        gaugeMax={recommendation.gaugeMax}
      />
      <ReasoningBox>
        <strong>Why this chart?</strong>
        <p>{recommendation.reasoning}</p>
      </ReasoningBox>
    </PreviewContainer>
  )
}
