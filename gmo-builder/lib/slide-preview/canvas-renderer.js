/**
 * Canvas Renderer Utilities for Slide Preview Generation
 *
 * Provides utilities for rendering PowerPoint slide previews using node-canvas.
 * Mirrors the layout specifications from pptx-export.js TEMPLATE_CONFIG.
 */

import { createCanvas, loadImage } from 'canvas';

// Slide dimensions (16:9 widescreen, matching PPTX LAYOUT_WIDE)
export const SLIDE_WIDTH = 1280;   // 13.33 inches × 96 DPI
export const SLIDE_HEIGHT = 720;   // 7.5 inches × 96 DPI
const DPI = 96;

/**
 * Template configuration matching pptx-export.js
 * Positions are in inches, converted to pixels at render time
 */
export const TEMPLATE_CONFIG = {
  colors: {
    primary: '#009FB1',
    teal: '#51BBB4',
    cyan: '#61C3D7',
    orange: '#F49F7B',
    brown: '#A37767',
    white: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#5F5F5F'
  },
  fonts: {
    title: { family: 'Arial', size: 24, weight: 'bold' },
    subtitle: { family: 'Arial', size: 16, weight: 'normal' },
    body: { family: 'Arial', size: 12, weight: 'normal' },
    source: { family: 'Arial', size: 10, style: 'italic' },
    sectionNumber: { family: 'Arial', size: 32, weight: 'bold' }
  },
  slideTypes: {
    title: {
      title: { x: 0.5, y: 3.0, w: 7.6, h: 1.5, fontSize: 48 },
      subtitle: { x: 0.5, y: 4.67, w: 4.0, h: 0.4, fontSize: 16 }
    },
    tableOfContents: {
      title: { x: 0.5, y: 0.29, w: 12.3, h: 0.39, fontSize: 24 },
      cards: {
        startX: 0.5, startY: 1.7, cardWidth: 2.25, cardHeight: 5.0,
        spacing: 0.26, numberY: 2.02, numberSize: 32, blurbY: 2.95,
        colors: ['#009FB1', '#51BBB4', '#61C3D7', '#F49F7B', '#A37767']
      }
    },
    sectionDivider: {
      sectionName: { x: 0.46, y: 2.7, w: 6.2, h: 0.65, fontSize: 48 },
      image: { x: 7.24, y: 0.88, w: 5.74, h: 5.74 }
    },
    chartSection: {
      sectionNumber: { x: 0.5, y: 0.36, w: 0.72, h: 0.72 },
      numberText: { x: 0.5, y: 0.42, w: 0.72, h: 0.64, fontSize: 32 },
      title: { x: 1.21, y: 0.43, w: 11.86, h: 0.36, fontSize: 24 },
      subtitle: { x: 1.24, y: 0.85, w: 11.86, h: 0.24, fontSize: 16 },
      source: { x: 0.5, y: 6.14, w: 12.47, h: 0.29, fontSize: 10 },
      leftPanel: { content: { x: 0.5, y: 3.48, w: 2.5, h: 2.69, fontSize: 10 } },
      chartTitle: { x: 3.35, y: 1.57, w: 4.44, h: 0.2, fontSize: 12 },
      chart: { x: 3.33, y: 1.93, w: 7.61, h: 3.94 }
    },
    insightsSection: {
      title: { x: 0.5, y: 0.29, w: 12.33, h: 0.39, fontSize: 24 },
      subtitle: { x: 0.5, y: 0.81, w: 5.77, h: 0.23, fontSize: 16 },
      source: { x: 0.5, y: 6.27, w: 9.04, h: 0.33, fontSize: 10 },
      chartTitle: { x: 0.5, y: 1.46, w: 2.48, h: 0.2, fontSize: 12 },
      chart: { x: 0.47, y: 1.85, w: 8.66, h: 4.33 },
      insightsPanel: { x: 9.79, y: 0, w: 3.54, h: 7.5, dividerX: 9.53, dividerW: 0.26 },
      insightsTitle: { x: 10.28, y: 1.46, w: 1.14, h: 0.2, fontSize: 12 },
      insightsList: { x: 10.28, y: 1.78, w: 3.28, h: 3.28 }
    },
    timelineSection: {
      title: { x: 0.5, y: 0.29, w: 12.33, h: 0.39, fontSize: 24 },
      subtitle: { x: 0.5, y: 0.81, w: 5.77, h: 0.23, fontSize: 16 },
      items: [
        { numberX: 0.5, numberY: 2.26, contentX: 0.4, contentY: 3.34, contentW: 3.4 },
        { numberX: 4.7, numberY: 2.26, contentX: 4.6, contentY: 3.34, contentW: 3.4 },
        { numberX: 8.9, numberY: 2.26, contentX: 8.8, contentY: 3.34, contentW: 3.4 }
      ]
    }
  }
};

