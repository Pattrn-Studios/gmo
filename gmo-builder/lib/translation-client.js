/**
 * Translation Client for GMO Reports
 *
 * Uses Claude API to translate report content from English to French.
 * Preserves Portable Text structure, chart configurations, and formatting.
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

/**
 * Main translation function - translates an entire report to French
 * @param {Object} report - The Sanity report object
 * @param {Object} options - Translation options
 * @returns {Object} - The report with translated content
 */
export async function translateReport(report, options = {}) {
  const { targetLanguage = 'fr' } = options;

  console.log('[FR] Building translation payload...');
  const payload = buildTranslationPayload(report);

  console.log('[FR] Sending to Claude for translation...');
  const translated = await sendTranslationRequest(payload, targetLanguage);

  console.log('[FR] Merging translations back into report...');
  return mergeTranslations(report, translated);
}

/**
 * Extract all translatable text from a report into a structured payload
 * @param {Object} report - The Sanity report object
 * @returns {Object} - Structured translation payload
 */
function buildTranslationPayload(report) {
  const payload = {
    reportMeta: {
      title: report.title || '',
      summary: report.summary || '',
      author: report.author || ''
    },
    sections: []
  };

  if (!report.sections) return payload;

  report.sections.forEach((section, index) => {
    const sectionPayload = {
      sectionType: section._type,
      sectionIndex: index,
      fields: {}
    };

    switch (section._type) {
      case 'titleSection':
        sectionPayload.fields = {
          heading: section.heading || '',
          subheading: section.subheading || ''
        };
        break;

      case 'contentSection':
        sectionPayload.fields = {
          title: section.title || '',
          subtitle: section.subtitle || '',
          content: section.content || [],
          chartSource: section.chartSource || '',
          xAxisLabel: section.xAxisLabel || '',
          yAxisLabel: section.yAxisLabel || '',
          chartSeries: (section.chartSeries || []).map(s => ({
            label: s.label || '',
            dataColumn: s.dataColumn,
            colour: s.colour
          }))
        };
        break;

      case 'chartInsightsSection':
        sectionPayload.fields = {
          title: section.title || '',
          subtitle: section.subtitle || '',
          chartSource: section.chartSource || '',
          xAxisLabel: section.xAxisLabel || '',
          yAxisLabel: section.yAxisLabel || '',
          chartSeries: (section.chartSeries || []).map(s => ({
            label: s.label || '',
            dataColumn: s.dataColumn,
            colour: s.colour
          })),
          insights: section.insights || []
        };
        break;

      case 'headerSection':
        sectionPayload.fields = {
          title: section.title || '',
          subtitle: section.subtitle || ''
        };
        break;

      case 'timelineSection':
        sectionPayload.fields = {
          title: section.title || '',
          subtitle: section.subtitle || '',
          items: (section.items || []).map(item => ({
            number: item.number,
            header: item.header || '',
            body: item.body || ''
          }))
        };
        break;

      case 'navigationSection':
        sectionPayload.fields = {
          title: section.title || ''
        };
        break;

      default:
        // Skip unknown section types
        return;
    }

    payload.sections.push(sectionPayload);
  });

  return payload;
}

/**
 * Send translation request to Claude API
 * @param {Object} payload - The translation payload
 * @param {string} targetLanguage - Target language code (e.g., 'fr')
 * @returns {Object} - Translated payload
 */
async function sendTranslationRequest(payload, targetLanguage) {
  const prompt = buildTranslationPrompt(payload, targetLanguage);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }]
  });

  // Extract JSON from response
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return parseTranslationResponse(content.text);
}

/**
 * Build the translation prompt with domain-specific instructions
 * @param {Object} payload - The translation payload
 * @param {string} targetLanguage - Target language code
 * @returns {string} - The complete prompt
 */
function buildTranslationPrompt(payload, targetLanguage) {
  const languageNames = {
    fr: 'French'
  };
  const languageName = languageNames[targetLanguage] || targetLanguage;

  return `You are a professional financial translator specializing in ${languageName} translations for institutional investment reports. You will translate a structured financial report from English to ${languageName} while maintaining technical accuracy and professional tone.

CRITICAL REQUIREMENTS:
1. Maintain financial terminology precision (use standard ${languageName} financial terms)
2. Preserve ALL Portable Text structure in the "content" arrays:
   - Keep _type, _key, style, listItem, level properties unchanged
   - Keep marks arrays unchanged (they reference mark definitions)
   - Only translate the "text" property within children arrays
3. Keep all numeric values UNCHANGED (percentages, currency values, dates in numbers)
4. Keep proper nouns unchanged: company names, index names (S&P 500, MSCI, etc.)
5. Keep technical abbreviations when appropriate: GDP, IMF, ECB, etc. (but translate their full forms)
6. Use formal professional tone consistent with institutional investor communications
7. Return ONLY valid JSON in the exact same structure as the input

DOMAIN-SPECIFIC TRANSLATIONS (English → French):
- "market outlook" → "perspectives de marché"
- "asset management" → "gestion d'actifs"
- "sustainable investing" → "investissement durable"
- "equity" / "equities" → "actions"
- "fixed income" → "obligations" or "revenu fixe"
- "central bank" → "banque centrale"
- "Federal Reserve" → "Réserve fédérale"
- "European Central Bank" / "ECB" → "Banque centrale européenne" / "BCE"
- "Bank of England" → "Banque d'Angleterre"
- "inflation" → "inflation"
- "interest rates" → "taux d'intérêt"
- "monetary policy" → "politique monétaire"
- "fiscal policy" → "politique budgétaire"
- "yield" → "rendement"
- "volatility" → "volatilité"
- "Key Insights" → "Points clés"
- "In This Report" → "Dans ce rapport"
- "Source:" → "Source :"

PORTABLE TEXT EXAMPLE:
Input content array:
[{"_type":"block","_key":"abc123","style":"normal","children":[{"_type":"span","_key":"def456","text":"The economy grew by ","marks":[]},{"_type":"span","_key":"ghi789","text":"5%","marks":["strong"]}]}]

Output (only text translated, structure preserved):
[{"_type":"block","_key":"abc123","style":"normal","children":[{"_type":"span","_key":"def456","text":"L'économie a progressé de ","marks":[]},{"_type":"span","_key":"ghi789","text":"5%","marks":["strong"]}]}]

INPUT DATA:
<translation_payload>
${JSON.stringify(payload, null, 2)}
</translation_payload>

RESPONSE FORMAT:
Return ONLY a JSON object with the exact same structure, with all text fields translated to ${languageName}. Do not include any explanation or markdown formatting - just the raw JSON object.`;
}

