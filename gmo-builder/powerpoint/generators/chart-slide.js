/**
 * Chart Section Slide Generator
 * Generates content slides with charts (the main content slide type)
 * Uses QuickChart.io for high-quality chart image rendering
 */

import { renderChartToPNG } from '../chart-image-renderer.js';
import { normalizeColor, getThemeColor } from '../../lib/powerpoint/color-utils.js';

/**
 * Determine if a hex color is dark (needs light text)
 * Uses relative luminance calculation
 * @param {string} hexColor - Hex color without # (e.g., '009FB1')
 * @returns {boolean} True if background is dark
 */
function isDarkBackground(hexColor) {
  if (!hexColor || hexColor.length < 6) return true; // Default to dark
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Convert Sanity PortableText to plain text array
 * @param {Array} blocks - PortableText blocks
 * @returns {Array<string>} Plain text lines
 */
function portableTextToLines(blocks) {
  if (!blocks || !Array.isArray(blocks)) return [];

  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      const text = block.children?.map(c => c.text).join('') || '';
      return text;
    })
    .filter(Boolean);
}

/**
 * Generate a chart section slide
 * @param {Object} slide - pptxgenjs slide object
 * @param {Object} section - Sanity contentSection data
 * @param {Object} options - { layout, config, sectionNumber, pptx }
 */
