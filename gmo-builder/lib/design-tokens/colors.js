/**
 * BNPP Design System - Color Exports
 *
 * This module provides color utilities and exports from the BNPP design tokens.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const tokens = require('./bnpp-tokens.json');

// Full color hierarchy from tokens
export const colors = tokens.colour;

// Chart color palette (ordered for data visualization)
export const chartColors = [
  tokens.colour.surfaces['accent-2'].base,    // #3E7274 - Blue Dianne (primary chart color)
  tokens.colour.surfaces['accent-4'].base,    // #3D748F - Coast Blue
  tokens.colour.surfaces['accent-3'].base,    // #AC5359 - Metallic Copper
  tokens.colour.surfaces.tertiary.base,       // #F07662 - Tertiary/Orange
  tokens.colour.surfaces['accent-1'].base,    // #3A7862 - Silver Tree Green
  tokens.colour.surfaces['accent-5'].base,    // #132728 - Firefly Dark
  tokens.colour.surfaces['accent-6'].base,    // #955073 - Plum
];

// Editorial theme colors for themed content sections
export const editorialColors = {
  investmentInsights: {
    base: tokens.colour.text.editorial['investment-insights'].base,
    middle: tokens.colour.text.editorial['investment-insights'].middle,
    shade: tokens.colour.text.editorial['investment-insights'].shade,
  },
  macroeconomics: {
    base: tokens.colour.text.editorial.macroeconomics.base,
    middle: tokens.colour.text.editorial.macroeconomics.middle,
    shade: tokens.colour.text.editorial.macroeconomics.shade,
  },
  sustainability: {
    base: tokens.colour.text.editorial.sustainability.base,
    middle: tokens.colour.text.editorial.sustainability.middle,
    shade: tokens.colour.text.editorial.sustainability.shade,
  },
  futureTrends: {
    base: tokens.colour.text.editorial['future-trends'].base,
    middle: tokens.colour.text.editorial['future-trends'].middle,
    shade: tokens.colour.text.editorial['future-trends'].shade,
  },
};

// Semantic text colors
export const textColors = {
  primary: tokens.colour.text['on-light'].neutral.primary,       // #1A1A1A
  secondary: tokens.colour.text['on-light'].neutral.secondary,   // #5F5F5F
  brand: tokens.colour.text['on-light'].brand.primary,           // #008252
  error: tokens.colour.text['on-light'].functional.error,        // #C91432
  inverse: tokens.colour.text['on-dark'].neutral.primary,        // #FFFFFF
  inverseSecondary: tokens.colour.text['on-dark'].neutral.secondary, // #F7F5F3
};

// Semantic surface colors
export const surfaceColors = {
  primary: tokens.colour.surfaces.primary.base,                  // #3A7862
  primaryLightest: tokens.colour.surfaces.primary.lightest,      // #EDF5F2
  primaryDarker: tokens.colour.surfaces.primary.darker,          // #326754
  secondary: tokens.colour.surfaces.secondary.base,              // #3E7274
  tertiary: tokens.colour.surfaces.tertiary.base,                // #F07662
  neutral: tokens.colour.surfaces.neutral.base,                  // #333333
  white: tokens.colour.surfaces.neutral.white,                   // #FFFFFF
  lightest: tokens.colour.surfaces.neutral.lightest,             // #F7F5F3
  lighter: tokens.colour.surfaces.neutral.lighter,               // #EEEEEE
};

// Background colors
export const backgroundColors = {
  primary: tokens.colour.backgrounds.neutral.white,              // #FFFFFF
  secondary: tokens.colour.backgrounds.neutral.lightest,         // #F7F5F3
  tertiary: tokens.colour.backgrounds.neutral.base,              // #333333
  dark: tokens.colour.backgrounds.neutral.darker,                // #1A1A1A
};

// Line/border colors
export const lineColors = {
  light: {
    primary: tokens.colour.lines['on-light'].neutral.primary,    // #EEEEEE
    secondary: tokens.colour.lines['on-light'].neutral.secondary, // #CCCCCC
    tertiary: tokens.colour.lines['on-light'].neutral.tertiary,  // #B1B1B1
  },
  dark: {
    primary: tokens.colour.lines['on-dark'].neutral.primary,     // #1A1A1A
    secondary: tokens.colour.lines['on-dark'].neutral.secondary, // #5F5F5F
  },
  brand: tokens.colour.lines['on-light'].brand.primary,          // #008252
  error: tokens.colour.lines['on-light'].functional.error,       // #C91432
};

// Icon colors
export const iconColors = {
  onLight: {
    primary: tokens.colour.icons['on-light'].neutral.primary,    // #1A1A1A
    secondary: tokens.colour.icons['on-light'].neutral.secondary, // #5F5F5F
    brand: tokens.colour.icons['on-light'].brand.primary,        // #008252
  },
  onDark: {
    primary: tokens.colour.icons['on-dark'].neutral.primary,     // #FFFFFF
    brand: tokens.colour.icons['on-dark'].brand.primary,         // #008252
  },
};

// Button colors
export const buttonColors = {
  primary: {
    default: tokens.colour.buttons.bg.fill.primary.default,      // #008252
    hover: tokens.colour.buttons.bg.fill.primary.hover,          // #00613D
    focusedPressed: tokens.colour.buttons.bg.fill.primary['focused-pressed'], // #B2E6D2
    disabled: tokens.colour.buttons.bg.fill.primary.disabled,    // #B1B1B1
  },
  white: {
    default: tokens.colour.buttons.bg.fill.white.default,        // #FFFFFF
    hover: tokens.colour.buttons.bg.fill.white.hover,            // #FFFFFF
    disabled: tokens.colour.buttons.bg.fill.white.disabled,      // #B1B1B1
  },
};

// Overlay colors
export const overlayColors = {
  dark: {
    subtle: tokens.colour.overlay.black.subtle,                  // rgba(0, 0, 0, 0.15)
    light: tokens.colour.overlay.black.light,                    // rgba(0, 0, 0, 0.2)
    medium: tokens.colour.overlay.black.medium,                  // rgba(0, 0, 0, 0.25)
    moderate: tokens.colour.overlay.black.moderate,              // rgba(0, 0, 0, 0.5)
    strong: tokens.colour.overlay.black.strong,                  // rgba(0, 0, 0, 0.7)
  },
  accent: {
    subtle: tokens.colour.overlay['accent-1'].subtle,            // rgba(16, 49, 50, 0.15)
    light: tokens.colour.overlay['accent-1'].light,              // rgba(16, 49, 50, 0.2)
    strong: tokens.colour.overlay['accent-1'].strong,            // rgba(16, 49, 50, 0.8)
  },
};

// Navigation colors
export const navigationColors = {
  light: {
    base: tokens.colour.surfaces.navigation.light.base,          // #326754
    darker: tokens.colour.surfaces.navigation.light.darker,      // #2A5646
  },
  dark: {
    base: tokens.colour.surfaces.navigation.dark.base,           // #174446
    darker: tokens.colour.surfaces.navigation.dark.darker,       // #172F30
    darkest: tokens.colour.surfaces.navigation.dark.darkest,     // #132728
  },
};

// Interaction state colors
export const interactionColors = {
  primary: tokens.colour.text['on-light'].interaction.primary,   // #008252
  primaryHover: tokens.colour.text['on-light'].interaction['primary-hover'], // #00613D
  active: tokens.colour['interaction-states']['active-state']['on-light'].primary, // #29A376
};

// Section theme colors for full-bleed section backgrounds (from PDF reference)
export const sectionThemes = {
  'market-themes': {
    background: tokens.colour.sections['market-themes'].base,     // #7CC5D9 - Light Cyan
    backgroundDarker: tokens.colour.sections['market-themes'].darker,
    text: tokens.colour.sections['market-themes'].text,           // #FFFFFF
  },
  'economic-outlook': {
    background: tokens.colour.sections['economic-outlook'].base,  // #7CC5D9 - Light Cyan
    backgroundDarker: tokens.colour.sections['economic-outlook'].darker,
    text: tokens.colour.sections['economic-outlook'].text,        // #FFFFFF
  },
  'geopolitical': {
    background: tokens.colour.sections['geopolitical'].base,      // #7CC5D9 - Light Cyan
    backgroundDarker: tokens.colour.sections['geopolitical'].darker,
    text: tokens.colour.sections['geopolitical'].text,            // #FFFFFF
  },
  'central-banks': {
    background: tokens.colour.sections['central-banks'].base,     // #7CC5D9 - Light Cyan
    backgroundDarker: tokens.colour.sections['central-banks'].darker,
    text: tokens.colour.sections['central-banks'].text,           // #FFFFFF
  },
  'ai-capex': {
    background: tokens.colour.sections['ai-capex'].base,          // #E8967B - Coral/Salmon
    backgroundDarker: tokens.colour.sections['ai-capex'].darker,
    text: tokens.colour.sections['ai-capex'].text,                // #FFFFFF
  },
  'american-exceptionalism': {
    background: tokens.colour.sections['american-exceptionalism'].base, // #A8887A - Dusty Rose
    backgroundDarker: tokens.colour.sections['american-exceptionalism'].darker,
    text: tokens.colour.sections['american-exceptionalism'].text, // #FFFFFF
  },
  'our-view': {
    background: tokens.colour.sections['our-view'].base,          // #008252 - BNPP Green
    backgroundDarker: tokens.colour.sections['our-view'].darker,
    text: tokens.colour.sections['our-view'].text,                // #FFFFFF
  },
  'december-review': {
    background: tokens.colour.sections['december-review'].base,   // #9DD9C7 - Light Mint
    backgroundDarker: tokens.colour.sections['december-review'].darker,
    text: tokens.colour.sections['december-review'].text,         // #1A1A1A
  },
  'appendix': {
    background: tokens.colour.sections['appendix'].base,          // #008252 - BNPP Green
    backgroundDarker: tokens.colour.sections['appendix'].darker,
    text: tokens.colour.sections['appendix'].text,                // #FFFFFF
  },
  'default': {
    background: tokens.colour.sections['default'].base,           // #FFFFFF - White
    backgroundDarker: tokens.colour.sections['default'].darker,
    text: tokens.colour.sections['default'].text,                 // #1A1A1A
  },
};

// PDF-matched chart color palette (from reference PDF)
export const pdfChartColors = [
  tokens.colour.charts['pdf-palette'].primary,    // #E86E58 - Coral/Red (primary data lines)
  tokens.colour.charts['pdf-palette'].secondary,  // #3E7274 - Teal (secondary lines)
  tokens.colour.charts['pdf-palette'].tertiary,   // #C9A227 - Gold (tertiary lines)
  tokens.colour.charts['pdf-palette'].quaternary, // #3D748F - Coast Blue
  tokens.colour.charts['pdf-palette'].quinary,    // #3A7862 - Silver Tree Green
  tokens.colour.charts['pdf-palette'].muted,      // #CCCCCC - Muted/Gray
];

// Key insights sidebar colors
export const keyInsightsColors = {
  background: tokens.colour['key-insights'].background,  // #008252 - BNPP Green
  text: tokens.colour['key-insights'].text,              // #FFFFFF
  bullet: tokens.colour['key-insights'].bullet,          // #FFFFFF
};

// Numbered boxes colors (for 01, 02, 03 style cards)
export const numberedBoxColors = {
  teal: tokens.colour['numbered-boxes'].teal,            // #00897B
  background: tokens.colour['numbered-boxes'].background, // #EDF7F7
};

/**
 * Get a color by dot-notation path
 * @param {string} path - e.g., 'surfaces.primary.base' or 'text.on-light.neutral.primary'
 * @returns {string|undefined} The color value or undefined if not found
 */
