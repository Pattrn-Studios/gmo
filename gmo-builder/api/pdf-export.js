/**
 * PDF Export API Endpoint
 * POST /api/pdf-export
 *
 * Generates PDF documents from Sanity report data.
 * Charts are rendered via QuickChart.io and embedded as images.
 * Delegates PDF generation to lib/pdf/pdf-generator.js.
 *
 * Aligned with pptx-export.js — same GROQ query, same section coverage.
 */

import { createClient } from '@sanity/client';
import { buildChartJsConfig } from '../lib/chart-config.js';
import { generatePDF } from '../lib/pdf/pdf-generator.js';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

// ============================================================================
// SANITY QUERY (aligned with pptx-export.js)
// ============================================================================

async function fetchReportById(reportId) {
  const query = `*[_type == "report" && _id == $reportId][0] {
    _id,
    title,
    publicationDate,
    author,
    summary,
    sections[] {
      _type,

      _type == "titleSection" => {
        heading,
        subheading,
        backgroundColor,
        "companyLogo": companyLogo { "asset": asset-> { url } }
      },

      _type == "navigationSection" => {
        title,
        showPageNumbers,
        layout,
        "cardImages": cardImages[] {
          title,
          description,
          "image": image { "asset": asset-> { url } }
        }
      },

      _type == "headerSection" => {
        title,
        subtitle,
        backgroundColor,
        "image": image { "asset": asset-> { url } }
      },

      _type == "contentSection" => {
        title,
        subtitle,
        content,
        hasChart,
        "sectionTheme": colorTheme,
        "chartConfig": chartConfig {
          chartType,
          chartData,
          chartTitle,
          chartSeries[] { label, dataColumn, colour },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat
        },
        chartSource,
        layout,
        "sectionImage": sectionImage { "asset": asset-> { url } }
      },

      _type == "chartInsightsSection" => {
        title,
        subtitle,
        insightsPosition,
        insightsColor,
        insights,
        "chartConfig": chartConfig {
          chartType,
          chartData,
          chartTitle,
          chartSeries[] { label, dataColumn, colour },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat
        },
        chartSource
      },

      _type == "timelineSection" => {
        title,
        subtitle,
        items[] {
          number,
          header,
          body,
          "image": image { "asset": asset-> { url } }
        }
      }
    }
  }`;

  return await client.fetch(query, { reportId });
}

// ============================================================================
// IMAGE FETCHING
// ============================================================================

/**
 * Fetch an image from a URL and convert to base64 string.
 *
 * @param {string} url - The image URL to fetch
 * @returns {Promise<string|null>} Base64-encoded image data (without data URL prefix), or null on failure
 */
