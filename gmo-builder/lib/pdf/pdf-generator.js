import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  GMO_COLORS,
  textColors,
  surfaceColors,
  backgroundColors,
  sectionThemes,
  getSectionTheme,
  keyInsightsColors,
  pdfChartColors,
} from '../design-tokens/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Font paths
const FONTS = {
  light: path.join(__dirname, 'fonts', 'bnpp-sans-light.ttf'),
  condensedBold: path.join(__dirname, 'fonts', 'bnpp-sans-cond-bold-v2.ttf'),
};

// A4 landscape dimensions in points (1 point = 1/72 inch)
const PAGE_WIDTH = 841.89;  // 297mm
const PAGE_HEIGHT = 595.28; // 210mm
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
const CONTENT_HEIGHT = PAGE_HEIGHT - (MARGIN * 2);
const FOOTER_HEIGHT = 30;
const KEY_INSIGHTS_WIDTH = 180;

/**
 * Convert portable text blocks to plain text
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
 * Add BNPP-style page footer
 * @param {PDFDocument} doc - The PDF document
 * @param {number} pageNumber - Current page number
 */
function addPageFooter(doc, pageNumber) {
  const footerY = PAGE_HEIGHT - FOOTER_HEIGHT;

  // Light gray line above footer
  doc.moveTo(MARGIN, footerY)
    .lineTo(PAGE_WIDTH - MARGIN, footerY)
    .strokeColor('#E5E5E5')
    .lineWidth(0.5)
    .stroke();

  // BNP Paribas branding on left
  doc.fillColor(textColors.secondary)
    .fontSize(8)
    .font('BNPPSans-Light')
    .text('BNP PARIBAS ASSET MANAGEMENT', MARGIN, footerY + 10);

  // Tagline in center
  doc.fillColor(textColors.secondary)
    .fontSize(8)
    .text('The sustainable investor for a changing world', PAGE_WIDTH / 2 - 80, footerY + 10);

  // Page number on right
  doc.fillColor(textColors.secondary)
    .fontSize(8)
    .text(`${pageNumber}`, PAGE_WIDTH - MARGIN - 20, footerY + 10, { align: 'right', width: 20 });
}

/**
 * Generate key insights sidebar
 * @param {PDFDocument} doc - The PDF document
 * @param {Array<string>} insights - Array of insight bullet points
 * @param {number} startY - Y position to start the sidebar
 */
function generateKeyInsightsSidebar(doc, insights, startY) {
  if (!insights || insights.length === 0) return;

  const sidebarX = PAGE_WIDTH - MARGIN - KEY_INSIGHTS_WIDTH;
  const sidebarHeight = Math.min(insights.length * 50 + 60, CONTENT_HEIGHT - startY - FOOTER_HEIGHT);

  // Green sidebar background
  doc.rect(sidebarX, startY, KEY_INSIGHTS_WIDTH, sidebarHeight)
    .fill(keyInsightsColors.background);

  // Sidebar title
  doc.fillColor(keyInsightsColors.text)
    .fontSize(12)
    .font('BNPPSans-CondensedBold')
    .text('KEY INSIGHTS', sidebarX + 15, startY + 15, { width: KEY_INSIGHTS_WIDTH - 30 });

  // Bullet points
  let bulletY = startY + 45;
  insights.forEach((insight, index) => {
    if (bulletY > startY + sidebarHeight - 30) return;

    // Bullet
    doc.circle(sidebarX + 20, bulletY + 5, 3)
      .fill(keyInsightsColors.bullet);

    // Text
    doc.fillColor(keyInsightsColors.text)
      .fontSize(9)
      .font('BNPPSans-Light')
      .text(insight, sidebarX + 30, bulletY, {
        width: KEY_INSIGHTS_WIDTH - 45,
        lineGap: 2
      });

    const textHeight = doc.heightOfString(insight, {
      width: KEY_INSIGHTS_WIDTH - 45,
      fontSize: 9
    });
    bulletY += Math.max(textHeight + 15, 25);
  });

  return KEY_INSIGHTS_WIDTH + 20; // Return width used by sidebar for content adjustment
}

/**
 * Generate a section divider page with themed background
 * @param {PDFDocument} doc - The PDF document
 * @param {string} title - Section title
 * @param {string} sectionType - Section theme type (e.g., 'market-themes', 'ai-capex')
 * @param {number} pageNumber - Current page number
 */
