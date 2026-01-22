import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { GMO_COLORS } from '../design-tokens/index.js';

/**
 * Renders a Highcharts configuration to a PNG image
 * @param {Object} chartConfig - Highcharts configuration object
 * @param {Object} options - Rendering options
 * @returns {Promise<string>} - Base64 encoded PNG image
 */
export async function renderChartToPNG(chartConfig, options = {}) {
  const { width = 700, height = 400 } = options;

  // Generate HTML page with Highcharts
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <script src="https://code.highcharts.com/highcharts.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: white; }
        #chart { width: ${width}px; height: ${height}px; }
      </style>
    </head>
    <body>
      <div id="chart"></div>
      <script>
        // Remove animation for static rendering
        const config = ${JSON.stringify(chartConfig)};
        if (config.plotOptions) {
          if (config.plotOptions.series) {
            config.plotOptions.series.animation = false;
          }
        }
        config.chart = config.chart || {};
        config.chart.animation = false;

        Highcharts.chart('chart', config);
        window.chartReady = true;
      </script>
    </body>
    </html>
  `;

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: width + 40, height: height + 40 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for chart to be ready
    await page.waitForFunction('window.chartReady === true', { timeout: 10000 });

    // Small delay to ensure complete rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // Screenshot the chart element
    const chartElement = await page.$('#chart');
    const screenshot = await chartElement.screenshot({
      type: 'png',
      encoding: 'base64'
    });

    return screenshot;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Renders all charts from report sections
 * @param {Array} sections - Report sections from Sanity
 * @param {Object} buildChartConfig - Function to build Highcharts config (from build.js)
 * @returns {Promise<Map>} - Map of section index to base64 PNG
 */
export async function renderAllCharts(sections, buildChartConfig) {
  const chartImages = new Map();

  // Collect sections with charts
  const chartsToRender = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.hasChart && section.chartData);

  if (chartsToRender.length === 0) {
    return chartImages;
  }

  // Render charts (sequentially to avoid memory issues)
  for (const { section, index } of chartsToRender) {
    try {
      const chartConfig = buildChartConfig(section);
      if (chartConfig) {
        const png = await renderChartToPNG(chartConfig);
        chartImages.set(index, png);
      }
    } catch (error) {
      console.error(`Failed to render chart for section ${index}:`, error);
      // Continue with other charts
    }
  }

  return chartImages;
}

// Re-export for consumers that import from this file
export { GMO_COLORS };
