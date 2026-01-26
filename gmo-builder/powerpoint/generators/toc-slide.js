/**
 * Table of Contents Slide Generator
 * Generates the navigation/TOC slide with section cards
 */

/**
 * Generate a table of contents slide
 * @param {Object} slide - pptxgenjs slide object
 * @param {Object} section - Sanity navigationSection data
 * @param {Object} options - { layout, config, pptx }
 */
export function generateTOCSlide(slide, section, options) {
  const { layout, config } = options;
  const colors = config.colors;
  const fonts = config.fonts;

  // White background
  slide.bkgd = colors.white;

  // Title
  const titleLayout = layout.title || { x: 0.5, y: 0.29, w: 12.3, h: 0.39 };
  slide.addText(section.title || 'TABLE OF CONTENTS', {
    x: titleLayout.x,
    y: titleLayout.y,
    w: titleLayout.w,
    h: titleLayout.h,
    fontSize: titleLayout.fontSize || 24,
    bold: titleLayout.bold !== false,
    fontFace: fonts.title.face,
    color: colors.text
  });

  // Cards configuration
  const cardsConfig = layout.cards || {
    startX: 0.5,
    startY: 1.7,
    cardWidth: 2.25,
    cardHeight: 5.0,
    spacing: 0.26,
    numberY: 2.02,
    numberSize: 32,
    blurbY: 2.95,
    blurbHeight: 1.58,
    colors: ['009FB1', '51BBB4', '61C3D7', 'F49F7B', 'A37767']
  };

  // Generate cards for each section
  const items = section.cardImages || section.items || [];
  const cardColors = cardsConfig.colors;

  items.forEach((item, index) => {
    if (index >= 5) return; // Max 5 cards

    const cardX = cardsConfig.startX + (index * (cardsConfig.cardWidth + cardsConfig.spacing));
    const cardColor = cardColors[index % cardColors.length];

    // Card background
    slide.addShape('rect', {
      x: cardX,
      y: cardsConfig.startY,
      w: cardsConfig.cardWidth,
      h: cardsConfig.cardHeight,
      fill: { color: cardColor }
    });

    // Section number circle (white)
    slide.addShape('ellipse', {
      x: cardX + 0.25,
      y: cardsConfig.numberY - 0.1,
      w: 0.72,
      h: 0.72,
      fill: { color: colors.white }
    });

    // Section number text
    const sectionNum = String(index + 1).padStart(2, '0');
    slide.addText(sectionNum, {
      x: cardX + 0.25,
      y: cardsConfig.numberY,
      w: 0.72,
      h: 0.64,
      fontSize: cardsConfig.numberSize || 32,
      bold: true,
      fontFace: fonts.title.face,
      color: cardColor,
      align: 'center',
      valign: 'middle'
    });

    // Blurb/description text
    const blurbText = item.description || item.title || item.blurb || '';
    if (blurbText) {
      slide.addText(blurbText, {
        x: cardX + 0.25,
        y: cardsConfig.blurbY,
        w: cardsConfig.cardWidth - 0.5,
        h: cardsConfig.blurbHeight,
        fontSize: 12,
        fontFace: fonts.body.face,
        color: colors.white,
        valign: 'top'
      });
    }

    // Card image (bottom portion)
    if (item.image?.asset?.url) {
      try {
        slide.addImage({
          path: item.image.asset.url,
          x: cardX,
          y: cardsConfig.imageY || 4.91,
          w: cardsConfig.cardWidth,
          h: cardsConfig.imageHeight || 1.8
        });
      } catch (e) {
        console.warn('Could not add card image:', e.message);
      }
    }
  });
}

export default { generateTOCSlide };
