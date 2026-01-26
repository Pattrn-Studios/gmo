/**
 * PowerPoint Export API Endpoint
 * POST /api/pptx-export
 *
 * Using static imports like pdf-export.js
 */

import { createClient } from '@sanity/client';
import PptxGenJS from 'pptxgenjs';
import { buildChartJsConfig } from '../lib/chart-config.js';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

// ============================================================================
// TEMPLATE CONFIG (embedded for serverless compatibility)
// ============================================================================

const TEMPLATE_CONFIG = {
  colors: {
    primary: '009FB1',
    teal: '51BBB4',
    cyan: '61C3D7',
    orange: 'F49F7B',
    brown: 'A37767',
    white: 'FFFFFF',
    text: '1A1A1A',
    textSecondary: '5F5F5F'
  },
  fonts: {
    title: { face: 'Arial', size: 24, bold: true },
    subtitle: { face: 'Arial', size: 16, bold: false },
    body: { face: 'Arial', size: 12, bold: false },
    source: { face: 'Arial', size: 10, italic: true }
  },
  slideTypes: {
    title: {
      title: { x: 0.5, y: 3.0, w: 7.6, h: 1.5, fontSize: 48, bold: true },
      subtitle: { x: 0.5, y: 4.67, w: 4.0, h: 0.4, fontSize: 16 }
    },
    tableOfContents: {
      title: { x: 0.5, y: 0.29, w: 12.3, h: 0.39, fontSize: 24, bold: true },
      cards: {
        startX: 0.5, startY: 1.7, cardWidth: 2.25, cardHeight: 5.0,
        spacing: 0.26, numberY: 2.02, numberSize: 32, blurbY: 2.95,
        colors: ['009FB1', '51BBB4', '61C3D7', 'F49F7B', 'A37767']
      }
    },
    sectionDivider: {
      sectionName: { x: 0.46, y: 2.7, w: 6.2, h: 0.65, fontSize: 48, bold: true },
      image: { x: 7.24, y: 0.88, w: 5.74, h: 5.74 }
    },
    chartSection: {
      sectionNumber: { x: 0.5, y: 0.36, w: 0.72, h: 0.72 },
      numberText: { x: 0.5, y: 0.42, w: 0.72, h: 0.64, fontSize: 32 },
      title: { x: 1.21, y: 0.43, w: 11.86, h: 0.36, fontSize: 24, bold: true },
      subtitle: { x: 1.24, y: 0.85, w: 11.86, h: 0.24, fontSize: 16 },
      source: { x: 0.5, y: 6.14, w: 12.47, h: 0.29, fontSize: 10 },
      leftPanel: { content: { x: 0.5, y: 3.48, w: 2.5, h: 2.69, fontSize: 10 } },
      chartTitle: { x: 3.35, y: 1.57, w: 4.44, h: 0.2, fontSize: 12, bold: true },
      chart: { x: 3.33, y: 1.93, w: 7.61, h: 3.94 }
    },
    insightsSection: {
      title: { x: 0.5, y: 0.29, w: 12.33, h: 0.39, fontSize: 24, bold: true },
      subtitle: { x: 0.5, y: 0.81, w: 5.77, h: 0.23, fontSize: 16 },
      source: { x: 0.5, y: 6.27, w: 9.04, h: 0.33, fontSize: 10 },
      chartTitle: { x: 0.5, y: 1.46, w: 2.48, h: 0.2, fontSize: 12, bold: true },
      chart: { x: 0.47, y: 1.85, w: 8.66, h: 4.33 },
      insightsPanel: { x: 9.79, y: 0, w: 3.54, h: 7.5, dividerX: 9.53, dividerW: 0.26 },
      insightsTitle: { x: 10.28, y: 1.46, w: 1.14, h: 0.2, fontSize: 12, bold: true },
      insightsList: { x: 10.28, y: 1.78, w: 3.28, h: 3.28 }
    },
    timelineSection: {
      title: { x: 0.5, y: 0.29, w: 12.33, h: 0.39, fontSize: 24, bold: true },
      subtitle: { x: 0.5, y: 0.81, w: 5.77, h: 0.23, fontSize: 16 }
    }
  }
};

// ============================================================================
// COLOR UTILITIES
// ============================================================================

