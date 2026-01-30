import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
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

// ============================================================================
// COLOR UTILITIES (aligned with pptx-export.js)
// ============================================================================

// Color theme mapping for PDF header/divider sections
const COLOR_THEME_MAP = {
  blue: { background: '#7CC5D9', text: '#FFFFFF' },
  green: { background: '#008252', text: '#FFFFFF' },
  orange: { background: '#E8967B', text: '#FFFFFF' },
  brown: { background: '#A8887A', text: '#FFFFFF' },
  mint: { background: '#9DD9C7', text: '#1A1A1A' },
  none: { background: '#FFFFFF', text: '#1A1A1A' },
};

// ============================================================================
// TEXT UTILITIES
// ============================================================================

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

// ============================================================================
// PAGE FOOTER
// ============================================================================

/**
 * Add BNPP-style page footer
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

// ============================================================================
// SECTION NUMBER BADGE (aligned with PPT section number circle)
// ============================================================================

/**
 * Draw a numbered circle badge, matching the PPT's section number style
 */
function drawSectionNumberBadge(doc, sectionNumber, x, y) {
  const badgeSize = 32;

  // Circle background
  doc.circle(x + badgeSize / 2, y + badgeSize / 2, badgeSize / 2)
    .fill(surfaceColors.primary);

  // Number text
  doc.fillColor('#FFFFFF')
    .fontSize(16)
    .font('BNPPSans-CondensedBold')
    .text(String(sectionNumber).padStart(2, '0'), x, y + 7, {
      width: badgeSize,
      align: 'center'
    });
}

// ============================================================================
// KEY INSIGHTS SIDEBAR
// ============================================================================

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
  insights.forEach((insight) => {
    if (bulletY > startY + sidebarHeight - 30) return;

    doc.circle(sidebarX + 20, bulletY + 5, 3)
      .fill(keyInsightsColors.bullet);

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

  return KEY_INSIGHTS_WIDTH + 20;
}

// ============================================================================
// SECTION DIVIDER
// ============================================================================

function generateSectionDivider(doc, title, sectionType, pageNumber) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 });

  const theme = getSectionTheme(sectionType);

  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    .fill(theme.background);

  doc.fillColor(theme.text)
    .fontSize(48)
    .font('BNPPSans-CondensedBold')
    .text(title || '', MARGIN, PAGE_HEIGHT / 2 - 30, {
      width: PAGE_WIDTH - (MARGIN * 2),
      align: 'center'
    });

  addPageFooter(doc, pageNumber);
}

// ============================================================================
// COVER PAGE
// ============================================================================

function generateCoverPage(doc, report, imageMap, titleSectionIndex) {
  const images = imageMap?.get(titleSectionIndex) || {};

  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    .fill(GMO_COLORS.primaryGreen);

  // Company logo (top left, matching PPT)
  if (images.companyLogo) {
    try {
      const logoBuffer = Buffer.from(images.companyLogo, 'base64');
      doc.image(logoBuffer, MARGIN, MARGIN, {
        width: 150,
        height: 60,
        fit: [150, 60]
      });
    } catch (e) {
      console.warn('[PDF] Failed to render company logo:', e.message);
    }
  }

  // Title
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

  doc.fontSize(8)
    .fillColor('rgba(255,255,255,0.6)')
    .text('The sustainable investor for a changing world', MARGIN, PAGE_HEIGHT - MARGIN);
}

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================

