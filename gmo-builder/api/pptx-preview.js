/**
 * PowerPoint Preview API Endpoint
 * POST /api/pptx-preview
 *
 * Generates PNG preview images of PowerPoint slides for AI review.
 * Returns base64-encoded images that can be sent to Claude Vision API.
 *
 * Request body:
 *   { reportId: string, onePerType?: boolean }
 *
 * Response:
 *   {
 *     previews: [{ slideIndex, slideType, imageData, dimensions }],
 *     metadata: { totalSlides, previewedSlides, generatedAt }
 *   }
 */

import { createClient } from '@sanity/client';
import { generateAllPreviews } from '../lib/slide-preview/index.js';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

// ============================================================================
// SANITY QUERY (same as pptx-export.js)
// ============================================================================

async function fetchReportById(reportId) {
  const query = `*[_type == "report" && _id == $reportId][0] {
    _id,
    title,
    publicationDate,
    author,
    summary,
    sections[] {
      _type,

      _type == "titleSection" => {
        heading,
        subheading,
        backgroundColor,
        "companyLogo": companyLogo { "asset": asset-> { url } }
      },

      _type == "navigationSection" => {
        title,
        showPageNumbers,
        layout,
        "cardImages": cardImages[] {
          title,
          description,
          "image": image { "asset": asset-> { url } }
        }
      },

      _type == "headerSection" => {
        title,
        subtitle,
        backgroundColor,
        "image": image { "asset": asset-> { url } }
      },

      _type == "contentSection" => {
        title,
        subtitle,
        content,
        hasChart,
        sectionTheme,
        "chartConfig": chartConfig {
          chartType,
          chartData,
          chartTitle,
          chartSeries[] { label, dataColumn, colour },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat
        },
        chartSource,
        layout,
        "sectionImage": sectionImage { "asset": asset-> { url } }
      },

      _type == "chartInsightsSection" => {
        title,
        subtitle,
        insightsPosition,
        insightsColor,
        insights,
        "chartConfig": chartConfig {
          chartType,
          chartData,
          chartTitle,
          chartSeries[] { label, dataColumn, colour },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat
        },
        chartSource
      },

      _type == "timelineSection" => {
        title,
        subtitle,
        items[] {
          number,
          header,
          body,
          "image": image { "asset": asset-> { url } }
        }
      }
    }
  }`;

  return await client.fetch(query, { reportId });
}

// ============================================================================
// API HANDLER
// ============================================================================

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { reportId, onePerType = true } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required in request body' });
    }

    console.log(`[Preview] Starting preview generation for report: ${reportId}`);

    // Fetch report from Sanity
    const report = await fetchReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: `Report not found: ${reportId}` });
    }

    console.log(`[Preview] Fetched report: "${report.title}" with ${report.sections?.length || 0} sections`);

    // Generate previews
    const result = await generateAllPreviews(report, {
      onePerType,
      maxPreviews: 10
    });

    console.log(`[Preview] Generated ${result.previews.length} preview images`);

    // Return previews with data URIs for easy display
    const previewsWithDataUri = result.previews.map(preview => ({
      ...preview,
      imageDataUri: `data:image/png;base64,${preview.imageData}`
    }));

    return res.json({
      success: true,
      reportId,
      reportTitle: report.title,
      previews: previewsWithDataUri,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('[Preview] Error:', error);

    return res.status(500).json({
      error: 'Preview generation failed',
      details: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
  }
}
