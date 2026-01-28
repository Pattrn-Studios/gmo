# GMO Project — Deployment Summary

**Last Updated:** January 28, 2026
**Status:** Production
**Repository:** https://github.com/Pattrn-Studios/gmo

---

## Project Overview

**Client:** BNP Paribas Asset Management
**Project:** Global Market Outlook (GMO) — Digital Transformation
**Consultancy:** Pattrn Studios

Transform the monthly GMO financial publication from a static PowerPoint deck into an interactive, digital-first experience with an AI-assisted production workflow.

---

## Production URLs

| Service | URL | Platform |
|---------|-----|----------|
| Sanity Studio | https://gmo-prototype.sanity.studio | Sanity |
| Builder APIs | https://gmo-builder.vercel.app | Vercel |
| Chart Agent API | https://gmo-chart-agent.vercel.app | Vercel |
| Live Report Viewer | https://gmo-report.vercel.app | Vercel |
| French Report | https://gmo-report.vercel.app/fr/ | Vercel |

---

## Architecture

```
Sanity Studio (CMS)                Vercel APIs (gmo-builder)
├── Report authoring               ├── /api/translate-json   (French translation JSON API)
├── Chart Builder (AI)             ├── /api/pptx-export      (PowerPoint generation)
├── PowerPoint Review (AI)         ├── /api/pptx-preview     (Slide preview images)
└── Document Actions               ├── /api/pptx-review      (AI design review)
    ├── View Live Report           ├── /api/build            (HTML report builder)
    ├── Voir traduction française  └── /api/chart-config     (Chart config endpoint)
    ├── Export as PDF
    └── Export as PowerPoint        Chart Agent API
                                   ├── /api/analyse          (AI chart recommendations)
                                   └── /api/analyse-image    (AI chart image extraction)

React Report Viewer (gmo-report)
├── /     English report with Recharts
└── /fr/  French translation (fetches from /api/translate-json)
```

---

## Features Deployed

### 1. Chart Builder (v3.0 — January 27, 2026)

AI-powered chart creation integrated directly into Sanity Studio.

**Components:**
- `gmo-prototype/components/ChartBuilder/` — 11 React components
- `gmo-chart-agent/` — Vercel serverless API with Claude Sonnet

**Capabilities:**
- Upload Excel (.xlsx/.xls) or CSV files for AI-powered chart recommendations
- Upload chart images (PNG/JPG/WebP) — Claude Vision extracts data and recreates as Recharts
- Editable data table for correcting AI-extracted values (image mode)
- Editable column headers that sync with chart legend and tooltips
- 2-3 alternative chart type suggestions with thumbnail previews
- Real-time Recharts preview in modal
- Edit flow restores original mode (CSV or image) with auto-regenerated alternatives
- Saves chart config directly to Sanity document

**User Guide:** [CHART_BUILDER_USER_GUIDE.md](gmo-prototype/CHART_BUILDER_USER_GUIDE.md)

---

### 2. PowerPoint Export (January 2026)

Server-side PowerPoint generation from Sanity report data.

**API:** `gmo-builder/api/pptx-export.js`

**Capabilities:**
- Generates .pptx files from Sanity report data
- Renders charts via QuickChart.io as embedded PNG images
- Fetches and embeds Sanity images (logos, cards, section images)
- Supports 6 slide types: Title, Table of Contents, Section Divider, Chart Section, Insights, Timeline
- Theme color mapping from Sanity (`colorTheme` field) to BNP Paribas template colors
- Accepts AI review suggestions for future auto-correction

**Template Config:** Embedded in `pptx-export.js` (positions, sizes, colors, fonts)

**Slide Type Mapping:**
| Sanity Type | Slide Generator | Background |
|-------------|----------------|------------|
| `titleSection` | `generateTitleSlide` | Primary Teal |
| `navigationSection` | `generateTOCSlide` | White |
| `headerSection` | `generateDividerSlide` | Theme color (named) |
| `contentSection` | `generateChartSlide` | Theme color (named) |
| `chartInsightsSection` | `generateInsightsSlide` | White |
| `timelineSection` | `generateTimelineSlide` | White |

**Color Theme Mapping:**
| Sanity Value | Hex | Used By |
|-------------|-----|---------|
| `blue` | `009FB1` | Primary |
| `green` | `51BBB4` | Teal |
| `teal` | `61C3D7` | Cyan |
| `orange` | `F49F7B` | Orange |
| `brown` | `A37767` | Brown |
| `mint` | `76BCA3` | Mint |
| `none` | `FFFFFF` | White |