async function fetchImageAsBase64(url) {
  if (!url) return null;
  try {
    console.log(`[PDF Export] Fetching image: ${url.substring(0, 80)}...`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[PDF Export] Image fetch HTTP ${response.status}: ${url.substring(0, 80)}`);
      return null;
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    console.log(`[PDF Export] Image fetched OK: ${base64.length} chars base64`);
    return base64;
  } catch (error) {
    console.error('[PDF Export] Image fetch failed:', error.message, url?.substring(0, 80));
    return null;
  }
}

/**
 * Pre-fetch all images referenced in report sections.
 * Returns a Map<sectionIndex, { [imageKey]: base64string }>
 */
async function prefetchAllImages(sections) {
  const imageMap = new Map();
  const fetchJobs = [];

  sections.forEach((section, index) => {
    const sectionImages = {};

    switch (section._type) {
      case 'titleSection':
        if (section.companyLogo?.asset?.url) {
          fetchJobs.push(
            fetchImageAsBase64(section.companyLogo.asset.url).then(data => {
              if (data) sectionImages.companyLogo = data;
            })
          );
        }
        break;

      case 'headerSection':
        if (section.image?.asset?.url) {
          fetchJobs.push(
            fetchImageAsBase64(section.image.asset.url).then(data => {
              if (data) sectionImages.image = data;
            })
          );
        }
        break;

      case 'contentSection':
        if (section.sectionImage?.asset?.url) {
          fetchJobs.push(
            fetchImageAsBase64(section.sectionImage.asset.url).then(data => {
              if (data) sectionImages.sectionImage = data;
            })
          );
        }
        break;

      case 'timelineSection':
        if (section.items?.length) {
          section.items.forEach((item, itemIdx) => {
            if (item.image?.asset?.url) {
              fetchJobs.push(
                fetchImageAsBase64(item.image.asset.url).then(data => {
                  if (data) sectionImages[`item_${itemIdx}`] = data;
                })
              );
            }
          });
        }
        break;

      case 'navigationSection':
        if (section.cardImages?.length) {
          section.cardImages.forEach((card, cardIdx) => {
            if (card.image?.asset?.url) {
              fetchJobs.push(
                fetchImageAsBase64(card.image.asset.url).then(data => {
                  if (data) sectionImages[`card_${cardIdx}`] = data;
                })
              );
            }
          });
        }
        break;
    }

    imageMap.set(index, sectionImages);
  });

  console.log(`[PDF Export] Fetching ${fetchJobs.length} images across ${sections.length} sections...`);
  await Promise.all(fetchJobs);

  // Log what was collected
  for (const [idx, images] of imageMap.entries()) {
    const keys = Object.keys(images);
    if (keys.length > 0) {
      console.log(`[PDF Export] Section ${idx} (${sections[idx]?._type}): ${keys.length} images — ${keys.join(', ')}`);
    }
  }

  return imageMap;
}

// ============================================================================
// CHART RENDERING (via QuickChart.io)
// ============================================================================

/**
 * Downsample chart data to reduce label density for PDF rendering.
 * Preserves first and last data points for context.
 *
 * @param {string[]} labels - Array of x-axis labels
 * @param {Object[]} datasets - Array of Chart.js dataset objects
 * @param {number} [maxLabels=100] - Maximum number of labels to retain
 * @returns {{labels: string[], datasets: Object[]}} Downsampled chart data
 */
function downsampleChartData(labels, datasets, maxLabels = 100) {
  if (labels.length <= maxLabels) return { labels, datasets };
  const step = Math.ceil(labels.length / maxLabels);
  const sampledIndices = [];
  for (let i = 0; i < labels.length; i += step) sampledIndices.push(i);
  if (sampledIndices[sampledIndices.length - 1] !== labels.length - 1) {
    sampledIndices.push(labels.length - 1);
  }
  return {
    labels: sampledIndices.map(i => labels[i]),
    datasets: datasets.map(ds => ({ ...ds, data: sampledIndices.map(i => ds.data[i]) }))
  };
}

/**
 * Normalize a section's nested chartConfig to flat fields for buildChartJsConfig.
 * Both contentSection and chartInsightsSection use nested chartConfig from the GROQ query.
 */
function flattenChartFields(section) {
  if (!section.chartConfig) return section;
  return {
    ...section,
    hasChart: section.hasChart !== undefined ? section.hasChart : Boolean(section.chartConfig?.chartData),
    chartData: section.chartConfig.chartData,
    chartSeries: section.chartConfig.chartSeries,
    chartType: section.chartConfig.chartType || 'line',
    xAxisLabel: section.chartConfig.xAxisLabel,
    yAxisLabel: section.chartConfig.yAxisLabel,
    yAxisFormat: section.chartConfig.yAxisFormat,
  };
}

/**
 * Render a chart section to PNG image via QuickChart.io API.
 *
 * @param {Object} section - Sanity section object containing chart configuration
 * @param {Object} [options={}] - Rendering options
 * @param {number} [options.width=700] - Image width in pixels
 * @param {number} [options.height=400] - Image height in pixels
 * @returns {Promise<string|null>} Base64-encoded PNG data, or null on failure
 */
async function renderChartToPNG(section, options = {}) {
  const { width = 700, height = 400 } = options;

  const flatSection = flattenChartFields(section);
  const chartJsConfig = buildChartJsConfig(flatSection, { forPdf: true, animation: false });
  if (!chartJsConfig) return null;

  if (chartJsConfig.data?.labels && chartJsConfig.data?.datasets) {
    const downsampled = downsampleChartData(chartJsConfig.data.labels, chartJsConfig.data.datasets);
    chartJsConfig.data.labels = downsampled.labels;
    chartJsConfig.data.datasets = downsampled.datasets;
  }

  if (chartJsConfig.options) {
    chartJsConfig.options.animation = false;
    chartJsConfig.options.responsive = false;
    chartJsConfig.options.maintainAspectRatio = false;
  }

  try {
    const response = await fetch('https://quickchart.io/chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: chartJsConfig,
        width,
        height,
        backgroundColor: 'white',
        format: 'png',
        devicePixelRatio: 2,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('image/png')) {
      const errorText = await response.text();
      throw new Error(`QuickChart API error: ${response.status} - ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('[PDF Export] QuickChart rendering failed:', error.message);
    return null;
  }
}

/**
 * Render charts for all sections that have chart data
 * (contentSection and chartInsightsSection both support charts)
 */
async function renderAllCharts(sections) {
  const chartImages = new Map();

  const chartsToRender = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => {
      if (section._type === 'contentSection') {
        return section.hasChart && section.chartConfig?.chartData;
      }
      if (section._type === 'chartInsightsSection') {
        return Boolean(section.chartConfig?.chartData);
      }
      return false;
    });

  if (chartsToRender.length === 0) return chartImages;

  console.log(`[PDF Export] Rendering ${chartsToRender.length} charts...`);

  for (const { section, index } of chartsToRender) {
    try {
      const png = await renderChartToPNG(section);
      if (png) {
        chartImages.set(index, png);
        console.log(`[PDF Export] Chart ${index} rendered successfully`);
      }
    } catch (error) {
      console.error(`[PDF Export] Failed to render chart for section ${index}:`, error.message);
    }
  }

  return chartImages;
}

