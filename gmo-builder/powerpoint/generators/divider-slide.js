/**
 * Section Divider Slide Generator
 * Generates full-bleed section separator slides
 */

import { normalizeColor } from '../../lib/powerpoint/color-utils.js';

/**
 * Generate a section divider slide
 * @param {Object} slide - pptxgenjs slide object
 * @param {Object} section - Sanity headerSection data
 * @param {Object} options - { layout, config, pptx }
 */
export function generateDividerSlide(slide, section, options) {
  const { layout, config } = options;
  const colors = config.colors;
  const fonts = config.fonts;

  // Background color - normalize to handle named colors
  const bgColor = normalizeColor(section.backgroundColor, layout.background?.fillColor || colors.cyan);
  slide.bkgd = bgColor;

  // Section name/title
  const sectionNameLayout = layout.sectionName || { x: 0.46, y: 2.7, w: 6.2, h: 0.65 };
  slide.addText(section.title || 'Section Title', {
    x: sectionNameLayout.x,
    y: sectionNameLayout.y,
    w: sectionNameLayout.w,
    h: sectionNameLayout.h,
    fontSize: sectionNameLayout.fontSize || 48,
    bold: sectionNameLayout.bold !== false,
    fontFace: fonts.title.face,
    color: colors.white,
    valign: 'middle'
  });

  // Subtitle (if exists)
  if (section.subtitle) {
    slide.addText(section.subtitle, {
      x: sectionNameLayout.x,
      y: sectionNameLayout.y + sectionNameLayout.h + 0.2,
      w: sectionNameLayout.w,
      h: 0.4,
      fontSize: 20,
      fontFace: fonts.subtitle.face,
      color: colors.white
    });
  }

  // Section image (right side)
  const imageLayout = layout.image || { x: 7.24, y: 0.88, w: 5.74, h: 5.74 };
  if (section.image?.asset?.url) {
    try {
      slide.addImage({
        path: section.image.asset.url,
        x: imageLayout.x,
        y: imageLayout.y,
        w: imageLayout.w,
        h: imageLayout.h
      });
    } catch (e) {
      console.warn('Could not add section image:', e.message);
    }
  }
}

export default { generateDividerSlide };
