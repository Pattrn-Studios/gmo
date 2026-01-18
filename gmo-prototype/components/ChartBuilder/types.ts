export interface ChartRecommendation {
  chartType: 'line' | 'column' | 'bar' | 'area' | 'stackedColumn' | 'stackedArea';
  series: ChartSeries[];
  xAxisLabel: string;
  yAxisLabel: string;
  yAxisFormat: 'number' | 'percent' | 'currency';
  reasoning: string;
}

export interface ChartSeries {
  label: string;
  dataColumn: string;
  colour: string;
}

export interface ChartBuilderValue {
  chartType?: string;
  chartData?: string;
  chartSeries?: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  yAxisFormat?: string;
}

// ChartBuilderProps removed - use ObjectInputProps from 'sanity' directly
