/**
 * Insights Section Slide Generator
 * Generates slides with large chart and key insights panel
 * Uses QuickChart.io for high-quality chart image rendering
 */

import { renderChartToPNG } from '../chart-image-renderer.js';
import { normalizeColor } from '../../lib/powerpoint/color-utils.js';

/**
 * Generate an insights section slide
 * @param {Object} slide - pptxgenjs slide object
 * @param {Object} section - Sanity chartInsightsSection data
 * @param {Object} options - { layout, config, sectionNumber, pptx }
 */
export async function generateInsightsSlide(slide, section, options) {
  const { layout, config } = options;
  const colors = config.colors;
  const fonts = config.fonts;

  // White background
  slide.bkgd = colors.white;

  // Title
  const titleLayout = layout.title || { x: 0.5, y: 0.29, w: 12.33, h: 0.39 };
  slide.addText(section.title || '', {
    x: titleLayout.x,
    y: titleLayout.y,
    w: titleLayout.w,
    h: titleLayout.h,
    fontSize: titleLayout.fontSize || 24,
    bold: titleLayout.bold !== false,
    fontFace: fonts.title.face,
    color: colors.text
  });

  // Subtitle
  if (section.subtitle) {
    const subtitleLayout = layout.subtitle || { x: 0.5, y: 0.81, w: 5.77, h: 0.23 };
    slide.addText(section.subtitle, {
      x: subtitleLayout.x,
      y: subtitleLayout.y,
      w: subtitleLayout.w,
      h: subtitleLayout.h,
      fontSize: subtitleLayout.fontSize || 16,
      fontFace: fonts.subtitle.face,
      color: colors.textSecondary
    });
  }

  // Chart title
  const chartTitleLayout = layout.chartTitle || { x: 0.5, y: 1.46, w: 2.48, h: 0.2 };
  const chartTitle = section.chartConfig?.chartTitle || 'Chart';
  slide.addText(chartTitle, {
    x: chartTitleLayout.x,
    y: chartTitleLayout.y,
    w: chartTitleLayout.w,
    h: chartTitleLayout.h,
    fontSize: chartTitleLayout.fontSize || 12,
    bold: chartTitleLayout.bold !== false,
    fontFace: fonts.body.face,
    color: colors.text
  });

  // Insights panel (right side vertical stripe)
  const insightsPanel = layout.insightsPanel || { x: 9.79, y: 0, w: 3.54, h: 7.5 };
  const insightsColor = normalizeColor(section.insightsColor, colors.primary);

  // Panel background
  slide.addShape('rect', {
    x: insightsPanel.x,
    y: insightsPanel.y,
    w: insightsPanel.w,
    h: insightsPanel.h,
    fill: { color: insightsColor }
  });

  // Divider stripe
  if (insightsPanel.dividerX) {
    slide.addShape('rect', {
      x: insightsPanel.dividerX,
      y: 0,
      w: insightsPanel.dividerW || 0.26,
      h: 7.5,
      fill: { color: colors.white }
    });
  }

  // Key insights title
  const insightsTitleLayout = layout.insightsTitle || { x: 10.28, y: 1.46, w: 1.14, h: 0.2 };
  slide.addText('Key insights', {
    x: insightsTitleLayout.x,
    y: insightsTitleLayout.y,
    w: insightsTitleLayout.w + 1.5,
    h: insightsTitleLayout.h,
    fontSize: insightsTitleLayout.fontSize || 12,
    bold: insightsTitleLayout.bold !== false,
    fontFace: fonts.body.face,
    color: colors.white
  });

  // Insights list
  const insightsListLayout = layout.insightsList || { x: 10.28, y: 1.78, w: 3.28, h: 3.28 };
  const insights = section.insights || [];

  if (insights.length > 0) {
    const insightItems = insights.map((insight, index) => ({
      text: typeof insight === 'string' ? insight : insight.text || '',
      options: { bullet: { code: '2022' } } // Bullet point
    }));

    slide.addText(insightItems, {
      x: insightsListLayout.x,
      y: insightsListLayout.y,
      w: insightsListLayout.w - 0.3,
      h: insightsListLayout.h,
      fontSize: 11,
      fontFace: fonts.body.face,
      color: colors.white,
      valign: 'top',
      paraSpaceAfter: 8
    });
  }

  // Add chart as image (large, on left side)
  if (section.chartConfig?.chartData) {
    const chartSection = {
      hasChart: true,
      chartData: section.chartConfig.chartData,
      chartSeries: section.chartConfig.chartSeries,
      chartType: section.chartConfig.chartType || 'line',
      xAxisLabel: section.chartConfig.xAxisLabel,
      yAxisLabel: section.chartConfig.yAxisLabel,
      yAxisFormat: section.chartConfig.yAxisFormat
    };

    // Get chart position from layout (larger chart for insights slide)
    const chartPos = layout.chart || { x: 0.47, y: 1.85, w: 8.66, h: 4.33 };

    try {
      // Render chart as high-quality image via QuickChart.io
      // Insights slides have white background, so use dark text (darkMode: false)
      const imageData = await renderChartToPNG(chartSection, {
        width: Math.round(chartPos.w * 96),   // Convert inches to pixels (96 DPI)
        height: Math.round(chartPos.h * 96),
        darkMode: false  // White background = dark text
      });

      if (imageData) {
        slide.addImage({
          data: imageData,
          x: chartPos.x,
          y: chartPos.y,
          w: chartPos.w,
          h: chartPos.h
        });
        console.log('[Insights Slide] Chart image added successfully');
      }
    } catch (error) {
      console.error('[Insights Slide] Failed to render chart image:', error.message);
      // Add placeholder text if chart fails
      slide.addText('Chart could not be rendered', {
        x: chartPos.x,
        y: chartPos.y + chartPos.h / 2,
        w: chartPos.w,
        h: 0.5,
        fontSize: 14,
        color: colors.text,
        align: 'center'
      });
    }
  }

  // Source
  if (section.chartSource || section.chartConfig?.chartSource) {
    const sourceLayout = layout.source || { x: 0.5, y: 6.27, w: 9.04, h: 0.33 };
    const sourceText = `Source: ${section.chartSource || section.chartConfig?.chartSource}`;
    slide.addText(sourceText, {
      x: sourceLayout.x,
      y: sourceLayout.y,
      w: sourceLayout.w,
      h: sourceLayout.h,
      fontSize: sourceLayout.fontSize || 10,
      italic: true,
      fontFace: fonts.source.face,
      color: colors.textSecondary
    });
  }
}

export default { generateInsightsSlide };
