# GMO Report Viewer

Interactive React-based report viewer for Global Market Outlook reports, built with Next.js 14.

## Features

- **Recharts Integration** - Same chart library as Sanity Studio preview for pixel-perfect consistency
- **Dark/Light Mode** - Toggle with localStorage persistence
- **Framer Motion Animations** - Smooth page transitions, staggered content reveals
- **Responsive Layout** - Mobile-first design with sticky sidebar TOC on desktop
- **Scroll Progress** - Visual indicator and back-to-top button

## Tech Stack

- Next.js 14.2 (App Router, Static Export)
- React 18.3
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Sanity Client

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Build & Deploy

```bash
# Build static export
npm run build

# Output directory: /out
# Deploy /out folder to any static hosting
```

## Project Structure

```
gmo-report/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with ThemeProvider
│   │   └── page.tsx        # Main report page
│   ├── components/
│   │   ├── charts/
│   │   │   └── RechartsRenderer.tsx  # All chart types
│   │   ├── layout/
│   │   │   ├── ReportLayout.tsx      # Page structure
│   │   │   ├── TableOfContents.tsx   # Sidebar navigation
│   │   │   ├── ThemeProvider.tsx     # Dark mode context
│   │   │   └── ThemeToggle.tsx       # Theme switch button
│   │   └── sections/
│   │       ├── TitleSection.tsx
│   │       ├── ContentSection.tsx
│   │       ├── ChartInsightsSection.tsx
│   │       ├── NavigationSection.tsx
│   │       ├── HeaderSection.tsx
│   │       └── TimelineSection.tsx
│   ├── lib/
│   │   ├── sanity.ts       # Sanity client & queries
│   │   └── utils.ts        # CSV parsing, formatting
│   └── styles/
│       └── globals.css     # Tailwind + CSS variables
├── next.config.js          # Static export config
├── tailwind.config.js      # Tailwind theme
└── tsconfig.json
```

## Data Source

Fetches report data from Sanity CMS at build time:
- Project ID: `mb7v1vpy`
- Dataset: `production`

## Supported Section Types

| Section Type | Description |
|--------------|-------------|
| `titleSection` | Hero with gradient/image background |
| `navigationSection` | Card grid linking to content sections |
| `contentSection` | Text + optional chart (15 chart types) |
| `chartInsightsSection` | Chart with insights panel |
| `headerSection` | Image + text header |
| `timelineSection` | Horizontal timeline |

## Chart Types

All 15 chart types from Sanity Studio are supported:
- Line, Area, Bar, Column
- Pie, Donut
- Stacked Area, Stacked Column
- Scatter, Radar
- Horizontal Bar
- Treemap, Heatmap
- Gauge, Waterfall

## Environment

No environment variables required - Sanity project ID is configured in code.

## Related Projects

- `gmo-prototype/` - Sanity CMS Studio
- `gmo-chart-agent/` - AI chart recommendations
- `gmo-builder/` - Legacy HTML generator (deprecated)
