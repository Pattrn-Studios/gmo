/**
 * Local test script for PDF generation
 * Tests PDF structure without serverless-specific Chromium
 */

import { createClient } from '@sanity/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Font paths
const FONTS = {
  light: path.join(__dirname, 'lib/pdf/fonts', 'bnpp-sans-light.ttf'),
  condensedBold: path.join(__dirname, 'lib/pdf/fonts', 'bnpp-sans-cond-bold-v2.ttf'),
};

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

const GMO_COLORS = {
  primaryGreen: '#3E7274',
  textPrimary: '#1A1A1A',
  textSecondary: '#5F5F5F',
};

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

// Fetch latest report
async function fetchReport() {
  const query = `*[_type == "report"] | order(publicationDate desc)[0] {
    _id,
    title,
    publicationDate,
    author,
    summary,
    sections[] {
      _type,
      _type == "contentSection" => {
        title,
        subtitle,
        content,
        hasChart,
        "chartType": chartConfig.chartType,
        "chartData": chartConfig.chartData,
        "chartSeries": chartConfig.chartSeries[] { label, dataColumn, colour },
        chartSource,
        layout
      }
    }
  }`;
  return await client.fetch(query);
}

// Convert portable text to plain text
function portableTextToPlain(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .filter(block => block._type === 'block')
    .map(block => block.children?.map(c => c.text || '').join('') || '')
    .join('\n\n');
}

// Generate PDF
async function generatePDF(report) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: MARGIN,
    info: {
      Title: report.title,
      Author: report.author || 'AXA Investment Managers',
    }
  });

  // Register custom fonts
  doc.registerFont('BNPPSans-Light', FONTS.light);
  doc.registerFont('BNPPSans-CondensedBold', FONTS.condensedBold);

  // Pipe to file
  const outputPath = './output/test-report.pdf';
  fs.mkdirSync('./output', { recursive: true });
  doc.pipe(fs.createWriteStream(outputPath));

  // Cover page
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(GMO_COLORS.primaryGreen);

  // Title - limit width to 60% to prevent overlap
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

  if (report.summary) {
    doc.fontSize(16)
      .font('BNPPSans-Light')
      .text(report.summary, MARGIN, summaryY, { width: titleMaxWidth });
  }

  const pubDate = report.publicationDate
    ? new Date(report.publicationDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : '';
  doc.fontSize(12)
    .font('BNPPSans-Light')
    .text(pubDate, MARGIN, PAGE_HEIGHT - MARGIN - 40);

  // Table of Contents
  doc.addPage();
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

  const contentSections = (report.sections || []).filter(s => s._type === 'contentSection');
  let yPos = MARGIN + 80;

  contentSections.forEach((section, i) => {
    doc.fillColor(GMO_COLORS.primaryGreen)
      .fontSize(14)
      .font('BNPPSans-CondensedBold')
      .text(`${i + 1}. ${section.title || 'Untitled'}`, MARGIN, yPos);
    if (section.subtitle) {
      doc.fillColor(GMO_COLORS.textSecondary)
        .fontSize(11)
        .font('BNPPSans-Light')
        .text(section.subtitle, MARGIN + 20, yPos + 18);
      yPos += 50;
    } else {
      yPos += 35;
    }
  });

  // Content sections
  contentSections.forEach((section, i) => {
    doc.addPage();

    // Title
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
    let yStart = MARGIN + 50;
    if (section.subtitle) {
      doc.fillColor(GMO_COLORS.textSecondary)
        .fontSize(14)
        .font('BNPPSans-Light')
        .text(section.subtitle, MARGIN, yStart);
      yStart += 30;
    }

    // Content
    const plainText = portableTextToPlain(section.content);
    doc.fillColor(GMO_COLORS.textPrimary)
      .fontSize(11)
      .font('BNPPSans-Light')
      .text(plainText, MARGIN, yStart + 20, {
        width: section.hasChart ? 350 : 700,
        lineGap: 4
      });

    // Chart placeholder
    if (section.hasChart) {
      doc.rect(450, yStart + 20, 340, 250)
        .stroke(GMO_COLORS.primaryGreen);
      doc.fillColor(GMO_COLORS.textSecondary)
        .fontSize(12)
        .font('BNPPSans-Light')
        .text('[Chart: ' + (section.chartType || 'unknown') + ']', 450, yStart + 130, {
          width: 340,
          align: 'center'
        });

      if (section.chartSource) {
        doc.fontSize(9)
          .font('BNPPSans-Light')
          .text('Source: ' + section.chartSource, 450, yStart + 280, { width: 340 });
      }
    }
  });

  doc.end();

  return outputPath;
}

// Main
async function main() {
  console.log('Fetching report from Sanity...');
  const report = await fetchReport();

  if (!report) {
    console.error('No report found!');
    process.exit(1);
  }

  console.log(`Found report: ${report.title}`);
  console.log(`Sections: ${report.sections?.length || 0}`);

  console.log('Generating PDF...');
  const outputPath = await generatePDF(report);

  console.log(`\nPDF generated: ${outputPath}`);
  console.log('Open with: open ' + outputPath);
}

main().catch(console.error);
