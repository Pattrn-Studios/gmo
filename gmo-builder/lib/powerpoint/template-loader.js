/**
 * Template Loader
 * Loads and validates the PowerPoint template configuration
 */

// Embedded template config (for serverless compatibility)
const templateConfig = {
  "colors": {
    "primary": "009FB1",
    "teal": "51BBB4",
    "cyan": "61C3D7",
    "orange": "F49F7B",
    "brown": "A37767",
    "white": "FFFFFF",
    "text": "1A1A1A",
    "textSecondary": "5F5F5F"
  },
  "fonts": {
    "title": { "face": "Arial", "size": 24, "bold": true },
    "subtitle": { "face": "Arial", "size": 16, "bold": false },
    "body": { "face": "Arial", "size": 12, "bold": false },
    "source": { "face": "Arial", "size": 10, "italic": true },
    "sectionNumber": { "face": "Arial", "size": 32, "bold": true }
  },
  "slideTypes": {
    "title": {
      "background": { "x": 0, "y": 0, "w": 13.33, "h": 7.5 },
      "title": { "x": 0.5, "y": 3.0, "w": 7.6, "h": 1.5, "fontSize": 48, "bold": true },
      "subtitle": { "x": 0.5, "y": 4.67, "w": 4.0, "h": 0.4, "fontSize": 16 },
      "disclaimer": { "x": 0.5, "y": 0.27, "w": 11.2, "h": 0.45, "fontSize": 9, "bold": true }
    },
    "tableOfContents": {
      "title": { "x": 0.5, "y": 0.29, "w": 12.3, "h": 0.39, "fontSize": 24, "bold": true },
      "cards": {
        "startX": 0.5, "startY": 1.7, "cardWidth": 2.25, "cardHeight": 5.0,
        "spacing": 0.26, "numberY": 2.02, "numberSize": 32, "blurbY": 2.95,
        "blurbHeight": 1.58, "imageY": 4.91, "imageHeight": 1.8,
        "colors": ["009FB1", "51BBB4", "61C3D7", "F49F7B", "A37767"]
      }
    },
    "sectionDivider": {
      "background": { "x": 0, "y": 0, "w": 13.33, "h": 7.5, "fillColor": "61C3D7" },
      "sectionName": { "x": 0.46, "y": 2.7, "w": 6.2, "h": 0.65, "fontSize": 48, "bold": true },
      "image": { "x": 7.24, "y": 0.88, "w": 5.74, "h": 5.74 }
    },
    "chartSection": {
      "background": { "x": 0, "y": 0, "w": 13.33, "h": 7.5, "fillColor": "009FB1" },
      "sectionNumber": { "x": 0.5, "y": 0.36, "w": 0.72, "h": 0.72, "fillColor": "FFFFFF" },
      "numberText": { "x": 0.5, "y": 0.42, "w": 0.72, "h": 0.64, "fontSize": 32, "bold": true },
      "title": { "x": 1.21, "y": 0.43, "w": 11.86, "h": 0.36, "fontSize": 24, "bold": true },
      "subtitle": { "x": 1.24, "y": 0.85, "w": 11.86, "h": 0.24, "fontSize": 16 },
      "source": { "x": 0.5, "y": 6.14, "w": 12.47, "h": 0.29, "fontSize": 10 },
      "leftPanel": {
        "image": { "x": 0.5, "y": 1.59, "w": 2.5, "h": 1.73 },
        "content": { "x": 0.5, "y": 3.48, "w": 2.5, "h": 2.69, "fontSize": 10 }
      },
      "chartTitle": { "x": 3.35, "y": 1.57, "w": 4.44, "h": 0.2, "fontSize": 12, "bold": true },
      "chart": { "x": 3.33, "y": 1.93, "w": 7.61, "h": 3.94 }
    },
    "insightsSection": {
      "title": { "x": 0.5, "y": 0.29, "w": 12.33, "h": 0.39, "fontSize": 24, "bold": true },
      "subtitle": { "x": 0.5, "y": 0.81, "w": 5.77, "h": 0.23, "fontSize": 16 },
      "source": { "x": 0.5, "y": 6.27, "w": 9.04, "h": 0.33, "fontSize": 10 },
      "chartTitle": { "x": 0.5, "y": 1.46, "w": 2.48, "h": 0.2, "fontSize": 12, "bold": true },
      "chart": { "x": 0.47, "y": 1.85, "w": 8.66, "h": 4.33 },
      "insightsPanel": { "x": 9.79, "y": 0, "w": 3.54, "h": 7.5, "dividerX": 9.53, "dividerW": 0.26 },
      "insightsTitle": { "x": 10.28, "y": 1.46, "w": 1.14, "h": 0.2, "fontSize": 12, "bold": true },
      "insightsList": { "x": 10.28, "y": 1.78, "w": 3.28, "h": 3.28 }
    },
    "timelineSection": {
      "title": { "x": 0.5, "y": 0.29, "w": 12.33, "h": 0.39, "fontSize": 24, "bold": true },
      "subtitle": { "x": 0.5, "y": 0.81, "w": 5.77, "h": 0.23, "fontSize": 16 },
      "timeline": {
        "itemWidth": 3.4, "spacing": 1.5,
        "items": [
          { "numberX": 0.5, "numberY": 2.26, "numberSize": 0.94, "contentX": 0.36, "contentY": 3.34, "contentW": 3.16, "contentH": 1.52 },
          { "numberX": 5.0, "numberY": 2.26, "numberSize": 0.94, "contentX": 4.88, "contentY": 3.34, "contentW": 3.42, "contentH": 1.52 },
          { "numberX": 9.36, "numberY": 2.26, "numberSize": 0.94, "contentX": 9.23, "contentY": 3.34, "contentW": 3.42, "contentH": 1.52 }
        ]
      }
    }
  }
};

let cachedConfig = null;

/**
 * Load the template configuration
 * @returns {Object} Template configuration object
 */
export function loadTemplateConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const config = templateConfig;

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
