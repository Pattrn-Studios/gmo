/**
 * Slide Preview Generator
 *
 * Generates PNG preview images of PowerPoint slides for AI review.
 * Renders slides using canvas to match the PPTX layout specifications.
 */

import {
  createSlideCanvas,
  canvasToBase64,
  inchesToPixels,
  normalizeColor,
  getThemeColor,
  isDarkBackground,
  drawRoundedRect,
  drawEllipse,
  drawWrappedText,
  drawBulletPoints,
  setFont,
  loadImageSafe,
  portableTextToLines,
  TEMPLATE_CONFIG,
  SLIDE_WIDTH,
  SLIDE_HEIGHT
} from './canvas-renderer.js';
import { buildChartJsConfig } from '../chart-config.js';

// ============================================================================
// CHART IMAGE RENDERING (via QuickChart.io - shared with pptx-export.js)
// ============================================================================

async function renderChartToPNG(section, options = {}) {
  const { width = 800, height = 500, darkMode = false } = options;

  const chartJsConfig = buildChartJsConfig(section, {
    forPdf: true,
    animation: false,
    darkMode: darkMode
  });

  if (!chartJsConfig) return null;

  // Disable animations for static rendering
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
      throw new Error(`QuickChart error: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('[Preview] Chart rendering failed:', error.message);
    return null;
  }
}

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

/**
 * Render Title Slide
 */
async function renderTitleSlide(ctx, section) {
  const layout = TEMPLATE_CONFIG.slideTypes.title;
  const colors = TEMPLATE_CONFIG.colors;

  // Background
  ctx.fillStyle = normalizeColor(section.backgroundColor, colors.primary);
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Title
  if (section.heading) {
    ctx.fillStyle = colors.white;
    setFont(ctx, layout.title.fontSize, 'bold');
    drawWrappedText(
      ctx,
      section.heading,
      inchesToPixels(layout.title.x),
      inchesToPixels(layout.title.y) + layout.title.fontSize,
      inchesToPixels(layout.title.w),
      layout.title.fontSize * 1.2
    );
  }

  // Subtitle
  if (section.subheading) {
    ctx.fillStyle = colors.white;
    setFont(ctx, layout.subtitle.fontSize);
    drawWrappedText(
      ctx,
      section.subheading,
      inchesToPixels(layout.subtitle.x),
      inchesToPixels(layout.subtitle.y) + layout.subtitle.fontSize,
      inchesToPixels(layout.subtitle.w),
      layout.subtitle.fontSize * 1.3
    );
  }
}

/**
 * Render Table of Contents Slide
 */
async function renderTOCSlide(ctx, section) {
  const layout = TEMPLATE_CONFIG.slideTypes.tableOfContents;
  const colors = TEMPLATE_CONFIG.colors;

  // White background
  ctx.fillStyle = colors.white;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Title
  ctx.fillStyle = colors.text;
  setFont(ctx, layout.title.fontSize, 'bold');
  ctx.fillText(
    section.title || 'In This Report',
    inchesToPixels(layout.title.x),
    inchesToPixels(layout.title.y) + layout.title.fontSize
  );

  // Cards
  const cards = section.cardImages || [];
  const cardLayout = layout.cards;

  for (let i = 0; i < Math.min(cards.length, 5); i++) {
    const card = cards[i];
    const x = inchesToPixels(cardLayout.startX + i * (cardLayout.cardWidth + cardLayout.spacing));
    const y = inchesToPixels(cardLayout.startY);
    const w = inchesToPixels(cardLayout.cardWidth);
    const h = inchesToPixels(cardLayout.cardHeight);
    const cardColor = cardLayout.colors[i % cardLayout.colors.length];

    // Card background
    ctx.fillStyle = cardColor;
    ctx.fillRect(x, y, w, h);

    // Card number
    ctx.fillStyle = colors.white;
    setFont(ctx, cardLayout.numberSize, 'bold');
    ctx.textAlign = 'center';
    ctx.fillText(
      String(i + 1).padStart(2, '0'),
      x + w / 2,
      inchesToPixels(cardLayout.numberY) + cardLayout.numberSize
    );
    ctx.textAlign = 'left';

    // Card title/description
    if (card.title) {
      setFont(ctx, 11);
      drawWrappedText(
        ctx,
        card.title,
        x + 10,
        inchesToPixels(cardLayout.blurbY) + 11,
        w - 20,
        14,
        { maxLines: 5 }
      );
    }
  }
}

/**
 * Render Section Divider Slide
 */
async function renderDividerSlide(ctx, section) {
  const layout = TEMPLATE_CONFIG.slideTypes.sectionDivider;
  const colors = TEMPLATE_CONFIG.colors;

  // Background
  const bgColor = normalizeColor(section.backgroundColor, colors.cyan);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Section name
  ctx.fillStyle = colors.white;
  setFont(ctx, layout.sectionName.fontSize, 'bold');
  drawWrappedText(
    ctx,
    section.title || '',
    inchesToPixels(layout.sectionName.x),
    inchesToPixels(layout.sectionName.y) + layout.sectionName.fontSize,
    inchesToPixels(layout.sectionName.w),
    layout.sectionName.fontSize * 1.1
  );

  // Image placeholder (right side)
  if (section.image?.asset?.url) {
    const img = await loadImageSafe(section.image.asset.url);
    if (img) {
      ctx.drawImage(
        img,
        inchesToPixels(layout.image.x),
        inchesToPixels(layout.image.y),
        inchesToPixels(layout.image.w),
        inchesToPixels(layout.image.h)
      );
    }
  }
}

/**
 * Render Chart Section Slide
 */
async function renderChartSlide(ctx, section, sectionNumber = 1) {
  const layout = TEMPLATE_CONFIG.slideTypes.chartSection;
  const colors = TEMPLATE_CONFIG.colors;

  // Background color
  const bgColor = section.sectionTheme
    ? getThemeColor(section.sectionTheme)
    : normalizeColor(section.backgroundColor, colors.primary);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  const textColor = isDarkBackground(bgColor) ? colors.white : colors.text;

  // Section number badge (white circle)
  ctx.fillStyle = colors.white;
  drawEllipse(
    ctx,
    inchesToPixels(layout.sectionNumber.x),
    inchesToPixels(layout.sectionNumber.y),
    inchesToPixels(layout.sectionNumber.w),
    inchesToPixels(layout.sectionNumber.h)
  );

  // Section number text
  ctx.fillStyle = bgColor;
  setFont(ctx, layout.numberText.fontSize, 'bold');
  ctx.textAlign = 'center';
  ctx.fillText(
    String(sectionNumber).padStart(2, '0'),
    inchesToPixels(layout.numberText.x) + inchesToPixels(layout.numberText.w) / 2,
    inchesToPixels(layout.numberText.y) + layout.numberText.fontSize
  );
  ctx.textAlign = 'left';

  // Title
  ctx.fillStyle = textColor;
  setFont(ctx, layout.title.fontSize, 'bold');
  ctx.fillText(
    section.title || '',
    inchesToPixels(layout.title.x),
    inchesToPixels(layout.title.y) + layout.title.fontSize
  );

  // Subtitle
  if (section.subtitle) {
    setFont(ctx, layout.subtitle.fontSize);
    ctx.fillText(
      section.subtitle,
      inchesToPixels(layout.subtitle.x),
      inchesToPixels(layout.subtitle.y) + layout.subtitle.fontSize
    );
  }

  // Left panel content (bullet points)
  const bodyLines = portableTextToLines(section.content);
  if (bodyLines.length > 0) {
    setFont(ctx, layout.leftPanel.content.fontSize);
    drawBulletPoints(
      ctx,
      bodyLines,
      inchesToPixels(layout.leftPanel.content.x),
      inchesToPixels(layout.leftPanel.content.y) + layout.leftPanel.content.fontSize,
      inchesToPixels(layout.leftPanel.content.w),
      layout.leftPanel.content.fontSize * 1.5
    );
  }

  // Chart
  if (section.hasChart && section.chartConfig?.chartData) {
    // Chart title
    const chartTitle = section.chartConfig?.chartTitle || 'Chart';
    setFont(ctx, layout.chartTitle.fontSize, 'bold');
    ctx.fillText(
      chartTitle,
      inchesToPixels(layout.chartTitle.x),
      inchesToPixels(layout.chartTitle.y) + layout.chartTitle.fontSize
    );

    // Render chart image
    const chartSection = {
      hasChart: true,
      chartData: section.chartConfig?.chartData,
      chartSeries: section.chartConfig?.chartSeries,
      chartType: section.chartConfig?.chartType || 'line',
      xAxisLabel: section.chartConfig?.xAxisLabel,
      yAxisLabel: section.chartConfig?.yAxisLabel,
      yAxisFormat: section.chartConfig?.yAxisFormat
    };

    const chartWidth = inchesToPixels(layout.chart.w);
    const chartHeight = inchesToPixels(layout.chart.h);

    const chartBase64 = await renderChartToPNG(chartSection, {
      width: chartWidth,
      height: chartHeight,
      darkMode: isDarkBackground(bgColor)
    });

    if (chartBase64) {
      const chartImg = await loadImageSafe(`data:image/png;base64,${chartBase64}`);
      if (chartImg) {
        ctx.drawImage(
          chartImg,
          inchesToPixels(layout.chart.x),
          inchesToPixels(layout.chart.y),
          chartWidth,
          chartHeight
        );
      }
    }
  }

  // Source
  if (section.chartSource || section.chartConfig?.chartSource) {
    const sourceText = `Source: ${section.chartSource || section.chartConfig?.chartSource}`;
    setFont(ctx, layout.source.fontSize, 'normal', 'italic');
    ctx.fillText(
      sourceText,
      inchesToPixels(layout.source.x),
      inchesToPixels(layout.source.y) + layout.source.fontSize
    );
  }
}

/**
 * Render Insights Section Slide
 */
async function renderInsightsSlide(ctx, section) {
  const layout = TEMPLATE_CONFIG.slideTypes.insightsSection;
  const colors = TEMPLATE_CONFIG.colors;

  // White background
  ctx.fillStyle = colors.white;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Insights panel (right side)
  const panelColor = normalizeColor(section.insightsColor, colors.primary);
  ctx.fillStyle = panelColor;
  ctx.fillRect(
    inchesToPixels(layout.insightsPanel.x),
    inchesToPixels(layout.insightsPanel.y),
    inchesToPixels(layout.insightsPanel.w),
    inchesToPixels(layout.insightsPanel.h)
  );

  // White divider stripe
  ctx.fillStyle = colors.white;
  ctx.fillRect(
    inchesToPixels(layout.insightsPanel.dividerX),
    0,
    inchesToPixels(layout.insightsPanel.dividerW),
    SLIDE_HEIGHT
  );

  // Title
  ctx.fillStyle = colors.text;
  setFont(ctx, layout.title.fontSize, 'bold');
  ctx.fillText(
    section.title || '',
    inchesToPixels(layout.title.x),
    inchesToPixels(layout.title.y) + layout.title.fontSize
  );

  // Subtitle
  if (section.subtitle) {
    ctx.fillStyle = colors.textSecondary;
    setFont(ctx, layout.subtitle.fontSize);
    ctx.fillText(
      section.subtitle,
      inchesToPixels(layout.subtitle.x),
      inchesToPixels(layout.subtitle.y) + layout.subtitle.fontSize
    );
  }

  // Key insights title
  ctx.fillStyle = colors.white;
  setFont(ctx, layout.insightsTitle.fontSize, 'bold');
  ctx.fillText(
    'Key insights',
    inchesToPixels(layout.insightsTitle.x),
    inchesToPixels(layout.insightsTitle.y) + layout.insightsTitle.fontSize
  );

  // Insights list
  const insights = section.insights || [];
  if (insights.length > 0) {
    const insightTexts = insights.map(i => typeof i === 'string' ? i : i.text || '');
    setFont(ctx, 11);
    drawBulletPoints(
      ctx,
      insightTexts,
      inchesToPixels(layout.insightsList.x),
      inchesToPixels(layout.insightsList.y) + 11,
      inchesToPixels(layout.insightsList.w) - 10,
      14
    );
  }

  // Chart
  if (section.chartConfig?.chartData) {
    // Chart title
    ctx.fillStyle = colors.text;
    const chartTitle = section.chartConfig?.chartTitle || 'Chart';
    setFont(ctx, layout.chartTitle.fontSize, 'bold');
    ctx.fillText(
      chartTitle,
      inchesToPixels(layout.chartTitle.x),
      inchesToPixels(layout.chartTitle.y) + layout.chartTitle.fontSize
    );

    // Render chart image
    const chartSection = {
      hasChart: true,
      chartData: section.chartConfig.chartData,
      chartSeries: section.chartConfig.chartSeries,
      chartType: section.chartConfig.chartType || 'line',
      xAxisLabel: section.chartConfig.xAxisLabel,
      yAxisLabel: section.chartConfig.yAxisLabel,
      yAxisFormat: section.chartConfig.yAxisFormat
    };

    const chartWidth = inchesToPixels(layout.chart.w);
    const chartHeight = inchesToPixels(layout.chart.h);

    const chartBase64 = await renderChartToPNG(chartSection, {
      width: chartWidth,
      height: chartHeight,
      darkMode: false
    });

    if (chartBase64) {
      const chartImg = await loadImageSafe(`data:image/png;base64,${chartBase64}`);
      if (chartImg) {
        ctx.drawImage(
          chartImg,
          inchesToPixels(layout.chart.x),
          inchesToPixels(layout.chart.y),
          chartWidth,
          chartHeight
        );
      }
    }
  }

  // Source
  if (section.chartSource || section.chartConfig?.chartSource) {
    ctx.fillStyle = colors.textSecondary;
    const sourceText = `Source: ${section.chartSource || section.chartConfig?.chartSource}`;
    setFont(ctx, layout.source.fontSize, 'normal', 'italic');
    ctx.fillText(
      sourceText,
      inchesToPixels(layout.source.x),
      inchesToPixels(layout.source.y) + layout.source.fontSize
    );
  }
}

/**
 * Render Timeline Section Slide
 */
async function renderTimelineSlide(ctx, section) {
  const layout = TEMPLATE_CONFIG.slideTypes.timelineSection;
  const colors = TEMPLATE_CONFIG.colors;

  // White background
  ctx.fillStyle = colors.white;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Title
  ctx.fillStyle = colors.text;
  setFont(ctx, layout.title.fontSize, 'bold');
  ctx.fillText(
    section.title || '',
    inchesToPixels(layout.title.x),
    inchesToPixels(layout.title.y) + layout.title.fontSize
  );

  // Subtitle
  if (section.subtitle) {
    ctx.fillStyle = colors.textSecondary;
    setFont(ctx, layout.subtitle.fontSize);
    ctx.fillText(
      section.subtitle,
      inchesToPixels(layout.subtitle.x),
      inchesToPixels(layout.subtitle.y) + layout.subtitle.fontSize
    );
  }

  // Timeline items
  const items = section.items || [];
  const itemColors = [colors.primary, colors.teal, colors.cyan];

  for (let i = 0; i < Math.min(items.length, 3); i++) {
    const item = items[i];
    const itemLayout = layout.items[i];
    const color = itemColors[i % itemColors.length];

    // Number circle
    ctx.fillStyle = color;
    drawEllipse(
      ctx,
      inchesToPixels(itemLayout.numberX),
      inchesToPixels(itemLayout.numberY),
      inchesToPixels(0.94),
      inchesToPixels(0.94)
    );

    // Number text
    ctx.fillStyle = colors.white;
    setFont(ctx, 32, 'bold');
    ctx.textAlign = 'center';
    ctx.fillText(
      item.number || String(i + 1),
      inchesToPixels(itemLayout.numberX) + inchesToPixels(0.47),
      inchesToPixels(itemLayout.numberY) + 32 + 10
    );
    ctx.textAlign = 'left';

    // Header
    if (item.header) {
      ctx.fillStyle = colors.text;
      setFont(ctx, 14, 'bold');
      ctx.fillText(
        item.header,
        inchesToPixels(itemLayout.contentX),
        inchesToPixels(itemLayout.contentY) + 14
      );
    }

    // Body
    if (item.body) {
      ctx.fillStyle = colors.textSecondary;
      setFont(ctx, 11);
      drawWrappedText(
        ctx,
        item.body,
        inchesToPixels(itemLayout.contentX),
        inchesToPixels(itemLayout.contentY) + 30,
        inchesToPixels(itemLayout.contentW),
        14,
        { maxLines: 6 }
      );
    }
  }
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Section type to renderer mapping
 */
const SECTION_RENDERERS = {
  titleSection: renderTitleSlide,
  navigationSection: renderTOCSlide,
  headerSection: renderDividerSlide,
  contentSection: renderChartSlide,
  chartInsightsSection: renderInsightsSlide,
  timelineSection: renderTimelineSlide
};

/**
 * Generate preview for a single section
 */
export async function generateSlidePreview(section, options = {}) {
  const { sectionNumber = 1 } = options;
  const sectionType = section._type;

  const renderer = SECTION_RENDERERS[sectionType];
  if (!renderer) {
    console.warn(`[Preview] Unknown section type: ${sectionType}`);
    return null;
  }

  const canvas = createSlideCanvas();
  const ctx = canvas.getContext('2d');

  try {
    // Chart slides need section number
    if (sectionType === 'contentSection') {
      await renderer(ctx, section, sectionNumber);
    } else {
      await renderer(ctx, section);
    }

    return {
      slideType: sectionType,
      imageData: canvasToBase64(canvas),
      dimensions: { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }
    };
  } catch (error) {
    console.error(`[Preview] Failed to render ${sectionType}:`, error.message);
    return null;
  }
}

/**
 * Generate previews for all sections in a report
 * Options:
 *   - onePerType: If true, only generate one preview per slide type
 *   - maxPreviews: Maximum number of previews to generate
 */
export async function generateAllPreviews(report, options = {}) {
  const { onePerType = true, maxPreviews = 10 } = options;
  const sections = report.sections || [];
  const previews = [];
  const seenTypes = new Set();
  let sectionNumber = 0;

  for (let i = 0; i < sections.length && previews.length < maxPreviews; i++) {
    const section = sections[i];
    const sectionType = section._type;

    // Track section numbers for chart slides
    if (sectionType === 'contentSection' || sectionType === 'chartInsightsSection') {
      sectionNumber++;
    }

    // Skip if we only want one per type and we've seen this type
    if (onePerType && seenTypes.has(sectionType)) {
      continue;
    }

    const preview = await generateSlidePreview(section, { sectionNumber });

    if (preview) {
      previews.push({
        slideIndex: i,
        sectionNumber: (sectionType === 'contentSection' || sectionType === 'chartInsightsSection')
          ? sectionNumber
          : null,
        ...preview
      });
      seenTypes.add(sectionType);
    }
  }

  return {
    previews,
    metadata: {
      totalSlides: sections.length,
      previewedSlides: previews.length,
      onePerType,
      generatedAt: new Date().toISOString()
    }
  };
}
