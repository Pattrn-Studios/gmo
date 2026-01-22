/**
 * BNPP Design System - Typography Exports
 *
 * This module provides typography utilities and exports from the BNPP design tokens.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const tokens = require('./bnpp-tokens.json');

// Full typography hierarchy from tokens
export const typography = tokens.type;

// Font families with fallbacks
export const fontFamilies = {
  // Primary - BNPP Sans Condensed (for headlines, display text)
  primary: `"${tokens.type.style.primary}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  // Secondary - BNPP Sans (for body text)
  secondary: `"${tokens.type.style.secondary}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  // Raw font names (for PDFKit registration)
  raw: {
    primary: tokens.type.style.primary,       // "BNPP Sans Condensed"
    secondary: tokens.type.style.secondary,   // "BNPP Sans"
  },
};

// Font sizes
export const fontSizes = {
  desktop: tokens.type.size.desktop,
  mobile: tokens.type.size.mobile,
};

// Line heights
export const lineHeights = {
  desktop: tokens.type.lineHeight.desktop,
  mobile: tokens.type.lineHeight.mobile,
};

// Font weights
export const fontWeights = {
  light: 300,
  regular: 400,
  semibold: 600,
  bold: 700,
  // String values for PDFKit
  strings: tokens.type.weight,
};

// Preset type styles for common use cases
export const typeStyles = {
  // Display styles (large headlines)
  displayXL: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.desktop.display.xl}px`,
    lineHeight: lineHeights.desktop.display.xl,
    fontWeight: fontWeights.bold,
  },
  displayLG: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.desktop.display.lg}px`,
    lineHeight: lineHeights.desktop.display.lg,
    fontWeight: fontWeights.bold,
  },
  displayMD: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.desktop.display.md}px`,
    lineHeight: lineHeights.desktop.display.md,
    fontWeight: fontWeights.bold,
  },
  displaySM: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.desktop.display.sm}px`,
    lineHeight: lineHeights.desktop.display.sm,
    fontWeight: fontWeights.bold,
  },

  // Title styles (section headers)
  titleXL: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.desktop.title.xl}px`,
    lineHeight: lineHeights.desktop.title.xl,
    fontWeight: fontWeights.bold,
  },
  titleLG: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.desktop.title.lg}px`,
    lineHeight: lineHeights.desktop.title.lg,
    fontWeight: fontWeights.bold,
  },
  titleMD: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.desktop.title.md}px`,
    lineHeight: lineHeights.desktop.title.md,
    fontWeight: fontWeights.bold,
  },
  titleXS: {
    fontFamily: fontFamilies.secondary,
    fontSize: `${fontSizes.desktop.title.xs}px`,
    lineHeight: lineHeights.desktop.title.xs,
    fontWeight: fontWeights.light,
  },

  // Body styles
  bodyLG: {
    fontFamily: fontFamilies.secondary,
    fontSize: `${fontSizes.desktop.body.lg}px`,
    lineHeight: lineHeights.desktop.body.lg,
    fontWeight: fontWeights.light,
  },
  bodyMD: {
    fontFamily: fontFamilies.secondary,
    fontSize: `${fontSizes.desktop.body.md}px`,
    lineHeight: lineHeights.desktop.body.md,
    fontWeight: fontWeights.light,
  },
  bodySM: {
    fontFamily: fontFamilies.secondary,
    fontSize: `${fontSizes.desktop.body.sm}px`,
    lineHeight: lineHeights.desktop.body.sm,
    fontWeight: fontWeights.regular,
  },
  bodyXS: {
    fontFamily: fontFamilies.secondary,
    fontSize: `${fontSizes.desktop.body.xs}px`,
    lineHeight: lineHeights.desktop.body.xs,
    fontWeight: fontWeights.light,
  },
  bodyXXS: {
    fontFamily: fontFamilies.secondary,
    fontSize: `${fontSizes.desktop.body.xxs}px`,
    lineHeight: lineHeights.desktop.body.xxs,
    fontWeight: fontWeights.light,
  },
};

// Mobile type styles
export const mobileTypeStyles = {
  displayXL: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.mobile.display.xl}px`,
    lineHeight: lineHeights.mobile.display.xl,
    fontWeight: fontWeights.bold,
  },
  displayLG: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.mobile.display.lg}px`,
    lineHeight: lineHeights.mobile.display.lg,
    fontWeight: fontWeights.bold,
  },
  titleXL: {
    fontFamily: fontFamilies.primary,
    fontSize: `${fontSizes.mobile.title.xl}px`,
    lineHeight: lineHeights.mobile.title.xl,
    fontWeight: fontWeights.bold,
  },
  bodyLG: {
    fontFamily: fontFamilies.secondary,
    fontSize: `${fontSizes.mobile.body.lg}px`,
    lineHeight: lineHeights.mobile.body.lg,
    fontWeight: fontWeights.light,
  },
  bodyMD: {
    fontFamily: fontFamilies.secondary,
    fontSize: `${fontSizes.mobile.body.md}px`,
    lineHeight: lineHeights.mobile.body.md,
    fontWeight: fontWeights.light,
  },
};

// CSS clamp values for responsive typography
export const responsiveTypography = {
  displayXL: `clamp(${fontSizes.mobile.display.xl}px, 5vw, ${fontSizes.desktop.display.xl}px)`,
  displayLG: `clamp(${fontSizes.mobile.display.lg}px, 4.5vw, ${fontSizes.desktop.display.lg}px)`,
  displayMD: `clamp(${fontSizes.mobile.display.md}px, 4vw, ${fontSizes.desktop.display.md}px)`,
  displaySM: `clamp(${fontSizes.mobile.display.sm}px, 3.5vw, ${fontSizes.desktop.display.sm}px)`,
  titleXL: `clamp(${fontSizes.mobile.title.xl}px, 3vw, ${fontSizes.desktop.title.xl}px)`,
  titleLG: `clamp(${fontSizes.mobile.title.lg}px, 2.5vw, ${fontSizes.desktop.title.lg}px)`,
  titleMD: `clamp(${fontSizes.mobile.title.md}px, 2vw, ${fontSizes.desktop.title.md}px)`,
};

/**
 * Get font size for a specific category and size
 * @param {'display'|'title'|'body'} category
 * @param {'xl'|'lg'|'md'|'sm'|'xs'|'xxs'} size
 * @param {'desktop'|'mobile'} breakpoint
 * @returns {number} Font size in pixels
 */
export function getFontSize(category, size, breakpoint = 'desktop') {
  return tokens.type.size[breakpoint]?.[category]?.[size];
}

/**
 * Get line height for a specific category and size
 * @param {'display'|'title'|'body'} category
 * @param {'xl'|'lg'|'md'|'sm'|'xs'|'xxs'} size
 * @param {'desktop'|'mobile'} breakpoint
 * @returns {number} Line height in pixels
 */
export function getLineHeight(category, size, breakpoint = 'desktop') {
  return tokens.type.lineHeight[breakpoint]?.[category]?.[size];
}
