/**
 * Color Utilities
 * Helper functions for color normalization in PowerPoint export
 */

// Named color to hex mapping
const NAMED_COLORS = {
  // Theme colors
  blue: '009FB1',
  green: '51BBB4',
  teal: '61C3D7',
  cyan: '61C3D7',
  orange: 'F49F7B',
  brown: 'A37767',
  mint: '76BCA3',

  // Standard colors
  white: 'FFFFFF',
  black: '000000',
  red: 'FF0000',
  yellow: 'FFFF00',
  gray: '808080',
  grey: '808080',

  // BNP Paribas colors
  primaryGreen: '3E7274',
  coastBlue: '3D748F',
  copper: 'AC5359',
  lightGreen: '76BCA3',
  darkBlue: '132728'
};

/**
 * Normalize a color value to 6-digit hex
 * @param {string} color - Color name or hex value
 * @param {string} defaultColor - Fallback color if invalid
 * @returns {string} 6-digit hex color (without #)
 */
export function normalizeColor(color, defaultColor = '009FB1') {
  if (!color) return defaultColor;

  // If it's already a hex value (with or without #)
  const hexMatch = color.match(/^#?([0-9A-Fa-f]{6})$/);
  if (hexMatch) {
    return hexMatch[1].toUpperCase();
  }

  // If it's a 3-digit hex, expand it
  const shortHexMatch = color.match(/^#?([0-9A-Fa-f]{3})$/);
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('');
    return `${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  // If it's a named color
  const namedColor = NAMED_COLORS[color.toLowerCase()];
  if (namedColor) {
    return namedColor;
  }

  // Return default
  return defaultColor;
}

/**
 * Get theme color by name
 * @param {string} themeName - Theme name from Sanity (e.g., 'blue', 'green')
 * @param {Object} config - Template config with colors
 * @returns {string} 6-digit hex color
 */
export function getThemeColor(themeName, config) {
  const themeMap = {
    blue: config.colors.primary,
    green: config.colors.teal,
    teal: config.colors.cyan,
    orange: config.colors.orange,
    brown: config.colors.brown,
    mint: '76BCA3',
    none: config.colors.white
  };

  return themeMap[themeName] || config.colors.primary;
}

export default {
  normalizeColor,
  getThemeColor,
  NAMED_COLORS
};
