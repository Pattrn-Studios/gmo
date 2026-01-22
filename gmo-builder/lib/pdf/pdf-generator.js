import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import { GMO_COLORS, textColors, surfaceColors, backgroundColors } from '../design-tokens/index.js';

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

  // AXA Investment Managers branding
  doc.fontSize(10)
    .fillColor('rgba(255,255,255,0.7)')
    .text('AXA Investment Managers', MARGIN, PAGE_HEIGHT - MARGIN - 15);
}

/**
 * Generate table of contents page
 */
function generateTableOfContents(doc, report) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  // Header
  doc.fillColor(GMO_COLORS.primaryGreen)
    .fontSize(28)
    .font('BNPPSans-CondensedBold')
    .text('In This Report', MARGIN, MARGIN);

  // Underline
  doc.moveTo(MARGIN, MARGIN + 40)
    .lineTo(MARGIN + 150, MARGIN + 40)
    .strokeColor(GMO_COLORS.primaryGreen)
    .lineWidth(3)
    .stroke();

  // Content sections list
  const contentSections = (report.sections || [])
    .filter(s => s._type === 'contentSection');

  let yPos = MARGIN + 80;
  const lineHeight = 35;

  contentSections.forEach((section, index) => {
    if (yPos > PAGE_HEIGHT - MARGIN - 50) return; // Don't overflow

    // Section number
    doc.fillColor(GMO_COLORS.primaryGreen)
      .fontSize(14)
      .font('BNPPSans-CondensedBold')
      .text(`${index + 1}.`, MARGIN, yPos, { continued: true, width: 30 });

    // Section title
    doc.fillColor(GMO_COLORS.textPrimary)
      .font('BNPPSans-CondensedBold')
      .text(` ${section.title || 'Untitled'}`, { continued: false });

    // Section subtitle
    if (section.subtitle) {
      doc.fillColor(GMO_COLORS.textSecondary)
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
}

/**
 * Generate a content section page
 */
function generateContentSection(doc, section, index, chartImage, layoutHints) {
  doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });

  const hints = layoutHints?.sections?.[index] || {};
  const hasChart = section.hasChart && chartImage;
  const chartPosition = hints.chartPosition || section.layout || 'chartRight';

  // Section title
  doc.fillColor(GMO_COLORS.textPrimary)
    .fontSize(24)
    .font('BNPPSans-CondensedBold')
    .text(section.title || '', MARGIN, MARGIN);

  // Underline
  doc.moveTo(MARGIN, MARGIN + 32)
    .lineTo(MARGIN + 60, MARGIN + 32)
    .strokeColor(GMO_COLORS.primaryGreen)
    .lineWidth(3)
    .stroke();

  // Subtitle
  let contentStartY = MARGIN + 50;
  if (section.subtitle) {
    doc.fillColor(GMO_COLORS.textSecondary)
      .fontSize(14)
      .font('BNPPSans-Light')
      .text(section.subtitle, MARGIN, contentStartY, { width: CONTENT_WIDTH });
    contentStartY += 30;
  }

  // Content area calculations
  const chartWidth = 380;
  const chartHeight = 280;
  const textWidth = hasChart ? CONTENT_WIDTH - chartWidth - 40 : CONTENT_WIDTH;

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
        doc.fillColor(GMO_COLORS.textSecondary)
          .fontSize(9)
          .font('BNPPSans-Light')
          .text(`Source: ${section.chartSource}`, MARGIN, contentStartY + chartHeight + 30, {
            width: chartWidth
          });
      }

      // Text content on right
      doc.fillColor(GMO_COLORS.textPrimary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN + chartWidth + 40, contentStartY + 20, {
          width: textWidth,
          lineGap: 4
        });
    } else if (chartPosition === 'chartFull') {
      // Text first, then full-width chart
      doc.fillColor(GMO_COLORS.textPrimary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(plainContent, MARGIN, contentStartY + 20, {
          width: CONTENT_WIDTH,
          lineGap: 4
        });

      // Chart below (would need pagination for long content)
      const chartBuffer = Buffer.from(chartImage, 'base64');
      doc.image(chartBuffer, MARGIN + (CONTENT_WIDTH - chartWidth) / 2, contentStartY + 150, {
        width: chartWidth,
        height: chartHeight,
        fit: [chartWidth, chartHeight]
      });
    } else {
      // Default: Chart on right, text on left
      doc.fillColor(GMO_COLORS.textPrimary)
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
        doc.fillColor(GMO_COLORS.textSecondary)
          .fontSize(9)
          .font('BNPPSans-Light')
          .text(`Source: ${section.chartSource}`, MARGIN + textWidth + 40, contentStartY + chartHeight + 30, {
            width: chartWidth
          });
      }
    }
  } else {
    // No chart - full width text
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
          Author: report.author || 'AXA Investment Managers',
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

      // Generate cover page
      generateCoverPage(doc, report);

      // Generate table of contents
      generateTableOfContents(doc, report);

      // Generate content sections
      const contentSections = (report.sections || [])
        .map((section, originalIndex) => ({ section, originalIndex }))
        .filter(({ section }) => section._type === 'contentSection');

      contentSections.forEach(({ section, originalIndex }, displayIndex) => {
        const chartImage = chartImages.get(originalIndex);
        generateContentSection(doc, section, displayIndex, chartImage, layoutHints);
      });

      // Finalize
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
