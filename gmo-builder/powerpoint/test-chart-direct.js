/**
 * Direct file write test - uses pptxgenjs writeFile method
 */

import pptxgen from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testChart() {
  console.log('Creating test presentation...\n');

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'Chart Test Direct';

  // Slide 1: Line chart
  const slide1 = pptx.addSlide();
  slide1.addText('Line Chart Test', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 24, bold: true, color: '363636'
  });

  slide1.addChart(pptx.ChartType.line, [
    {
      name: 'Actual Sales',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [1500, 4600, 5156, 3167, 8510, 8009]
    },
    {
      name: 'Projected',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [1000, 2600, 3456, 4567, 5010, 6009]
    }
  ], {
    x: 0.5,
    y: 1.0,
    w: 8,
    h: 4.5,
    showLegend: true,
    legendPos: 'b',
    showTitle: false,
    lineDataSymbol: 'circle',
    lineDataSymbolSize: 8
  });

  console.log('Added line chart');

  // Slide 2: Bar chart
  const slide2 = pptx.addSlide();
  slide2.addText('Bar Chart Test', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 24, bold: true, color: '363636'
  });

  slide2.addChart(pptx.ChartType.bar, [
    {
      name: 'Revenue',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [100, 150, 120, 180]
    },
    {
      name: 'Expenses',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [80, 90, 100, 110]
    }
  ], {
    x: 0.5,
    y: 1.0,
    w: 8,
    h: 4.5,
    barDir: 'col',
    showLegend: true,
    legendPos: 'b'
  });

  console.log('Added bar chart');

  // Slide 3: Pie chart
  const slide3 = pptx.addSlide();
  slide3.addText('Pie Chart Test', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 24, bold: true, color: '363636'
  });

  slide3.addChart(pptx.ChartType.pie, [
    {
      name: 'Market Share',
      labels: ['Product A', 'Product B', 'Product C', 'Other'],
      values: [35, 28, 22, 15]
    }
  ], {
    x: 3,
    y: 1.0,
    w: 6,
    h: 5.5,
    showLegend: true,
    legendPos: 'r',
    showPercent: true,
    showValue: false
  });

  console.log('Added pie chart');

  // Use writeFile instead of write + fs
  const outputPath = path.join(__dirname, '../output/chart-test-direct.pptx');
  await pptx.writeFile({ fileName: outputPath });

  console.log(`\nSaved to: ${outputPath}`);
}

testChart().catch(console.error);
