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
};

/**
 * Chart colors array for Highcharts and other charting libraries
 * @deprecated Use chartColors from colors.js instead
 */
export const CHART_PALETTE = chartColors;

/**
 * Get a legacy color by name
 * @param {string} name - Color name (e.g., 'primaryGreen', 'textPrimary')
 * @returns {string|undefined} Hex color value
 * @deprecated Use semantic color exports instead
 */
export function getLegacyColor(name) {
  return GMO_COLORS[name];
}