function normalizeColor(color, defaultColor = '009FB1') {
  if (!color) return defaultColor;
  const hexMatch = color.match(/^#?([0-9A-Fa-f]{6})$/);
  if (hexMatch) return hexMatch[1].toUpperCase();
  const shortHexMatch = color.match(/^#?([0-9A-Fa-f]{3})$/);
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('');
    return `${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return defaultColor;
}

function getThemeColor(themeName, config) {
  const themeMap = {
    blue: config.colors.primary,
    green: config.colors.teal,
    teal: config.colors.cyan,
    orange: config.colors.orange,
    brown: config.colors.brown,
    none: config.colors.white
  };
  return themeMap[themeName] || config.colors.primary;
}

function isDarkBackground(hexColor) {
  if (!hexColor || hexColor.length < 6) return true;
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// ============================================================================
// CHART IMAGE RENDERING (via QuickChart.io)
// ============================================================================

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

async function renderChartToPNG(section, options = {}) {
  const { width = 800, height = 500, darkMode = false } = options;

  const chartJsConfig = buildChartJsConfig(section, {
    forPdf: true,
    animation: false,
    darkMode: darkMode
  });
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
        width: width,
        height: height,
        backgroundColor: 'transparent',
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
    return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
  } catch (error) {
    console.error('[PPTX Export] QuickChart rendering failed:', error.message);
    return null;
  }
}

// ============================================================================
// PORTABLE TEXT CONVERSION
// ============================================================================

function portableTextToLines(blocks) {
  if (!blocks || !Array.isArray(blocks)) return [];
  return blocks
    .filter(block => block._type === 'block')
    .map(block => block.children?.map(c => c.text).join('') || '')
    .filter(Boolean);
}

// ============================================================================
// SLIDE GENERATORS
// ============================================================================

function generateTitleSlide(slide, section, options) {
  const { config } = options;
  const colors = config.colors;
  const fonts = config.fonts;

  slide.bkgd = colors.primary;

  if (section.heading) {
    slide.addText(section.heading, {
      x: 0.5, y: 3.0, w: 7.6, h: 1.5,
      fontSize: 48, bold: true,
      fontFace: fonts.title.face,
      color: colors.white
    });
  }

  if (section.subheading) {
    slide.addText(section.subheading, {
      x: 0.5, y: 4.67, w: 4.0, h: 0.4,
      fontSize: 16,
      fontFace: fonts.subtitle.face,
      color: colors.white
    });
  }
}

function generateTOCSlide(slide, section, options) {
  const { config } = options;
  const colors = config.colors;
  const fonts = config.fonts;
  const layout = config.slideTypes.tableOfContents;

  slide.bkgd = colors.white;

  slide.addText(section.title || 'In This Report', {
    x: layout.title.x, y: layout.title.y, w: layout.title.w, h: layout.title.h,
    fontSize: layout.title.fontSize,
    bold: true,
    fontFace: fonts.title.face,
    color: colors.text
  });

  const cards = section.cardImages || [];
  const cardLayout = layout.cards;
  cards.forEach((card, index) => {
    if (index >= 5) return;
    const x = cardLayout.startX + index * (cardLayout.cardWidth + cardLayout.spacing);
    const cardColor = cardLayout.colors[index % cardLayout.colors.length];

    slide.addShape('rect', {
      x: x, y: cardLayout.startY, w: cardLayout.cardWidth, h: cardLayout.cardHeight,
      fill: { color: cardColor }
    });

    slide.addText(String(index + 1).padStart(2, '0'), {
      x: x, y: cardLayout.numberY, w: cardLayout.cardWidth, h: 0.5,
      fontSize: cardLayout.numberSize, bold: true,
      fontFace: fonts.title.face, color: colors.white, align: 'center'
    });

    if (card.title) {
      slide.addText(card.title, {
        x: x + 0.1, y: cardLayout.blurbY, w: cardLayout.cardWidth - 0.2, h: 1.5,
        fontSize: 11, fontFace: fonts.body.face, color: colors.white, valign: 'top'
      });
    }
  });
}

function generateDividerSlide(slide, section, options) {
  const { config } = options;
  const colors = config.colors;
  const fonts = config.fonts;

  const bgColor = normalizeColor(section.backgroundColor, colors.cyan);
  slide.bkgd = bgColor;

  slide.addText(section.title || '', {
    x: 0.46, y: 2.7, w: 6.2, h: 0.65,
    fontSize: 48, bold: true,
    fontFace: fonts.title.face,
    color: colors.white
  });
}

async function generateChartSlide(slide, section, options) {
  const { config, sectionNumber } = options;
  const colors = config.colors;
  const fonts = config.fonts;
  const layout = config.slideTypes.chartSection;

  const bgColor = section.sectionTheme
    ? getThemeColor(section.sectionTheme, config)
    : normalizeColor(section.backgroundColor, colors.primary);
  slide.bkgd = bgColor;

  // Section number badge
  slide.addShape('ellipse', {
    x: layout.sectionNumber.x, y: layout.sectionNumber.y,
    w: layout.sectionNumber.w, h: layout.sectionNumber.h,
    fill: { color: colors.white }
  });

  slide.addText(String(sectionNumber || 1).padStart(2, '0'), {
    x: layout.numberText.x, y: layout.numberText.y,
    w: layout.numberText.w, h: layout.numberText.h,
    fontSize: layout.numberText.fontSize, bold: true,
    fontFace: fonts.title.face, color: bgColor, align: 'center', valign: 'middle'
  });

  // Title
  slide.addText(section.title || '', {
    x: layout.title.x, y: layout.title.y, w: layout.title.w, h: layout.title.h,
    fontSize: layout.title.fontSize, bold: true,
    fontFace: fonts.title.face, color: colors.white
  });

  // Subtitle
  if (section.subtitle) {
    slide.addText(section.subtitle, {
      x: layout.subtitle.x, y: layout.subtitle.y, w: layout.subtitle.w, h: layout.subtitle.h,
      fontSize: layout.subtitle.fontSize,
      fontFace: fonts.subtitle.face, color: colors.white
    });
  }

  // Body content
  const bodyLines = portableTextToLines(section.content);
  if (bodyLines.length > 0) {
    slide.addText(bodyLines.map(line => ({ text: line, options: { bullet: true } })), {
      x: layout.leftPanel.content.x, y: layout.leftPanel.content.y,
      w: layout.leftPanel.content.w, h: layout.leftPanel.content.h,
      fontSize: layout.leftPanel.content.fontSize,
      fontFace: fonts.body.face, color: colors.white, valign: 'top'
    });
  }

  // Chart
  if (section.hasChart && section.chartConfig?.chartData) {
    const chartTitle = section.chartConfig?.chartTitle || 'Chart';
    slide.addText(chartTitle, {
      x: layout.chartTitle.x, y: layout.chartTitle.y, w: layout.chartTitle.w, h: layout.chartTitle.h,
      fontSize: layout.chartTitle.fontSize, bold: true,
      fontFace: fonts.body.face, color: colors.white
    });

    const chartSection = {
      hasChart: true,
      chartData: section.chartConfig?.chartData,
      chartSeries: section.chartConfig?.chartSeries,
      chartType: section.chartConfig?.chartType || 'line',
      xAxisLabel: section.chartConfig?.xAxisLabel,
      yAxisLabel: section.chartConfig?.yAxisLabel,
      yAxisFormat: section.chartConfig?.yAxisFormat
    };

    const chartPos = layout.chart;
    const darkMode = isDarkBackground(bgColor);

    try {
      const imageData = await renderChartToPNG(chartSection, {
        width: Math.round(chartPos.w * 96),
        height: Math.round(chartPos.h * 96),
        darkMode: darkMode
      });

      if (imageData) {
        slide.addImage({
          data: imageData,
          x: chartPos.x, y: chartPos.y, w: chartPos.w, h: chartPos.h
        });
      }
    } catch (error) {
      console.error('[PPTX] Chart render failed:', error.message);
    }
  }

  // Source
  if (section.chartSource || section.chartConfig?.chartSource) {
    const sourceText = `Source: ${section.chartSource || section.chartConfig?.chartSource}`;
    slide.addText(sourceText, {
      x: layout.source.x, y: layout.source.y, w: layout.source.w, h: layout.source.h,
      fontSize: layout.source.fontSize, italic: true,
      fontFace: fonts.source.face, color: colors.white
    });
  }
}

async function generateInsightsSlide(slide, section, options) {
  const { config } = options;
  const colors = config.colors;
  const fonts = config.fonts;
  const layout = config.slideTypes.insightsSection;

  slide.bkgd = colors.white;

  // Title
  slide.addText(section.title || '', {
    x: layout.title.x, y: layout.title.y, w: layout.title.w, h: layout.title.h,
    fontSize: layout.title.fontSize, bold: true,
    fontFace: fonts.title.face, color: colors.text
  });

  // Subtitle
  if (section.subtitle) {
    slide.addText(section.subtitle, {
      x: layout.subtitle.x, y: layout.subtitle.y, w: layout.subtitle.w, h: layout.subtitle.h,
      fontSize: layout.subtitle.fontSize,
      fontFace: fonts.subtitle.face, color: colors.textSecondary
    });
  }

  // Insights panel
  const insightsPanel = layout.insightsPanel;
  const insightsColor = normalizeColor(section.insightsColor, colors.primary);

  slide.addShape('rect', {
    x: insightsPanel.x, y: insightsPanel.y, w: insightsPanel.w, h: insightsPanel.h,
    fill: { color: insightsColor }
  });

  if (insightsPanel.dividerX) {
    slide.addShape('rect', {
      x: insightsPanel.dividerX, y: 0, w: insightsPanel.dividerW || 0.26, h: 7.5,
      fill: { color: colors.white }
    });
  }

  // Key insights title
  slide.addText('Key insights', {
    x: layout.insightsTitle.x, y: layout.insightsTitle.y,
    w: layout.insightsTitle.w + 1.5, h: layout.insightsTitle.h,
    fontSize: layout.insightsTitle.fontSize, bold: true,
    fontFace: fonts.body.face, color: colors.white
  });

  // Insights list
  const insights = section.insights || [];
  if (insights.length > 0) {
    const insightItems = insights.map(insight => ({
      text: typeof insight === 'string' ? insight : insight.text || '',
      options: { bullet: { code: '2022' } }
    }));

    slide.addText(insightItems, {
      x: layout.insightsList.x, y: layout.insightsList.y,
      w: layout.insightsList.w - 0.3, h: layout.insightsList.h,
      fontSize: 11, fontFace: fonts.body.face, color: colors.white,
      valign: 'top', paraSpaceAfter: 8
    });
  }

  // Chart
  if (section.chartConfig?.chartData) {
    const chartTitle = section.chartConfig?.chartTitle || 'Chart';
    slide.addText(chartTitle, {
      x: layout.chartTitle.x, y: layout.chartTitle.y, w: layout.chartTitle.w, h: layout.chartTitle.h,
      fontSize: layout.chartTitle.fontSize, bold: true,
      fontFace: fonts.body.face, color: colors.text
    });

    const chartSection = {
      hasChart: true,
      chartData: section.chartConfig.chartData,
      chartSeries: section.chartConfig.chartSeries,
      chartType: section.chartConfig.chartType || 'line',
      xAxisLabel: section.chartConfig.xAxisLabel,
      yAxisLabel: section.chartConfig.yAxisLabel,
      yAxisFormat: section.chartConfig.yAxisFormat
    };

    const chartPos = layout.chart;

    try {
      const imageData = await renderChartToPNG(chartSection, {
        width: Math.round(chartPos.w * 96),
        height: Math.round(chartPos.h * 96),
        darkMode: false
      });

      if (imageData) {
        slide.addImage({
          data: imageData,
          x: chartPos.x, y: chartPos.y, w: chartPos.w, h: chartPos.h
        });
      }
    } catch (error) {
      console.error('[PPTX] Chart render failed:', error.message);
    }
  }

  // Source
  if (section.chartSource || section.chartConfig?.chartSource) {
    const sourceText = `Source: ${section.chartSource || section.chartConfig?.chartSource}`;
    slide.addText(sourceText, {
      x: layout.source.x, y: layout.source.y, w: layout.source.w, h: layout.source.h,
      fontSize: layout.source.fontSize, italic: true,
      fontFace: fonts.source.face, color: colors.textSecondary
    });
  }
}

function generateTimelineSlide(slide, section, options) {
  const { config } = options;
  const colors = config.colors;
  const fonts = config.fonts;
  const layout = config.slideTypes.timelineSection;

  slide.bkgd = colors.white;

  slide.addText(section.title || '', {
    x: layout.title.x, y: layout.title.y, w: layout.title.w, h: layout.title.h,
    fontSize: layout.title.fontSize, bold: true,
    fontFace: fonts.title.face, color: colors.text
  });

  if (section.subtitle) {
    slide.addText(section.subtitle, {
      x: layout.subtitle.x, y: layout.subtitle.y, w: layout.subtitle.w, h: layout.subtitle.h,
      fontSize: layout.subtitle.fontSize,
      fontFace: fonts.subtitle.face, color: colors.textSecondary
    });
  }

  const items = section.items || [];
  const itemColors = ['009FB1', '51BBB4', '61C3D7'];

  items.forEach((item, index) => {
    if (index >= 3) return;
    const x = 0.5 + index * 4.2;
    const color = itemColors[index % itemColors.length];

    slide.addShape('ellipse', {
      x: x, y: 2.26, w: 0.94, h: 0.94,
      fill: { color: color }
    });

    slide.addText(item.number || String(index + 1), {
      x: x, y: 2.26, w: 0.94, h: 0.94,
      fontSize: 32, bold: true,
      fontFace: fonts.title.face, color: colors.white,
      align: 'center', valign: 'middle'
    });

    if (item.header) {
      slide.addText(item.header, {
        x: x - 0.1, y: 3.34, w: 3.4, h: 0.4,
        fontSize: 14, bold: true,
        fontFace: fonts.title.face, color: colors.text
      });
    }

    if (item.body) {
      slide.addText(item.body, {
        x: x - 0.1, y: 3.8, w: 3.4, h: 1.2,
        fontSize: 11,
        fontFace: fonts.body.face, color: colors.textSecondary, valign: 'top'
      });
    }
  });
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

const SECTION_TYPE_MAP = {
  titleSection: { generator: generateTitleSlide, isAsync: false },
  navigationSection: { generator: generateTOCSlide, isAsync: false },
  headerSection: { generator: generateDividerSlide, isAsync: false },
  contentSection: { generator: generateChartSlide, isAsync: true },
  chartInsightsSection: { generator: generateInsightsSlide, isAsync: true },
  timelineSection: { generator: generateTimelineSlide, isAsync: false }
};

async function exportToPowerPoint(report) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = report.title || 'GMO Report';
  pptx.author = report.author || 'BNP Paribas Asset Management';
  pptx.company = 'BNP Paribas Asset Management';
  pptx.subject = 'Global Market Outlook';

  let sectionNumber = 0;
  const sections = report.sections || [];

  for (const section of sections) {
    const sectionType = section._type;
    const mapping = SECTION_TYPE_MAP[sectionType];

    if (!mapping) {
      console.warn(`[PPTX] Unknown section type: ${sectionType}, skipping`);
      continue;
    }

    if (sectionType === 'contentSection' || sectionType === 'chartInsightsSection') {
      sectionNumber++;
    }

    const slide = pptx.addSlide();

    try {
      if (mapping.isAsync) {
        await mapping.generator(slide, section, {
          layout: TEMPLATE_CONFIG.slideTypes[sectionType] || {},
          config: TEMPLATE_CONFIG,
          sectionNumber,
          pptx
        });
      } else {
        mapping.generator(slide, section, {
          layout: TEMPLATE_CONFIG.slideTypes[sectionType] || {},
          config: TEMPLATE_CONFIG,
          sectionNumber,
          pptx
        });
      }
    } catch (error) {
      console.error(`[PPTX] Error generating ${sectionType} slide:`, error.message);
    }
  }

  return await pptx.write({ outputType: 'nodebuffer' });
}

// ============================================================================
// SANITY QUERY
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
        sectionTheme,
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

function sanitizeFilename(name) {
  return (name || 'report')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

// ============================================================================
// API HANDLER
// ============================================================================

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required in request body' });
    }

    console.log(`[PPTX Export] Starting export for report: ${reportId}`);

    const report = await fetchReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: `Report not found: ${reportId}` });
    }

    console.log(`[PPTX Export] Fetched report: "${report.title}" with ${report.sections?.length || 0} sections`);

    const pptxBuffer = await exportToPowerPoint(report);

    console.log(`[PPTX Export] Generated PowerPoint: ${pptxBuffer.length} bytes`);

    const filename = sanitizeFilename(report.title);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pptx"`);
    res.setHeader('Content-Length', pptxBuffer.length);

    return res.send(pptxBuffer);

  } catch (error) {
    console.error('[PPTX Export] Error:', error);

    if (error.message?.includes('timeout')) {
      return res.status(504).json({
        error: 'PowerPoint generation timed out',
        details: 'The report may be too large. Try exporting a smaller report.'
      });
    }

    return res.status(500).json({
      error: 'PowerPoint generation failed',
      details: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
  }
}