function generateTableOfContents(doc, report) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  doc.fillColor(surfaceColors.primary)
    .fontSize(28)
    .font('BNPPSans-CondensedBold')
    .text('In This Report', MARGIN, MARGIN);

  doc.moveTo(MARGIN, MARGIN + 40)
    .lineTo(MARGIN + 150, MARGIN + 40)
    .strokeColor(surfaceColors.primary)
    .lineWidth(3)
    .stroke();

  // List content and chart insights sections (matching PPT numbering)
  const numberedSections = (report.sections || [])
    .filter(s => s._type === 'contentSection' || s._type === 'chartInsightsSection');

  let yPos = MARGIN + 80;
  const lineHeight = 35;

  numberedSections.forEach((section, index) => {
    if (yPos > PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT - 30) return;

    // Section number
    doc.fillColor(surfaceColors.primary)
      .fontSize(14)
      .font('BNPPSans-CondensedBold')
      .text(`${index + 1}.`, MARGIN, yPos);

    // Section title
    doc.fillColor(textColors.primary)
      .font('BNPPSans-CondensedBold')
      .text(section.title || 'Untitled', MARGIN + 25, yPos, {
        width: CONTENT_WIDTH - 25
      });

    if (section.subtitle) {
      doc.fillColor(textColors.secondary)
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

  addPageFooter(doc, 2);
}

// ============================================================================
// HEADER SECTION (full-bleed divider)
// ============================================================================

function generateHeaderSection(doc, section, pageNumber, sectionImages) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 });

  const theme = COLOR_THEME_MAP[section.backgroundColor] || COLOR_THEME_MAP.blue;

  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    .fill(theme.background);

  // Title on left side (limit to ~50% width if image present)
  const titleWidth = sectionImages?.image ? PAGE_WIDTH * 0.5 : PAGE_WIDTH - (MARGIN * 2);
  doc.fillColor(theme.text)
    .fontSize(42)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', MARGIN, PAGE_HEIGHT / 3, {
      width: titleWidth,
      align: 'left'
    });

  if (section.subtitle) {
    doc.fontSize(18)
      .font('BNPPSans-Light')
      .text(section.subtitle, MARGIN, PAGE_HEIGHT / 3 + 60, {
        width: titleWidth,
        align: 'left'
      });
  }

  // Section image on right side (matching PPT divider layout)
  if (sectionImages?.image) {
    try {
      const imgBuffer = Buffer.from(sectionImages.image, 'base64');
      const imgX = PAGE_WIDTH * 0.55;
      const imgSize = PAGE_HEIGHT * 0.6;
      doc.image(imgBuffer, imgX, (PAGE_HEIGHT - imgSize) / 2, {
        width: imgSize,
        height: imgSize,
        fit: [imgSize, imgSize]
      });
    } catch (e) {
      console.warn('[PDF] Failed to render header image:', e.message);
    }
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

// ============================================================================
// CONTENT SECTION
// ============================================================================

function generateContentSection(doc, section, contentIndex, chartImage, layoutHints, pageNumber, sectionNumber, sectionImages) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  const hints = layoutHints?.sections?.[contentIndex] || {};
  const hasChart = section.hasChart && chartImage;
  const chartPosition = hints.chartPosition || section.layout || 'chartRight';
  const sectionTheme = section.sectionTheme || hints.sectionTheme;
  const keyInsights = section.keyInsights || hints.keyInsights;
  const hasKeyInsights = keyInsights && keyInsights.length > 0;

  // Apply themed background if specified
  if (sectionTheme && sectionTheme !== 'default') {
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
      .fill(backgroundColors.secondary);
  }

  // Calculate content width accounting for key insights sidebar
  const sidebarOffset = hasKeyInsights ? KEY_INSIGHTS_WIDTH + 20 : 0;
  const availableContentWidth = CONTENT_WIDTH - sidebarOffset;

  // Section number badge (matching PPT)
  let titleX = MARGIN;
  if (sectionNumber) {
    drawSectionNumberBadge(doc, sectionNumber, MARGIN, MARGIN);
    titleX = MARGIN + 42;
  }

  // Section title
  doc.fillColor(textColors.primary)
    .fontSize(24)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', titleX, MARGIN + 4, { width: availableContentWidth - (titleX - MARGIN) });

  // Underline with theme color if applicable
  const underlineColor = sectionTheme ? getSectionTheme(sectionTheme).background : surfaceColors.primary;
  doc.moveTo(titleX, MARGIN + 36)
    .lineTo(titleX + 60, MARGIN + 36)
    .strokeColor(underlineColor)
    .lineWidth(3)
    .stroke();

  // Subtitle
  let contentStartY = MARGIN + 50;
  if (section.subtitle) {
    doc.fillColor(textColors.secondary)
      .fontSize(14)
      .font('BNPPSans-Light')
      .text(section.subtitle, titleX, contentStartY, { width: availableContentWidth - (titleX - MARGIN) });
    contentStartY += 30;
  }

  // Generate key insights sidebar if present
  if (hasKeyInsights) {
    generateKeyInsightsSidebar(doc, keyInsights, MARGIN);
  }

  // Section image (left panel, matching PPT's sectionImage placement)
  let leftPanelWidth = 0;
  if (sectionImages?.sectionImage && !hasChart) {
    leftPanelWidth = 160;
    try {
      const imgBuffer = Buffer.from(sectionImages.sectionImage, 'base64');
      doc.image(imgBuffer, MARGIN, contentStartY + 20, {
        width: leftPanelWidth - 20,
        height: 120,
        fit: [leftPanelWidth - 20, 120]
      });
    } catch (e) {
      console.warn('[PDF] Failed to render section image:', e.message);
      leftPanelWidth = 0;
    }
  }

  // Content area calculations
  const chartWidth = hasKeyInsights ? 320 : 380;
  const chartHeight = 280;
  const textStartX = MARGIN + leftPanelWidth;
  const textWidth = hasChart
    ? availableContentWidth - chartWidth - 40 - leftPanelWidth
    : availableContentWidth - leftPanelWidth;

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
        doc.fillColor(textColors.secondary)
          .fontSize(9)
          .font('BNPPSans-Light')
          .text(`Source: ${section.chartSource}`, MARGIN, contentStartY + chartHeight + 30, {
            width: chartWidth
          });
      }

      doc.fillColor(textColors.primary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN + chartWidth + 40, contentStartY + 20, {
          width: textWidth,
          lineGap: 4
        });
    } else if (chartPosition === 'chartFull') {
      doc.fillColor(textColors.primary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, textStartX, contentStartY + 20, {
          width: availableContentWidth - leftPanelWidth,
          lineGap: 4
        });

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
        .text(plainContent, textStartX, contentStartY + 20, {
          width: textWidth,
          lineGap: 4
        });

      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, MARGIN + textWidth + leftPanelWidth + 40, contentStartY + 20, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });

      if (section.chartSource) {
        doc.fillColor(textColors.secondary)
          .fontSize(9)
          .font('BNPPSans-Light')
          .text(`Source: ${section.chartSource}`, MARGIN + textWidth + leftPanelWidth + 40, contentStartY + chartHeight + 30, {
            width: chartWidth
          });
      }
    }
  } else {
    doc.fillColor(textColors.primary)
      .fontSize(11)
      .font('BNPPSans-Light')
      .text(plainContent, textStartX, contentStartY + 20, {
        width: availableContentWidth - leftPanelWidth,
        lineGap: 4,
        columns: hasKeyInsights ? 1 : 2,
        columnGap: 40
      });
  }

  addPageFooter(doc, pageNumber);
}