/**
 * Convert inches to pixels
 */
export function inchesToPixels(inches) {
  return Math.round(inches * DPI);
}

/**
 * Create a new canvas for slide rendering
 */
export function createSlideCanvas() {
  return createCanvas(SLIDE_WIDTH, SLIDE_HEIGHT);
}

/**
 * Normalize color - ensures hex format with # prefix
 */
export function normalizeColor(color, defaultColor = '#009FB1') {
  if (!color) return defaultColor;
  if (color.startsWith('#')) return color;
  return `#${color}`;
}

/**
 * Get theme color from theme name
 */
export function getThemeColor(themeName) {
  const themeMap = {
    blue: TEMPLATE_CONFIG.colors.primary,
    green: TEMPLATE_CONFIG.colors.teal,
    teal: TEMPLATE_CONFIG.colors.cyan,
    orange: TEMPLATE_CONFIG.colors.orange,
    brown: TEMPLATE_CONFIG.colors.brown,
    mint: '#9DD9C7',
    none: TEMPLATE_CONFIG.colors.white
  };
  return themeMap[themeName] || TEMPLATE_CONFIG.colors.primary;
}

/**
 * Determine if background is dark (for text color selection)
 */
export function isDarkBackground(hexColor) {
  if (!hexColor || hexColor.length < 4) return true;
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Draw a rounded rectangle
 */
export function drawRoundedRect(ctx, x, y, w, h, radius = 0) {
  if (radius === 0) {
    ctx.fillRect(x, y, w, h);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw an ellipse (for section number badges)
 */
export function drawEllipse(ctx, x, y, w, h) {
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  const radiusX = w / 2;
  const radiusY = h / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.fill();
}

/**
 * Draw text with word wrapping
 */
export function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
  const { align = 'left', maxLines = Infinity } = options;

  if (!text) return y;

  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      if (lineCount >= maxLines - 1 && i < words.length - 1) {
        // Truncate with ellipsis on last allowed line
        line = line.trim() + '...';
      }

      let drawX = x;
      if (align === 'center') {
        drawX = x + (maxWidth - ctx.measureText(line).width) / 2;
      } else if (align === 'right') {
        drawX = x + maxWidth - ctx.measureText(line).width;
      }

      ctx.fillText(line, drawX, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      lineCount++;

      if (lineCount >= maxLines) break;
    } else {
      line = testLine;
    }
  }

  // Draw remaining text
  if (line.trim() && lineCount < maxLines) {
    let drawX = x;
    if (align === 'center') {
      drawX = x + (maxWidth - ctx.measureText(line).width) / 2;
    } else if (align === 'right') {
      drawX = x + maxWidth - ctx.measureText(line).width;
    }
    ctx.fillText(line, drawX, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

/**
 * Draw bullet points
 */
export function drawBulletPoints(ctx, items, x, y, maxWidth, lineHeight, options = {}) {
  const { bulletChar = '\u2022', bulletIndent = 20 } = options;
  let currentY = y;

  for (const item of items) {
    if (!item) continue;

    // Draw bullet
    ctx.fillText(bulletChar, x, currentY);

    // Draw text with wrapping
    currentY = drawWrappedText(
      ctx,
      item,
      x + bulletIndent,
      currentY,
      maxWidth - bulletIndent,
      lineHeight
    );

    currentY += lineHeight * 0.3; // Extra spacing between bullets
  }

  return currentY;
}

/**
 * Set font on canvas context
 */
export function setFont(ctx, size, weight = 'normal', style = 'normal', family = 'Arial') {
  ctx.font = `${style} ${weight} ${size}px ${family}`;
}

/**
 * Load an image from URL or base64
 */
export async function loadImageSafe(src) {
  try {
    return await loadImage(src);
  } catch (error) {
    console.error('[Canvas] Failed to load image:', error.message);
    return null;
  }
}

/**
 * Convert Sanity Portable Text blocks to plain text lines
 */
export function portableTextToLines(blocks) {
  if (!blocks || !Array.isArray(blocks)) return [];
  return blocks
    .filter(block => block._type === 'block')
    .map(block => block.children?.map(c => c.text).join('') || '')
    .filter(Boolean);
}

/**
 * Export canvas to base64 PNG
 */
export function canvasToBase64(canvas) {
  return canvas.toBuffer('image/png').toString('base64');
}