export async function generateChartSlide(slide, section, options) {
  const { layout, config, sectionNumber } = options;
  const colors = config.colors;
  const fonts = config.fonts;

  // Background color (themed) - use getThemeColor for proper normalization
  const bgColor = section.sectionTheme
    ? getThemeColor(section.sectionTheme, config)
    : normalizeColor(section.backgroundColor, colors.primary);
  slide.bkgd = bgColor;

  // Section number badge (white circle)
  const numberLayout = layout.sectionNumber || { x: 0.5, y: 0.36, w: 0.72, h: 0.72 };
  slide.addShape('ellipse', {
    x: numberLayout.x,
    y: numberLayout.y,
    w: numberLayout.w,
    h: numberLayout.h,
    fill: { color: colors.white }
  });

  // Section number text
  const numText = String(sectionNumber || 1).padStart(2, '0');
  const numberTextLayout = layout.numberText || { x: 0.5, y: 0.42, w: 0.72, h: 0.64 };
  slide.addText(numText, {
    x: numberTextLayout.x,
    y: numberTextLayout.y,
    w: numberTextLayout.w,
    h: numberTextLayout.h,
    fontSize: numberTextLayout.fontSize || 32,
    bold: true,
    fontFace: fonts.title.face,
    color: bgColor,
    align: 'center',
    valign: 'middle'
  });

  // Title
  const titleLayout = layout.title || { x: 1.21, y: 0.43, w: 11.86, h: 0.36 };
  slide.addText(section.title || '', {
    x: titleLayout.x,
    y: titleLayout.y,
    w: titleLayout.w,
    h: titleLayout.h,
    fontSize: titleLayout.fontSize || 24,
    bold: titleLayout.bold !== false,
    fontFace: fonts.title.face,
    color: colors.white
  });

  // Subtitle
  if (section.subtitle) {
    const subtitleLayout = layout.subtitle || { x: 1.24, y: 0.85, w: 11.86, h: 0.24 };
    slide.addText(section.subtitle, {
      x: subtitleLayout.x,
      y: subtitleLayout.y,
      w: subtitleLayout.w,
      h: subtitleLayout.h,
      fontSize: subtitleLayout.fontSize || 16,
      fontFace: fonts.subtitle.face,
      color: colors.white
    });
  }

  // Left panel content (body text)
  const leftPanel = layout.leftPanel || {
    content: { x: 0.5, y: 3.48, w: 2.5, h: 2.69, fontSize: 10 }
  };

  const bodyLines = portableTextToLines(section.content);
  if (bodyLines.length > 0) {
    slide.addText(bodyLines.map(line => ({ text: line, options: { bullet: true } })), {
      x: leftPanel.content.x,
      y: leftPanel.content.y,
      w: leftPanel.content.w,
      h: leftPanel.content.h,
      fontSize: leftPanel.content.fontSize || 10,
      fontFace: fonts.body.face,
      color: colors.white,
      valign: 'top'
    });
  }

  // Section image (in left panel)
  if (section.sectionImage?.asset?.url && leftPanel.image) {
    try {
      slide.addImage({
        path: section.sectionImage.asset.url,
        x: leftPanel.image.x,
        y: leftPanel.image.y,
        w: leftPanel.image.w,
        h: leftPanel.image.h
      });
    } catch (e) {
      console.warn('Could not add section image:', e.message);
    }
  }

  // Chart rendering
  if (section.hasChart && section.chartConfig?.chartData) {
    const chartTitleLayout = layout.chartTitle || { x: 3.35, y: 1.57, w: 4.44, h: 0.2 };
    const chartTitle = section.chartConfig?.chartTitle || section.chartTitle || 'Chart';
    slide.addText(chartTitle, {
      x: chartTitleLayout.x,
      y: chartTitleLayout.y,
      w: chartTitleLayout.w,
      h: chartTitleLayout.h,
      fontSize: chartTitleLayout.fontSize || 12,
      bold: chartTitleLayout.bold !== false,
      fontFace: fonts.body.face,
      color: colors.white
    });

    // Build chart section for rendering
    const chartSection = {
      hasChart: true,
      chartData: section.chartConfig?.chartData || section.chartData,
      chartSeries: section.chartConfig?.chartSeries || section.chartSeries,
      chartType: section.chartConfig?.chartType || section.chartType || 'line',
      xAxisLabel: section.chartConfig?.xAxisLabel,
      yAxisLabel: section.chartConfig?.yAxisLabel,
      yAxisFormat: section.chartConfig?.yAxisFormat
    };

    // Get chart position from layout
    const chartPos = layout.chart || { x: 3.33, y: 1.93, w: 7.61, h: 3.94 };

    // Determine if chart needs light text for dark background
    const darkMode = isDarkBackground(bgColor);

    try {
      // Render chart as high-quality image via QuickChart.io
      // Use transparent background with adaptive text colors
      const imageData = await renderChartToPNG(chartSection, {
        width: Math.round(chartPos.w * 96),   // Convert inches to pixels (96 DPI)
        height: Math.round(chartPos.h * 96),
        darkMode: darkMode  // White text for dark slides, dark text for light slides
      });

      if (imageData) {
        slide.addImage({
          data: imageData,
          x: chartPos.x,
          y: chartPos.y,
          w: chartPos.w,
          h: chartPos.h
        });
        console.log('[Chart Slide] Chart image added successfully');
      }
    } catch (error) {
      console.error('[Chart Slide] Failed to render chart image:', error.message);
      // Add placeholder text if chart fails
      slide.addText('Chart could not be rendered', {
        x: chartPos.x,
        y: chartPos.y + chartPos.h / 2,
        w: chartPos.w,
        h: 0.5,
        fontSize: 14,
        color: colors.white,
        align: 'center'
      });
    }
  }

  // Source
  if (section.chartSource || section.chartConfig?.chartSource) {
    const sourceLayout = layout.source || { x: 0.5, y: 6.14, w: 12.47, h: 0.29 };
    const sourceText = `Source: ${section.chartSource || section.chartConfig?.chartSource}`;
    slide.addText(sourceText, {
      x: sourceLayout.x,
      y: sourceLayout.y,
      w: sourceLayout.w,
      h: sourceLayout.h,
      fontSize: sourceLayout.fontSize || 10,
      italic: true,
      fontFace: fonts.source.face,
      color: colors.white
    });
  }
}

export default { generateChartSlide };
