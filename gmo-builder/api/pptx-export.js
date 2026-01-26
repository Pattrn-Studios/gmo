/**
 * PowerPoint Export API Endpoint
 * POST /api/pptx-export
 *
 * Generates a PowerPoint presentation from a Sanity report
 */

import { createClient } from '@sanity/client';
import { exportToPowerPoint } from '../powerpoint/export-to-powerpoint.js';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

/**
 * Fetch a specific report by ID from Sanity
 */
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

/**
 * Sanitize filename for safe download
 */
function sanitizeFilename(name) {
  return (name || 'report')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

/**
 * API Handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required in request body' });
    }

    console.log(`[PPTX Export] Starting export for report: ${reportId}`);

    // Fetch report from Sanity
    const report = await fetchReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: `Report not found: ${reportId}` });
    }

    console.log(`[PPTX Export] Fetched report: "${report.title}" with ${report.sections?.length || 0} sections`);

    // Generate PowerPoint
    const pptxBuffer = await exportToPowerPoint(report);

    console.log(`[PPTX Export] Generated PowerPoint: ${pptxBuffer.length} bytes`);

    // Send response
    const filename = sanitizeFilename(report.title);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pptx"`);
    res.setHeader('Content-Length', pptxBuffer.length);

    return res.send(pptxBuffer);

  } catch (error) {
    console.error('[PPTX Export] Error:', error);

    // Specific error handling
    if (error.message?.includes('timeout')) {
      return res.status(504).json({
        error: 'PowerPoint generation timed out',
        details: 'The report may be too large. Try exporting a smaller report.'
      });
    }

    return res.status(500).json({
      error: 'PowerPoint generation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