// ============================================================================
// LAYOUT HINTS
// ============================================================================

function getDefaultLayoutHints(report) {
  const sections = (report.sections || [])
    .filter(s => s._type === 'contentSection')
    .map((section, index) => {
      const hasChart = Boolean(section.hasChart && section.chartConfig?.chartData);
      const seriesCount = section.chartConfig?.chartSeries?.length || 0;

      let chartPosition = section.layout || 'chartRight';
      let chartSize = 'medium';

      if (hasChart) {
        if (seriesCount > 3 || section.chartConfig?.chartType?.includes('stacked')) {
          chartSize = 'large';
        } else if (seriesCount <= 1) {
          chartSize = 'small';
        }

        if (chartPosition !== 'chartFull' && index % 2 === 1) {
          chartPosition = chartPosition === 'chartRight' ? 'chartLeft' : 'chartRight';
        }
      }

      return { title: section.title, chartPosition, chartSize, notes: 'Default layout' };
    });

  return { sections, generalNotes: 'Using default layout rules' };
}

// ============================================================================
// FILENAME UTILITY
// ============================================================================

function sanitizeFilename(name) {
  return (name || 'report')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

// ============================================================================
// API HANDLER
// ============================================================================

/**
 * Vercel API handler for PDF export.
 *
 * POST /api/pdf-export
 *
 * Request body:
 * @param {string} reportId - Sanity document ID of the report to export
 *
 * Response:
 * - Success: Returns PDF file as binary download
 * - Error: Returns JSON with error message
 *
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reportId, options = {} } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required' });
    }

    console.log(`[PDF Export] Starting export for report: ${reportId}`);

    // 1. Fetch report from Sanity
    const report = await fetchReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log(`[PDF Export] Fetched report: "${report.title}" with ${report.sections?.length || 0} sections`);

    // 2. Pre-fetch all images and render all charts in parallel
    const [imageMap, chartImages] = await Promise.all([
      prefetchAllImages(report.sections || []),
      renderAllCharts(report.sections || []),
    ]);

    // 3. Get layout hints
    const layoutHints = getDefaultLayoutHints(report);

    // 4. Generate PDF via the shared generator
    const pdfBuffer = await generatePDF(report, chartImages, layoutHints, imageMap);

    console.log(`[PDF Export] Generated PDF: ${pdfBuffer.length} bytes`);

    // 5. Send response
    const filename = sanitizeFilename(report.title);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);

  } catch (error) {
    console.error('[PDF Export] Error:', error);

    if (error.message?.includes('timeout')) {
      return res.status(504).json({
        error: 'PDF generation timed out',
        details: 'The report may be too large. Try exporting a smaller report.'
      });
    }

    return res.status(500).json({
      error: 'PDF generation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
