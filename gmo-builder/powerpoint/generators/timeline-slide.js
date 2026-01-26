/**
 * Timeline Section Slide Generator
 * Generates slides with horizontal timeline items
 */

/**
 * Generate a timeline section slide
 * @param {Object} slide - pptxgenjs slide object
 * @param {Object} section - Sanity timelineSection data
 * @param {Object} options - { layout, config, pptx }
 */
export function generateTimelineSlide(slide, section, options) {
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

  // Timeline items
  const timelineConfig = layout.timeline || {
    items: [
      { numberX: 0.5, numberY: 2.26, numberSize: 0.94, contentX: 0.36, contentY: 3.34, contentW: 3.16, contentH: 1.52 },
      { numberX: 5.0, numberY: 2.26, numberSize: 0.94, contentX: 4.88, contentY: 3.34, contentW: 3.42, contentH: 1.52 },
      { numberX: 9.36, numberY: 2.26, numberSize: 0.94, contentX: 9.23, contentY: 3.34, contentW: 3.42, contentH: 1.52 }
    ]
  };

  const items = section.items || [];
  const itemColors = [colors.primary, colors.teal, colors.cyan, colors.orange, colors.brown];

  items.forEach((item, index) => {
    if (index >= timelineConfig.items.length) return; // Max items based on layout

    const pos = timelineConfig.items[index];
    const itemColor = itemColors[index % itemColors.length];

    // Number circle
    slide.addShape('ellipse', {
      x: pos.numberX,
      y: pos.numberY,
      w: pos.numberSize,
      h: pos.numberSize,
      fill: { color: itemColor }
    });

    // Number text
    const numText = item.number || String(index + 1).padStart(2, '0');
    slide.addText(numText, {
      x: pos.numberX,
      y: pos.numberY,
      w: pos.numberSize,
      h: pos.numberSize,
      fontSize: 36,
      bold: true,
      fontFace: fonts.title.face,
      color: colors.white,
      align: 'center',
      valign: 'middle'
    });

    // Item header (if exists)
    if (item.header) {
      slide.addText(item.header, {
        x: pos.contentX,
        y: pos.contentY - 0.4,
        w: pos.contentW,
        h: 0.3,
        fontSize: 14,
        bold: true,
        fontFace: fonts.title.face,
        color: colors.text
      });
    }

    // Item body/description
    const bodyText = item.body || item.description || '';
    if (bodyText) {
      // Handle PortableText or plain string
      let textContent = bodyText;
      if (Array.isArray(bodyText)) {
        textContent = bodyText
          .filter(block => block._type === 'block')
          .map(block => block.children?.map(c => c.text).join('') || '')
          .join('\n');
      }

      slide.addText(textContent, {
        x: pos.contentX,
        y: pos.contentY,
        w: pos.contentW,
        h: pos.contentH,
        fontSize: 12,
        fontFace: fonts.body.face,
        color: colors.text,
        valign: 'top'
      });
    }

    // Item image (if exists)
    if (item.image?.asset?.url) {
      try {
        slide.addImage({
          path: item.image.asset.url,
          x: pos.numberX + pos.numberSize + 0.2,
          y: pos.numberY,
          w: 1.5,
          h: 1.0
        });
      } catch (e) {
        console.warn('Could not add timeline item image:', e.message);
      }
    }
  });

  // Connecting line between timeline items (optional visual enhancement)
  if (items.length > 1 && timelineConfig.items.length > 1) {
    const firstItem = timelineConfig.items[0];
    const lastItem = timelineConfig.items[Math.min(items.length - 1, timelineConfig.items.length - 1)];

    const lineY = firstItem.numberY + (firstItem.numberSize / 2);
    const lineStartX = firstItem.numberX + firstItem.numberSize;
    const lineEndX = lastItem.numberX;

    slide.addShape('line', {
      x: lineStartX,
      y: lineY,
      w: lineEndX - lineStartX,
      h: 0,
      line: { color: colors.textSecondary, width: 2, dashType: 'dash' }
    });
  }
}

export default { generateTimelineSlide };
