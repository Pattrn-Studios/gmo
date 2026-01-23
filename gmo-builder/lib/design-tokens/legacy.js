/**
 * BNPP Design System - Legacy Compatibility Layer
 *
 * This module provides backward-compatible exports matching the old GMO_COLORS object.
 * Use this during migration or for files that haven't been updated to use semantic tokens.
 *
 * @deprecated Prefer using named imports from colors.js for new code:
 *   import { chartColors, textColors, surfaceColors } from './colors.js';
 */

import {
  chartColors,
  textColors,
  surfaceColors,
  backgroundColors,
  sectionThemes,
  pdfChartColors,
  keyInsightsColors,
} from './colors.js';

/**
 * Legacy GMO_COLORS object for backward compatibility
 * Maps old property names to new token values
 *
 * @deprecated Use semantic color imports instead
 */
export const GMO_COLORS = {
  // Primary colors (chart palette order)
  primaryGreen: surfaceColors.secondary,     // #3E7274 - Blue Dianne
  coastBlue: chartColors[1],                  // #3D748F - Coast/Accent-4
  copper: chartColors[2],                     // #AC5359 - Metallic Copper/Accent-3
  orange: surfaceColors.tertiary,             // #F07662 - Tertiary
  lightGreen: surfaceColors.primary,          // #3A7862 - Silver Tree/Accent-1
  darkBlue: chartColors[5],                   // #132728 - Firefly/Accent-5

  // Text colors
  textPrimary: textColors.primary,           // #1A1A1A
  textSecondary: textColors.secondary,       // #5F5F5F
  textInverse: textColors.inverse,           // #FFFFFF

  // Background colors
  bgPrimary: backgroundColors.primary,       // #FFFFFF
  bgSecondary: backgroundColors.secondary,   // #F7F5F3

  // Section theme backgrounds (from PDF reference)
  sectionMarketThemes: sectionThemes['market-themes'].background,    // #7CC5D9 - Light Cyan
  sectionAiCapex: sectionThemes['ai-capex'].background,              // #E8967B - Coral
  sectionOurView: sectionThemes['our-view'].background,              // #008252 - BNPP Green
  sectionDecember: sectionThemes['december-review'].background,      // #9DD9C7 - Light Mint
  sectionAppendix: sectionThemes['appendix'].background,             // #008252 - BNPP Green

  // Key insights sidebar
  keyInsightsBg: keyInsightsColors.background,  // #008252 - BNPP Green
  keyInsightsText: keyInsightsColors.text,      // #FFFFFF

  // PDF chart palette
  chartPdfPrimary: pdfChartColors[0],    // #E86E58 - Coral/Red
  chartPdfSecondary: pdfChartColors[1],  // #3E7274 - Teal
  chartPdfTertiary: pdfChartColors[2],   // #C9A227 - Gold
};

/**
 * Chart colors array for Highcharts and other charting libraries
 * @deprecated Use chartColors from colors.js instead
 */
export const CHART_PALETTE = chartColors;

/**
 * PDF-matched chart colors (from reference PDF)
 * @deprecated Use pdfChartColors from colors.js instead
 */
export const PDF_CHART_PALETTE = pdfChartColors;

/**
 * Get a legacy color by name
 * @param {string} name - Color name (e.g., 'primaryGreen', 'textPrimary')
 * @returns {string|undefined} Hex color value
 * @deprecated Use semantic color exports instead
 */
export function getLegacyColor(name) {
  return GMO_COLORS[name];
}

/**
 * Get section theme colors by name
 * @param {string} sectionType - Section type (e.g., 'market-themes', 'ai-capex')
 * @returns {object} Theme colors with background and text
 */
export function getSectionThemeColors(sectionType) {
  return sectionThemes[sectionType] || sectionThemes['default'];
}
