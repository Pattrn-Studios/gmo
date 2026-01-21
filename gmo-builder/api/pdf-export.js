import { createClient } from '@sanity/client';
import { renderAllCharts } from '../lib/pdf/chart-renderer.js';
import { generatePDF } from '../lib/pdf/pdf-generator.js';
import { getLayoutOptimization, getDefaultLayoutHints } from '../lib/pdf/layout-optimizer.js';

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

/**
 * Parse CSV data into array of objects
 */
function parseCSV(csv) {
  if (!csv) return [];

  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      const val = values[i]?.trim();
      obj[header] = isNaN(val) ? val : parseFloat(val);
    });
    return obj;
  });
}

/**
 * Build Highcharts configuration for a section
 */
function buildChartConfig(section) {
  if (!section.hasChart || !section.chartData) return null;

  const parsedData = parseCSV(section.chartData);
  if (parsedData.length === 0) return null;

  const xAxisKey = Object.keys(parsedData[0])[0];
  const categories = parsedData.map(row => row[xAxisKey]);

  const series = (section.chartSeries || []).map(s => ({
    name: s.label,
    data: parsedData.map(row => row[s.dataColumn]),
    color: s.colour,
  }));

  const chartTypeMap = {
    line: 'line',
    column: 'column',
    bar: 'bar',
    area: 'area',
    stackedColumn: 'column',
    stackedArea: 'area',
  };

  const isStacked = section.chartType?.includes('stacked');

  // Y-axis formatter as string for serialization
  let yAxisFormatter;
  if (section.yAxisFormat === 'percent') {
    yAxisFormatter = 'percent';
  } else if (section.yAxisFormat === 'currency') {
    yAxisFormatter = 'currency';
  } else {
    yAxisFormatter = 'number';
  }

  return {
    chart: {
      type: chartTypeMap[section.chartType] || 'line',
      style: { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
      backgroundColor: 'white',
      height: 400,
    },
    title: { text: null },
    xAxis: {
      categories: categories,
      title: { text: section.xAxisLabel || null },
      labels: { style: { color: GMO_COLORS.textSecondary, fontSize: '11px' } },
    },
    yAxis: {
      title: { text: section.yAxisLabel || null },
      labels: {
        style: { color: GMO_COLORS.textSecondary, fontSize: '11px' },
        format: yAxisFormatter === 'percent' ? '{value}%' :
                yAxisFormatter === 'currency' ? '${value:,.0f}' : '{value:,.0f}'
      },
    },
    legend: {
      align: 'left',
      itemStyle: { color: GMO_COLORS.textPrimary, fontSize: '11px' },
    },
    plotOptions: {
      series: {
        animation: false,
        marker: { enabled: false },
        lineWidth: 3,
      },
      column: { stacking: isStacked ? 'normal' : undefined },
      area: { stacking: isStacked ? 'normal' : undefined, fillOpacity: 0.25 },
    },
    series: series,
    credits: { enabled: false },
  };
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

    console.log(`[PDF Export] Starting export for report: ${reportId}`);

    // 1. Fetch report from Sanity
    const report = await fetchReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log(`[PDF Export] Fetched report: ${report.title}`);

    // 2. Get layout hints (Claude or default)
    let layoutHints = null;
    if (options.optimizeLayout !== false) {
      try {
        layoutHints = await getLayoutOptimization(report);
        console.log('[PDF Export] Got Claude layout hints');
      } catch (error) {
        console.warn('[PDF Export] Claude optimization failed, using defaults:', error.message);
        layoutHints = getDefaultLayoutHints(report);
      }
    } else {
      layoutHints = getDefaultLayoutHints(report);
    }

    // 3. Render charts to PNG
    console.log('[PDF Export] Rendering charts...');
    const chartImages = await renderAllCharts(report.sections, buildChartConfig);
    console.log(`[PDF Export] Rendered ${chartImages.size} charts`);

    // 4. Generate PDF
    console.log('[PDF Export] Generating PDF...');
    const pdfBuffer = await generatePDF(report, chartImages, layoutHints);
    console.log(`[PDF Export] Generated PDF: ${pdfBuffer.length} bytes`);

    const elapsed = Date.now() - startTime;
    console.log(`[PDF Export] Complete in ${elapsed}ms`);

    // 5. Send response
    const filename = sanitizeFilename(report.title);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);

  } catch (error) {
    console.error('[PDF Export] Error:', error);

    // Determine appropriate error response
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
