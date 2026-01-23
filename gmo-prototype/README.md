# GMO Prototype - Sanity CMS Studio

Sanity CMS Studio for managing Global Market Outlook report content with integrated AI-powered Chart Builder.

## Features

- **Report Management** - Create and edit GMO reports with multiple section types
- **Chart Builder** - Upload Excel/CSV data and get AI-powered chart recommendations
- **Live Preview** - See charts rendered with Recharts before publishing
- **Flexible Layouts** - Configure chart positions, color themes, and content layouts

## Tech Stack

- Sanity Studio v4.22
- React 19
- TypeScript
- Recharts (for chart previews)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:3333
```

## Deployment

```bash
# Deploy to Sanity hosting
npm run deploy
```

## Schema Types

### Report

The main document type containing all sections.

```typescript
{
  title: string
  publicationDate: date
  author: string
  summary: text
  sections: Section[]
}
```

### Section Types

| Type | Description |
|------|-------------|
| `titleSection` | Hero with gradient/image background, company logo |
| `navigationSection` | Card grid with optional images linking to sections |
| `contentSection` | Text content with optional chart (15 chart types) |
| `chartInsightsSection` | Full-width chart with insights panel |
| `headerSection` | Section divider with colored background |
| `timelineSection` | Horizontal timeline with numbered items |

### Chart Configuration

Charts are configured via the ChartBuilder component:

1. Upload Excel/CSV file
2. AI analyzes data and recommends chart type
3. Configure series, axis labels, and formatting
4. Preview chart with Recharts
5. Save configuration to Sanity

Supported chart types:
- Line, Area, Bar, Column
- Pie, Donut
- Stacked Area, Stacked Column
- Scatter, Radar
- Horizontal Bar
- Treemap, Heatmap
- Gauge, Waterfall

## Project Structure

```
gmo-prototype/
├── schemaTypes/
│   ├── report.ts              # Main report document
│   ├── titleSection.ts
│   ├── navigationSection.ts
│   ├── contentSection.ts
│   ├── chartInsightsSection.ts
│   ├── headerSection.ts
│   └── timelineSection.ts
├── components/
│   └── ChartBuilder/
│       ├── ChartBuilderInput.tsx  # Main component
│       ├── RechartsRenderer.tsx   # Chart rendering
│       ├── types.ts
│       └── styles.ts
└── sanity.config.ts
```

## Environment

No environment variables required - connects to:
- **Project ID**: `mb7v1vpy`
- **Dataset**: `production`

## Related Projects

- [`gmo-report`](../gmo-report/) - React report viewer (primary)
- [`gmo-chart-agent`](../gmo-chart-agent/) - AI chart recommendations API
- [`gmo-builder`](../gmo-builder/) - Legacy HTML generator (deprecated)

## Documentation

See `/documentation` folder in root for:
- `CHART_BUILDER_USER_GUIDE.md` - End-user documentation
- `CHART_BUILDER_FEATURE_SUMMARY.md` - Technical overview
- `CHART_IMPORT_GUIDE.md` - Data import instructions