function generateSectionDivider(doc, title, sectionType, pageNumber) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 });

  const theme = getSectionTheme(sectionType);

  // Full-bleed background
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    .fill(theme.background);

  // Large title centered
  doc.fillColor(theme.text)
    .fontSize(48)
    .font('BNPPSans-CondensedBold')
    .text(title || '', MARGIN, PAGE_HEIGHT / 2 - 30, {
      width: PAGE_WIDTH - (MARGIN * 2),
      align: 'center'
    });

  // Footer on divider pages
  addPageFooter(doc, pageNumber);
}

/**
 * Generate the cover page
 */
function generateCoverPage(doc, report) {
  // Green gradient background (simplified as solid color)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    .fill(GMO_COLORS.primaryGreen);

  // Title - limit width to 60% of content area to prevent overlap
  const titleMaxWidth = CONTENT_WIDTH * 0.6;
  doc.fillColor('white')
    .fontSize(42)
    .font('BNPPSans-CondensedBold')
    .text(report.title || 'GMO Report', MARGIN, PAGE_HEIGHT / 3, {
      width: titleMaxWidth,
      align: 'left'
    });

  // Calculate where title ends to position summary below it
  const titleHeight = doc.heightOfString(report.title || 'GMO Report', {
    width: titleMaxWidth,
    fontSize: 42
  });
  const summaryY = PAGE_HEIGHT / 3 + titleHeight + 30;

  // Summary - positioned below title with gap
  if (report.summary) {
    doc.fontSize(16)
      .font('BNPPSans-Light')
      .text(report.summary, MARGIN, summaryY, {
        width: titleMaxWidth,
        align: 'left'
      });
  }

  // Publication date and author
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

  // BNP Paribas Asset Management branding
  doc.fontSize(10)
    .fillColor('rgba(255,255,255,0.7)')
    .text('BNP PARIBAS ASSET MANAGEMENT', MARGIN, PAGE_HEIGHT - MARGIN - 15);

  // Tagline
  doc.fontSize(8)
    .fillColor('rgba(255,255,255,0.6)')
    .text('The sustainable investor for a changing world', MARGIN, PAGE_HEIGHT - MARGIN);
}

/**
 * Generate table of contents page
 */
function generateTableOfContents(doc, report) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  // Header
  doc.fillColor(surfaceColors.primary)
    .fontSize(28)
    .font('BNPPSans-CondensedBold')
    .text('In This Report', MARGIN, MARGIN);

  // Underline
  doc.moveTo(MARGIN, MARGIN + 40)
    .lineTo(MARGIN + 150, MARGIN + 40)
    .strokeColor(surfaceColors.primary)
    .lineWidth(3)
    .stroke();

  // Content sections list
  const contentSections = (report.sections || [])
    .filter(s => s._type === 'contentSection');

  let yPos = MARGIN + 80;
  const lineHeight = 35;

  contentSections.forEach((section, index) => {
    if (yPos > PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT - 30) return; // Don't overflow

    // Section number
    doc.fillColor(surfaceColors.primary)
      .fontSize(14)
      .font('BNPPSans-CondensedBold')
      .text(`${index + 1}.`, MARGIN, yPos, { continued: true, width: 30 });

    // Section title
    doc.fillColor(textColors.primary)
      .font('BNPPSans-CondensedBold')
      .text(` ${section.title || 'Untitled'}`, { continued: false });

    // Section subtitle
    if (section.subtitle) {
      doc.fillColor(textColors.secondary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(section.subtitle, MARGIN + 30, yPos + 18, {
          width: CONTENT_WIDTH - 30
        });
      yPos += lineHeight + 15;
    } else {
      yPos += lineHeight;
    }
  });

  // Add page footer
  addPageFooter(doc, 2);
}

/**
 * Generate a content section page
 */
