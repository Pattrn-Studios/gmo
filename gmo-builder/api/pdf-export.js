import { createClient } from '@sanity/client';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { buildChartJsConfig, parseCSV } from '../lib/chart-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Font paths - relative to API directory
const FONTS_DIR = path.join(__dirname, '..', 'lib', 'pdf', 'fonts');
const FONTS = {
  light: path.join(FONTS_DIR, 'bnpp-sans-light.ttf'),
  condensedBold: path.join(FONTS_DIR, 'bnpp-sans-cond-bold-v2.ttf'),
};

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

const GMO_COLORS = {
  primaryGreen: '#3E7274',
  coastBlue: '#3D748F',
  copper: '#AC5359',
  orange: '#F1875A',
  lightGreen: '#76BCA3',
  darkBlue: '#132728',
  textPrimary: '#1A1A1A',
  textSecondary: '#5F5F5F',
};

// PDF dimensions
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

/**
 * Fetch a specific report by ID from Sanity
 */
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
        backgroundColor
      },

      _type == "navigationSection" => {
        title,
        showPageNumbers,
        layout
      },

      _type == "contentSection" => {
        title,
        subtitle,
        content,
        hasChart,
        "chartType": chartConfig.chartType,
        "chartData": chartConfig.chartData,
        "chartSeries": chartConfig.chartSeries[] { label, dataColumn, colour },
        "xAxisLabel": chartConfig.xAxisLabel,
        "yAxisLabel": chartConfig.yAxisLabel,
        "yAxisFormat": chartConfig.yAxisFormat,
        chartSource,
        layout
      }
    }
  }`;

  return await client.fetch(query, { reportId });
}

// parseCSV and buildChartJsConfig are imported from ../lib/chart-config.js

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

  return { labels: sampledLabels, datasets: sampledDatasets };
}

/**
 * Render a chart to PNG using QuickChart.io API
 * Uses the shared Chart.js configuration builder
 */
async function renderChartToPNG(section, options = {}) {
  const { width = 700, height = 400 } = options;

  // Build Chart.js configuration using shared builder (with PDF-specific options)
  const chartJsConfig = buildChartJsConfig(section, { forPdf: true, animation: false });
  if (!chartJsConfig) return null;

  // Downsample if too many data points (QuickChart free tier limit)
  if (chartJsConfig.data?.labels && chartJsConfig.data?.datasets) {
    const downsampled = downsampleChartData(chartJsConfig.data.labels, chartJsConfig.data.datasets);
    chartJsConfig.data.labels = downsampled.labels;
    chartJsConfig.data.datasets = downsampled.datasets;
  }

  // Disable animation for PDF rendering
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
        width: width,
        height: height,
        backgroundColor: 'white',
        format: 'png',
        devicePixelRatio: 2, // Higher resolution
      }),
    });

    // Check Content-Type instead of status code - QuickChart sometimes returns 400 but still includes valid PNG
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('image/png')) {
      const errorText = await response.text();
      throw new Error(`QuickChart API error: ${response.status} - ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('[PDF Export] QuickChart rendering failed:', error);
    throw error;
  }
}

/**
 * Render all charts from report sections
 */
async function renderAllCharts(sections) {
  const chartImages = new Map();

  const chartsToRender = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.hasChart && section.chartData);

  if (chartsToRender.length === 0) {
    return chartImages;
  }

  for (const { section, index } of chartsToRender) {
    try {
      const png = await renderChartToPNG(section);
      if (png) {
        chartImages.set(index, png);
      }
    } catch (error) {
      console.error(`Failed to render chart for section ${index}:`, error);
    }
  }

  return chartImages;
}

/**
 * Convert portable text to plain text
 */
function portableTextToPlain(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';

  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      const text = block.children
        ?.map(child => child.text || '')
        .join('') || '';
      return text;
    })
    .join('\n\n');
}

/**
 * Get default layout hints
 */
