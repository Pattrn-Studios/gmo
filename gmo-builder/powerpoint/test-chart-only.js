/**
 * Simple chart test to verify pptxgenjs chart rendering
 */

import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testChart() {
  console.log('Creating test presentation with chart...\n');

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'Chart Test';

  // Log available chart types
  console.log('Available ChartTypes:', Object.keys(pptx.ChartType || {}));

  // Slide 1: Simple line chart
  const slide1 = pptx.addSlide();
  slide1.addText('Line Chart Test', { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 24, bold: true });

  const lineData = [
    {
      name: 'Series 1',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [10, 20, 15, 25, 30, 22]
    },
    {
      name: 'Series 2',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [5, 15, 20, 18, 25, 28]
    }
  ];

  // Use pptx.ChartType constant
  slide1.addChart(pptx.ChartType.line, lineData, {
    x: 0.5,
    y: 1.0,
    w: 8,
    h: 4,
    chartColors: ['009FB1', 'F49F7B'],
    showLegend: true,
    legendPos: 'b'
  });

  console.log('Added line chart to slide 1');

  // Slide 2: Bar chart
  const slide2 = pptx.addSlide();
  slide2.addText('Bar Chart Test', { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 24, bold: true });

  const barData = [
    {
      name: 'Revenue',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [100, 150, 120, 180]
    }
  ];

  slide2.addChart(pptx.ChartType.bar, barData, {
    x: 0.5,
    y: 1.0,
    w: 8,
    h: 4,
    chartColors: ['51BBB4'],
    barDir: 'col',
    showLegend: true
  });

  console.log('Added bar chart to slide 2');

  // Slide 3: Pie chart
  const slide3 = pptx.addSlide();
  slide3.addText('Pie Chart Test', { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 24, bold: true });

  const pieData = [
    {
      name: 'Market Share',
      labels: ['Product A', 'Product B', 'Product C', 'Product D'],
      values: [30, 25, 20, 25]
    }
  ];

  slide3.addChart(pptx.ChartType.pie, pieData, {
    x: 2,
    y: 1.0,
    w: 5,
    h: 5,
    chartColors: ['009FB1', '51BBB4', '61C3D7', 'F49F7B'],
    showLegend: true,
    legendPos: 'r'
  });

  console.log('Added pie chart to slide 3');

  // Save
  const outputPath = path.join(__dirname, '../output/chart-test.pptx');
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  fs.writeFileSync(outputPath, buffer);

  console.log(`\nSaved to: ${outputPath}`);
  console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

testChart().catch(console.error);
