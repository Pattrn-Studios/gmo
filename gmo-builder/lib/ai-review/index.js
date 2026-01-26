/**
 * AI Review Module
 *
 * Integrates with Claude Vision API to review PowerPoint slide designs.
 * Analyzes preview images and returns actionable suggestions.
 */

import Anthropic from '@anthropic-ai/sdk';
import { buildReviewPrompt } from './prompts.js';

// Initialize Anthropic client
// API key should be set in ANTHROPIC_API_KEY environment variable
const anthropic = new Anthropic();

/**
 * Review slide previews using Claude Vision API
 *
 * @param {Array} previews - Array of preview objects with imageData (base64)
 * @param {Object} options - Review options
 * @returns {Object} Review result with suggestions and score
 */
export async function reviewSlideDesigns(previews, options = {}) {
  const {
    detailed = true,
    model = 'claude-sonnet-4-20250514',
    maxTokens = 2048
  } = options;

  if (!previews || previews.length === 0) {
    throw new Error('No previews provided for review');
  }

  console.log(`[AI Review] Reviewing ${previews.length} slide previews...`);

  // Build message content with images and prompt
  const content = [
    // Add each preview image
    ...previews.map((preview, index) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png',
        data: preview.imageData // Already base64 encoded
      }
    })),
    // Add the review prompt
    {
      type: 'text',
      text: buildReviewPrompt(previews, { detailed })
    }
  ];

  try {
    const startTime = Date.now();

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content
      }]
    });

    const elapsed = Date.now() - startTime;
    console.log(`[AI Review] Response received in ${elapsed}ms`);

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent) {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    const review = parseReviewResponse(textContent.text);

    console.log(`[AI Review] Score: ${review.overallScore}/100, Suggestions: ${review.suggestions?.length || 0}`);

    return {
      ...review,
      metadata: {
        model,
        slidesReviewed: previews.length,
        responseTimeMs: elapsed,
        reviewedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('[AI Review] Error:', error.message);

    // Provide more specific error messages
    if (error.status === 401) {
      throw new Error('Invalid or missing ANTHROPIC_API_KEY');
    }
    if (error.status === 429) {
      throw new Error('Rate limited - please try again later');
    }
    if (error.status === 400 && error.message?.includes('image')) {
      throw new Error('Image processing error - preview may be too large or invalid');
    }

    throw error;
  }
}

/**
 * Parse the JSON response from Claude
 *
 * @param {string} text - Raw text response
 * @returns {Object} Parsed review object
 */
function parseReviewResponse(text) {
  // Try to extract JSON from the response
  // Claude should return pure JSON, but handle cases where there's extra text
  let jsonStr = text.trim();

  // If response has text before/after JSON, extract the JSON
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    const review = JSON.parse(jsonStr);

    // Validate required fields
    if (typeof review.overallScore !== 'number') {
      review.overallScore = 75; // Default if missing
    }
    if (!Array.isArray(review.suggestions)) {
      review.suggestions = [];
    }
    if (!Array.isArray(review.positives)) {
      review.positives = [];
    }
    if (!review.summary) {
      review.summary = 'Review completed.';
    }

    // Normalize suggestion structure
    review.suggestions = review.suggestions.map(s => ({
      slideIndex: s.slideIndex ?? 0,
      slideType: s.slideType || 'unknown',
      category: normalizeCategory(s.category),
      severity: normalizeSeverity(s.severity),
      issue: s.issue || s.problem || '',
      recommendation: s.recommendation || s.suggestion || '',
      affectedElement: s.affectedElement || s.element || 'general'
    }));

    // Sort suggestions by severity (high first)
    review.suggestions.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return review;

  } catch (error) {
    console.error('[AI Review] Failed to parse response:', error.message);
    console.error('[AI Review] Raw response:', text.substring(0, 500));

    // Return a fallback response
    return {
      overallScore: 70,
      suggestions: [],
      positives: ['Unable to parse detailed suggestions'],
      summary: 'Review completed but response parsing failed. Please try again.',
      parseError: true
    };
  }
}

/**
 * Normalize category to expected values
 */
function normalizeCategory(category) {
  const validCategories = ['typography', 'color', 'layout', 'chartClarity', 'whitespace', 'content'];
  const normalized = (category || '').toLowerCase().replace(/[^a-z]/g, '');

  // Map common variations
  const categoryMap = {
    'chart': 'chartClarity',
    'chartclarity': 'chartClarity',
    'charts': 'chartClarity',
    'text': 'typography',
    'font': 'typography',
    'fonts': 'typography',
    'colors': 'color',
    'spacing': 'whitespace',
    'space': 'whitespace',
    'alignment': 'layout',
    'position': 'layout',
    'organization': 'content',
    'bullets': 'content'
  };

  return categoryMap[normalized] || (validCategories.includes(normalized) ? normalized : 'layout');
}

/**
 * Normalize severity to expected values
 */
function normalizeSeverity(severity) {
  const normalized = (severity || '').toLowerCase();
  if (normalized.includes('high') || normalized.includes('critical')) return 'high';
  if (normalized.includes('low') || normalized.includes('minor')) return 'low';
  return 'medium';
}

/**
 * Quick review for a single slide
 */
export async function quickReviewSlide(preview, options = {}) {
  return reviewSlideDesigns([preview], { ...options, detailed: false });
}

/**
 * Get a summary score without full suggestions
 */
export async function getQuickScore(previews) {
  const result = await reviewSlideDesigns(previews, {
    detailed: false,
    maxTokens: 512
  });
  return {
    score: result.overallScore,
    summary: result.summary,
    topIssueCount: result.suggestions?.filter(s => s.severity === 'high').length || 0
  };
}