function getDefaultLayoutHints(report) {
  const sections = (report.sections || [])
    .filter(s => s._type === 'contentSection')
    .map((section, index) => {
      const hasChart = Boolean(section.hasChart && section.chartData);
      const seriesCount = section.chartSeries?.length || 0;

      let chartPosition = section.layout || 'chartRight';
      let chartSize = 'medium';

      if (hasChart) {
        if (seriesCount > 3 || section.chartType?.includes('stacked')) {
          chartSize = 'large';
        } else if (seriesCount <= 1) {
          chartSize = 'small';
        }

        if (chartPosition !== 'chartFull' && index % 2 === 1) {
          chartPosition = chartPosition === 'chartRight' ? 'chartLeft' : 'chartRight';
        }
      }

      return {
        title: section.title,
        chartPosition,
        chartSize,
        notes: 'Default layout'
      };
    });

  return { sections, generalNotes: 'Using default layout rules' };
}

/**
 * Generate the cover page
 */
function generateCoverPage(doc, report) {
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    .fill(GMO_COLORS.primaryGreen);

  const titleMaxWidth = CONTENT_WIDTH * 0.6;
  doc.fillColor('white')
    .fontSize(42)
    .font('BNPPSans-CondensedBold')
    .text(report.title || 'GMO Report', MARGIN, PAGE_HEIGHT / 3, {
      width: titleMaxWidth,
      align: 'left'
    });

  const titleHeight = doc.heightOfString(report.title || 'GMO Report', {
    width: titleMaxWidth,
    fontSize: 42
  });
  const summaryY = PAGE_HEIGHT / 3 + titleHeight + 30;

  if (report.summary) {
    doc.fontSize(16)
      .font('BNPPSans-Light')
      .text(report.summary, MARGIN, summaryY, {
        width: titleMaxWidth,
        align: 'left'
      });
  }

  const publicationDate = report.publicationDate
    ? new Date(report.publicationDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : '';

  doc.fontSize(12)
    .font('BNPPSans-Light')
    .text(`${publicationDate}`, MARGIN, PAGE_HEIGHT - MARGIN - 60);

  if (report.author) {
    doc.text(report.author, MARGIN, PAGE_HEIGHT - MARGIN - 40);
  }

  doc.fontSize(10)
    .fillColor('rgba(255,255,255,0.7)')
    .text('AXA Investment Managers', MARGIN, PAGE_HEIGHT - MARGIN - 15);
}

/**
 * Generate table of contents page
 */
function generateTableOfContents(doc, report) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  doc.fillColor(GMO_COLORS.primaryGreen)
    .fontSize(28)
    .font('BNPPSans-CondensedBold')
    .text('In This Report', MARGIN, MARGIN);

  doc.moveTo(MARGIN, MARGIN + 40)
    .lineTo(MARGIN + 150, MARGIN + 40)
    .strokeColor(GMO_COLORS.primaryGreen)
    .lineWidth(3)
    .stroke();

  const contentSections = (report.sections || [])
    .filter(s => s._type === 'contentSection');

  let yPos = MARGIN + 80;
  const lineHeight = 35;

  contentSections.forEach((section, index) => {
    if (yPos > PAGE_HEIGHT - MARGIN - 50) return;

    // Render number and title separately at same Y position
    doc.fillColor(GMO_COLORS.primaryGreen)
      .fontSize(14)
      .font('BNPPSans-CondensedBold')
      .text(`${index + 1}.`, MARGIN, yPos);

    doc.fillColor(GMO_COLORS.textPrimary)
      .font('BNPPSans-CondensedBold')
      .text(section.title || 'Untitled', MARGIN + 25, yPos, {
        width: CONTENT_WIDTH - 25
      });

    if (section.subtitle) {
      doc.fillColor(GMO_COLORS.textSecondary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(section.subtitle, MARGIN + 25, yPos + 18, {
          width: CONTENT_WIDTH - 25
        });
      yPos += lineHeight + 15;
    } else {
      yPos += lineHeight;
    }
  });
}

/**
 * Generate a content section page
 */
function generateContentSection(doc, section, index, chartImage, layoutHints) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  const hints = layoutHints?.sections?.[index] || {};
  const hasChart = section.hasChart && chartImage;
  const chartPosition = hints.chartPosition || section.layout || 'chartRight';

  doc.fillColor(GMO_COLORS.textPrimary)
    .fontSize(24)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', MARGIN, MARGIN);

  doc.moveTo(MARGIN, MARGIN + 32)
    .lineTo(MARGIN + 60, MARGIN + 32)
    .strokeColor(GMO_COLORS.primaryGreen)
    .lineWidth(3)
    .stroke();

  let contentStartY = MARGIN + 50;
  if (section.subtitle) {
    doc.fillColor(GMO_COLORS.textSecondary)
      .fontSize(14)
      .font('BNPPSans-Light')
      .text(section.subtitle, MARGIN, contentStartY, { width: CONTENT_WIDTH });
    contentStartY += 30;
  }

  const chartWidth = 380;
  const chartHeight = 280;
  const textWidth = hasChart ? CONTENT_WIDTH - chartWidth - 40 : CONTENT_WIDTH;
  const plainContent = portableTextToPlain(section.content);

  if (hasChart) {
    if (chartPosition === 'chartLeft') {
      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, MARGIN, contentStartY + 20, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });

      if (section.chartSource) {
        doc.fillColor(GMO_COLORS.textSecondary)
          .fontSize(9)
          .font('BNPPSans-Light')
          .text(`Source: ${section.chartSource}`, MARGIN, contentStartY + chartHeight + 30, {
            width: chartWidth
          });
      }

      doc.fillColor(GMO_COLORS.textPrimary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN + chartWidth + 40, contentStartY + 20, {
          width: textWidth,
          lineGap: 4
        });
    } else if (chartPosition === 'chartFull') {
      doc.fillColor(GMO_COLORS.textPrimary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN, contentStartY + 20, {
          width: CONTENT_WIDTH,
          lineGap: 4
        });

      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, MARGIN + (CONTENT_WIDTH - chartWidth) / 2, contentStartY + 150, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });
    } else {
      doc.fillColor(GMO_COLORS.textPrimary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN, contentStartY + 20, {
          width: textWidth,
          lineGap: 4
        });

      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, MARGIN + textWidth + 40, contentStartY + 20, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });

      if (section.chartSource) {
        doc.fillColor(GMO_COLORS.textSecondary)
          .fontSize(9)
          .font('BNPPSans-Light')
          .text(`Source: ${section.chartSource}`, MARGIN + textWidth + 40, contentStartY + chartHeight + 30, {
            width: chartWidth
          });
      }
    }
  } else {
    doc.fillColor(GMO_COLORS.textPrimary)
      .fontSize(11)
      .font('BNPPSans-Light')
      .text(plainContent, MARGIN, contentStartY + 20, {
        width: CONTENT_WIDTH,
        lineGap: 4,
        columns: 2,
        columnGap: 40
      });
  }
}

