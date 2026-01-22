/**
 * BNPP Design System - CommonJS Export for gmo-chart-agent
 *
 * This module provides design tokens compatible with CommonJS for the Express server.
 * It mirrors the ESM version in gmo-builder/lib/design-tokens/ for consistency.
 *
 * @see gmo-builder/lib/design-tokens/ for the full ESM version with all utilities
 */

// Chart color palette (ordered for data visualization)
const chartColors = [
  '#3E7274', // Blue Dianne (primary chart color)
  '#3D748F', // Coast Blue
  '#AC5359', // Metallic Copper
  '#F07662', // Tertiary/Orange
  '#3A7862', // Silver Tree Green
  '#132728', // Firefly Dark
  '#955073', // Plum
];

// Semantic text colors
const textColors = {
  primary: '#1A1A1A',
  secondary: '#5F5F5F',
  brand: '#008252',
  error: '#C91432',
  inverse: '#FFFFFF',
  inverseSecondary: '#F7F5F3',
};

// Semantic surface colors
const surfaceColors = {
  primary: '#3A7862',
  primaryLightest: '#EDF5F2',
  primaryDarker: '#326754',
  secondary: '#3E7274',
  tertiary: '#F07662',
  neutral: '#333333',
  white: '#FFFFFF',
  lightest: '#F7F5F3',
  lighter: '#EEEEEE',
};

// Background colors
const backgroundColors = {
  primary: '#FFFFFF',
  secondary: '#F7F5F3',
  tertiary: '#333333',
  dark: '#1A1A1A',
};

/**
 * Legacy GMO_COLORS object for backward compatibility
 * Maps old property names to new token values
 *
 * @deprecated Use semantic color exports instead
 */
const GMO_COLORS = {
  // Primary colors (chart palette order)
  primary: surfaceColors.secondary,        // #3E7274 - Blue Dianne
  accent1: chartColors[1],                  // #3D748F - Coast/Accent-4
  accent2: chartColors[2],                  // #AC5359 - Metallic Copper/Accent-3
  accent3: surfaceColors.tertiary,          // #F07662 - Tertiary
  accent4: surfaceColors.primary,           // #3A7862 - Silver Tree/Accent-1
  accent5: chartColors[5],                  // #132728 - Firefly/Accent-5

  // Legacy aliases
  primaryGreen: surfaceColors.secondary,    // #3E7274 - Blue Dianne
  coastBlue: chartColors[1],                // #3D748F - Coast/Accent-4
  copper: chartColors[2],                   // #AC5359 - Metallic Copper/Accent-3
  orange: surfaceColors.tertiary,           // #F07662 - Tertiary
  lightGreen: surfaceColors.primary,        // #3A7862 - Silver Tree/Accent-1
  darkBlue: chartColors[5],                 // #132728 - Firefly/Accent-5

  // Text colors
  textPrimary: textColors.primary,          // #1A1A1A
  textSecondary: textColors.secondary,      // #5F5F5F
  textInverse: textColors.inverse,          // #FFFFFF

  // Background colors
  bgPrimary: backgroundColors.primary,      // #FFFFFF
  bgSecondary: backgroundColors.secondary,  // #F7F5F3
};

/**
 * Get the chart color palette as an array
 * @param {number} count - Number of colors to return (default: all)
 * @returns {string[]} Array of hex color values
 */
function getChartColors(count = chartColors.length) {
  return chartColors.slice(0, count);
}

/**
 * Build color instructions for Claude API prompts
 * @returns {string} Formatted color palette instructions
 */
function getColorPromptInstructions() {
  return `BRAND COLOR PALETTE (GMO / AXA IM):
Use these colors IN ORDER for data series:
1. ${chartColors[0]} (Primary Green - GMO brand color)
2. ${chartColors[1]} (Coast Blue)
3. ${chartColors[2]} (Metallic Copper)
4. ${chartColors[3]} (Orange)
5. ${chartColors[4]} (Light Green)
6. ${chartColors[5]} (Dark Blue)

IMPORTANT:
- Assign colors in the order listed above
- First series gets ${chartColors[0]} (green)
- Second series gets ${chartColors[1]} (blue)
- Third series gets ${chartColors[2]} (copper), etc.
- These are the ONLY approved brand colors`;
}

module.exports = {
  chartColors,
  textColors,
  surfaceColors,
  backgroundColors,
  GMO_COLORS,
  getChartColors,
  getColorPromptInstructions,
};
