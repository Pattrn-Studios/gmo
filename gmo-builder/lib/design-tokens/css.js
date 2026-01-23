/**
 * BNPP Design System - CSS Variable Generator
 *
 * This module generates CSS custom properties from design tokens.
 */

import {
  chartColors,
  textColors,
  surfaceColors,
  backgroundColors,
  lineColors,
  buttonColors,
  editorialColors,
  overlayColors,
  sectionThemes,
  pdfChartColors,
  keyInsightsColors,
  numberedBoxColors,
} from './colors.js';

import {
  fontFamilies,
  fontSizes,
  lineHeights,
  fontWeights,
  responsiveTypography,
} from './typography.js';

/**
 * Generate CSS custom properties as an object
 * @returns {Object} Object with CSS variable names as keys and values
 */
export function generateCSSVariables() {
  return {
    // Legacy variables for backward compatibility
    '--gmo-green': surfaceColors.secondary,
    '--gmo-blue': chartColors[1],
    '--gmo-copper': chartColors[2],

    // Text colors
    '--color-text-primary': textColors.primary,
    '--color-text-secondary': textColors.secondary,
    '--color-text-inverse': textColors.inverse,
    '--color-text-inverse-secondary': textColors.inverseSecondary,
    '--color-text-brand': textColors.brand,
    '--color-text-error': textColors.error,

    // Background colors
    '--color-bg-primary': backgroundColors.primary,
    '--color-bg-secondary': backgroundColors.secondary,
    '--color-bg-tertiary': backgroundColors.tertiary,
    '--color-bg-dark': backgroundColors.dark,

    // Surface colors
    '--color-surface-primary': surfaceColors.primary,
    '--color-surface-primary-lightest': surfaceColors.primaryLightest,
    '--color-surface-primary-darker': surfaceColors.primaryDarker,
    '--color-surface-secondary': surfaceColors.secondary,
    '--color-surface-tertiary': surfaceColors.tertiary,
    '--color-surface-neutral': surfaceColors.neutral,
    '--color-surface-white': surfaceColors.white,
    '--color-surface-lightest': surfaceColors.lightest,
    '--color-surface-lighter': surfaceColors.lighter,

    // Line/border colors
    '--color-line-primary': lineColors.light.primary,
    '--color-line-secondary': lineColors.light.secondary,
    '--color-line-tertiary': lineColors.light.tertiary,
    '--color-line-brand': lineColors.brand,

    // Chart palette
    '--color-chart-1': chartColors[0],
    '--color-chart-2': chartColors[1],
    '--color-chart-3': chartColors[2],
    '--color-chart-4': chartColors[3],
    '--color-chart-5': chartColors[4],
    '--color-chart-6': chartColors[5],
    '--color-chart-7': chartColors[6],

    // Button colors
    '--color-button-primary': buttonColors.primary.default,
    '--color-button-primary-hover': buttonColors.primary.hover,
    '--color-button-primary-focus': buttonColors.primary.focusedPressed,
    '--color-button-disabled': buttonColors.primary.disabled,

    // Editorial theme colors
    '--color-editorial-investment-base': editorialColors.investmentInsights.base,
    '--color-editorial-investment-middle': editorialColors.investmentInsights.middle,
    '--color-editorial-investment-shade': editorialColors.investmentInsights.shade,
    '--color-editorial-macro-base': editorialColors.macroeconomics.base,
    '--color-editorial-macro-middle': editorialColors.macroeconomics.middle,
    '--color-editorial-macro-shade': editorialColors.macroeconomics.shade,
    '--color-editorial-sustainability-base': editorialColors.sustainability.base,
    '--color-editorial-sustainability-middle': editorialColors.sustainability.middle,
    '--color-editorial-sustainability-shade': editorialColors.sustainability.shade,
    '--color-editorial-future-base': editorialColors.futureTrends.base,
    '--color-editorial-future-middle': editorialColors.futureTrends.middle,
    '--color-editorial-future-shade': editorialColors.futureTrends.shade,

    // Overlay colors
    '--color-overlay-light': overlayColors.dark.light,
    '--color-overlay-medium': overlayColors.dark.medium,
    '--color-overlay-strong': overlayColors.dark.strong,

    // Section theme colors (from PDF reference)
    '--color-section-market-themes-bg': sectionThemes['market-themes'].background,
    '--color-section-market-themes-text': sectionThemes['market-themes'].text,
    '--color-section-economic-outlook-bg': sectionThemes['economic-outlook'].background,
    '--color-section-economic-outlook-text': sectionThemes['economic-outlook'].text,
    '--color-section-geopolitical-bg': sectionThemes['geopolitical'].background,
    '--color-section-geopolitical-text': sectionThemes['geopolitical'].text,
    '--color-section-central-banks-bg': sectionThemes['central-banks'].background,
    '--color-section-central-banks-text': sectionThemes['central-banks'].text,
    '--color-section-ai-capex-bg': sectionThemes['ai-capex'].background,
    '--color-section-ai-capex-text': sectionThemes['ai-capex'].text,
    '--color-section-american-exceptionalism-bg': sectionThemes['american-exceptionalism'].background,
    '--color-section-american-exceptionalism-text': sectionThemes['american-exceptionalism'].text,
    '--color-section-our-view-bg': sectionThemes['our-view'].background,
    '--color-section-our-view-text': sectionThemes['our-view'].text,
    '--color-section-december-review-bg': sectionThemes['december-review'].background,
    '--color-section-december-review-text': sectionThemes['december-review'].text,
    '--color-section-appendix-bg': sectionThemes['appendix'].background,
    '--color-section-appendix-text': sectionThemes['appendix'].text,
    '--color-section-default-bg': sectionThemes['default'].background,
    '--color-section-default-text': sectionThemes['default'].text,

    // PDF chart palette colors
    '--color-chart-pdf-1': pdfChartColors[0],
    '--color-chart-pdf-2': pdfChartColors[1],
    '--color-chart-pdf-3': pdfChartColors[2],
    '--color-chart-pdf-4': pdfChartColors[3],
    '--color-chart-pdf-5': pdfChartColors[4],
    '--color-chart-pdf-6': pdfChartColors[5],

    // Key insights sidebar colors
    '--color-key-insights-bg': keyInsightsColors.background,
    '--color-key-insights-text': keyInsightsColors.text,
    '--color-key-insights-bullet': keyInsightsColors.bullet,

    // Numbered boxes colors
    '--color-numbered-box-teal': numberedBoxColors.teal,
    '--color-numbered-box-bg': numberedBoxColors.background,

    // Typography - Font families
    '--font-family-primary': fontFamilies.primary,
    '--font-family-secondary': fontFamilies.secondary,

    // Typography - Font sizes (desktop)
    '--font-size-display-xl': `${fontSizes.desktop.display.xl}px`,
    '--font-size-display-lg': `${fontSizes.desktop.display.lg}px`,
    '--font-size-display-md': `${fontSizes.desktop.display.md}px`,
    '--font-size-display-sm': `${fontSizes.desktop.display.sm}px`,
    '--font-size-title-xl': `${fontSizes.desktop.title.xl}px`,
    '--font-size-title-lg': `${fontSizes.desktop.title.lg}px`,
    '--font-size-title-md': `${fontSizes.desktop.title.md}px`,
    '--font-size-title-xs': `${fontSizes.desktop.title.xs}px`,
    '--font-size-body-lg': `${fontSizes.desktop.body.lg}px`,
    '--font-size-body-md': `${fontSizes.desktop.body.md}px`,
    '--font-size-body-sm': `${fontSizes.desktop.body.sm}px`,
    '--font-size-body-xs': `${fontSizes.desktop.body.xs}px`,
    '--font-size-body-xxs': `${fontSizes.desktop.body.xxs}px`,

    // Typography - Line heights (desktop)
    '--line-height-display-xl': `${lineHeights.desktop.display.xl}px`,
    '--line-height-display-lg': `${lineHeights.desktop.display.lg}px`,
    '--line-height-display-md': `${lineHeights.desktop.display.md}px`,
    '--line-height-title-xl': `${lineHeights.desktop.title.xl}px`,
    '--line-height-title-lg': `${lineHeights.desktop.title.lg}px`,
    '--line-height-body-lg': `${lineHeights.desktop.body.lg}px`,
    '--line-height-body-md': `${lineHeights.desktop.body.md}px`,

    // Typography - Font weights
    '--font-weight-light': fontWeights.light,
    '--font-weight-regular': fontWeights.regular,
    '--font-weight-semibold': fontWeights.semibold,
    '--font-weight-bold': fontWeights.bold,

    // Typography - Responsive sizes
    '--font-size-display-xl-responsive': responsiveTypography.displayXL,
    '--font-size-display-lg-responsive': responsiveTypography.displayLG,
    '--font-size-display-md-responsive': responsiveTypography.displayMD,
    '--font-size-title-xl-responsive': responsiveTypography.titleXL,
    '--font-size-title-lg-responsive': responsiveTypography.titleLG,
  };
}

