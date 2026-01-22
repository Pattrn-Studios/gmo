/**
 * BNPP Design System - Main Entry Point
 *
 * This module re-exports all design token utilities for easy consumption.
 *
 * Usage:
 *   import { GMO_COLORS, chartColors, generateCSSVariablesString } from './lib/design-tokens/index.js';
 */

// Re-export colors
export {
  colors,
  chartColors,
  editorialColors,
  textColors,
  surfaceColors,
  backgroundColors,
  lineColors,
  iconColors,
  buttonColors,
  overlayColors,
  navigationColors,
  interactionColors,
  getColor,
  getAccentColors,
  getAccentBackground,
} from './colors.js';

// Re-export typography
export {
  typography,
  fontFamilies,
  fontSizes,
  lineHeights,
  fontWeights,
  typeStyles,
  mobileTypeStyles,
  responsiveTypography,
  getFontSize,
  getLineHeight,
} from './typography.js';

// Re-export CSS utilities
export {
  generateCSSVariables,
  generateCSSVariablesString,
  generateCSSRootBlock,
  getEditorialThemeVars,
} from './css.js';

// Re-export legacy compatibility
export {
  GMO_COLORS,
  CHART_PALETTE,
  getLegacyColor,
} from './legacy.js';

// Import raw tokens for direct access if needed
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
export const tokens = require('./bnpp-tokens.json');
