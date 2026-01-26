/**
 * PowerPoint AI Review API Endpoint
 * POST /api/pptx-review
 *
 * Analyzes PowerPoint slide previews using Claude Vision API
 * and returns actionable design suggestions.
 *
 * Request body:
 *   { previews: SlidePreview[] }
 *   where SlidePreview = { slideIndex, slideType, imageData (base64), ... }
 *
 * Response:
 *   {
 *     overallScore: number,
 *     suggestions: Suggestion[],
 *     positives: string[],
 *     summary: string,
 *     metadata: { model, slidesReviewed, responseTimeMs, reviewedAt }
 *   }
 *
 * Requires ANTHROPIC_API_KEY environment variable to be set.
 */

import { reviewSlideDesigns } from '../lib/ai-review/index.js';

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

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[Review] ANTHROPIC_API_KEY not configured');
    return res.status(500).json({
      error: 'AI review not configured',
      details: 'ANTHROPIC_API_KEY environment variable is not set'
    });
  }

  try {
    const { previews, options = {} } = req.body;

    // Validate previews
    if (!previews || !Array.isArray(previews)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'previews array is required in request body'
      });
    }

    if (previews.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'previews array cannot be empty'
      });
    }

    // Validate each preview has required fields
    for (let i = 0; i < previews.length; i++) {
      const preview = previews[i];
      if (!preview.imageData) {
        return res.status(400).json({
          error: 'Invalid request',
          details: `Preview at index ${i} is missing imageData`
        });
      }
    }

    console.log(`[Review] Starting AI review of ${previews.length} slides...`);

    // Perform the review
    const review = await reviewSlideDesigns(previews, {
      detailed: options.detailed !== false,
      model: options.model || 'claude-sonnet-4-20250514'
    });

    console.log(`[Review] Review complete. Score: ${review.overallScore}/100`);

    return res.json({
      success: true,
      ...review
    });

  } catch (error) {
    console.error('[Review] Error:', error);

    // Categorize errors for better client handling
    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({
        error: 'Configuration error',
        details: error.message
      });
    }

    if (error.message?.includes('Rate limited')) {
      return res.status(429).json({
        error: 'Rate limited',
        details: error.message,
        retryAfter: 60
      });
    }

    if (error.message?.includes('image')) {
      return res.status(400).json({
        error: 'Image processing error',
        details: error.message
      });
    }

    return res.status(500).json({
      error: 'Review failed',
      details: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
  }
}
