# GMO Builder

> **⚠️ DEPRECATED**: This module is being replaced by [`gmo-report`](../gmo-report/), a React-based viewer with improved chart rendering and interactivity.
>
> **New development should target `gmo-report`.**
> This module is maintained for backwards compatibility only.

---

Generates HTML reports from Sanity CMS content for BNP Paribas Asset Management's Global Market Outlook.

## Overview

This builder fetches report data from Sanity and generates:
- **HTML reports** with interactive charts (Chart.js) and scroll animations (GSAP)
- **PDF exports** with rendered charts via QuickChart.io

## Project Structure

```
gmo-builder/
├── api/                    # Vercel serverless functions
│   ├── build.js           # Main HTML report generator endpoint
│   └── pdf-export.js      # PDF export endpoint
├── lib/
│   ├── chart-config.js    # Chart.js configuration builder
│   ├── design-tokens/     # Color themes and CSS variables
│   └── pdf/               # PDF generation utilities
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

| Endpoint | Description |
|----------|-------------|
| `/` or `/api/build` | Generates HTML report from latest Sanity data |
| `/api/pdf-export?reportId=<id>` | Exports report as PDF |

## Environment Variables

Set in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `CLAUDE_API_KEY` | (Optional) For AI-powered PDF layout optimization |

## Dependencies

- `@sanity/client` - Fetches data from Sanity CMS
- `pdfkit` - PDF generation
- Chart.js (CDN) - Interactive charts
- GSAP (CDN) - Scroll animations