/**
 * Generate CSS custom properties as a string for inline styles
 * @param {Object} options
 * @param {boolean} options.includeTypography - Include typography variables (default: true)
 * @param {boolean} options.includeEditorial - Include editorial theme colors (default: true)
 * @returns {string} CSS variable declarations as a string
 */
export function generateCSSVariablesString(options = {}) {
  const { includeTypography = true, includeEditorial = true } = options;

  let vars = generateCSSVariables();

  // Filter out typography if not needed
  if (!includeTypography) {
    vars = Object.fromEntries(
      Object.entries(vars).filter(([key]) =>
        !key.startsWith('--font-') && !key.startsWith('--line-height-')
      )
    );
  }

  // Filter out editorial if not needed
  if (!includeEditorial) {
    vars = Object.fromEntries(
      Object.entries(vars).filter(([key]) =>
        !key.startsWith('--color-editorial-')
      )
    );
  }

  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n      ');
}

/**
 * Generate a complete :root block with CSS variables
 * @param {Object} options - Same options as generateCSSVariablesString
 * @returns {string} Complete :root CSS block
 */
export function generateCSSRootBlock(options = {}) {
  return `:root {
      ${generateCSSVariablesString(options)}
    }`;
}

/**
 * Generate CSS for a specific editorial theme
 * @param {'investment-insights'|'macroeconomics'|'sustainability'|'future-trends'} theme
 * @returns {Object} CSS variables for the theme
 */
export function getEditorialThemeVars(theme) {
  const themeMap = {
    'investment-insights': editorialColors.investmentInsights,
    'macroeconomics': editorialColors.macroeconomics,
    'sustainability': editorialColors.sustainability,
    'future-trends': editorialColors.futureTrends,
  };

  const colors = themeMap[theme];
  if (!colors) return null;

  return {
    '--theme-base': colors.base,
    '--theme-middle': colors.middle,
    '--theme-shade': colors.shade,
  };
}

/**
 * Generate CSS for a specific section theme
 * @param {string} sectionType - Section type key (e.g., 'market-themes', 'ai-capex', 'our-view')
 * @returns {Object} CSS variables for the section theme
 */
export function getSectionThemeVars(sectionType) {
  const theme = sectionThemes[sectionType] || sectionThemes['default'];

  return {
    '--section-bg': theme.background,
    '--section-bg-darker': theme.backgroundDarker,
    '--section-text': theme.text,
  };
}

/**
 * Get section theme CSS as inline style string
 * @param {string} sectionType - Section type key
 * @returns {string} Inline style string
 */
export function getSectionThemeStyle(sectionType) {
  const vars = getSectionThemeVars(sectionType);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}