**Key Implementation Detail:** PptxGenJS loaded via `createRequire()` to avoid ESM/CJS mismatch on Vercel serverless.

---

### 3. AI-Powered Slide Design Review (January 2026)

Claude Vision API reviews slide preview images against BNP Paribas design specifications.

**Backend:**
- `gmo-builder/api/pptx-review.js` — API endpoint
- `gmo-builder/lib/ai-review/index.js` — Claude API integration + response parser
- `gmo-builder/lib/ai-review/prompts.js` — Enhanced review prompts with exact template measurements

**Frontend:**
- `gmo-prototype/components/PowerPointReview/PowerPointReviewModal.tsx` — Review flow UI
- `gmo-prototype/components/PowerPointReview/SuggestionsList.tsx` — Suggestion cards with severity badges
- `gmo-prototype/components/PowerPointReview/types.ts` — TypeScript interfaces

**Review Categories:**
| Category | What It Checks |
|----------|---------------|
| `textLength` | Title/subtitle character counts vs. template limits |
| `chartSize` | Chart dimensions vs. template specifications |
| `bulletCount` | Number of bullet points (3-5 ideal, 6+ = HIGH severity) |
| `colorAccuracy` | Background/text colors vs. brand guidelines |
| `placeholder` | Unreplaced placeholder content ("Chart" text) |
| `layoutAlignment` | Element positions vs. template grid |

**Severity Levels:**
- **HIGH:** Title >80 chars, 6+ bullets, placeholder content, wrong background color
- **MEDIUM:** Subtitle >120 chars, generic chart title, source format issues
- **LOW:** Minor spacing, font size variance, image resolution

**Design Spec Reference:** [BNP_Paribas_Design_Specification.md](documentation/BNP_Paribas_Design_Specification.md)

---

### 4. Slide Preview Generation (January 2026)

Server-side rendering of slide previews as PNG images using node-canvas.

**API:** `gmo-builder/api/pptx-preview.js`
**Renderers:** `gmo-builder/lib/slide-preview/index.js`

**Capabilities:**
- Canvas-based rendering of each slide type
- Returns base64 PNG images for AI review
- Supports "one per type" mode for efficient preview generation

---

### 5. React Report Viewer (January 2026)

Interactive web-based report viewer replacing static HTML build. Fetches report data **client-side** from Sanity on every page load, so published changes in Sanity appear immediately without a rebuild.

**URL:** https://gmo-report.vercel.app
**Location:** `gmo-report/`

---

### 7. French Translation (January 2026)

AI-powered French translation of report content using Claude API.

**How it works:**
1. `gmo-report/src/app/fr/page.tsx` fetches translated JSON from `gmo-builder/api/translate-json.js`
2. The API fetches the latest report from Sanity, sends translatable text to Claude (Sonnet), and returns structured JSON
3. The French page renders using the same React components as the English version

**Translation API:** `gmo-builder/api/translate-json.js`
**Translation Client:** `gmo-builder/lib/translation-client.js`

**Capabilities:**
- Translates all text content (titles, body text, chart labels, axis labels, insights)
- Preserves Portable Text structure (bold, italic, lists, headers)
- Uses formal business French appropriate for institutional investors
- Preserves proper nouns, numbers, and percentages
- Language dropdown in report header for switching between English and French
- Translation notice banner on French page

**UI Components:**
- `gmo-report/src/components/layout/LanguageDropdown.tsx` — Header dropdown (flag icon, expands to show languages)
- `gmo-report/src/app/fr/page.tsx` — French report page
- `gmo-prototype/components/ViewFrenchTranslationAction.tsx` — Sanity document action

---

### 6. Sanity Studio Document Actions

Custom actions available on report documents in Sanity Studio.

**File:** `gmo-prototype/sanity.config.ts`

**Actions:**
1. **View Live Report** — Opens React report viewer in new tab (always shows latest published content; no rebuild needed)
2. **Voir traduction française** — Opens French translation in new tab (`gmo-report.vercel.app/fr/`). Only enabled when document is published.
3. **Export as PDF** — Downloads PDF version
4. **Export as PowerPoint** — Opens AI review modal with full workflow:
   - Generate slide previews
   - Run AI design review (optional)
   - View suggestions grouped by severity
   - Select suggestions to apply
   - Export .pptx file

---

## Sanity Schema Types

