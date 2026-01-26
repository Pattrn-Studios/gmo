/**
 * Chart Image Renderer for PowerPoint
 * Renders charts as high-quality PNG images using QuickChart.io API
 * Based on the same pattern used by PDF export (api/pdf-export.js)
 */

import { buildChartJsConfig } from '../lib/chart-config.js';

/**
 * Downsample data arrays to reduce total data points for QuickChart free tier
 * QuickChart free tier limit is ~300 points, so we target max 100 labels
 */
function downsampleChartData(labels, datasets, maxLabels = 100) {
  if (labels.length <= maxLabels) {
    return { labels, datasets };
  }

  const step = Math.ceil(labels.length / maxLabels);
  const sampledIndices = [];
  for (let i = 0; i < labels.length; i += step) {
    sampledIndices.push(i);
  }
  // Always include the last point
  if (sampledIndices[sampledIndices.length - 1] !== labels.length - 1) {
    sampledIndices.push(labels.length - 1);
  }

  const sampledLabels = sampledIndices.map(i => labels[i]);
  const sampledDatasets = datasets.map(ds => ({
    ...ds,
    data: sampledIndices.map(i => ds.data[i]),
  }));

  console.log(`[Chart Image] Downsampled ${labels.length} labels to ${sampledLabels.length}`);
  return { labels: sampledLabels, datasets: sampledDatasets };
}

/**
 * Render a chart section to PNG using QuickChart.io API
 * Returns base64 data URI for embedding in PowerPoint
 * @param {Object} section - Chart section with chartData, chartSeries, etc.
 * @param {Object} options - Rendering options { width, height, darkMode }
 * @returns {Promise<string|null>} Base64 data URI or null if rendering fails
 */
export async function renderChartToPNG(section, options = {}) {
  const { width = 800, height = 500, darkMode = false } = options;

  // Build Chart.js configuration using shared builder
  // Pass darkMode for adaptive text colors
  const chartJsConfig = buildChartJsConfig(section, {
    forPdf: true,
    animation: false,
    darkMode: darkMode
  });
  if (!chartJsConfig) {
    console.log('[Chart Image] No chart config generated');
    return null;
  }

  // Downsample if too many data points (QuickChart free tier limit)
  if (chartJsConfig.data?.labels && chartJsConfig.data?.datasets) {
    const downsampled = downsampleChartData(chartJsConfig.data.labels, chartJsConfig.data.datasets);
    chartJsConfig.data.labels = downsampled.labels;
    chartJsConfig.data.datasets = downsampled.datasets;
  }

  // Disable animation for image rendering
  if (chartJsConfig.options) {
    chartJsConfig.options.animation = false;
    chartJsConfig.options.responsive = false;
    chartJsConfig.options.maintainAspectRatio = false;
  }

  console.log(`[Chart Image] Rendering ${chartJsConfig.type} chart (${width}x${height}, darkMode: ${darkMode})`);

  try {
    const response = await fetch('https://quickchart.io/chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: chartJsConfig,
        width: width,
        height: height,
        backgroundColor: 'transparent',  // Transparent for blending with slide backgrounds
        format: 'png',
        devicePixelRatio: 2, // Higher resolution for quality
      }),
    });

    // Check Content-Type - QuickChart sometimes returns errors with non-image content
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('image/png')) {
      const errorText = await response.text();
      throw new Error(`QuickChart API error: ${response.status} - ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    console.log(`[Chart Image] Successfully rendered (${Math.round(base64.length / 1024)}KB)`);

    // Return as data URI for pptxgenjs
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('[Chart Image] QuickChart rendering failed:', error.message);
    throw error;
  }
}

/**
 * Render all charts from report sections
 * @param {Array} sections - Report sections
 * @returns {Promise<Map<number, string>>} Map of section index to base64 image data URI
 */
export async function renderAllCharts(sections) {
  const chartImages = new Map();

  const chartsToRender = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.hasChart && (section.chartData || section.chartConfig?.chartData));

  if (chartsToRender.length === 0) {
    console.log('[Chart Image] No charts to render');
    return chartImages;
  }

  console.log(`[Chart Image] Rendering ${chartsToRender.length} charts...`);

  for (const { section, index } of chartsToRender) {
    try {
      // Build the section object for chart rendering
      const chartSection = {
        hasChart: true,
        chartType: section.chartConfig?.chartType || section.chartType || 'line',
        chartData: section.chartConfig?.chartData || section.chartData,
        chartSeries: section.chartConfig?.chartSeries || section.chartSeries,
        xAxisLabel: section.chartConfig?.xAxisLabel || section.xAxisLabel,
        yAxisLabel: section.chartConfig?.yAxisLabel || section.yAxisLabel,
        yAxisFormat: section.chartConfig?.yAxisFormat || section.yAxisFormat,
      };

      const imageDataUri = await renderChartToPNG(chartSection);
      if (imageDataUri) {
        chartImages.set(index, imageDataUri);
        console.log(`[Chart Image] Chart ${index + 1} rendered successfully`);
      }
    } catch (error) {
      console.error(`[Chart Image] Failed to render chart for section ${index}:`, error.message);
    }
  }

  return chartImages;
}

export default {
  renderChartToPNG,
  renderAllCharts
};
