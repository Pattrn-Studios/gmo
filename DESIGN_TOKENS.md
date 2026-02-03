# GMO Design Tokens

Complete design token reference for the Global Market Outlook project. This document serves as the source of truth for exporting to design tools (Pencil, Figma) and maintaining consistency across implementations.

## Table of Contents

- [Overview](#overview)
- [Color Tokens](#color-tokens)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Shadows](#shadows)
- [Component Reference](#component-reference)
- [Chart System](#chart-system)
- [Export Formats](#export-formats)

---

## Overview

### Token Sources

| File | Purpose |
|------|---------|
| `gmo-builder/lib/design-tokens/bnpp-tokens.json` | Master token definition (JSON) |
| `gmo-report/src/styles/globals.css` | CSS custom properties for web |
| `gmo-report/tailwind.config.js` | Tailwind theme extension |
| `gmo-builder/lib/design-tokens/colors.js` | JavaScript exports |

### Brand Foundation

- **Primary Brand Color:** `#008252` (BNPP Green)
- **Primary Font:** BNPP Sans / BNPP Sans Condensed
- **Fallback Fonts:** -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

---

## Color Tokens

### Core Semantic Colors

#### Text Colors

| Token | Light Theme | Dark Theme | Usage |
|-------|-------------|------------|-------|
| `--color-text-primary` | `#1A1A1A` | `#FFFFFF` | Main body text |
| `--color-text-secondary` | `#5F5F5F` | `#A0A0A0` | Supporting text, captions |
| `--color-text-inverse` | `#FFFFFF` | `#1A1A1A` | Text on dark backgrounds |

#### Background Colors

| Token | Light Theme | Dark Theme | Usage |
|-------|-------------|------------|-------|
| `--color-bg-primary` | `#FFFFFF` | `#1A1A1A` | Main page background |
| `--color-bg-secondary` | `#F7F5F3` | `#2A2A2A` | Cards, elevated surfaces |
| `--color-bg-tertiary` | `#E8E8E8` | `#3A3A3A` | Disabled states, dividers |

#### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#008252` | Primary actions, links, accents |
| `--color-brand-light` | `#9DD9C7` | Brand highlight areas |
| `--gmo-green` | `#008252` | Primary brand (alias) |
| `--gmo-blue` | `#3E7274` | Secondary brand accent |
| `--gmo-copper` | `#3D748F` | Tertiary brand accent |

#### Line/Border Colors

| Token | Light Theme | Dark Theme | Usage |
|-------|-------------|------------|-------|
| `--color-line-default` | `#E8E8E8` | `#3A3A3A` | Card borders, dividers |
| `--color-line-strong` | `#D0D0D0` | `#4A4A4A` | Emphasized borders |

### Chart Color Palette

Sequential palette for data visualization (consistent across light/dark themes):

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `--color-chart-1` | `#3E7274` | Blue Dianne | Primary series |
| `--color-chart-2` | `#3D748F` | Coast Blue | Secondary series |
| `--color-chart-3` | `#AC5359` | Metallic Copper | Tertiary series |
| `--color-chart-4` | `#F07662` | Orange | Fourth series |
| `--color-chart-5` | `#3A7862` | Silver Tree Green | Fifth series |
| `--color-chart-6` | `#132728` | Firefly Dark | Sixth series |
| `--color-chart-7` | `#955073` | Plum | Seventh series |

### Section Theme Colors

Full-bleed section backgrounds with automatic text color selection:

| Theme | Background | Text | Use Case |
|-------|------------|------|----------|
| `blue` | `#7CC5D9` | `#FFFFFF` | Market themes, economic outlook |
| `green` | `#008252` | `#FFFFFF` | Our view, appendix sections |
| `orange` | `#E8967B` | `#FFFFFF` | AI & CapEx, tech themes |
| `brown` | `#A8887A` | `#FFFFFF` | American exceptionalism |
| `mint` | `#9DD9C7` | `#1A1A1A` | December review, soft accents |

**CSS Variables:**
- `--color-section-blue`
- `--color-section-green`
- `--color-section-orange`
- `--color-section-brown`
- `--color-section-mint`

### Interaction Colors

| State | Value | Usage |
|-------|-------|-------|
| Primary | `#008252` | Default interactive elements |
| Hover | `#00613D` | Hover state (darker) |
| Active | `#29A376` | Active/pressed state |
| Disabled | `#B1B1B1` | Disabled state |
| Focus Ring | `#B2E6D2` | Focus indicator |

### Editorial Colors

For themed content sections (investment categories):

| Theme | Base | Middle | Shade |
|-------|------|--------|-------|
| Investment Insights | `#59A3A6` | `#2E696B` | `#174446` |
| Macroeconomics | `#98BCCD` | `#3D748F` | `#1F3A47` |
| Sustainability | `#98CDBA` | `#326754` | `#224438` |
| Future Trends | `#C99CB3` | `#A65980` | `#422433` |

---

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `font-sans` | `'BNPP Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | All text |
| Primary (condensed) | `BNPP Sans Condensed` | Display headlines |
| Secondary | `BNPP Sans` | Body and UI text |

### Font Sizes (Desktop)

| Category | Size | Line Height | Weight | Usage |
|----------|------|-------------|--------|-------|
| Display XL | 64px | 67.2px | Light | Hero headlines |
| Display LG | 56px | 58.8px | Light | Section heroes |
| Display MD | 40px | 44px | Light | Large titles |
| Display SM | 32px | 38.4px | Regular | Medium titles |
| Title XL | 32px | 48px | 600 | Section titles |
| Title LG | 28px | 40px | 600 | Subsection titles |
| Title MD | 24px | 36px | 600 | Card titles |
| Title XS | 18px | 28px | 600 | Small titles |
| Body LG | 18px | 27px | 400 | Lead paragraphs |
| Body MD | 16px | 24px | 400 | Standard body |
| Body SM | 14px | 16.8px | 400 | Secondary text |
| Body XS | 13px | 17.55px | 400 | Captions |
| Body XXS | 12px | 18px | 400 | Labels, hints |

### Font Sizes (Mobile)

| Category | Size | Line Height |
|----------|------|-------------|
| Display XL | 56px | 58.8px |
| Display LG | 48px | 52.8px |
| Display MD | 40px | 44px |
| Display SM | 32px | 38.4px |
| Title XL | 32px | 48px |
| Title LG | 28px | 42px |
| Title MD | 24px | 33px |
| Body LG | 18px | 27px |
| Body MD | 15px | 24px |

### Font Weights

| Token | Value | CSS |
|-------|-------|-----|
| Light | Light | 300 |
| Regular | Regular | 400 |
| Semibold | - | 600 |

---

## Spacing & Layout

### Base Spacing Scale

Using Tailwind's default 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-1` | 4px (0.25rem) | Tight gaps |
| `spacing-2` | 8px (0.5rem) | Small gaps |
| `spacing-3` | 12px (0.75rem) | Compact spacing |
| `spacing-4` | 16px (1rem) | Default gap |
| `spacing-6` | 24px (1.5rem) | Section content |
| `spacing-8` | 32px (2rem) | Large gaps |
| `spacing-12` | 48px (3rem) | Section padding |
| `spacing-18` | 72px (4.5rem) | Custom: medium sections |
| `spacing-20` | 80px (5rem) | Section vertical padding |

### Container Widths

| Token | Value | Usage |
|-------|-------|-------|
| `container` | 1400px | Maximum content width |
| `narrow` | 900px | Text-focused content |

### Container Padding

```css
.container {
  max-width: 1400px;
  padding: 0 24px;
  margin: 0 auto;
}
```

### Section Spacing Pattern

```css
/* Standard section */
padding: 80px 0;  /* py-20 */

/* Mobile section */
padding: 60px 0;  /* py-15 */
```

---

## Shadows

Three-tier elevation system:

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle depth, cards at rest |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | Standard elevation, chart wrappers |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | High elevation, hover states |

### Dark Theme Shadows

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.4)` |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.5)` |

---

## Component Reference

### Section Header

```css
.section-header h2::after {
  width: 60px;
  height: 4px;
  background: var(--gmo-green);
  bottom: -12px;
}
```

### Chart Wrapper

```css
.chart-wrapper {
  background: var(--color-bg-primary);
  padding: 24px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-line-default);
}
```

### Navigation Card

```css
.nav-card {
  background: var(--color-bg-primary);
  padding: 24px;
  border-radius: 8px;
  border-left: 4px solid var(--gmo-green);
  box-shadow: var(--shadow-sm);
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-left-color: var(--gmo-blue);
}
```

### Content Block

```css
.content-block {
  font-size: 1.125rem;  /* 18px */
  line-height: 1.8;
}

.content-block li::before {
  width: 8px;
  height: 8px;
  background: var(--gmo-green);
  border-radius: 50%;
}
```

---

## Chart System

### Supported Chart Types

1. **Line** - Time series, trends
2. **Column** - Categorical comparison (vertical)
3. **Bar** - Categorical comparison (horizontal)
4. **Area** - Volume over time
5. **Stacked Column** - Part-to-whole comparison
6. **Stacked Area** - Cumulative trends
7. **Pie** - Proportions (simple)
8. **Donut** - Proportions (with center value)
9. **Scatter** - Correlation analysis
10. **Radar** - Multi-dimensional comparison
11. **Composed** - Mixed line + bar
12. **Waterfall** - Sequential changes
13. **Gauge** - Single metric vs target
14. **Treemap** - Hierarchical proportions
15. **Heatmap** - Matrix data intensity

### Chart Color Assignment

Colors are assigned in order from `chart-1` through `chart-7`, cycling if more series are needed:

```javascript
const CHART_COLORS = [
  '#3E7274', // chart-1
  '#3D748F', // chart-2
  '#AC5359', // chart-3
  '#F07662', // chart-4
  '#3A7862', // chart-5
  '#132728', // chart-6
  '#955073', // chart-7
];
```

---

## Export Formats

### CSS Custom Properties (Web)

Located in `gmo-report/src/styles/globals.css`:

```css
:root {
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #5F5F5F;
  --color-bg-primary: #FFFFFF;
  /* ... see full file */
}
```

### Tailwind Config (Web)

Located in `gmo-report/tailwind.config.js`:

```javascript
colors: {
  'text-primary': 'var(--color-text-primary)',
  'bg-primary': 'var(--color-bg-primary)',
  'brand': 'var(--color-brand)',
  // ... maps CSS vars to Tailwind utilities
}
```

### JSON Tokens (Machine-readable)

Located in `gmo-builder/lib/design-tokens/bnpp-tokens.json` - Full hierarchical token structure suitable for Style Dictionary or Figma token plugins.

### Figma-Compatible Export

See `design-tokens.figma.json` for Figma Tokens plugin compatible format.

---

## Component Inventory

### Layout Components (7)
- Footer
- LanguageDropdown
- PageTransition
- ReportLayout
- TableOfContents
- ThemeProvider
- ThemeToggle

### Section Components (7)
- ChartInsightsSection
- ContentSection
- HeaderSection
- NavigationSection
- SectionRenderer
- TimelineSection
- TitleSection

### Chart Components (2)
- RechartsRenderer (supports 14 chart types)
- types.ts (TypeScript definitions)

---

## Usage in Design Tools

### Pencil Export

1. Import color tokens as variables
2. Create component variants for each section theme
3. Set up light/dark theme switching
4. Create chart placeholder components

### Figma Export

1. Use Figma Tokens plugin with `design-tokens.figma.json`
2. Set up color styles matching token names
3. Create text styles for typography scale
4. Build section components as Figma components

---

## Maintenance

When updating design tokens:

1. Update `gmo-builder/lib/design-tokens/bnpp-tokens.json` (source of truth)
2. Run exports to update derived files
3. Update `gmo-report/src/styles/globals.css` CSS variables
4. Update this documentation
5. Regenerate Figma export file if needed