| Type | File | Purpose |
|------|------|---------|
| `report` | `schemaTypes/report.ts` | Main report document with sections array |
| `titleSection` | `schemaTypes/titleSection.ts` | Cover slide with logo, heading, subheading |
| `navigationSection` | `schemaTypes/navigationSection.ts` | Table of contents with 5 cards |
| `headerSection` | `schemaTypes/headerSection.ts` | Section divider with background color |
| `contentSection` | `schemaTypes/contentSection.ts` | Chart section with color theme, chart builder |
| `chartInsightsSection` | `schemaTypes/chartInsightsSection.ts` | Chart with insights panel |
| `timelineSection` | `schemaTypes/timelineSection.ts` | 3-item horizontal timeline |
| `slide` | `schemaTypes/slide.ts` | Standalone slide (legacy) |

---

## Environment Variables

### Vercel (gmo-builder):
- `ANTHROPIC_API_KEY` — Required for French translation (Claude API) and AI slide review

### Vercel (gmo-chart-agent):
- `CLAUDE_API_KEY` — Required for chart analysis

### Sanity Studio:
- `SANITY_STUDIO_CHART_AGENT_URL` — Optional, overrides Chart Agent API URL

---

## Key Files Reference

### PowerPoint Export Pipeline
- `gmo-builder/api/pptx-export.js` — Main export handler with all slide generators
- `gmo-builder/lib/chart-config.js` — Chart.js configuration builder
- `gmo-builder/api/pptx-preview.js` — Preview generation endpoint
- `gmo-builder/api/pptx-review.js` — AI review endpoint
- `gmo-builder/lib/ai-review/index.js` — Claude API integration + response parser
- `gmo-builder/lib/ai-review/prompts.js` — Review prompts with BNP Paribas specs

### French Translation Pipeline
- `gmo-builder/api/translate-json.js` — Translation JSON API (consumed by gmo-report)
- `gmo-builder/lib/translation-client.js` — Claude API integration for translation
- `gmo-report/src/app/fr/page.tsx` — French report page (React)
- `gmo-report/src/components/layout/LanguageDropdown.tsx` — Language switcher in header
- `gmo-prototype/components/ViewFrenchTranslationAction.tsx` — Sanity document action

### Sanity Studio Components
- `gmo-prototype/components/PowerPointReview/PowerPointReviewModal.tsx` — Review workflow
- `gmo-prototype/components/PowerPointReview/SuggestionsList.tsx` — Suggestion display
- `gmo-prototype/components/PowerPointReview/types.ts` — TypeScript interfaces
- `gmo-prototype/components/ChartBuilder/ChartBuilderInput.tsx` — Chart Builder entry point
- `gmo-prototype/components/ViewFrenchTranslationAction.tsx` — French translation action
- `gmo-prototype/sanity.config.ts` — Document actions configuration

### Documentation
- `documentation/BNP_Paribas_Design_Specification.md` — Design spec for AI review
- `gmo-prototype/CHART_BUILDER_USER_GUIDE.md` — Chart Builder user guide

---

## Recent Commits

| Date | Commit | Description |
|------|--------|-------------|
| Jan 28, 2026 | `cec295a` | fix: Match language dropdown height to theme toggle |
| Jan 28, 2026 | `9ed87be` | fix: Language dropdown in header and direct /fr URL access |
| Jan 28, 2026 | `a1cf354` | feat: Add language toggle to English page |
| Jan 28, 2026 | `6d8d622` | fix: Move French translation to gmo-report React app |
| Jan 28, 2026 | `6b8ec53` | feat: Add French translation feature with Claude AI |
| Jan 27, 2026 | `d422e9e` | feat: Add image upload to Chart Builder with edit flow improvements |
| Jan 27, 2026 | `a11926c` | docs: Update documentation to reflect current production state |
| Jan 27, 2026 | `cf50ce6` | fix: Resolve background color mapping for content and divider slides |

---

## Deployment Process

### Automatic (Vercel):
All APIs in `gmo-builder/` auto-deploy on push to `main` branch.

### Manual (Sanity Studio):
```bash
cd gmo-prototype && npx sanity deploy
```

### Automatic (React Viewer):
Deployed via Vercel from `gmo-report/` directory on push to `main`. The report fetches data client-side from Sanity, so content updates are live immediately after publishing — no rebuild required.

---

**Maintained By:** Pattrn Studios
**Built With:** Sanity Studio v4, React 19, TypeScript, PptxGenJS, Claude API, Vercel Serverless
