export type ChartType =
  | 'line'
  | 'column'
  | 'bar'
  | 'area'
  | 'stackedColumn'
  | 'stackedArea'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'radar'
  | 'gauge'
  | 'waterfall'
  | 'treemap'
  | 'heatmap'
  | 'composed'

export interface ChartSeries {
  label: string
  dataColumn: string
  colour?: string
}

export interface ChartConfig {
  chartType: ChartType
  chartData: string
  chartSeries: ChartSeries[]
  xAxisLabel?: string
  yAxisLabel?: string
  yAxisFormat?: 'number' | 'percent' | 'currency'
  gaugeMax?: number
}
