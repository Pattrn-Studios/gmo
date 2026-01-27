import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ChartRecommendation } from './types';

// Excel/CSV parsing
export function parseFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      if (file.name.endsWith('.csv')) {
        resolve(data as string);
      } else {
        // Excel file
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        resolve(csv);
      }
    };

    reader.onerror = reject;

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}

// API call
// Use local Chart Agent for development, production URL for deployed version
const API_BASE_URL = process.env.SANITY_STUDIO_CHART_AGENT_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://gmo-chart-agent.vercel.app');

export async function analyzeChartData(csvData: string): Promise<{
  main: ChartRecommendation;
  alternatives: ChartRecommendation[];
}> {
  const response = await fetch(`${API_BASE_URL}/api/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvData })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    main: data,
    alternatives: data.alternatives || [] // API may not return alternatives yet
  };
}

// Image reading - convert File to base64 + extract media type
export function readImageAsBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // dataUrl format: "data:image/png;base64,iVBORw0KGgo..."
      const [header, base64] = dataUrl.split(',');
      const mediaType = header.split(':')[1].split(';')[0];
      resolve({ base64, mediaType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Analyse a chart image using Claude Vision
export async function analyzeChartImage(base64Image: string, mediaType: string): Promise<{
  main: ChartRecommendation;
  alternatives: ChartRecommendation[];
  csvData: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/analyse-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData: base64Image, mediaType })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    main: {
      chartType: data.chartType,
      series: data.series,
      xAxisLabel: data.xAxisLabel,
      yAxisLabel: data.yAxisLabel,
      yAxisFormat: data.yAxisFormat,
      reasoning: data.reasoning,
      dataColumn: data.dataColumn,
      labelColumn: data.labelColumn,
      gaugeValue: data.gaugeValue,
      gaugeMax: data.gaugeMax,
      gaugeThresholds: data.gaugeThresholds,
    },
    alternatives: data.alternatives || [],
    csvData: data.csvData
  };
}

// CSV parsing for chart data
export function parseCSV(csv: string): Record<string, any>[] {
  const result = Papa.parse(csv, { header: true, dynamicTyping: true });
  return result.data as Record<string, any>[];
}

// Format a value based on the specified format type
// Used by Recharts components for axis ticks and tooltips
export function formatValue(value: number, format?: string): string {
  if (format === 'percent') return `${value}%`
  if (format === 'currency') return `$${value.toLocaleString()}`
  return value.toLocaleString()
}

// Get display name for chart type
export function getChartTypeDisplayName(chartType: string): string {
  const displayNames: Record<string, string> = {
    line: 'Line Chart',
    column: 'Column Chart',
    bar: 'Bar Chart',
    area: 'Area Chart',
    stackedColumn: 'Stacked Column',
    stackedArea: 'Stacked Area',
    pie: 'Pie Chart',
    donut: 'Donut Chart',
    scatter: 'Scatter Plot',
    radar: 'Radar Chart',
    composed: 'Composed Chart',
    waterfall: 'Waterfall Chart',
    gauge: 'Gauge',
    treemap: 'Treemap',
    heatmap: 'Heatmap',
  }
  return displayNames[chartType] || chartType
}