export function getColor(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], tokens.colour);
}

/**
 * Get accent colors as an array (useful for charts)
 * @param {number} count - Number of colors to return (default: all)
 * @returns {string[]} Array of accent color hex values
 */
export function getAccentColors(count = 6) {
  const accents = [
    tokens.colour.surfaces['accent-1'].base,
    tokens.colour.surfaces['accent-2'].base,
    tokens.colour.surfaces['accent-3'].base,
    tokens.colour.surfaces['accent-4'].base,
    tokens.colour.surfaces['accent-5'].base,
    tokens.colour.surfaces['accent-6'].base,
  ];
  return accents.slice(0, count);
}

/**
 * Get background colors for a specific accent
 * @param {number} accentNumber - Accent number (1-6)
 * @returns {object} Object with lightest, base, and optionally darker/darkest colors
 */
export function getAccentBackground(accentNumber) {
  const key = `accent-${accentNumber}`;
  return tokens.colour.backgrounds[key] || null;
}

/**
 * Get section theme colors by section type
 * @param {string} sectionType - Section type key (e.g., 'market-themes', 'ai-capex', 'our-view')
 * @returns {object} Theme object with background, backgroundDarker, and text colors
 */
export function getSectionTheme(sectionType) {
  return sectionThemes[sectionType] || sectionThemes['default'];
}

/**
 * Get PDF chart colors as an array
 * @param {number} count - Number of colors to return (default: all)
 * @returns {string[]} Array of chart color hex values
 */
export function getPdfChartColors(count = 6) {
  return pdfChartColors.slice(0, count);
}