function generateContentSection(doc, section, index, chartImage, layoutHints, pageNumber) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  const hints = layoutHints?.sections?.[index] || {};
  const hasChart = section.hasChart && chartImage;
  const chartPosition = hints.chartPosition || section.layout || 'chartRight';
  const sectionTheme = section.sectionTheme || hints.sectionTheme;
  const keyInsights = section.keyInsights || hints.keyInsights;
  const hasKeyInsights = keyInsights && keyInsights.length > 0;

  // Apply themed background if specified
  if (sectionTheme && sectionTheme !== 'default') {
    const theme = getSectionTheme(sectionTheme);
    // Light tint of theme color for content pages (not full saturation)
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
      .fill(backgroundColors.secondary); // Use light background, theme color for accents
  }

  // Calculate content width accounting for key insights sidebar
  const sidebarOffset = hasKeyInsights ? KEY_INSIGHTS_WIDTH + 20 : 0;
  const availableContentWidth = CONTENT_WIDTH - sidebarOffset;

  // Section title
  const titleColor = textColors.primary;
  doc.fillColor(titleColor)
    .fontSize(24)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', MARGIN, MARGIN, { width: availableContentWidth });

  // Underline with theme color if applicable
  const underlineColor = sectionTheme ? getSectionTheme(sectionTheme).background : surfaceColors.primary;
  doc.moveTo(MARGIN, MARGIN + 32)
    .lineTo(MARGIN + 60, MARGIN + 32)
    .strokeColor(underlineColor)
    .lineWidth(3)
    .stroke();

  // Subtitle
  let contentStartY = MARGIN + 50;
  if (section.subtitle) {
    doc.fillColor(textColors.secondary)
      .fontSize(14)
      .font('BNPPSans-Light')
      .text(section.subtitle, MARGIN, contentStartY, { width: availableContentWidth });
    contentStartY += 30;
  }

  // Generate key insights sidebar if present
  if (hasKeyInsights) {
    generateKeyInsightsSidebar(doc, keyInsights, MARGIN);
  }

  // Content area calculations
  const chartWidth = hasKeyInsights ? 320 : 380;
  const chartHeight = 280;
  const textWidth = hasChart ? availableContentWidth - chartWidth - 40 : availableContentWidth;

  // Get plain text content
  const plainContent = portableTextToPlain(section.content);

  if (hasChart) {
    if (chartPosition === 'chartLeft') {
      // Chart on left, text on right
      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, MARGIN, contentStartY + 20, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });

      // Chart source
      if (section.chartSource) {
        doc.fillColor(textColors.secondary)
          .fontSize(9)
          .font('BNPPSans-Light')
          .text(`Source: ${section.chartSource}`, MARGIN, contentStartY + chartHeight + 30, {
            width: chartWidth
          });
      }

      // Text content on right
      doc.fillColor(textColors.primary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN + chartWidth + 40, contentStartY + 20, {
          width: textWidth,
          lineGap: 4
        });
    } else if (chartPosition === 'chartFull') {
      // Text first, then full-width chart
      doc.fillColor(textColors.primary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN, contentStartY + 20, {
          width: availableContentWidth,
          lineGap: 4
        });

      // Chart below (would need pagination for long content)
      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, MARGIN + (availableContentWidth - chartWidth) / 2, contentStartY + 150, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });
    } else {
      // Default: Chart on right, text on left
      doc.fillColor(textColors.primary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN, contentStartY + 20, {
          width: textWidth,
          lineGap: 4
        });

      // Chart on right
      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, MARGIN + textWidth + 40, contentStartY + 20, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });

      // Chart source
      if (section.chartSource) {
        doc.fillColor(textColors.secondary)
          .fontSize(9)
          .font('BNPPSans-Light')
          .text(`Source: ${section.chartSource}`, MARGIN + textWidth + 40, contentStartY + chartHeight + 30, {
            width: chartWidth
          });
      }
    }
  } else {
    // No chart - full width text (or adjusted for sidebar)
    doc.fillColor(textColors.primary)
      .fontSize(11)
      .font('BNPPSans-Light')
      .text(plainContent, MARGIN, contentStartY + 20, {
        width: availableContentWidth,
        lineGap: 4,
        columns: hasKeyInsights ? 1 : 2,
        columnGap: 40
      });
  }

  // Add page footer
  addPageFooter(doc, pageNumber);
}

// Color theme mapping for PDF
const COLOR_THEME_MAP = {
  blue: { background: '#7CC5D9', text: '#FFFFFF' },
  green: { background: '#008252', text: '#FFFFFF' },
  orange: { background: '#E8967B', text: '#FFFFFF' },
  brown: { background: '#A8887A', text: '#FFFFFF' },
  mint: { background: '#9DD9C7', text: '#1A1A1A' },
  none: { background: '#FFFFFF', text: '#1A1A1A' },
};

/**
 * Generate a header section page (full-bleed divider with image)
 */
