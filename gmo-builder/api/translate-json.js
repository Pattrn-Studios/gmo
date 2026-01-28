/**
 * JSON Translation API for GMO Reports
 *
 * Returns translated report data as JSON for consumption by gmo-report React app.
 * Called by gmo-report's /fr page to get translated content.
 */

import { createClient } from '@sanity/client';
import { translateReport } from '../lib/translation-client.js';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

/**
 * Fetch the latest report from Sanity
 */
async function fetchLatestReport() {
  const query = `*[_type == "report"] | order(publicationDate desc)[0] {
    title,
    publicationDate,
    author,
    summary,
    sections[] {
      _type,

      _type == "titleSection" => {
        heading,
        subheading,
        backgroundType,
        backgroundColor,
        "backgroundImage": backgroundImage.asset->url,
        "companyLogo": companyLogo.asset->url
      },

      _type == "navigationSection" => {
        title,
        showPageNumbers,
        layout,
        "cardImages": cardImages[] {
          sectionIndex,
          "imageUrl": image.asset->url
        }
      },

      _type == "contentSection" => {
        title,
        subtitle,
        colorTheme,
        "sectionImage": sectionImage.asset->url,
        content,
        hasChart,
        "chartType": chartConfig.chartType,
        "chartData": chartConfig.chartData,
        "chartSeries": chartConfig.chartSeries[] { label, dataColumn, colour },
        "xAxisLabel": chartConfig.xAxisLabel,
        "yAxisLabel": chartConfig.yAxisLabel,
        "yAxisFormat": chartConfig.yAxisFormat,
        "gaugeMax": chartConfig.gaugeMax,
        chartSource,
        layout
      },

      _type == "headerSection" => {
        title,
        subtitle,
        "image": image.asset->url,
        showBnpBanner,
        backgroundColor
      },

      _type == "timelineSection" => {
        title,
        subtitle,
        items[] {
          number,
          "image": image.asset->url,
          header,
          body
        }
      },

      _type == "chartInsightsSection" => {
        title,
        subtitle,
        "chartType": chartConfig.chartType,
        "chartData": chartConfig.chartData,
        "chartSeries": chartConfig.chartSeries[] { label, dataColumn, colour },
        "xAxisLabel": chartConfig.xAxisLabel,
        "yAxisLabel": chartConfig.yAxisLabel,
        "yAxisFormat": chartConfig.yAxisFormat,
        chartSource,
        insightsPosition,
        insightsColor,
        insights
      }
    }
  }`;

  return await client.fetch(query);
}

/**
 * Main handler - returns translated report as JSON
 */
export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests from gmo-report
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('[FR-JSON] Translation request received');

  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[FR-JSON] ANTHROPIC_API_KEY not configured');
      return res.status(500).json({
        error: 'Translation service not configured',
        message: 'ANTHROPIC_API_KEY environment variable is not set'
      });
    }

    // Fetch latest report from Sanity
    console.log('[FR-JSON] Fetching report from Sanity...');
    const report = await fetchLatestReport();

    if (!report) {
      console.log('[FR-JSON] No report found in Sanity');
      return res.status(404).json({
        error: 'No report found',
        message: 'No report is available in Sanity CMS'
      });
    }

    console.log('[FR-JSON] Report fetched:', report.title);

    // Translate the report
    console.log('[FR-JSON] Starting translation...');
    const startTime = Date.now();

    const translatedReport = await translateReport(report, {
      targetLanguage: 'fr'
    });

    const translationTime = Date.now() - startTime;
    console.log(`[FR-JSON] Translation completed in ${translationTime}ms`);

    // Return translated report as JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    return res.status(200).json({
      success: true,
      translationTime,
      language: 'fr',
      report: translatedReport
    });

  } catch (error) {
    console.error('[FR-JSON] Translation error:', error);

    // Handle specific error types
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many translation requests. Please try again later.'
      });
    }

    if (error.status === 401 || error.message?.includes('API key')) {
      return res.status(500).json({
        error: 'Authentication error',
        message: 'Translation service authentication failed'
      });
    }

    return res.status(500).json({
      error: 'Translation failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
}
