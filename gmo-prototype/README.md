# GMO Prototype - Sanity CMS Studio

Sanity CMS Studio for managing Global Market Outlook report content with integrated AI-powered Chart Builder.

## Features

- **Report Management** - Create and edit GMO reports with multiple section types
- **Chart Builder** - Upload Excel/CSV data or chart images for AI-powered chart creation
- **Image Upload** - Extract data from chart images via Claude Vision and recreate as editable Recharts charts
- **Live Preview** - See charts rendered with Recharts before publishing
- **PowerPoint Export** - AI-reviewed slide generation with design spec compliance
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

1. Upload Excel/CSV file **or** chart image (PNG/JPG/WebP)
2. AI analyzes data and recommends chart type with 2-3 alternatives
3. For images: review and edit AI-extracted data in the editable table
4. Preview chart with Recharts, swap alternatives
5. Save configuration to Sanity

15 supported chart types: Line, Area, Bar, Column, Pie, Donut, Stacked Area, Stacked Column, Scatter, Radar, Composed, Waterfall, Gauge, Treemap, Heatmap

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
│   ├── ChartBuilder/
│   │   ├── ChartBuilderInput.tsx      # Entry point (Add/Edit/Upload/Remove)
│   │   ├── ChartBuilderModal.tsx      # Modal orchestrator (CSV + image flows)
│   │   ├── FileUploadArea.tsx         # CSV/Excel drag-drop upload
│   │   ├── ImageUploadArea.tsx        # Image drag-drop upload
│   │   ├── EditableDataTable.tsx      # Editable table for AI-extracted data
│   │   ├── ChartPreview.tsx           # Full-size chart preview
│   │   ├── AlternativesThumbnails.tsx # Alternative chart type grid
│   │   ├── RechartsRenderer.tsx       # Chart rendering (15 types)
│   │   ├── types.ts
│   │   ├── utils.ts                   # File parsing, API calls
│   │   └── styles.ts
│   └── PowerPointReview/
│       ├── PowerPointReviewModal.tsx   # AI review workflow
│       ├── SuggestionsList.tsx         # Suggestion display
│       └── types.ts
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

- `CHART_BUILDER_USER_GUIDE.md` - End-user guide for chart creation (CSV + image upload)
