// build-slide.mjs
import { createClient } from '@sanity/client';
import fs from 'fs';
import { GMO_COLORS, generateCSSVariablesString } from './lib/design-tokens/index.js';
import { buildChartJsConfig } from './lib/chart-config.js';

// Configure Sanity client
const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

// Color theme mapping for section backgrounds
const COLOR_THEME_MAP = {
  blue: { background: '#7CC5D9', text: '#FFFFFF' },
  green: { background: '#008252', text: '#FFFFFF' },
  orange: { background: '#E8967B', text: '#FFFFFF' },
  brown: { background: '#A8887A', text: '#FFFFFF' },
  mint: { background: '#9DD9C7', text: '#1A1A1A' },
  none: { background: 'transparent', text: 'inherit' },
};

// Fetch latest report from Sanity
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

// Convert Sanity portable text to HTML
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

// Build title section HTML (hero/cover section)
function buildTitleSectionHTML(section) {
  const isImageBackground = section.backgroundType === 'image' && section.backgroundImage;
  const bgColor = section.backgroundColor || '#3E7274';

  const backgroundStyle = isImageBackground
    ? `background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${section.backgroundImage}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${bgColor} 0%, #132728 100%);`;

  return `
    <header class="report-header title-section" style="${backgroundStyle}">
      <div class="container">
        <h1>${section.heading || ''}</h1>
        ${section.subheading ? `<p class="lead">${section.subheading}</p>` : ''}
        ${section.companyLogo ? `
          <div class="company-logo">
            <img src="${section.companyLogo}" alt="Company Logo" />
          </div>
        ` : ''}
      </div>
    </header>
  `;
}

