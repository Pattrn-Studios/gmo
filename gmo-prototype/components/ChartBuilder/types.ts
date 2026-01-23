// All supported chart types
export type ChartType =
  // Basic chart types
  | 'line'
  | 'column'
  | 'bar'
  | 'area'
  | 'stackedColumn'
  | 'stackedArea'
  // Proportional charts
  | 'pie'
  | 'donut'
  // Analytical charts
  | 'scatter'
  | 'radar'
  | 'composed'
  | 'waterfall'
  // Specialized charts
  | 'gauge'
  | 'treemap'
  | 'heatmap';

export interface ChartRecommendation {
  chartType: ChartType;
  series: ChartSeries[];
  xAxisLabel: string;
  yAxisLabel: string;
  yAxisFormat: 'number' | 'percent' | 'currency';
  reasoning: string;
  // Optional fields for specific chart types
  dataColumn?: string; // For pie/donut: the value column
  labelColumn?: string; // For pie/donut: the label column
  gaugeValue?: number; // For gauge: current value
  gaugeMax?: number; // For gauge: maximum value
  gaugeThresholds?: number[]; // For gauge: threshold values
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
