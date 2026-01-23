import { createClient } from '@sanity/client';
import { GMO_COLORS, generateCSSVariablesString } from '../lib/design-tokens/index.js';
import { buildChartJsConfig } from '../lib/chart-config.js';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

export default async function handler(req, res) {
  // All functions defined inside handler for proper scope

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
          backgroundColor
        },

        _type == "navigationSection" => {
          title,
          showPageNumbers,
          layout
        },

        _type == "contentSection" => {
          title,
          subtitle,
          content,
          hasChart,
          // Read from nested chartConfig structure
          "chartType": chartConfig.chartType,
          "chartData": chartConfig.chartData,
          "chartSeries": chartConfig.chartSeries[] { label, dataColumn, colour },
          "xAxisLabel": chartConfig.xAxisLabel,
          "yAxisLabel": chartConfig.yAxisLabel,
          "yAxisFormat": chartConfig.yAxisFormat,
          "gaugeMax": chartConfig.gaugeMax,
          chartSource,
          layout
        }
      }
    }`;

    return await client.fetch(query);
  }

  function portableTextToHTML(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';

    let html = '';
    let inList = false;

    blocks.forEach(block => {
      if (block._type !== 'block') return;

      const text = block.children
        ?.map(child => {
          let t = child.text || '';
          if (child.marks?.includes('strong')) t = `<strong>${t}</strong>`;
          if (child.marks?.includes('em')) t = `<em>${t}</em>`;
          if (child.marks?.includes('underline')) t = `<u>${t}</u>`;
          return t;
        })
        .join('') || '';

      if (block.listItem === 'bullet') {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${text}</li>`;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }

        if (block.style === 'h2') html += `<h2>${text}</h2>`;
        else if (block.style === 'h3') html += `<h3>${text}</h3>`;
        else html += `<p>${text}</p>`;
      }
    });

    if (inList) html += '</ul>';

    return html;
  }

  function buildNavigationHTML(section, allSections) {
    const contentSections = allSections
      .filter(s => s._type === 'contentSection')
      .map((s, i) => ({ title: s.title, subtitle: s.subtitle, id: `section-${i}` }));

    const cards = contentSections
      .map(s => `
        <a href="#${s.id}" class="nav-card">
          <h4>${s.title}</h4>
          ${s.subtitle ? `<p>${s.subtitle}</p>` : ''}
        </a>
      `)
      .join('');

    return `
      <section class="navigation-section">
        <div class="container">
          <h3>${section.title || 'In This Report'}</h3>
          <div class="nav-grid">${cards}</div>
        </div>
      </section>
    `;
  }

  function buildContentSectionHTML(section, index) {
    const hasChart = section.hasChart && section.chartData;
    const chartId = hasChart ? `chart-${index}` : null;

    let layoutClass = 'container-narrow';
    let contentHTML = '';

    if (hasChart) {
      // Use canvas element for Chart.js (instead of div for Highcharts)
      const chartHTML = `
        <div class="chart-wrapper">
          <canvas class="chart-container" id="${chartId}"></canvas>
          ${section.chartSource ? `<p class="chart-source">Source: ${section.chartSource}</p>` : ''}
        </div>
      `;

      const textHTML = `<div class="content-block">${portableTextToHTML(section.content)}</div>`;

      if (section.layout === 'chartLeft') {
        layoutClass = 'container';
        contentHTML = `<div class="layout-chart-left">${chartHTML}${textHTML}</div>`;
      } else if (section.layout === 'chartRight') {
        layoutClass = 'container';
        contentHTML = `<div class="layout-chart-right">${textHTML}${chartHTML}</div>`;
      } else {
        layoutClass = 'container';
        contentHTML = `<div class="content-block">${portableTextToHTML(section.content)}</div>${chartHTML}`;
      }
    } else {
      contentHTML = `<div class="content-block">${portableTextToHTML(section.content)}</div>`;
    }

    return `
      <section class="content-section" id="section-${index}">
        <div class="${layoutClass}">
          <div class="section-header">
            <h2>${section.title}</h2>
            ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
          </div>
          ${contentHTML}
        </div>
      </section>
    `;
  }

  function buildChartsInitScript(sections) {
    const configs = sections
      .map((section, index) => {
        if (!section.hasChart || !section.chartData) return null;
        const config = buildChartJsConfig(section, { animation: true });
        if (!config) return null;
        // Chart.js initialization: new Chart(canvas, config)
        return `new Chart(document.getElementById('chart-${index}'), ${JSON.stringify(config)});`;
      })
      .filter(Boolean);

    return configs.join('\n');
  }

  function generateHTML(report) {
    const sectionsHTML = report.sections
      .map((section, index) => {
        if (section._type === 'navigationSection') return buildNavigationHTML(section, report.sections);
        if (section._type === 'contentSection') return buildContentSectionHTML(section, index);
        return '';
      })
      .join('\n');

    const chartsInitScript = buildChartsInitScript(report.sections);
    const publicationDate = new Date(report.publicationDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <!-- Chart.js for chart rendering -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <!-- Optional Chart.js plugins for specialized chart types -->
  <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-treemap@2.3.0/dist/chartjs-chart-treemap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-matrix@2.0.1/dist/chartjs-chart-matrix.min.js"></script>
  <!-- GSAP for animations -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/ScrollTrigger.min.js"></script>
  <style>
    :root {
${generateCSSVariablesString('      ')}
      /* Legacy aliases */
      --gmo-green: var(--color-surface-secondary);
      --text-primary: var(--color-text-primary);
      --text-secondary: var(--color-text-secondary);
      --bg-primary: var(--color-bg-primary);
      --bg-secondary: var(--color-bg-secondary);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'BNPP Sans', -apple-system, sans-serif;
      color: var(--text-primary);
      background: var(--bg-primary);
      line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
    .container-narrow { max-width: 900px; margin: 0 auto; padding: 0 24px; }
    .report-header {
      background: linear-gradient(135deg, var(--gmo-green) 0%, #132728 100%);
      color: white;
      padding: 96px 0;
      position: relative;
    }
    h1 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; margin-bottom: 16px; }
    .lead { font-size: 1.375rem; margin-bottom: 24px; opacity: 0.9; }
    .report-meta { display: flex; gap: 24px; opacity: 0.85; }
    .navigation-section { background: var(--bg-secondary); padding: 72px 0; border-top: 4px solid var(--gmo-green); }
    .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-top: 48px; }
    .nav-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid var(--gmo-green);
      text-decoration: none;
      color: inherit;
      display: block;
      transition: all 0.3s;
    }
    .nav-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(62,114,116,0.15); }
    .nav-card h4 { font-size: 1.25rem; margin-bottom: 8px; color: var(--gmo-green); }
    .nav-card p { font-size: 0.95rem; color: var(--text-secondary); margin: 0; }
    .content-section { padding: 96px 0; border-bottom: 1px solid #E0E0E0; }
    .section-header { margin-bottom: 72px; }
    .section-header h2 {
      font-size: clamp(2rem, 4vw, 3.5rem);
      font-weight: 700;
      margin-bottom: 24px;
      position: relative;
      display: inline-block;
    }
    .section-header h2::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 60px;
      height: 4px;
      background: var(--gmo-green);
    }
    .section-subtitle { font-size: 1.5rem; color: var(--text-secondary); font-weight: 300; }
    .layout-chart-left { display: grid; grid-template-columns: 1.2fr 1fr; gap: 72px; align-items: start; }
    .layout-chart-right { display: grid; grid-template-columns: 1fr 1.2fr; gap: 72px; align-items: start; }
    @media (max-width: 900px) {
      .layout-chart-left, .layout-chart-right { grid-template-columns: 1fr; gap: 48px; }
    }
    .chart-wrapper {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      border: 1px solid #E0E0E0;
      position: relative;
      height: 450px;
    }
    .chart-container {
      width: 100%;
      height: 100%;
      max-height: 450px;
    }
    .chart-source { margin-top: 16px; font-size: 0.875rem; color: var(--text-secondary); font-style: italic; }
    .content-block { font-size: 1.125rem; line-height: 1.8; }
    .content-block ul { list-style: none; padding: 0; margin: 48px 0; }
    .content-block li {
      padding: 16px 0 16px 24px;
      position: relative;
      border-bottom: 1px solid #F0F0F0;
    }
    .content-block li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 1.4rem;
      width: 8px;
      height: 8px;
      background: var(--gmo-green);
      border-radius: 50%;
    }
    .report-footer { background: var(--bg-secondary); padding: 72px 0; text-align: center; border-top: 1px solid #E0E0E0; }
    .scroll-indicator {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: var(--gmo-green);
      z-index: 9999;
      transform-origin: left;
      width: 100%;
      transform: scaleX(0);
    }
  </style>
</head>
<body>
  <div class="scroll-indicator" id="scroll-indicator"></div>
  <header class="report-header">
    <div class="container">
      <h1>${report.title}</h1>
      ${report.summary ? `<p class="lead">${report.summary}</p>` : ''}
      <div class="report-meta">
        <span>${publicationDate}</span>
        <span>${report.author}</span>
      </div>
    </div>
  </header>
  ${sectionsHTML}
  <footer class="report-footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} AXA Investment Managers</p>
    </div>
  </footer>
  <script>
    // Initialize all charts with Chart.js
    ${chartsInitScript}

    // GSAP animations
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('#scroll-indicator', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });
    gsap.from('.report-header h1', { opacity: 0, y: 30, duration: 0.8, delay: 0.2 });
    gsap.utils.toArray('.content-section').forEach((section) => {
      gsap.from(section.querySelector('.section-header'), {
        opacity: 0, y: 40, duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 80%' }
      });
    });
  </script>
</body>
</html>`;
  }

  // Main handler logic
  try {
    const report = await fetchLatestReport();

    if (!report) {
      return res.status(404).send('<h1>No report found</h1><p>Create a report in Sanity CMS first.</p>');
    }

    const html = generateHTML(report);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Build failed: ' + error.message);
  }
}
