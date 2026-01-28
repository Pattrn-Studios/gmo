# GMO Builder

> **⚠️ HTML Generator DEPRECATED**: The HTML report generator is replaced by [`gmo-report`](../gmo-report/).
>
> **Translation API is ACTIVE** — `gmo-report` calls `/api/translate-json` for French translations.

---

Backend APIs for BNP Paribas Asset Management's Global Market Outlook reports.

## Overview

This module provides:
- **French Translation API** — Claude AI-powered translation of report content, consumed by `gmo-report`
- **HTML reports** (deprecated) — Legacy static HTML with Chart.js and GSAP
- **PDF exports** with rendered charts via QuickChart.io

## Project Structure

```
gmo-builder/
├── api/                    # Vercel serverless functions
│   ├── build.js           # Main HTML report generator endpoint (deprecated)
│   ├── translate.js       # French HTML endpoint (deprecated)
│   ├── translate-json.js  # French translation JSON API (active — used by gmo-report)
│   └── pdf-export.js      # PDF export endpoint
├── lib/
│   ├── translation-client.js  # Claude AI translation integration
│   ├── html-generator.js      # Shared HTML generation functions
│   ├── chart-config.js        # Chart.js configuration builder
│   ├── design-tokens/         # Color themes and CSS variables
│   └── pdf/                   # PDF generation utilities
├── output/                # Local build output (gitignored)
├── build-slide.mjs        # CLI build script for local development
└── vercel.json            # Vercel deployment configuration
```

## Supported Section Types

| Section Type | Description |
|--------------|-------------|
| `titleSection` | Hero section with background image/color and company logo |
| `navigationSection` | Table of contents with optional card images |
| `contentSection` | Main content with optional charts (left/right/full layouts) |
| `headerSection` | Full-bleed section divider with color themes |
| `timelineSection` | Horizontal timeline with numbered items |
| `chartInsightsSection` | Chart with key insights panel |

## Local Development

```bash
# Install dependencies
npm install

# Build report locally
npm run build

# Build and open in browser
npm run dev
```

Output is written to `output/index.html`.

## Deployment

Deployed on Vercel. Auto-deploys from `main` branch.

### Endpoints

| Endpoint | Description | Status |
|----------|-------------|--------|
| `/api/translate-json` | Returns French-translated report as JSON (consumed by `gmo-report`) | **Active** |
| `/` or `/api/build` | Generates HTML report from latest Sanity data | Deprecated |
| `/fr` | French HTML report | Deprecated |
| `/api/pdf-export?reportId=<id>` | Exports report as PDF | Active |

## Environment Variables

Set in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Required for French translation (Claude API) and AI slide review |

## Dependencies

- `@sanity/client` - Fetches data from Sanity CMS
- `@anthropic-ai/sdk` - Claude API for French translation
- `pdfkit` - PDF generation
- Chart.js (CDN) - Interactive charts
- GSAP (CDN) - Scroll animations