// ============================================================================
// CHART INSIGHTS SECTION
// ============================================================================

function generateChartInsightsSection(doc, section, chartImage, pageNumber, sectionNumber) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  const position = section.insightsPosition || 'right';
  const insightsTheme = COLOR_THEME_MAP[section.insightsColor] || COLOR_THEME_MAP.green;

  // Section number badge (matching PPT)
  let titleX = MARGIN;
  if (sectionNumber) {
    drawSectionNumberBadge(doc, sectionNumber, MARGIN, MARGIN);
    titleX = MARGIN + 42;
  }

  // Section title
  doc.fillColor(textColors.primary)
    .fontSize(24)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', titleX, MARGIN + 4);

  // Underline
  doc.moveTo(titleX, MARGIN + 36)
    .lineTo(titleX + 60, MARGIN + 36)
    .strokeColor(surfaceColors.primary)
    .lineWidth(3)
    .stroke();

  // Subtitle
  let contentStartY = MARGIN + 50;
  if (section.subtitle) {
    doc.fillColor(textColors.secondary)
      .fontSize(14)
      .font('BNPPSans-Light')
      .text(section.subtitle, titleX, contentStartY);
    contentStartY += 35;
  }

  // Layout calculations
  const insightsWidth = 200;
  const chartWidth = CONTENT_WIDTH - insightsWidth - 40;
  const chartHeight = 300;

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
    try {
      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, chartX, contentStartY + 20, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });
    } catch (e) {
      console.warn('[PDF] Failed to render chart insights chart:', e.message);
    }

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

    doc.rect(insightsX, contentStartY + 20, insightsWidth, panelHeight)
      .fill(insightsTheme.background);

    doc.fillColor(insightsTheme.text)
      .fontSize(12)
      .font('BNPPSans-CondensedBold')
      .text('KEY INSIGHTS', insightsX + 15, contentStartY + 35, { width: insightsWidth - 30 });

    let bulletY = contentStartY + 60;
    insights.forEach((insight) => {
      if (bulletY > contentStartY + 20 + panelHeight - 25) return;

      doc.circle(insightsX + 20, bulletY + 5, 3)
        .fill(insightsTheme.text);

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

// ============================================================================
// TIMELINE SECTION
// ============================================================================

function generateTimelineSection(doc, section, pageNumber, sectionImages) {
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

  // Timeline dot colors (matching PPT)
  const dotColors = ['#009FB1', '#51BBB4', '#61C3D7'];

  // Draw items
  items.forEach((item, index) => {
    const itemX = MARGIN + (index * itemWidth) + (itemWidth / 2) - 60;
    const itemCenterX = MARGIN + (index * itemWidth) + (itemWidth / 2);
    const dotColor = dotColors[index % dotColors.length];

    // Timeline dot
    doc.circle(itemCenterX, trackY, 8)
      .fill(dotColor);

    // Number
    doc.fillColor(dotColor)
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

    // Item image (below body text)
    const itemImageKey = `item_${index}`;
    if (sectionImages?.[itemImageKey]) {
      try {
        const imgBuffer = Buffer.from(sectionImages[itemImageKey], 'base64');
        doc.image(imgBuffer, itemX + 10, trackY + 120, {
          width: 100,
          height: 70,
          fit: [100, 70]
        });
      } catch (e) {
        console.warn(`[PDF] Failed to render timeline item ${index} image:`, e.message);
      }
    }
  });

  addPageFooter(doc, pageNumber);
}

// ============================================================================
// MAIN PDF GENERATOR
// ============================================================================

/**
 * Generate the complete PDF
 * @param {Object} report - Report data from Sanity
 * @param {Map} chartImages - Map of section index to base64 PNG
 * @param {Object} layoutHints - Optional layout optimization hints
 * @param {Map} imageMap - Map of section index to { [imageKey]: base64string }
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generatePDF(report, chartImages, layoutHints = null, imageMap = null) {
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

      // Register custom fonts with fallback
      if (fs.existsSync(FONTS.light) && fs.existsSync(FONTS.condensedBold)) {
        doc.registerFont('BNPPSans-Light', FONTS.light);
        doc.registerFont('BNPPSans-CondensedBold', FONTS.condensedBold);
      } else {
        console.warn('[PDF] Custom fonts not found, using Helvetica fallback');
        doc.registerFont('BNPPSans-Light', 'Helvetica');
        doc.registerFont('BNPPSans-CondensedBold', 'Helvetica-Bold');
      }

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Find titleSection index for cover page images
      const titleSectionIndex = (report.sections || []).findIndex(s => s._type === 'titleSection');

      // Generate cover page (page 1)
      generateCoverPage(doc, report, imageMap, titleSectionIndex >= 0 ? titleSectionIndex : null);

      // Generate table of contents (page 2)
      generateTableOfContents(doc, report);

      let pageNumber = 3;
      let contentSectionIndex = 0;
      let sectionNumber = 0; // Shared counter for contentSection + chartInsightsSection

      // Process all sections in document order (matching PPT behavior)
      (report.sections || []).forEach((section, originalIndex) => {
        const chartImage = chartImages?.get(originalIndex);
        const sectionImages = imageMap?.get(originalIndex) || {};

        switch (section._type) {
          case 'headerSection':
            generateHeaderSection(doc, section, pageNumber, sectionImages);
            pageNumber++;
            break;

          case 'timelineSection':
            generateTimelineSection(doc, section, pageNumber, sectionImages);
            pageNumber++;
            break;

          case 'chartInsightsSection':
            sectionNumber++;
            generateChartInsightsSection(doc, section, chartImage, pageNumber, sectionNumber);
            pageNumber++;
            break;

          case 'contentSection': {
            sectionNumber++;
            const sectionHints = layoutHints?.sections?.[contentSectionIndex] || {};

            // Check if this section should have a divider page
            const sectionTheme = section.sectionTheme || sectionHints.sectionTheme;
            const showDivider = section.showSectionDivider || sectionHints.showDivider;

            if (showDivider && sectionTheme && sectionTheme !== 'default') {
              generateSectionDivider(doc, section.title, sectionTheme, pageNumber);
              pageNumber++;
            }

            generateContentSection(doc, section, contentSectionIndex, chartImage, layoutHints, pageNumber, sectionNumber, sectionImages);
            pageNumber++;
            contentSectionIndex++;
            break;
          }

          // titleSection and navigationSection are covered by cover page and TOC
          default:
            break;
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
