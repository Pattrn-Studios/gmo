/**
 * PowerPoint Export
 * Main export function that generates PowerPoint from Sanity report data
 */

import pptxgen from 'pptxgenjs';
import { loadTemplateConfig } from '../lib/powerpoint/template-loader.js';

// Import slide generators
import { generateTitleSlide } from './generators/title-slide.js';
import { generateTOCSlide } from './generators/toc-slide.js';
import { generateDividerSlide } from './generators/divider-slide.js';
import { generateChartSlide } from './generators/chart-slide.js';
import { generateInsightsSlide } from './generators/insights-slide.js';
import { generateTimelineSlide } from './generators/timeline-slide.js';

/**
 * Map Sanity section _type to slide generator
 */
const SECTION_TYPE_MAP = {
  // Sanity _type -> { generator, templateSlideType }
  titleSection: { generator: generateTitleSlide, templateType: 'title' },
  navigationSection: { generator: generateTOCSlide, templateType: 'tableOfContents' },
  headerSection: { generator: generateDividerSlide, templateType: 'sectionDivider' },
  contentSection: { generator: generateChartSlide, templateType: 'chartSection' },
  chartInsightsSection: { generator: generateInsightsSlide, templateType: 'insightsSection' },
  timelineSection: { generator: generateTimelineSlide, templateType: 'timelineSection' }
};

/**
 * Export a Sanity report to PowerPoint
 * @param {Object} report - Full report object from Sanity
 * @returns {Promise<Buffer>} PowerPoint file as buffer
 */
export async function exportToPowerPoint(report) {
  if (!report) {
    throw new Error('Report is required');
  }

  // Load template configuration
  const templateConfig = loadTemplateConfig();

  // Create presentation
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5" (matches template)
  pptx.title = report.title || 'GMO Report';
  pptx.author = report.author || 'BNP Paribas Asset Management';
  pptx.company = 'BNP Paribas Asset Management';
  pptx.subject = 'Global Market Outlook';

  // Track section numbers for chart sections
  let sectionNumber = 0;

  // Process each section
  const sections = report.sections || [];

  for (const section of sections) {
    const sectionType = section._type;
    const mapping = SECTION_TYPE_MAP[sectionType];

    if (!mapping) {
      console.warn(`Unknown section type: ${sectionType}, skipping`);
      continue;
    }

    // Increment section number for content sections
    if (sectionType === 'contentSection' || sectionType === 'chartInsightsSection') {
      sectionNumber++;
    }

    // Get layout for this slide type
    const layout = templateConfig.slideTypes[mapping.templateType];

    if (!layout) {
      console.warn(`No layout found for slide type: ${mapping.templateType}, using defaults`);
    }

    // Add slide
    const slide = pptx.addSlide();

    // Generate slide content
    try {
      await mapping.generator(slide, section, {
        layout: layout || {},
        config: templateConfig,
        sectionNumber,
        pptx
      });
    } catch (error) {
      console.error(`Error generating ${sectionType} slide:`, error.message);
      // Add error placeholder
      slide.addText(`Error generating slide: ${error.message}`, {
        x: 0.5,
        y: 3,
        w: 12,
        h: 1,
        fontSize: 14,
        color: 'FF0000'
      });
    }
  }

  // Generate PowerPoint buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

/**
 * Export a single section to PowerPoint (for testing)
 * @param {Object} section - Single section from Sanity
 * @returns {Promise<Buffer>} PowerPoint file as buffer
 */
export async function exportSectionToPowerPoint(section) {
  return exportToPowerPoint({
    title: 'Section Preview',
    sections: [section]
  });
}

export default {
  exportToPowerPoint,
  exportSectionToPowerPoint
};
