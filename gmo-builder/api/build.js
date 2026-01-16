import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

const GMO_COLORS = {
  primaryGreen: '#3E7274',
  coastBlue: '#3D748F',
  copper: '#AC5359',
  orange: '#F1875A',
  lightGreen: '#76BCA3',
  darkBlue: '#132728',
  textPrimary: '#1A1A1A',
  textSecondary: '#5F5F5F',
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F5F5F5',
};

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
          chartType,
          chartData,
          chartSeries[] {
            label,
            dataColumn,
            colour
          },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat,
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

  function parseCSV(csv) {
    if (!csv) return [];
    
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        const val = values[i]?.trim();
        obj[header] = isNaN(val) ? val : parseFloat(val);
      });
      return obj;
    });
  }

  function buildChartConfig(section) {
    if (!section.hasChart || !section.chartData) return null;
    
    const parsedData = parseCSV(section.chartData);
    if (parsedData.length === 0) return null;
    
    const xAxisKey = Object.keys(parsedData[0])[0];
    const categories = parsedData.map(row => row[xAxisKey]);
    
    const series = (section.chartSeries || []).map(s => ({
      name: s.label,
      data: parsedData.map(row => row[s.dataColumn]),
      color: s.colour,
    }));
    
    const chartTypeMap = {
      line: 'line',
      column: 'column',
      bar: 'bar',
      area: 'area',
      stackedColumn: 'column',
      stackedArea: 'area',
    };
    
    const isStacked = section.chartType?.includes('stacked');
    
    return {
      chart: {
        type: chartTypeMap[section.chartType] || 'line',
        style: { fontFamily: '"BNPP Sans", -apple-system, sans-serif' },
        backgroundColor: 'transparent',
        height: 450,
      },
      title: { text: null },
      xAxis: {
        categories: categories,
        title: { text: section.xAxisLabel || null },
        labels: { style: { color: GMO_COLORS.textSecondary } },
      },
      yAxis: {
        title: { text: section.yAxisLabel || null },
        labels: {
          style: { color: GMO_COLORS.textSecondary },
          formatter: function() {
            if (section.yAxisFormat === 'percent') return this.value + '%';
            if (section.yAxisFormat === 'currency') return '$' + this.value.toLocaleString();
            return this.value.toLocaleString();
          }
        },
      },
      legend: {
        align: 'left',
        itemStyle: { color: GMO_COLORS.textPrimary },
      },
      plotOptions: {
        series: {
          animation: { duration: 1200 },
          marker: { enabled: false },
          lineWidth: 3,
        },
        column: { stacking: isStacked ? 'normal' : undefined },
        area: { stacking: isStacked ? 'normal' : undefined, fillOpacity: 0.25 },
      },
      series: series,
      credits: { enabled: false },
    };
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
      const chartHTML = `
        <div class="chart-wrapper">
          <div class="chart-container" id="${chartId}"></div>
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

  function buildChartsConfig(sections) {
    const configs = sections
      .map((section, index) => {
        if (!section.hasChart || !section.chartData) return null;
        const config = buildChartConfig(section);
        if (!config) return null;
        return `Highcharts.chart('chart-${index}', ${JSON.stringify(config)});`;
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
    
    const chartsConfig = buildChartsConfig(report.sections);
    const publicationDate = new Date(report.publicationDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/ScrollTrigger.min.js"></script>
  <style>
    :root {
      --gmo-green: ${GMO_COLORS.primaryGreen};
      --text-primary: ${GMO_COLORS.textPrimary};
      --text-secondary: ${GMO_COLORS.textSecondary};
      --bg-primary: ${GMO_COLORS.bgPrimary};
      --bg-secondary: ${GMO_COLORS.bgSecondary};
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
    }
    .chart-container { width: 100%; height: 450px; }
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
        <span>📅 ${publicationDate}</span>
        <span>✍️ ${report.author}</span>
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
    ${chartsConfig}
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