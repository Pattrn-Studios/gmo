/**
 * French Translation Endpoint for GMO Reports
 *
 * Serves French-translated versions of GMO reports at /fr
 * Uses Claude AI for real-time translation from English to French.
 */

import { createClient } from '@sanity/client';
import { translateReport } from '../lib/translation-client.js';
import { generateHTML } from '../lib/html-generator.js';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

/**
 * Fetch the latest report from Sanity
 * @returns {Object|null} - The report data or null
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
 * Render a French error page
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {string} details - Optional error details
 * @returns {string} - HTML error page
 */
function renderErrorPage(title, message, details = null) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 60px 24px;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
      color: #1A1A1A;
    }
    h1 {
      color: #AC5359;
      font-size: 2rem;
      margin-bottom: 16px;
    }
    p {
      margin-bottom: 16px;
      color: #5F5F5F;
    }
    a {
      color: #3E7274;
      text-decoration: underline;
    }
    .back-link {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 24px;
      background: #3E7274;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
    .back-link:hover {
      background: #2d5456;
    }
    details {
      margin-top: 32px;
      padding: 16px;
      background: #F5F5F5;
      border-radius: 8px;
    }
    summary {
      cursor: pointer;
      font-weight: 500;
      color: #1A1A1A;
    }
    pre {
      margin-top: 12px;
      padding: 12px;
      background: #E8E8E8;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 13px;
      color: #5F5F5F;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${message}</p>
  <a href="https://gmo-builder.vercel.app/" class="back-link">
    ← Voir la version anglaise
  </a>
  ${details ? `
    <details>
      <summary>Détails techniques</summary>
      <pre>${details}</pre>
    </details>
  ` : ''}
</body>
</html>`;
}

/**
 * Main handler for French translation endpoint
 */
export default async function handler(req, res) {
  console.log('[FR] French translation request received');

  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[FR] ANTHROPIC_API_KEY not configured');
      return res.status(500).send(renderErrorPage(
        'Configuration manquante',
        'Le service de traduction n\'est pas configuré correctement. Veuillez contacter l\'administrateur.',
        'ANTHROPIC_API_KEY environment variable is not set'
      ));
    }

    // Fetch latest report from Sanity
    console.log('[FR] Fetching report from Sanity...');
    const report = await fetchLatestReport();

    if (!report) {
      console.log('[FR] No report found in Sanity');
      return res.status(404).send(renderErrorPage(
        'Aucun rapport trouvé',
        'Aucun rapport n\'est disponible pour le moment. Veuillez d\'abord créer un rapport dans Sanity CMS.'
      ));
    }

    console.log('[FR] Report fetched:', report.title);

    // Translate the report
    console.log('[FR] Starting translation...');
    const startTime = Date.now();

    const translatedReport = await translateReport(report, {
      targetLanguage: 'fr'
    });

    const translationTime = Date.now() - startTime;
    console.log(`[FR] Translation completed in ${translationTime}ms`);

    // Generate HTML with French options
    console.log('[FR] Generating French HTML...');
    const html = generateHTML(translatedReport, {
      lang: 'fr',
      dateFormat: 'fr-FR',
      languageBadge: {
        flag: '🇫🇷',
        text: 'Français',
        backgroundColor: '#3E7274',
        textColor: '#FFFFFF'
      },
      translationNotice: {
        title: 'Traduction automatique',
        text: 'Ce rapport a été traduit automatiquement de l\'anglais vers le français à l\'aide de l\'intelligence artificielle. Bien que nous nous efforcions d\'assurer l\'exactitude, certaines nuances peuvent différer de l\'original.',
        linkToEnglish: 'https://gmo-builder.vercel.app/',
        linkText: 'Voir la version anglaise'
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    console.log('[FR] Sending response');
    return res.status(200).send(html);

  } catch (error) {
    console.error('[FR] Translation error:', error);

    // Handle specific error types
    if (error.status === 429) {
      return res.status(429).send(renderErrorPage(
        'Limite de requêtes atteinte',
        'Trop de demandes de traduction ont été effectuées. Veuillez réessayer dans quelques minutes.',
        error.message
      ));
    }

    if (error.status === 401 || error.message?.includes('API key')) {
      return res.status(500).send(renderErrorPage(
        'Erreur d\'authentification',
        'Le service de traduction ne peut pas s\'authentifier. Veuillez contacter l\'administrateur.',
        error.message
      ));
    }

    if (error.message?.includes('parse') || error.message?.includes('JSON')) {
      return res.status(500).send(renderErrorPage(
        'Erreur de traduction',
        'Une erreur s\'est produite lors du traitement de la traduction. Veuillez réessayer.',
        error.message
      ));
    }

    // Generic error
    return res.status(500).send(renderErrorPage(
      'Erreur de traduction',
      'Une erreur inattendue s\'est produite lors de la traduction du rapport.',
      error.message
    ));
  }
}