// Build navigation HTML
function buildNavigationHTML(section, allSections) {
  // Map sections with their original index to match content section IDs
  const contentSections = allSections
    .map((s, originalIndex) => ({ section: s, originalIndex }))
    .filter(item => item.section._type === 'contentSection')
    .map(item => ({
      title: item.section.title,
      subtitle: item.section.subtitle,
      id: `section-${item.originalIndex}`
    }));

  // Get card images mapped by section index
  const cardImageMap = {};
  if (section.cardImages) {
    section.cardImages.forEach(ci => {
      if (ci.sectionIndex && ci.imageUrl) {
        cardImageMap[ci.sectionIndex] = ci.imageUrl;
      }
    });
  }

  const isCardsLayout = section.layout === 'cards';
  const layoutClass = isCardsLayout ? 'nav-grid nav-grid-cards' : 'nav-grid';

  const cards = contentSections
    .map((s, i) => {
      const cardImage = cardImageMap[i + 1]; // sectionIndex is 1-based
      const hasImage = isCardsLayout && cardImage;

      return `
        <a href="#${s.id}" class="nav-card ${hasImage ? 'nav-card-with-image' : ''}">
          <div class="nav-card-content">
            <h4>${s.title}</h4>
            ${s.subtitle ? `<p>${s.subtitle}</p>` : ''}
          </div>
          ${hasImage ? `
            <div class="nav-card-image">
              <img src="${cardImage}" alt="${s.title}" />
            </div>
          ` : ''}
        </a>
      `;
    })
    .join('');

  return `
    <section class="navigation-section">
      <div class="container">
        <h3>${section.title || 'In This Report'}</h3>
        <div class="${layoutClass}">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

// Build header section HTML (full-bleed section divider)
function buildHeaderSectionHTML(section) {
  const theme = COLOR_THEME_MAP[section.backgroundColor] || COLOR_THEME_MAP.blue;

  return `
    <section class="header-section" style="background: ${theme.background}; color: ${theme.text};">
      <div class="container header-section-content">
        <div class="header-section-text">
          <h2>${section.title || ''}</h2>
          ${section.subtitle ? `<p class="header-section-subtitle">${section.subtitle}</p>` : ''}
        </div>
        ${section.image ? `
          <div class="header-section-image">
            <img src="${section.image}" alt="${section.title || 'Section image'}" />
          </div>
        ` : ''}
      </div>
      ${section.showBnpBanner ? `
        <div class="bnp-banner">
          <span class="bnp-logo">BNP PARIBAS</span>
          <span class="bnp-tagline">The sustainable investor for a changing world</span>
        </div>
      ` : ''}
    </section>
  `;
}

// Build timeline section HTML
function buildTimelineSectionHTML(section) {
  const items = section.items || [];

  const timelineItems = items.map(item => `
    <div class="timeline-item">
      <div class="timeline-number">${item.number || ''}</div>
      ${item.image ? `
        <div class="timeline-image">
          <img src="${item.image}" alt="${item.header || ''}" />
        </div>
      ` : ''}
      <div class="timeline-content">
        <h4>${item.header || ''}</h4>
        ${item.body ? `<p>${item.body}</p>` : ''}
      </div>
    </div>
  `).join('');

  return `
    <section class="timeline-section">
      <div class="container">
        <div class="section-header">
          <h2>${section.title || ''}</h2>
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
        </div>
        <div class="timeline-container">
          <div class="timeline-track"></div>
          <div class="timeline-items">
            ${timelineItems}
          </div>
        </div>
      </div>
    </section>
  `;
}

// Build chart insights section HTML
function buildChartInsightsSectionHTML(section, index) {
  const hasChart = section.chartData;
  const chartId = hasChart ? `chart-insights-${index}` : null;
  const position = section.insightsPosition || 'right';
  const insightsTheme = COLOR_THEME_MAP[section.insightsColor] || COLOR_THEME_MAP.green;

  const chartHTML = hasChart ? `
    <div class="chart-wrapper chart-insights-chart">
      <canvas class="chart-container" id="${chartId}"></canvas>
      ${section.chartSource ? `<p class="chart-source">Source: ${section.chartSource}</p>` : ''}
    </div>
  ` : '';

  const insightsHTML = section.insights && section.insights.length > 0 ? `
    <div class="insights-panel insights-${position}" style="background: ${insightsTheme.background}; color: ${insightsTheme.text};">
      <h4>Key Insights</h4>
      <ul>
        ${section.insights.map(insight => `<li>${insight}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const layoutClass = `chart-insights-layout layout-insights-${position}`;

  return `
    <section class="chart-insights-section" id="chart-insights-${index}">
      <div class="container">
        <div class="section-header">
          <h2>${section.title || ''}</h2>
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
        </div>
        <div class="${layoutClass}">
          ${position === 'left' || position === 'top' ? insightsHTML : ''}
          ${chartHTML}
          ${position === 'right' || position === 'bottom' ? insightsHTML : ''}
        </div>
      </div>
    </section>
  `;
}

// Build content section HTML
function buildContentSectionHTML(section, index) {
  const hasChart = section.hasChart && section.chartData;
  const chartId = hasChart ? `chart-${index}` : null;

  // Handle color theme
  const colorTheme = section.colorTheme || 'none';
  const theme = COLOR_THEME_MAP[colorTheme] || COLOR_THEME_MAP.none;
  const hasColorTheme = colorTheme && colorTheme !== 'none';
  const sectionStyle = hasColorTheme
    ? `background: ${theme.background}; color: ${theme.text};`
    : '';
  const themeClass = hasColorTheme ? 'content-section-themed' : '';

  // Section image (displayed above content)
  const sectionImageHTML = section.sectionImage
    ? `<div class="section-image"><img src="${section.sectionImage}" alt="${section.title || 'Section illustration'}" /></div>`
    : '';

  let layoutClass = 'container-narrow';
  let contentHTML = '';

  if (hasChart) {
    // Use canvas element for Chart.js
    const chartHTML = `
      <div class="chart-wrapper">
        <canvas class="chart-container" id="${chartId}"></canvas>
        ${section.chartSource ? `<p class="chart-source">Source: ${section.chartSource}</p>` : ''}
      </div>
    `;

    // Text column with optional section image above the content
    const textColumnHTML = `
      <div class="text-column">
        ${sectionImageHTML}
        <div class="content-block">
          ${portableTextToHTML(section.content)}
        </div>
      </div>
    `;

    if (section.layout === 'chartLeft') {
      layoutClass = 'container';
      contentHTML = `
        <div class="layout-chart-left">
          ${chartHTML}
          ${textColumnHTML}
        </div>
      `;
    } else if (section.layout === 'chartRight') {
      layoutClass = 'container';
      contentHTML = `
        <div class="layout-chart-right">
          ${textColumnHTML}
          ${chartHTML}
        </div>
      `;
    } else {
      // chartFull layout - image above text, then chart below
      layoutClass = 'container';
      contentHTML = `
        ${sectionImageHTML}
        <div class="content-block">
          ${portableTextToHTML(section.content)}
        </div>
        ${chartHTML}
      `;
    }
  } else {
    contentHTML = `
      ${sectionImageHTML}
      <div class="content-block">
        ${portableTextToHTML(section.content)}
      </div>
    `;
  }

  return `
    <section class="content-section ${themeClass}" id="section-${index}" style="${sectionStyle}">
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

// Build charts configuration JavaScript using Chart.js
function buildChartsInitScript(sections) {
  const configs = [];

  sections.forEach((section, index) => {
    // Handle contentSection charts
    if (section._type === 'contentSection' && section.hasChart && section.chartData) {
      const config = buildChartJsConfig(section, { animation: true });
      if (config) {
        configs.push(`new Chart(document.getElementById('chart-${index}'), ${JSON.stringify(config, null, 2)});`);
      }
    }

    // Handle chartInsightsSection charts
    if (section._type === 'chartInsightsSection' && section.chartData) {
      const config = buildChartJsConfig(section, { animation: true });
      if (config) {
        configs.push(`new Chart(document.getElementById('chart-insights-${index}'), ${JSON.stringify(config, null, 2)});`);
      }
    }
  });

  return configs.join('\n');
}

// Generate complete HTML
function generateHTML(report) {
  // Track if we've used a titleSection (to avoid duplicate headers)
  let hasTitleSection = false;

  const sectionsHTML = report.sections
    .map((section, index) => {
      if (section._type === 'titleSection') {
        hasTitleSection = true;
        return buildTitleSectionHTML(section);
      }
      if (section._type === 'navigationSection') {
        return buildNavigationHTML(section, report.sections);
      }
      if (section._type === 'contentSection') {
        return buildContentSectionHTML(section, index);
      }
      if (section._type === 'headerSection') {
        return buildHeaderSectionHTML(section);
      }
      if (section._type === 'timelineSection') {
        return buildTimelineSectionHTML(section);
      }
      if (section._type === 'chartInsightsSection') {
        return buildChartInsightsSectionHTML(section, index);
      }
      return '';
    })
    .join('\n');

  const chartsInitScript = buildChartsInitScript(report.sections);

  const publicationDate = new Date(report.publicationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
      /* Legacy aliases for backward compatibility */
      --gmo-green: var(--color-surface-secondary);
      --gmo-blue: var(--color-chart-1);
      --gmo-copper: var(--color-chart-2);
      --text-primary: var(--color-text-primary);
      --text-secondary: var(--color-text-secondary);
      --bg-primary: var(--color-bg-primary);
      --bg-secondary: var(--color-bg-secondary);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: 'BNPP Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text-primary);
      background: var(--bg-primary);
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .container-narrow {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Header */
    .report-header {
      background: linear-gradient(135deg, var(--gmo-green) 0%, #132728 100%);
      color: white;
      padding: 96px 0;
      position: relative;
      overflow: hidden;
    }

    .report-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.1;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 50px 50px;
    }

    .report-header .container {
      position: relative;
      z-index: 1;
    }

    h1 {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      line-height: 1.05;
      margin-bottom: 16px;
    }

    .lead {
      font-size: 1.375rem;
      line-height: 2rem;
      opacity: 0.9;
      margin-bottom: 24px;
    }

    .report-meta {
      display: flex;
      gap: 24px;
      font-size: 1rem;
      opacity: 0.85;
    }

    /* Navigation */
    .navigation-section {
      background: var(--bg-secondary);
      padding: 72px 0;
      border-top: 4px solid var(--gmo-green);
    }

    .nav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-top: 48px;
    }

    .nav-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid var(--gmo-green);
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .nav-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(62, 114, 116, 0.15);
      border-left-color: var(--gmo-blue);
    }

    .nav-card h4 {
      font-size: 1.25rem;
      margin-bottom: 8px;
      color: var(--gmo-green);
    }

    .nav-card p {
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* Content Sections */
    .content-section {
      padding: 96px 0;
      border-bottom: 1px solid #E0E0E0;
    }

    .content-section:last-of-type {
      border-bottom: none;
    }

    .section-header {
      margin-bottom: 72px;
    }

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
      border-radius: 2px;
    }

    .section-subtitle {
      font-size: 1.5rem;
      color: var(--text-secondary);
      font-weight: 300;
      margin-top: 16px;
    }

    /* Layouts */
    .layout-chart-left {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 72px;
      align-items: start;
    }

    .layout-chart-right {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 72px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .layout-chart-left,
      .layout-chart-right {
        grid-template-columns: 1fr;
        gap: 48px;
      }
    }

    /* Charts */
    .chart-wrapper {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      border: 1px solid #E0E0E0;
      position: relative;
      height: 450px;
    }

    .chart-container {
      width: 100%;
      height: 100%;
      max-height: 450px;
    }

    .chart-source {
      margin-top: 16px;
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-style: italic;
    }

    /* Sticky charts in side-by-side layouts */
    .layout-chart-left .chart-wrapper,
    .layout-chart-right .chart-wrapper {
      position: sticky;
      top: 24px;
      align-self: start;
    }

    /* Content */
    .content-block {
      font-size: 1.125rem;
      line-height: 1.8;
    }

    .content-block p {
      margin-bottom: 24px;
    }

    .content-block ul {
      list-style: none;
      padding: 0;
      margin: 48px 0;
    }

    .content-block li {
      padding: 16px 0;
      padding-left: 24px;
      position: relative;
      border-bottom: 1px solid #F0F0F0;
    }

    .content-block li:last-child {
      border-bottom: none;
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

    h3 {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 300;
      margin-bottom: 16px;
    }

    /* Footer */
    .report-footer {
      background: var(--bg-secondary);
      padding: 72px 0;
      margin-top: 96px;
      text-align: center;
      border-top: 1px solid #E0E0E0;
    }

    .report-footer p {
      margin: 0;
      color: var(--text-secondary);
    }

    /* Scroll Progress */
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

    /* Section Dividers - Full-bleed colored backgrounds */
    .section-divider {
      min-height: 50vh;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
      padding: 80px 0;
    }

    .section-divider .container {
      position: relative;
      z-index: 1;
    }

    .section-divider .section-number {
      font-family: var(--font-family-primary, 'BNPP Sans Condensed', sans-serif);
      font-size: clamp(80px, 15vw, 140px);
      font-weight: 700;
      opacity: 0.15;
      position: absolute;
      top: 50%;
      right: 10%;
      transform: translateY(-50%);
    }

    .section-divider h2 {
      font-family: var(--font-family-primary, 'BNPP Sans Condensed', sans-serif);
      font-size: clamp(2.5rem, 6vw, 5rem);
      font-weight: 700;
      line-height: 1.05;
      max-width: 60%;
    }

    .section-divider h2::after {
      display: none;
    }

    .section-divider .divider-subtitle {
      font-size: 1.5rem;
      font-weight: 300;
      margin-top: 24px;
      max-width: 50%;
      opacity: 0.9;
    }

    /* Themed Content Section backgrounds */
    .content-section[data-theme="market-themes"],
    .content-section[data-theme="economic-outlook"],
    .content-section[data-theme="geopolitical"],
    .content-section[data-theme="central-banks"] {
      background: var(--color-section-market-themes-bg, #7CC5D9);
      color: var(--color-section-market-themes-text, #FFFFFF);
    }

    .content-section[data-theme="ai-capex"] {
      background: var(--color-section-ai-capex-bg, #E8967B);
      color: var(--color-section-ai-capex-text, #FFFFFF);
    }

    .content-section[data-theme="american-exceptionalism"] {
      background: var(--color-section-american-exceptionalism-bg, #A8887A);
      color: var(--color-section-american-exceptionalism-text, #FFFFFF);
    }

    .content-section[data-theme="our-view"],
    .content-section[data-theme="appendix"] {
      background: var(--color-section-our-view-bg, #008252);
      color: var(--color-section-our-view-text, #FFFFFF);
    }

    .content-section[data-theme="december-review"] {
      background: var(--color-section-december-review-bg, #9DD9C7);
      color: var(--color-section-december-review-text, #1A1A1A);
    }

    /* Key Insights Sidebar */
    .layout-with-insights {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 48px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .layout-with-insights {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }

    .key-insights-sidebar {
      background: var(--color-key-insights-bg, #008252);
      color: var(--color-key-insights-text, #FFFFFF);
      padding: 28px 24px;
      border-radius: 8px;
      position: sticky;
      top: 24px;
    }

    .key-insights-sidebar h4 {
      font-family: var(--font-family-primary, 'BNPP Sans Condensed', sans-serif);
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .key-insights-sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .key-insights-sidebar li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.6;
      border-bottom: none;
    }

    .key-insights-sidebar li:last-child {
      margin-bottom: 0;
    }

    .key-insights-sidebar li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 6px;
      height: 6px;
      background: var(--color-key-insights-bullet, #FFFFFF);
      border-radius: 50%;
    }

    /* Numbered Box Cards (for key themes display) */
    .numbered-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-top: 48px;
    }

    .numbered-card {
      position: relative;
      padding: 24px;
      border-radius: 8px;
      overflow: hidden;
    }

    .numbered-card .card-number {
      font-family: var(--font-family-primary, 'BNPP Sans Condensed', sans-serif);
      font-size: 48px;
      font-weight: 700;
      opacity: 0.85;
      margin-bottom: 16px;
      color: inherit;
    }

    .numbered-card h5 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .numbered-card p {
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      opacity: 0.9;
    }

    /* Footer Bar (BNPP Style) */
    .report-footer-bar {
      position: relative;
      background: #1A1A1A;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      margin-top: 0;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .footer-logo {
      height: 24px;
    }

    .footer-tagline {
      color: #CCCCCC;
      font-size: 12px;
      font-style: italic;
    }

    .footer-page {
      color: white;
      font-size: 14px;
      font-weight: 600;
    }

    /* ========== NEW SECTION STYLES ========== */

    /* Title Section (Hero with background image/color) */
    .title-section {
      min-height: 60vh;
      display: flex;
      align-items: center;
      position: relative;
    }

    .title-section .container {
      padding-bottom: 120px; /* Space for company logo */
    }

    .title-section h1 {
      max-width: 80%;
    }

    .title-section .lead {
      max-width: 70%;
    }

    .title-section .company-logo {
      position: absolute;
      bottom: 40px;
      left: 24px;
    }

    .title-section .company-logo img {
      max-height: 60px;
      max-width: 200px;
      object-fit: contain;
    }

    /* Navigation Cards with Images */
    .nav-grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 48px;
    }

    .nav-card-with-image {
      display: flex;
      align-items: stretch;
      padding: 0;
      overflow: visible;
      position: relative;
      margin-right: 40px;
    }

    .nav-card-with-image .nav-card-content {
      flex: 1;
      padding: 24px;
      padding-right: 120px;
    }

    .nav-card-with-image .nav-card-image {
      position: absolute;
      right: -20%;
      top: 50%;
      transform: translateY(-50%);
      width: 40%;
      height: 120%;
      overflow: visible;
    }

    .nav-card-with-image .nav-card-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }

    /* Header Section (Full-bleed divider) */
    .header-section {
      min-height: 40vh;
      padding: 80px 0;
      position: relative;
    }

    .header-section-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 48px;
    }

    .header-section-text {
      flex: 1;
      max-width: 70%;
    }

    .header-section-text h2 {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 16px;
    }

    .header-section-text h2::after {
      display: none;
    }

    .header-section-subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      font-weight: 300;
    }

    .header-section-image {
      flex-shrink: 0;
      max-width: 35%;
    }

    .header-section-image img {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
    }

    @media (max-width: 768px) {
      .header-section-content {
        flex-direction: column;
        gap: 32px;
      }
      .header-section-text,
      .header-section-image {
        max-width: 100%;
      }
    }

    .bnp-banner {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.2);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .bnp-logo {
      font-weight: 700;
      font-size: 14px;
    }

    .bnp-tagline {
      font-size: 12px;
      font-style: italic;
      opacity: 0.9;
    }

    /* Timeline Section */
    .timeline-section {
      padding: 96px 0;
      background: var(--bg-secondary);
    }

    .timeline-container {
      position: relative;
      margin-top: 48px;
    }

    .timeline-track {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gmo-green);
      border-radius: 2px;
    }

    .timeline-items {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      overflow-x: auto;
      padding-bottom: 24px;
    }

    .timeline-item {
      flex: 1;
      min-width: 180px;
      max-width: 280px;
      text-align: center;
    }

    .timeline-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--gmo-green);
      margin-bottom: 16px;
    }

    .timeline-image {
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      border-radius: 50%;
      overflow: hidden;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .timeline-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .timeline-content h4 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-primary);
    }

    .timeline-content p {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Timeline responsive - vertical on mobile */
    @media (max-width: 768px) {
      .timeline-track {
        top: 0;
        bottom: 0;
        left: 30px;
        right: auto;
        width: 4px;
        height: auto;
      }

      .timeline-items {
        flex-direction: column;
        gap: 32px;
      }

      .timeline-item {
        display: flex;
        align-items: flex-start;
        gap: 24px;
        text-align: left;
        max-width: 100%;
        padding-left: 60px;
      }

      .timeline-number {
        position: absolute;
        left: 0;
        width: 60px;
        text-align: center;
      }

      .timeline-image {
        flex-shrink: 0;
        margin: 0;
      }
    }

    /* Chart Insights Section */
    .chart-insights-section {
      padding: 96px 0;
    }

    .chart-insights-layout {
      display: grid;
      gap: 48px;
      align-items: start;
      margin-top: 48px;
    }

    .layout-insights-right {
      grid-template-columns: 1fr 300px;
    }

    .layout-insights-left {
      grid-template-columns: 300px 1fr;
    }

    .layout-insights-top,
    .layout-insights-bottom {
      grid-template-columns: 1fr;
    }

    .chart-insights-chart {
      height: 400px;
    }

    .insights-panel {
      padding: 28px 24px;
      border-radius: 8px;
    }

    .insights-panel h4 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .insights-panel ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .insights-panel li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.6;
      border-bottom: none;
    }

    .insights-panel li:last-child {
      margin-bottom: 0;
    }

    .insights-panel li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 6px;
      height: 6px;
      background: currentColor;
      opacity: 0.8;
      border-radius: 50%;
    }

    @media (max-width: 900px) {
      .layout-insights-right,
      .layout-insights-left {
        grid-template-columns: 1fr;
      }
    }

    /* Content Section with Theme */
    .content-section-themed .section-header h2::after {
      background: rgba(255, 255, 255, 0.5);
    }

    .content-section-themed .content-block li::before {
      background: currentColor;
      opacity: 0.8;
    }

    .content-section-themed .chart-source {
      color: inherit;
      opacity: 0.8;
    }

    /* Section Image */
    .section-image {
      margin-bottom: 48px;
      text-align: center;
    }

    .section-image img {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: 8px;
    }

    /* Text Column (for layouts with chart + text side by side) */
    .text-column {
      display: flex;
      flex-direction: column;
    }

    .text-column .section-image {
      margin-bottom: 32px;
    }
  </style>
</head>
<body>
  <div class="scroll-indicator" id="scroll-indicator"></div>

  ${!hasTitleSection ? `
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
  ` : ''}

  ${sectionsHTML}

  <footer class="report-footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} BNP Paribas Asset Management. All rights reserved.</p>
      <p>The sustainable investor for a changing world</p>
    </div>
  </footer>

  <div class="report-footer-bar">
    <div class="footer-left">
      <span style="color: #008252; font-weight: bold; font-size: 14px;">BNP PARIBAS</span>
      <span class="footer-tagline">The sustainable investor for a changing world</span>
    </div>
  </div>

  <script>
    // Initialize all charts with Chart.js
    ${chartsInitScript}

    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Scroll progress
    gsap.to('#scroll-indicator', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });

    // Header animations
    gsap.from('.report-header h1', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.2
    });

    gsap.from('.report-header .lead', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.4
    });

    gsap.from('.report-header .report-meta', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.6
    });

    // Section animations
    gsap.utils.toArray('.content-section').forEach((section) => {
      gsap.from(section.querySelector('.section-header'), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      const chart = section.querySelector('.chart-wrapper');
      if (chart) {
        gsap.from(chart, {
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          scrollTrigger: {
            trigger: chart,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      }

      gsap.from(section.querySelectorAll('.content-block p, .content-block li'), {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Navigation cards
    gsap.from('.nav-card', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.navigation-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
  </script>
</body>
</html>`;
}

// Main build function
async function build() {
  console.log('Fetching report from Sanity...');

  const report = await fetchLatestReport();

  if (!report) {
    console.error('No report found in Sanity');
    process.exit(1);
  }

  console.log(`Building: ${report.title}`);
  console.log(`Sections: ${report.sections.length}`);

  const html = generateHTML(report);

  // Ensure output directory exists
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
  }

  // Write to output/index.html
  fs.writeFileSync('output/index.html', html);
  console.log('Built output/index.html');
  console.log('Open in browser to view');
}

build().catch(console.error);