/**
 * Generate the complete PDF
 */
async function generatePDF(report, chartImages, layoutHints = null) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: MARGIN,
        info: {
          Title: report.title || 'GMO Report',
          Author: report.author || 'AXA Investment Managers',
          Creator: 'GMO Report Builder'
        }
      });

      // Register custom fonts
      if (fs.existsSync(FONTS.light) && fs.existsSync(FONTS.condensedBold)) {
        doc.registerFont('BNPPSans-Light', FONTS.light);
        doc.registerFont('BNPPSans-CondensedBold', FONTS.condensedBold);
      } else {
        // Fallback to Helvetica if fonts not found
        console.warn('[PDF Export] Custom fonts not found, using Helvetica');
        doc.registerFont('BNPPSans-Light', 'Helvetica');
        doc.registerFont('BNPPSans-CondensedBold', 'Helvetica-Bold');
      }

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      generateCoverPage(doc, report);
      generateTableOfContents(doc, report);

      const contentSections = (report.sections || [])
        .map((section, originalIndex) => ({ section, originalIndex }))
        .filter(({ section }) => section._type === 'contentSection');

      contentSections.forEach(({ section, originalIndex }, displayIndex) => {
        const chartImage = chartImages.get(originalIndex);
        generateContentSection(doc, section, displayIndex, chartImage, layoutHints);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(name) {
  return (name || 'report')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

/**
 * Main PDF export handler
 */
export default async function handler(req, res) {
  // Handle CORS for Sanity Studio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const { reportId, options = {} } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required' });
    }

    // 1. Fetch report from Sanity
    const report = await fetchReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // 2. Get layout hints (default for now, skip Claude to simplify)
    const layoutHints = getDefaultLayoutHints(report);

    // 3. Render charts to PNG
    const chartImages = await renderAllCharts(report.sections);

    // 4. Generate PDF
    const pdfBuffer = await generatePDF(report, chartImages, layoutHints);

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