/**
 * Parse Claude's response and extract the translated JSON
 * @param {string} responseText - The raw response text
 * @returns {Object} - Parsed translation payload
 */
function parseTranslationResponse(responseText) {
  // Try to extract JSON from the response
  let jsonStr = responseText.trim();

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('[FR] Failed to parse translation response:', error.message);
    console.error('[FR] Response was:', responseText.slice(0, 500));
    throw new Error('Failed to parse translation response as JSON');
  }
}

/**
 * Merge translated content back into the original report structure
 * @param {Object} report - Original report object
 * @param {Object} translated - Translated payload
 * @returns {Object} - Report with translated content
 */
function mergeTranslations(report, translated) {
  // Deep clone the report to avoid mutating the original
  const translatedReport = JSON.parse(JSON.stringify(report));

  // Merge report-level fields
  if (translated.reportMeta) {
    if (translated.reportMeta.title) {
      translatedReport.title = translated.reportMeta.title;
    }
    if (translated.reportMeta.summary) {
      translatedReport.summary = translated.reportMeta.summary;
    }
    // Note: We keep author unchanged (it's a proper noun)
  }

  // Create a map of translated sections by index
  const translatedSectionsMap = {};
  (translated.sections || []).forEach(section => {
    translatedSectionsMap[section.sectionIndex] = section.fields;
  });

  // Merge each section
  (translatedReport.sections || []).forEach((section, index) => {
    const translatedFields = translatedSectionsMap[index];
    if (!translatedFields) return;

    switch (section._type) {
      case 'titleSection':
        if (translatedFields.heading) section.heading = translatedFields.heading;
        if (translatedFields.subheading) section.subheading = translatedFields.subheading;
        break;

      case 'contentSection':
        if (translatedFields.title) section.title = translatedFields.title;
        if (translatedFields.subtitle) section.subtitle = translatedFields.subtitle;
        if (translatedFields.content) section.content = translatedFields.content;
        if (translatedFields.chartSource) section.chartSource = translatedFields.chartSource;
        if (translatedFields.xAxisLabel) section.xAxisLabel = translatedFields.xAxisLabel;
        if (translatedFields.yAxisLabel) section.yAxisLabel = translatedFields.yAxisLabel;
        if (translatedFields.chartSeries && section.chartSeries) {
          translatedFields.chartSeries.forEach((ts, i) => {
            if (section.chartSeries[i] && ts.label) {
              section.chartSeries[i].label = ts.label;
            }
          });
        }
        break;

      case 'chartInsightsSection':
        if (translatedFields.title) section.title = translatedFields.title;
        if (translatedFields.subtitle) section.subtitle = translatedFields.subtitle;
        if (translatedFields.chartSource) section.chartSource = translatedFields.chartSource;
        if (translatedFields.xAxisLabel) section.xAxisLabel = translatedFields.xAxisLabel;
        if (translatedFields.yAxisLabel) section.yAxisLabel = translatedFields.yAxisLabel;
        if (translatedFields.chartSeries && section.chartSeries) {
          translatedFields.chartSeries.forEach((ts, i) => {
            if (section.chartSeries[i] && ts.label) {
              section.chartSeries[i].label = ts.label;
            }
          });
        }
        if (translatedFields.insights) section.insights = translatedFields.insights;
        break;

      case 'headerSection':
        if (translatedFields.title) section.title = translatedFields.title;
        if (translatedFields.subtitle) section.subtitle = translatedFields.subtitle;
        break;

      case 'timelineSection':
        if (translatedFields.title) section.title = translatedFields.title;
        if (translatedFields.subtitle) section.subtitle = translatedFields.subtitle;
        if (translatedFields.items && section.items) {
          translatedFields.items.forEach((ti, i) => {
            if (section.items[i]) {
              if (ti.header) section.items[i].header = ti.header;
              if (ti.body) section.items[i].body = ti.body;
            }
          });
        }
        break;

      case 'navigationSection':
        if (translatedFields.title) section.title = translatedFields.title;
        break;
    }
  });

  return translatedReport;
}

export { buildTranslationPayload, mergeTranslations };