function generateHeaderSection(doc, section, pageNumber) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 });

  const theme = COLOR_THEME_MAP[section.backgroundColor] || COLOR_THEME_MAP.blue;

  // Full-bleed background
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    .fill(theme.background);

  // Title on left side
  doc.fillColor(theme.text)
    .fontSize(42)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', MARGIN, PAGE_HEIGHT / 3, {
      width: PAGE_WIDTH * 0.5,
      align: 'left'
    });

  // Subtitle
  if (section.subtitle) {
    doc.fontSize(18)
      .font('BNPPSans-Light')
      .text(section.subtitle, MARGIN, PAGE_HEIGHT / 3 + 60, {
        width: PAGE_WIDTH * 0.5,
        align: 'left'
      });
  }

  // BNP Banner at bottom if enabled
  if (section.showBnpBanner) {
    const bannerY = PAGE_HEIGHT - 40;
    doc.rect(0, bannerY, PAGE_WIDTH, 40)
      .fillOpacity(0.2)
      .fill('#000000');

    doc.fillOpacity(1)
      .fillColor(theme.text)
      .fontSize(10)
      .font('BNPPSans-CondensedBold')
      .text('BNP PARIBAS', MARGIN, bannerY + 14);

    doc.fontSize(9)
      .font('BNPPSans-Light')
      .text('The sustainable investor for a changing world', MARGIN + 100, bannerY + 14);
  }

  addPageFooter(doc, pageNumber);
}

/**
 * Generate a timeline section page
 */
function generateTimelineSection(doc, section, pageNumber) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  // Section title
  doc.fillColor(textColors.primary)
    .fontSize(24)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', MARGIN, MARGIN);

  // Underline
  doc.moveTo(MARGIN, MARGIN + 32)
    .lineTo(MARGIN + 60, MARGIN + 32)
    .strokeColor(surfaceColors.primary)
    .lineWidth(3)
    .stroke();

  // Subtitle
  let startY = MARGIN + 50;
  if (section.subtitle) {
    doc.fillColor(textColors.secondary)
      .fontSize(14)
      .font('BNPPSans-Light')
      .text(section.subtitle, MARGIN, startY);
    startY += 40;
  }

  // Timeline items
  const items = section.items || [];
  const itemCount = items.length;
  const itemWidth = (CONTENT_WIDTH - 40) / Math.min(itemCount, 6);
  const trackY = startY + 50;

  // Draw timeline track
  doc.moveTo(MARGIN, trackY)
    .lineTo(PAGE_WIDTH - MARGIN, trackY)
    .strokeColor(surfaceColors.primary)
    .lineWidth(4)
    .stroke();

  // Draw items
  items.forEach((item, index) => {
    const itemX = MARGIN + (index * itemWidth) + (itemWidth / 2) - 60;
    const itemCenterX = MARGIN + (index * itemWidth) + (itemWidth / 2);

    // Timeline dot
    doc.circle(itemCenterX, trackY, 8)
      .fill(surfaceColors.primary);

    // Number
    doc.fillColor(surfaceColors.primary)
      .fontSize(28)
      .font('BNPPSans-CondensedBold')
      .text(item.number || '', itemX, trackY + 20, { width: 120, align: 'center' });

    // Header
    doc.fillColor(textColors.primary)
      .fontSize(12)
      .font('BNPPSans-CondensedBold')
      .text(item.header || '', itemX, trackY + 60, { width: 120, align: 'center' });

    // Body (truncated for space)
    if (item.body) {
      const truncatedBody = item.body.length > 80 ? item.body.substring(0, 77) + '...' : item.body;
      doc.fillColor(textColors.secondary)
        .fontSize(9)
        .font('BNPPSans-Light')
        .text(truncatedBody, itemX, trackY + 85, { width: 120, align: 'center' });
    }
  });

  addPageFooter(doc, pageNumber);
}

/**
 * Generate a chart insights section page
 */
