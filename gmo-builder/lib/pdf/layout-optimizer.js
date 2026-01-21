/**
 * Layout optimizer using Claude API to suggest optimal PDF layout
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Estimate content length for a section
 */
function estimateContentLength(content) {
  if (!content || !Array.isArray(content)) return 0;

  return content
    .filter(block => block._type === 'block')
    .reduce((total, block) => {
      const text = block.children?.map(c => c.text || '').join('') || '';
      return total + text.length;
    }, 0);
}

/**
 * Call Claude API for layout optimization
 */
async function callClaudeAPI(prompt) {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.warn('CLAUDE_API_KEY not set, skipping layout optimization');
    return null;
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Claude API call failed:', error);
    return null;
  }
}

/**
 * Get layout optimization hints from Claude
 * @param {Object} report - Report data from Sanity
 * @returns {Promise<Object|null>} - Layout hints or null if unavailable
 */
export async function getLayoutOptimization(report) {
  // Build content summary for Claude
  const contentSummary = (report.sections || [])
    .filter(s => s._type === 'contentSection')
    .map((section, index) => ({
      index,
      title: section.title || 'Untitled',
      hasChart: Boolean(section.hasChart && section.chartData),
      contentLength: estimateContentLength(section.content),
      chartType: section.chartType,
      seriesCount: section.chartSeries?.length || 0,
      currentLayout: section.layout || 'chartRight'
    }));

  if (contentSummary.length === 0) {
    return null;
  }

  const prompt = `You are a PDF layout optimization assistant for professional financial reports.

Analyze this report structure and provide layout recommendations for A4 landscape PDF export.

REPORT: "${report.title || 'Untitled Report'}"

SECTIONS:
${JSON.stringify(contentSummary, null, 2)}

PAGE CONSTRAINTS:
- A4 landscape: 297mm x 210mm
- Margins: 50pt (~18mm) all sides
- Usable content area: ~760pt x 495pt
- Each section gets its own page

CONSIDERATIONS:
1. Chart complexity: More series = larger chart needed
2. Content length: Long text may need chart on top/bottom instead of side
3. Visual balance: Alternate chart positions for variety
4. Data density: Stacked charts benefit from larger size

PROVIDE RECOMMENDATIONS AS JSON ONLY (no other text):
{
  "sections": [
    {
      "title": "Section title",
      "chartPosition": "chartLeft" | "chartRight" | "chartFull",
      "chartSize": "small" | "medium" | "large",
      "notes": "Brief reasoning"
    }
  ],
  "generalNotes": "Any overall advice"
}

Rules:
- chartFull: chart below text, good for complex charts or short text
- chartLeft/chartRight: side by side, good for balanced content
- large: >3 series or stacked charts
- medium: 2-3 series
- small: 1 series or simple data`;

  const hints = await callClaudeAPI(prompt);

  if (hints && hints.sections) {
    // Map hints back to original section indices
    return {
      ...hints,
      sections: contentSummary.map((summary, i) => ({
        ...hints.sections[i],
        originalIndex: summary.index
      }))
    };
  }

  return null;
}

/**
 * Get default layout hints (fallback when Claude is unavailable)
 */
export function getDefaultLayoutHints(report) {
  const sections = (report.sections || [])
    .filter(s => s._type === 'contentSection')
    .map((section, index) => {
      const hasChart = Boolean(section.hasChart && section.chartData);
      const contentLength = estimateContentLength(section.content);
      const seriesCount = section.chartSeries?.length || 0;

      let chartPosition = section.layout || 'chartRight';
      let chartSize = 'medium';

      if (hasChart) {
        // Determine chart size based on complexity
        if (seriesCount > 3 || section.chartType?.includes('stacked')) {
          chartSize = 'large';
        } else if (seriesCount <= 1) {
          chartSize = 'small';
        }

        // Use full width for complex charts with short content
        if (contentLength < 300 && seriesCount > 2) {
          chartPosition = 'chartFull';
        }

        // Alternate sides for visual variety
        if (chartPosition !== 'chartFull' && index % 2 === 1) {
          chartPosition = chartPosition === 'chartRight' ? 'chartLeft' : 'chartRight';
        }
      }

      return {
        title: section.title,
        chartPosition,
        chartSize,
        notes: 'Default layout'
      };
    });

  return { sections, generalNotes: 'Using default layout rules' };
}
