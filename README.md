# GMO (Global Market Outlook) Suite

A collection of tools for creating and managing BNP Paribas' Global Market Outlook reports.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SANITY CMS                              │
│                      (gmo-prototype)                            │
│              Content Management & Chart Builder                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      gmo-report         │     │    gmo-chart-agent      │
│   (Next.js React App)   │     │   (AI Recommendations)  │
│   PRIMARY VIEWER        │     │                         │
│   English + French      │     │                         │
└─────────────────────────┘     └─────────────────────────┘
              │
              │ /api/translate-json
              ▼
┌─────────────────────────┐
│      gmo-builder        │
│   (Translation API +    │
│    Legacy HTML Gen)     │
└─────────────────────────┘
```

## Projects

### gmo-report ⭐ PRIMARY

**Interactive React-based report viewer** - The primary way to view GMO reports.

- **Tech Stack**: Next.js 14, React 18, TypeScript, Recharts, Tailwind CSS, Framer Motion
- **Features**: Dark mode, French translation (AI-powered), interactive charts, scroll-spy TOC, language dropdown
- **Local Dev**: `cd gmo-report && npm install && npm run dev`
- **Build**: `npm run build` (static shell; data fetched client-side from Sanity)

### gmo-prototype

Sanity CMS Studio for managing GMO report content with integrated Chart Builder and PowerPoint export.

- **Tech Stack**: Sanity v4, React 19, TypeScript, Recharts
- **Features**: AI chart builder (CSV + image upload), PowerPoint export with AI design review, French translation action
- **Local Dev**: `cd gmo-prototype && npm install && npm run dev`
- **Deploy**: `npx sanity deploy`

### gmo-chart-agent

AI-powered chart recommendation API using Claude for analyzing CSV data and chart images.

- **Tech Stack**: Express, multer, xlsx, Claude API (Sonnet + Vision)
- **Endpoints**: `/api/analyse` (CSV data), `/api/analyse-image` (chart image extraction)
- **Local Dev**: `cd gmo-chart-agent && npm install && node index.js` (requires `.env` with `CLAUDE_API_KEY`)
- **Production**: Deployed on Vercel

### gmo-builder ⚠️ DEPRECATED (HTML gen) / ACTIVE (Translation API)

> **Note**: The HTML report generator is deprecated. Use `gmo-report` for viewing reports.
> The translation API (`/api/translate-json`) is actively used by `gmo-report` for French translations.

Legacy HTML report generator + translation API. Fetches content from Sanity, translates via Claude AI.

- **Tech Stack**: Node.js, @sanity/client, @anthropic-ai/sdk, Chart.js
- **Active Endpoint**: `/api/translate-json` — Returns French-translated report JSON for `gmo-report`

## Documentation

- **DEPLOYMENT_SUMMARY.md** - Production architecture, features, and deployment process
- **gmo-prototype/CHART_BUILDER_USER_GUIDE.md** - End-user guide for chart creation

Brand assets in `/documentation`:
- **BNP_Paribas_Design_Specification.md** - Design spec for AI slide review
- **GMO Colours.pdf** - Brand color palette
- **GMO Typestack.pdf** - Typography guidelines
- **GMO Digital Enhancements_Project Brief.pdf** - Project brief

## Shared Backend

All projects connect to a shared Sanity backend:

- **Project ID**: `mb7v1vpy`
- **Dataset**: `production`

## Workflow

1. Content is edited in **gmo-prototype** (Sanity Studio)
2. **gmo-chart-agent** analyzes data and recommends chart configurations
3. **gmo-report** displays the interactive report (primary viewer) — fetches live data from Sanity on each page load, so published changes appear immediately via the **View Live Report** action
4. **French translation** — accessible via language dropdown in report header or **Voir traduction française** action in Sanity Studio. Translation is powered by Claude AI via `gmo-builder/api/translate-json`

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Pattrn-Studios/gmo.git
cd gmo

# Start the React Report Viewer
cd gmo-report
npm install
npm run dev
# Opens at http://localhost:3000

# Start the Sanity Studio (for content editing)
cd gmo-prototype
npm install
npm run dev
# Opens at http://localhost:3333

# For the chart agent (requires API key)
cd gmo-chart-agent
npm install
cp .env.example .env
# Edit .env to add your CLAUDE_API_KEY
npm run dev
# Opens at http://localhost:3001
```

## Environment Variables

| Project | Variable | Description |
|---------|----------|-------------|
| `gmo-chart-agent` | `CLAUDE_API_KEY` | Anthropic API key for chart analysis |
| `gmo-chart-agent` | `PORT` | Server port (default: 3000) |
| `gmo-builder` | `ANTHROPIC_API_KEY` | Anthropic API key for translation + AI review |

For `gmo-chart-agent`, copy `.env.example` to `.env` and fill in your values.
For `gmo-builder`, environment variables are set in the Vercel dashboard.
