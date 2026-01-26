/**
 * Template Loader
 * Loads and validates the PowerPoint template configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '../../powerpoint/template-config.json');

let cachedConfig = null;

/**
 * Load the template configuration
 * @returns {Object} Template configuration object
 */
export function loadTemplateConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Template config not found at: ${CONFIG_PATH}`);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

  // Validate required sections
  if (!config.colors) {
    throw new Error('Template config missing required "colors" section');
  }
  if (!config.fonts) {
    throw new Error('Template config missing required "fonts" section');
  }
  if (!config.slideTypes) {
    throw new Error('Template config missing required "slideTypes" section');
  }

  // Validate slide types
  const requiredSlideTypes = [
    'title',
    'tableOfContents',
    'sectionDivider',
    'chartSection',
    'insightsSection',
    'timelineSection'
  ];

  for (const slideType of requiredSlideTypes) {
    if (!config.slideTypes[slideType]) {
      console.warn(`Warning: Template config missing slide type: ${slideType}`);
    }
  }

  cachedConfig = config;
  return config;
}

/**
 * Get layout for a specific slide type
 * @param {string} slideType - The slide type (e.g., 'chartSection')
 * @returns {Object} Layout configuration for the slide type
 */
export function getSlideLayout(slideType) {
  const config = loadTemplateConfig();
  return config.slideTypes[slideType] || null;
}

/**
 * Get font configuration
 * @param {string} fontType - The font type (e.g., 'title', 'body')
 * @returns {Object} Font configuration
 */
export function getFontConfig(fontType) {
  const config = loadTemplateConfig();
  return config.fonts[fontType] || config.fonts.body;
}

/**
 * Get color by name
 * @param {string} colorName - The color name (e.g., 'primary', 'teal')
 * @returns {string} Hex color code (without #)
 */
export function getColor(colorName) {
  const config = loadTemplateConfig();
  return config.colors[colorName] || config.colors.text;
}

/**
 * Clear the cached configuration (useful for testing)
 */
export function clearConfigCache() {
  cachedConfig = null;
}

export default {
  loadTemplateConfig,
  getSlideLayout,
  getFontConfig,
  getColor,
  clearConfigCache
};
