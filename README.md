# GMO (Global Market Outlook) Suite

A collection of tools for creating and managing AXA Investment Managers' Global Market Outlook reports.

## Projects

### gmo-prototype

Sanity CMS studio for managing GMO report content.

- **Tech Stack**: Sanity v4, React 19, TypeScript
- **Local Dev**: `cd gmo-prototype && npm install && npm run dev`
- **Deploy**: `npm run deploy` (deploys to Sanity Studio hosting)

### gmo-builder

HTML report generator that fetches content from Sanity and produces static HTML with Highcharts visualizations.

- **Tech Stack**: Node.js, @sanity/client
- **Local Dev**: `cd gmo-builder && npm install && npm run dev`
- **Production**: Deployed on Vercel as serverless function at https://gmo-builder.vercel.app

### gmo-chart-agent

AI-powered chart recommendation tool using Claude API for analyzing data and suggesting optimal chart configurations.

- **Tech Stack**: Express, multer, xlsx
- **Local Dev**: `cd gmo-chart-agent && npm install && npm run dev` (requires `.env` file with `CLAUDE_API_KEY`)
- **Production**: Deployed on Vercel

## Documentation

See the `/documentation` folder for:

- **GMO_Chart_Agent_Build_Guide.md** - Guide for building the chart agent
- **GMO_Complete_Project_Documentation_With_Branding.md** - Full project documentation with branding guidelines
- **GMO_Project_Handover_Document.md** - Project handover notes
- **GMO_V2_Prototype_Step_by_Step.md** - Step-by-step prototype guide
- **GMO_V3_Automated_Deployment_Guide.md** - Automated deployment instructions
- **GMO_Technical_Brief_for_Claude.md** - Technical specification
- **GMO Colours.pdf** - Brand color palette
- **GMO Typestack.pdf** - Typography guidelines
- **GMO Digital Enhancements_Project Brief.pdf** - Project brief

## Architecture

All projects connect to a shared Sanity backend:

- **Project ID**: `mb7v1vpy`
- **Dataset**: `production`

The workflow is:

1. Content is edited in **gmo-prototype** (Sanity Studio)
2. **gmo-builder** fetches content from Sanity and generates interactive HTML reports
3. **gmo-chart-agent** helps create chart configurations by analyzing data with AI

## Quick Start

```bash
# Clone the repository
git clone https://github.com/joepattrn/gmo.git
cd gmo

# Start the Sanity Studio
cd gmo-prototype
npm install
npm run dev
# Opens at http://localhost:3333

# In another terminal, test the builder
cd gmo-builder
npm install
npm run build
# Check output/index.html

# For the chart agent (requires API key)
cd gmo-chart-agent
npm install
cp .env.example .env
# Edit .env to add your CLAUDE_API_KEY
npm run dev
# Opens at http://localhost:3000
```

## Environment Variables

Only **gmo-chart-agent** requires environment variables:

| Variable | Description |
|----------|-------------|
| `CLAUDE_API_KEY` | Anthropic API key for Claude |
| `PORT` | Server port (default: 3000) |

Copy `.env.example` to `.env` and fill in your values.
