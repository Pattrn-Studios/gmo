/**
 * PowerPoint Export Test Script
 *
 * Usage: node powerpoint/test-export.js [reportId]
 *
 * If no reportId provided, fetches the latest report.
 */

import { createClient } from '@sanity/client';
import { exportToPowerPoint } from './export-to-powerpoint.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function fetchLatestReport() {
  const query = `*[_type == "report"] | order(publicationDate desc)[0] {
    _id,
    title,
    publicationDate,
    author,
    summary,
    sections[] {
      _type,

      _type == "titleSection" => {
        heading,
        subheading,
        backgroundColor,
        "companyLogo": companyLogo { "asset": asset-> { url } }
      },

      _type == "navigationSection" => {
        title,
        showPageNumbers,
        layout,
        "cardImages": cardImages[] {
          title,
          description,
          "image": image { "asset": asset-> { url } }
        }
      },

      _type == "headerSection" => {
        title,
        subtitle,
        backgroundColor,
        "image": image { "asset": asset-> { url } }
      },

      _type == "contentSection" => {
        title,
        subtitle,
        content,
        hasChart,
        sectionTheme,
        "chartConfig": chartConfig {
          chartType,
          chartData,
          chartTitle,
          chartSeries[] { label, dataColumn, colour },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat
        },
        chartSource,
        layout,
        "sectionImage": sectionImage { "asset": asset-> { url } }
      },

      _type == "chartInsightsSection" => {
        title,
        subtitle,
        insightsPosition,
        insightsColor,
        insights,
        "chartConfig": chartConfig {
          chartType,
          chartData,
          chartTitle,
          chartSeries[] { label, dataColumn, colour },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat
        },
        chartSource
      },

      _type == "timelineSection" => {
        title,
        subtitle,
        items[] {
          number,
          header,
          body,
          "image": image { "asset": asset-> { url } }
        }
      }
    }
  }`;

  return await client.fetch(query);
}

async function fetchReportById(reportId) {
  const query = `*[_type == "report" && _id == $reportId][0] {
    _id,
    title,
    publicationDate,
    author,
    summary,
    sections[] {
      _type,

      _type == "titleSection" => {
        heading,
        subheading,
        backgroundColor,
        "companyLogo": companyLogo { "asset": asset-> { url } }
      },

      _type == "navigationSection" => {
        title,
        showPageNumbers,
        layout,
        "cardImages": cardImages[] {
          title,
          description,
          "image": image { "asset": asset-> { url } }
        }
      },

      _type == "headerSection" => {
        title,
        subtitle,
        backgroundColor,
        "image": image { "asset": asset-> { url } }
      },

      _type == "contentSection" => {
        title,
        subtitle,
        content,
        hasChart,
        sectionTheme,
        "chartConfig": chartConfig {
          chartType,
          chartData,
          chartTitle,
          chartSeries[] { label, dataColumn, colour },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat
        },
        chartSource,
        layout,
        "sectionImage": sectionImage { "asset": asset-> { url } }
      },

      _type == "chartInsightsSection" => {
        title,
        subtitle,
        insightsPosition,
        insightsColor,
        insights,
        "chartConfig": chartConfig {
          chartType,
          chartData,
          chartTitle,
          chartSeries[] { label, dataColumn, colour },
          xAxisLabel,
          yAxisLabel,
          yAxisFormat
        },
        chartSource
      },

      _type == "timelineSection" => {
        title,
        subtitle,
        items[] {
          number,
          header,
          body,
          "image": image { "asset": asset-> { url } }
        }
      }
    }
  }`;

  return await client.fetch(query, { reportId });
}

async function main() {
  const reportId = process.argv[2];

  console.log('=== PowerPoint Export Test ===\n');

  try {
    // Fetch report
    let report;
    if (reportId) {
      console.log(`Fetching report: ${reportId}`);
      report = await fetchReportById(reportId);
    } else {
      console.log('Fetching latest report...');
      report = await fetchLatestReport();
    }

    if (!report) {
      console.error('No report found');
      process.exit(1);
    }

    console.log(`Report: "${report.title}"`);
    console.log(`Sections: ${report.sections?.length || 0}`);

    // List section types
    report.sections?.forEach((section, i) => {
      console.log(`  ${i + 1}. ${section._type}: ${section.title || section.heading || '(no title)'}`);
    });

    console.log('\nGenerating PowerPoint...');

    // Generate PowerPoint
    const buffer = await exportToPowerPoint(report);

    // Save to file
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = (report.title || 'report')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const outputPath = path.join(outputDir, `${filename}.pptx`);
    fs.writeFileSync(outputPath, buffer);

    console.log(`\nSuccess! PowerPoint saved to:`);
    console.log(`  ${outputPath}`);
    console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);

  } catch (error) {
    console.error('\nError:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
