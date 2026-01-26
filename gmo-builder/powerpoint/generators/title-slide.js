/**
 * Title Slide Generator
 * Generates the report cover/title slide
 */

/**
 * Generate a title slide
 * @param {Object} slide - pptxgenjs slide object
 * @param {Object} section - Sanity titleSection data
 * @param {Object} options - { layout, config, pptx }
 */
export function generateTitleSlide(slide, section, options) {
  const { layout, config } = options;
  const colors = config.colors;
  const fonts = config.fonts;

  // Background color (use section backgroundColor or default)
  const bgColor = section.backgroundColor?.replace('#', '') || colors.primary;
  slide.bkgd = bgColor;

  // Title
  const titleLayout = layout.title || { x: 0.5, y: 3.0, w: 7.6, h: 1.5 };
  slide.addText(section.heading || section.title || 'Global Market Outlook', {
    x: titleLayout.x,
    y: titleLayout.y,
    w: titleLayout.w,
    h: titleLayout.h,
    fontSize: titleLayout.fontSize || 48,
    bold: titleLayout.bold !== false,
    fontFace: fonts.title.face,
    color: colors.white,
    valign: 'middle'
  });

  // Subtitle / Date
  if (section.subheading || section.subtitle) {
    const subtitleLayout = layout.subtitle || { x: 0.5, y: 4.67, w: 4.0, h: 0.4 };
    slide.addText(section.subheading || section.subtitle, {
      x: subtitleLayout.x,
      y: subtitleLayout.y,
      w: subtitleLayout.w,
      h: subtitleLayout.h,
      fontSize: subtitleLayout.fontSize || 16,
      fontFace: fonts.subtitle.face,
      color: colors.white,
      valign: 'middle'
    });
  }

  // Disclaimer text (top of slide)
  const disclaimerLayout = layout.disclaimer || { x: 0.5, y: 0.27, w: 11.2, h: 0.45 };
  const disclaimerText = 'This material is for information purposes only and intended to broaden readers\' awareness of financial markets and of the investment management industry. No part of the material should be construed to represent financial advice or an offer to buy, sell or otherwise participate in any investment activity or strategy.';

  slide.addText(disclaimerText, {
    x: disclaimerLayout.x,
    y: disclaimerLayout.y,
    w: disclaimerLayout.w,
    h: disclaimerLayout.h,
    fontSize: disclaimerLayout.fontSize || 9,
    bold: disclaimerLayout.bold || true,
    fontFace: fonts.body.face,
    color: colors.white
  });

  // Logo (if provided as URL)
  if (section.companyLogo?.asset?.url) {
    try {
      slide.addImage({
        path: section.companyLogo.asset.url,
        x: 10.5,
        y: 0.5,
        w: 2.5,
        h: 0.8
      });
    } catch (e) {
      console.warn('Could not add logo image:', e.message);
    }
  }
}

export default { generateTitleSlide };