function generateChartInsightsSection(doc, section, chartImage, pageNumber) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  const position = section.insightsPosition || 'right';
  const insightsTheme = COLOR_THEME_MAP[section.insightsColor] || COLOR_THEME_MAP.green;

  // Section title
  doc.fillColor(textColors.primary)
    .fontSize(24)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', MARGIN, MARGIN);

  // Underline
  doc.moveTo(MARGIN, MARGIN + 32)
    .lineTo(MARGIN + 60, MARGIN + 32)
    .strokeColor(surfaceColors.primary)
    .lineWidth(3)
    .stroke();

  // Subtitle
  let contentStartY = MARGIN + 50;
  if (section.subtitle) {
    doc.fillColor(textColors.secondary)
      .fontSize(14)
      .font('BNPPSans-Light')
      .text(section.subtitle, MARGIN, contentStartY);
    contentStartY += 35;
  }

  // Layout calculations
  const insightsWidth = 200;
  const chartWidth = CONTENT_WIDTH - insightsWidth - 40;
  const chartHeight = 300;

  // Determine positions based on insightsPosition
  let chartX, insightsX;
  if (position === 'left') {
    insightsX = MARGIN;
    chartX = MARGIN + insightsWidth + 40;
  } else {
    chartX = MARGIN;
    insightsX = MARGIN + chartWidth + 40;
  }

  // Draw chart
  if (chartImage) {
    const chartBuffer = Buffer.from(chartImage, 'base64');
    doc.image(chartBuffer, chartX, contentStartY + 20, {
      width: chartWidth,
      height: chartHeight,
      fit: [chartWidth, chartHeight]
    });

    // Chart source
    if (section.chartSource) {
      doc.fillColor(textColors.secondary)
        .fontSize(9)
        .font('BNPPSans-Light')
        .text(`Source: ${section.chartSource}`, chartX, contentStartY + chartHeight + 30, {
          width: chartWidth
        });
    }
  }

  // Draw insights panel
  const insights = section.insights || [];
  if (insights.length > 0) {
    const panelHeight = Math.min(insights.length * 45 + 50, chartHeight);

    // Panel background
    doc.rect(insightsX, contentStartY + 20, insightsWidth, panelHeight)
      .fill(insightsTheme.background);

    // Panel title
    doc.fillColor(insightsTheme.text)
      .fontSize(12)
      .font('BNPPSans-CondensedBold')
      .text('KEY INSIGHTS', insightsX + 15, contentStartY + 35, { width: insightsWidth - 30 });

    // Bullet points
    let bulletY = contentStartY + 60;
    insights.forEach((insight) => {
      if (bulletY > contentStartY + 20 + panelHeight - 25) return;

      // Bullet
      doc.circle(insightsX + 20, bulletY + 5, 3)
        .fill(insightsTheme.text);

      // Text
      doc.fillColor(insightsTheme.text)
        .fontSize(9)
        .font('BNPPSans-Light')
        .text(insight, insightsX + 30, bulletY, {
          width: insightsWidth - 45,
          lineGap: 2
        });

      const textHeight = doc.heightOfString(insight, {
        width: insightsWidth - 45,
        fontSize: 9
      });
      bulletY += Math.max(textHeight + 12, 22);
    });
  }

  addPageFooter(doc, pageNumber);
}

/**
 * Generate the complete PDF
 * @param {Object} report - Report data from Sanity
 * @param {Map} chartImages - Map of section index to base64 PNG
 * @param {Object} layoutHints - Optional layout optimization hints from Claude
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generatePDF(report, chartImages, layoutHints = null) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: MARGIN,
        info: {
          Title: report.title || 'GMO Report',
          Author: report.author || 'BNP Paribas Asset Management',
          Creator: 'GMO Report Builder'
        }
      });

      // Register custom fonts
      doc.registerFont('BNPPSans-Light', FONTS.light);
      doc.registerFont('BNPPSans-CondensedBold', FONTS.condensedBold);

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate cover page (page 1)
      generateCoverPage(doc, report);

      // Generate table of contents (page 2)
      generateTableOfContents(doc, report);

      let pageNumber = 3; // Start after cover and TOC
      let contentSectionIndex = 0;

      // Process all sections in order
      (report.sections || []).forEach((section, originalIndex) => {
        const chartImage = chartImages?.get(originalIndex);

        switch (section._type) {
          case 'headerSection':
            generateHeaderSection(doc, section, pageNumber);
            pageNumber++;
            break;

          case 'timelineSection':
            generateTimelineSection(doc, section, pageNumber);
            pageNumber++;
            break;

          case 'chartInsightsSection':
            generateChartInsightsSection(doc, section, chartImage, pageNumber);
            pageNumber++;
            break;

          case 'contentSection':
            const sectionHints = layoutHints?.sections?.[contentSectionIndex] || {};

            // Check if this section should have a divider page
            const sectionTheme = section.sectionTheme || sectionHints.sectionTheme;
            const showDivider = section.showSectionDivider || sectionHints.showDivider;

            if (showDivider && sectionTheme && sectionTheme !== 'default') {
              generateSectionDivider(doc, section.title, sectionTheme, pageNumber);
              pageNumber++;
            }

            generateContentSection(doc, section, contentSectionIndex, chartImage, layoutHints, pageNumber);
            pageNumber++;
            contentSectionIndex++;
            break;

          // titleSection and navigationSection are handled differently (not separate pages in PDF)
          default:
            break;
        }
      });

      // Finalize
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
