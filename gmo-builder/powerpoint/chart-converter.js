/**
 * Chart Converter
 * Converts Sanity chart data to pptxgenjs chart format
 */

import { parseCSV } from '../lib/chart-config.js';
import { loadTemplateConfig } from '../lib/powerpoint/template-loader.js';

// Maximum data points for PowerPoint charts - prevents visual clutter
const MAX_PPTX_DATA_POINTS = 100;

/**
 * Sample data to reduce density while preserving trends
 * @param {Array} data - Parsed CSV data array
 * @param {number} maxPoints - Maximum number of points to keep
 * @returns {Array} Sampled data array
 */
function sampleData(data, maxPoints) {
  if (data.length <= maxPoints) return data;

  const step = Math.ceil(data.length / maxPoints);
  const sampled = data.filter((_, i) => i % step === 0);

  // Always include the last data point for continuity
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }

  console.log(`[Chart] Sampled ${data.length} points down to ${sampled.length} points`);
  return sampled;
}

// Default GMO brand colors (without # prefix)
const defaultColors = [
  '009FB1',  // primary teal
  '51BBB4',  // lighter teal
  '61C3D7',  // cyan
  'F49F7B',  // orange
  'A37767',  // brown
  '3E7274',  // dark teal
  '76BCA3'   // mint
];

/**
 * Convert section chart data to pptxgenjs chart options
 * @param {Object} section - Sanity section with chart data
 * @param {Object} layout - Layout positions from template config
 * @returns {Object|null} pptxgenjs chart options or null if no chart
 */
export function convertChartToPptx(section, layout) {
  if (!section.chartData || !section.chartSeries?.length) {
    return null;
  }

  const config = loadTemplateConfig();

  // Parse CSV data
  let parsedData = parseCSV(section.chartData);
  if (!parsedData || parsedData.length === 0) {
    return null;
  }

  // Get chart type - map Sanity types to pptxgenjs types
  const chartType = section.chartType || 'line';
  const chartTypeMap = {
    line: 'line',
    column: 'bar',
    bar: 'bar',
    area: 'area',
    stackedColumn: 'bar',
    stackedArea: 'area',
    pie: 'pie',
    donut: 'doughnut',
    scatter: 'scatter',
    radar: 'radar'
  };
  const pptxChartType = chartTypeMap[chartType] || 'line';

  // Get labels (x-axis values) from first column
  const firstKey = Object.keys(parsedData[0])[0];

  // Chart position from layout
  const chartPos = layout?.chart || { x: 3.33, y: 1.93, w: 7.61, h: 3.94 };

  // Base chart options
  const baseOptions = {
    x: chartPos.x,
    y: chartPos.y,
    w: chartPos.w,
    h: chartPos.h,
    showLegend: true,
    legendPos: 'b',
    showTitle: false
  };

  // Add axis labels if provided
  if (section.xAxisLabel) {
    baseOptions.catAxisTitle = section.xAxisLabel;
    baseOptions.showCatAxisTitle = true;
  }
  if (section.yAxisLabel) {
    baseOptions.valAxisTitle = section.yAxisLabel;
    baseOptions.showValAxisTitle = true;
  }

  // Format Y-axis based on format type
  if (section.yAxisFormat === 'percent') {
    baseOptions.valAxisLabelFormatCode = '0%';
  } else if (section.yAxisFormat === 'currency') {
    baseOptions.valAxisLabelFormatCode = '$#,##0';
  }

  // Handle PIE/DOUGHNUT charts separately - they have a different data structure
  if (pptxChartType === 'pie' || pptxChartType === 'doughnut') {
    return buildPieChart(section, parsedData, firstKey, pptxChartType, baseOptions);
  }

  // For non-pie charts, sample data if too dense
  if (parsedData.length > MAX_PPTX_DATA_POINTS) {
    parsedData = sampleData(parsedData, MAX_PPTX_DATA_POINTS);
  }

  const labels = parsedData.map(row => String(row[firstKey] || ''));

  // Build datasets with colors
  const chartData = [];
  const chartColors = [];

  section.chartSeries.forEach((series, index) => {
    const values = parsedData.map(row => {
      const val = row[series.dataColumn];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });

    chartData.push({
      name: series.label,
      labels: labels,
      values: values
    });

    // Get color for this series - remove # if present
    let color = series.colour || series.color;
    if (color) {
      color = color.replace('#', '');
    } else {
      color = defaultColors[index % defaultColors.length];
    }
    chartColors.push(color);
  });

  // Build chart options
  const chartOptions = {
    ...baseOptions,
    chartColors: chartColors
  };

  // LINE chart specific options
  if (pptxChartType === 'line') {
    chartOptions.lineSmooth = true;
    chartOptions.lineSize = 2;

    // Hide markers for dense datasets, show for sparse
    const dataPointCount = chartData[0]?.values?.length || 0;
    if (dataPointCount > 30) {
      chartOptions.lineDataSymbol = 'none';
      console.log(`[Chart] Hiding markers for dense line chart (${dataPointCount} points)`);
    } else {
      chartOptions.lineDataSymbol = 'circle';
      chartOptions.lineDataSymbolSize = 6;
    }
  }

  // AREA chart specific options
  if (pptxChartType === 'area') {
    chartOptions.lineSmooth = true;
  }

  // BAR chart specific options
  if (pptxChartType === 'bar') {
    chartOptions.barDir = chartType === 'bar' ? 'bar' : 'col';
    chartOptions.barGrouping = chartType.includes('stacked') ? 'stacked' : 'clustered';
    chartOptions.barGapWidthPct = 50;
  }

  console.log(`[Chart] Type: ${pptxChartType}`);
  console.log(`[Chart] Labels: ${labels.slice(0, 5).join(', ')}${labels.length > 5 ? '...' : ''} (${labels.length} total)`);
  console.log(`[Chart] Series: ${chartData.map(d => d.name).join(', ')}`);
  console.log(`[Chart] Colors: ${chartColors.join(', ')}`);

  return {
    type: pptxChartType,
    data: chartData,
    options: chartOptions
  };
}

/**
 * Build pie/doughnut chart configuration
 * Pie charts have a different data structure - one dataset with multiple slices
 */
function buildPieChart(section, parsedData, firstKey, pptxChartType, baseOptions) {
  // For pie charts, the first column values become slice labels
  const labels = parsedData.map(row => String(row[firstKey] || ''));

  // Get the value column from the first series, or fall back to second column
  const valueColumn = section.chartSeries?.[0]?.dataColumn || Object.keys(parsedData[0])[1];

  // Extract values for each slice
  const values = parsedData.map(row => {
    const val = row[valueColumn];
    return typeof val === 'number' ? val : parseFloat(val) || 0;
  });

  // Generate colors - one per slice (not per series)
  const sliceColors = labels.map((_, index) => {
    // Check if series has custom colors defined
    const seriesColor = section.chartSeries?.[index]?.colour || section.chartSeries?.[index]?.color;
    if (seriesColor) {
      return seriesColor.replace('#', '');
    }
    return defaultColors[index % defaultColors.length];
  });

  const chartData = [{
    name: section.chartSeries?.[0]?.label || 'Data',
    labels: labels,
    values: values
  }];

  const chartOptions = {
    ...baseOptions,
    chartColors: sliceColors,
    legendPos: 'r',  // Legend on right for pie charts
    showPercent: true,
    showValue: false
  };

  console.log(`[Chart] Type: ${pptxChartType}`);
  console.log(`[Chart] Pie slices: ${labels.join(', ')}`);
  console.log(`[Chart] Pie values: ${values.join(', ')}`);
  console.log(`[Chart] Slice colors: ${sliceColors.join(', ')}`);

  return {
    type: pptxChartType,
    data: chartData,
    options: chartOptions
  };
}

/**
 * Add chart to a pptxgenjs slide
 * @param {Object} pptxSlide - pptxgenjs slide object
 * @param {Object} section - Sanity section with chart data
 * @param {Object} layout - Layout positions from template config
 * @param {Object} pptx - pptxgenjs presentation instance (for ChartType constants)
 * @returns {boolean} True if chart was added successfully
 */
export function addChartToSlide(pptxSlide, section, layout, pptx) {
  const chartConfig = convertChartToPptx(section, layout);

  if (!chartConfig) {
    console.log('[Chart] No chart config generated - missing chartData or chartSeries');
    return false;
  }

  console.log(`[Chart] Adding ${chartConfig.type} chart with ${chartConfig.data.length} series`);

  try {
    // Use pptx.ChartType constants if available, otherwise fall back to string
    let chartType = chartConfig.type;
    if (pptx?.ChartType && pptx.ChartType[chartConfig.type]) {
      chartType = pptx.ChartType[chartConfig.type];
      console.log(`[Chart] Using ChartType constant: ${chartConfig.type}`);
    }

    pptxSlide.addChart(chartType, chartConfig.data, chartConfig.options);
    console.log('[Chart] Chart added successfully');
    return true;
  } catch (error) {
    console.error('[Chart] Error adding chart:', error.message);
    return false;
  }
}

export default {
  convertChartToPptx,
  addChartToSlide
};
