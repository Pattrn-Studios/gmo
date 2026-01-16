# GMO v2 Prototype: Step-by-Step Build Guide

## What We're Building

A working prototype that demonstrates:

1. **Data → Chart recommendation** (Claude analyses data, suggests chart type)
2. **Content entry** (Sanity CMS with structured fields)
3. **Output** (HTML file using Highcharts, connected to existing prototype styling)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   GOOGLE          CLAUDE           SANITY            OUTPUT                    │
│   SHEET           PROJECT          CMS               HTML                      │
│                                                                                 │
│   ┌───────┐       ┌───────┐       ┌───────┐        ┌───────┐                  │
│   │       │       │       │       │       │        │       │                  │
│   │ Data  │──────►│ Chart │──────►│Content│───────►│ Slide │                  │
│   │ (CSV) │       │ Advice│       │ Entry │        │ .html │                  │
│   │       │       │       │       │       │        │       │                  │
│   └───────┘       └───────┘       └───────┘        └───────┘                  │
│                                                                                 │
│   You have        "Use line        User fills       Styled,                   │
│   this            chart with       in fields        animated                   │
│                   3 series"                         output                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Node.js installed (v18+)
- A Sanity account (free at sanity.io)
- Access to Claude (for the Claude Project)
- Your existing GMO prototype code

---

## Phase 1: Sanity CMS Setup

**Time: ~30 minutes**

### Step 1.1: Create Sanity Project

Open terminal and run:

```bash
npm create sanity@latest
```

When prompted:
- **Login**: Use Google, GitHub, or email
- **Create new project**: Yes
- **Project name**: `gmo-prototype`
- **Dataset**: `production`
- **Project output path**: `gmo-sanity`
- **Template**: Clean project with no predefined schema
- **TypeScript**: Yes

### Step 1.2: Navigate to Project

```bash
cd gmo-sanity
```

### Step 1.3: Add the Slide Schema

Create the file `schemaTypes/slide.ts` with this content:

```typescript
// schemaTypes/slide.ts

import {defineType, defineField, defineArrayMember} from 'sanity'

export const slide = defineType({
  name: 'slide',
  title: 'GMO Slide',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'chart', title: 'Chart'},
    {name: 'style', title: 'Style'},
  ],
  fields: [
    // CONTENT FIELDS
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Main headline for the slide',
      group: 'content',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Supporting headline',
      group: 'content',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'body',
      title: 'Commentary',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [{title: 'Bullet', value: 'bullet'}],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
          },
        },
      ],
      description: 'Key points (use bullet points for best results)',
      group: 'content',
    }),
    defineField({
      name: 'source',
      title: 'Data Source',
      type: 'string',
      description: 'Attribution (e.g., "Bloomberg, October 2025")',
      group: 'content',
    }),

    // CHART CONFIGURATION
    defineField({
      name: 'chartType',
      title: 'Chart Type',
      type: 'string',
      group: 'chart',
      options: {
        list: [
          {title: 'Line Chart', value: 'line'},
          {title: 'Bar Chart (Vertical)', value: 'column'},
          {title: 'Bar Chart (Horizontal)', value: 'bar'},
          {title: 'Area Chart', value: 'area'},
          {title: 'Stacked Bar', value: 'stackedColumn'},
          {title: 'Stacked Area', value: 'stackedArea'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'line',
    }),
    defineField({
      name: 'chartData',
      title: 'Chart Data (CSV)',
      type: 'text',
      description: 'Paste data from Google Sheets. First row = headers. First column = x-axis.',
      placeholder: `date,fed,ecb,boe
Jan 2022,0.25,0.00,0.25
Apr 2022,0.50,0.00,0.75
Jul 2022,2.50,0.50,1.25`,
      rows: 12,
      group: 'chart',
    }),
    defineField({
      name: 'series',
      title: 'Data Series',
      type: 'array',
      group: 'chart',
      description: 'Configure each line/bar. "Data Column" must match a CSV header.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'seriesItem',
          title: 'Series',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Display name in legend',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'dataColumn',
              title: 'Data Column',
              type: 'string',
              description: 'Column name from CSV',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'colour',
              title: 'Colour',
              type: 'string',
              options: {
                list: [
                  {title: 'Navy (Primary)', value: '#00005E'},
                  {title: 'Teal', value: '#00A3A3'},
                  {title: 'Coral', value: '#FF6B5B'},
                  {title: 'Gold', value: '#E5A93D'},
                  {title: 'Purple', value: '#7B5EA7'},
                  {title: 'Green', value: '#2E8B57'},
                  {title: 'Grey', value: '#6B7280'},
                ],
                layout: 'dropdown',
              },
              initialValue: '#00005E',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'dataColumn',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'xAxisLabel',
      title: 'X-Axis Label',
      type: 'string',
      group: 'chart',
    }),
    defineField({
      name: 'yAxisLabel',
      title: 'Y-Axis Label',
      type: 'string',
      group: 'chart',
    }),
    defineField({
      name: 'yAxisFormat',
      title: 'Y-Axis Format',
      type: 'string',
      group: 'chart',
      options: {
        list: [
          {title: 'Number (1,234)', value: 'number'},
          {title: 'Percentage (12.5%)', value: 'percent'},
          {title: 'Currency ($1,234)', value: 'currency'},
          {title: 'Decimal (1.23)', value: 'decimal'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'number',
    }),

    // STYLE SETTINGS
    defineField({
      name: 'themeColour',
      title: 'Slide Theme',
      type: 'string',
      group: 'style',
      options: {
        list: [
          {title: 'Teal', value: 'teal'},
          {title: 'Coral', value: 'coral'},
          {title: 'Gold', value: 'gold'},
          {title: 'Purple', value: 'purple'},
          {title: 'Navy', value: 'navy'},
        ],
        layout: 'radio',
      },
      initialValue: 'teal',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      group: 'style',
      options: {
        list: [
          {title: 'Chart on Left', value: 'chartLeft'},
          {title: 'Chart on Right', value: 'chartRight'},
          {title: 'Chart Full Width', value: 'chartFull'},
        ],
        layout: 'radio',
      },
      initialValue: 'chartLeft',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      chartType: 'chartType',
    },
    prepare({title, subtitle, chartType}) {
      const chartIcons: Record<string, string> = {
        line: '📈',
        column: '📊',
        bar: '📊',
        area: '📉',
      }
      return {
        title: title || 'Untitled Slide',
        subtitle: `${chartIcons[chartType] || '📊'} ${subtitle || ''}`,
      }
    },
  },
})
```

### Step 1.4: Register the Schema

Replace `schemaTypes/index.ts` with:

```typescript
import {slide} from './slide'

export const schemaTypes = [slide]
```

### Step 1.5: Start Sanity Studio

```bash
npm run dev
```

Opens at: `http://localhost:3333`

### Step 1.6: Create a Test Slide

1. Click "GMO Slide" in sidebar
2. Click "Create new document"
3. Fill in test content:
   - **Title**: "Central Banks Hold Steady"
   - **Subtitle**: "Major central banks pause rate hikes"
   - **Commentary**: Add 3 bullet points
   - **Chart Type**: Line Chart
   - **Chart Data**: Paste sample CSV
   - **Series**: Add 2-3 series with labels and colours
   - **Theme**: Teal
4. Click "Publish"

### ✓ Checkpoint: Sanity Running

You should see:
- Three tabs: Content, Chart, Style
- Ability to add/remove series
- Dropdown for chart types and colours

**Take screenshots for client presentation.**

---

## Phase 2: Claude Project Setup

**Time: ~20 minutes**

### Step 2.1: Create Claude Project

1. Go to claude.ai
2. Click "Projects" in sidebar
3. Click "Create Project"
4. Name it: **"GMO Chart Generator"**

### Step 2.2: Add Custom Instructions

In the project settings, add these instructions:

```
You are a chart recommendation assistant for AXA IM's Global Market Outlook reports.

When given data (CSV or pasted from spreadsheet):

1. ANALYSE the structure:
   - Identify column types (date, category, numeric)
   - Count data series
   - Note patterns (time series, rankings, comparisons)

2. RECOMMEND a chart type:
   - Time series with 1-3 series → Line Chart
   - Time series with 4+ series → Line Chart with key series highlighted
   - Categories (<7 items) → Vertical Bar (column)
   - Categories (7+ items) → Horizontal Bar
   - Part of whole → Stacked Bar or Stacked Area
   - Comparison over time → Area Chart

3. PROVIDE configuration for Sanity:
   - Recommended chart type
   - Series configuration (which columns, suggested labels, colours)
   - Axis labels

Keep responses practical. User will copy your recommendations into Sanity CMS.

COLOUR PALETTE:
- Navy (primary): #00005E
- Teal: #00A3A3
- Coral: #FF6B5B
- Gold: #E5A93D
- Purple: #7B5EA7
```

### Step 2.3: Add Knowledge File

Create a file called `chart-selection-guide.md`:

```markdown
# Chart Selection Guide

## Decision Tree

### Is it time-based data?
- YES, 1-3 series → **Line Chart**
- YES, 4+ series → **Line Chart** (highlight 2-3 key series)
- YES, showing accumulation → **Area Chart**
- YES, comparing to baseline → **Area Chart** (indexed to 100)

### Is it categorical data?
- Less than 7 categories → **Vertical Bar (column)**
- 7+ categories → **Horizontal Bar**
- Showing ranking → **Horizontal Bar** (sorted)
- Part of whole → **Stacked Bar**

### Comparing two datasets?
- Side by side → **Grouped Bar**
- Over time → **Multi-line** or **Small multiples**

## Series Colour Assignment

| Position | Colour | Hex |
|----------|--------|-----|
| Series 1 | Navy | #00005E |
| Series 2 | Teal | #00A3A3 |
| Series 3 | Coral | #FF6B5B |
| Series 4 | Gold | #E5A93D |
| Series 5 | Purple | #7B5EA7 |

## Output Format

When recommending, provide:

**Chart Type:** [line/column/bar/area]

**Series Configuration:**
| Label | Data Column | Colour |
|-------|-------------|--------|
| Federal Reserve | fed | #00005E |
| ECB | ecb | #00A3A3 |

**Axis Labels:**
- X-Axis: [suggestion]
- Y-Axis: [suggestion]
- Format: [number/percent/currency]
```

Upload this file to the Claude Project.

### Step 2.4: Test the Claude Project

Paste this sample data:

```
date,fed,ecb,boe
Jan 2022,0.25,0.00,0.25
Apr 2022,0.50,0.00,0.75
Jul 2022,2.50,0.50,1.25
Oct 2022,3.25,1.25,2.25
Jan 2023,4.50,2.50,3.50
Apr 2023,5.00,3.25,4.25
Jul 2023,5.25,3.75,5.00
Oct 2023,5.25,4.00,5.25
```

Ask: "What chart should I use for this data?"

### ✓ Checkpoint: Claude Project Working

Claude should respond with:
- Recommended chart type (Line Chart)
- Series configuration table
- Suggested axis labels

---

## Phase 3: Build Script (Sanity → HTML)

**Time: ~1-2 hours**

### Step 3.1: Create Build Project

In a separate folder (not inside Sanity):

```bash
mkdir gmo-builder
cd gmo-builder
npm init -y
npm install @sanity/client
```

### Step 3.2: Create Environment File

Create `.env`:

```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
```

Find your project ID in Sanity Studio → Project Settings, or at sanity.io/manage.

### Step 3.3: Create Build Script

Create `build-slide.mjs`:

```javascript
// build-slide.mjs
import {createClient} from '@sanity/client'
import fs from 'fs'

// Configure Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'YOUR_PROJECT_ID', // Replace with your ID
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

// Theme colour mapping
const themeColours = {
  teal: {accent: '#00A3A3', light: 'rgba(0,163,163,0.1)'},
  coral: {accent: '#FF6B5B', light: 'rgba(255,107,91,0.1)'},
  gold: {accent: '#E5A93D', light: 'rgba(229,169,61,0.1)'},
  purple: {accent: '#7B5EA7', light: 'rgba(123,94,167,0.1)'},
  navy: {accent: '#00005E', light: 'rgba(0,0,94,0.1)'},
}

// Parse CSV to array
function parseCSV(csv) {
  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const obj = {}
    headers.forEach((header, i) => {
      const val = values[i]?.trim()
      obj[header] = isNaN(val) ? val : parseFloat(val)
    })
    return obj
  })
}

// Convert Sanity portable text to HTML
function portableTextToHTML(blocks) {
  if (!blocks) return ''
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      const text = block.children?.map(child => {
        let t = child.text || ''
        if (child.marks?.includes('strong')) t = `<strong>${t}</strong>`
        if (child.marks?.includes('em')) t = `<em>${t}</em>`
        return t
      }).join('') || ''
      
      if (block.listItem === 'bullet') {
        return `<li>${text}</li>`
      }
      return text
    })
    .join('\n')
}

// Build Highcharts config from Sanity data
function buildChartConfig(slide, parsedData) {
  const xAxisKey = Object.keys(parsedData[0])[0] // First column is x-axis
  const categories = parsedData.map(row => row[xAxisKey])
  
  const series = (slide.series || []).map(s => ({
    name: s.label,
    data: parsedData.map(row => row[s.dataColumn]),
    color: s.colour,
  }))

  // Map Sanity chart types to Highcharts types
  const chartTypeMap = {
    line: 'line',
    column: 'column',
    bar: 'bar',
    area: 'area',
    stackedColumn: 'column',
    stackedArea: 'area',
  }

  const isStacked = slide.chartType?.includes('stacked')

  return {
    chart: {
      type: chartTypeMap[slide.chartType] || 'line',
      style: {fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'},
      backgroundColor: 'transparent',
    },
    title: {text: null},
    xAxis: {
      categories: categories,
      title: {text: slide.xAxisLabel || null},
      labels: {style: {color: '#6B7280'}},
      lineColor: '#E5E7EB',
    },
    yAxis: {
      title: {text: slide.yAxisLabel || null},
      labels: {
        style: {color: '#6B7280'},
        formatter: function() {
          if (slide.yAxisFormat === 'percent') return this.value + '%'
          if (slide.yAxisFormat === 'currency') return '$' + this.value.toLocaleString()
          return this.value
        }
      },
      gridLineColor: '#E5E7EB',
    },
    legend: {
      align: 'left',
      verticalAlign: 'top',
      itemStyle: {color: '#374151', fontWeight: 'normal'},
    },
    plotOptions: {
      series: {
        animation: {duration: 1000},
        marker: {enabled: false},
      },
      column: {stacking: isStacked ? 'normal' : undefined},
      area: {stacking: isStacked ? 'normal' : undefined, fillOpacity: 0.3},
    },
    series: series,
    credits: {enabled: false},
  }
}

// Generate HTML
function generateHTML(slide) {
  const theme = themeColours[slide.themeColour] || themeColours.teal
  const parsedData = slide.chartData ? parseCSV(slide.chartData) : []
  const chartConfig = buildChartConfig(slide, parsedData)
  const commentary = portableTextToHTML(slide.body)
  
  // Layout classes
  const isChartLeft = slide.layout === 'chartLeft'
  const isChartFull = slide.layout === 'chartFull'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${slide.title || 'GMO Slide'}</title>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #00005E 0%, #1a1a7a 100%);
      color: white;
      min-height: 100vh;
    }
    
    .slide {
      display: grid;
      grid-template-columns: ${isChartFull ? '1fr' : isChartLeft ? '1.2fr 1fr' : '1fr 1.2fr'};
      gap: 3rem;
      padding: 4rem;
      min-height: 100vh;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .content {
      order: ${isChartLeft ? '2' : '1'};
    }
    
    .chart-container {
      order: ${isChartLeft ? '1' : '2'};
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    h1 {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      margin-bottom: 0.75rem;
      line-height: 1.1;
    }
    
    h2 {
      font-size: clamp(1rem, 2vw, 1.25rem);
      font-weight: 400;
      opacity: 0.8;
      margin-bottom: 2rem;
    }
    
    .commentary {
      list-style: none;
      padding: 0;
    }
    
    .commentary li {
      padding: 0.875rem 0;
      padding-left: 1.75rem;
      position: relative;
      font-size: 1.0625rem;
      line-height: 1.6;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .commentary li:last-child {
      border-bottom: none;
    }
    
    .commentary li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 1.2rem;
      width: 8px;
      height: 8px;
      background: ${theme.accent};
      border-radius: 50%;
    }
    
    .source {
      margin-top: 2rem;
      font-size: 0.875rem;
      opacity: 0.5;
    }
    
    #chart {
      width: 100%;
      height: 400px;
    }
    
    @media (max-width: 900px) {
      .slide {
        grid-template-columns: 1fr;
        padding: 2rem;
      }
      .content, .chart-container {
        order: unset;
      }
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="content">
      <h1>${slide.title || ''}</h1>
      <h2>${slide.subtitle || ''}</h2>
      <ul class="commentary">
        ${commentary}
      </ul>
      <p class="source">Source: ${slide.source || ''}</p>
    </div>
    <div class="chart-container">
      <div id="chart"></div>
    </div>
  </div>

  <script>
    // Highcharts configuration
    const chartConfig = ${JSON.stringify(chartConfig, null, 2)};
    
    // Render chart
    Highcharts.chart('chart', chartConfig);
    
    // GSAP animations
    gsap.from('h1', {opacity: 0, y: 30, duration: 0.8, delay: 0.2, ease: 'power3.out'});
    gsap.from('h2', {opacity: 0, y: 20, duration: 0.6, delay: 0.4, ease: 'power3.out'});
    gsap.from('.commentary li', {opacity: 0, x: -20, duration: 0.5, stagger: 0.1, delay: 0.6, ease: 'power2.out'});
    gsap.from('.chart-container', {opacity: 0, scale: 0.95, duration: 0.8, delay: 0.3, ease: 'power3.out'});
  </script>
</body>
</html>`
}

// Main build function
async function build() {
  console.log('Fetching slide from Sanity...')
  
  const slide = await client.fetch('*[_type == "slide"][0]')
  
  if (!slide) {
    console.error('No slide found in Sanity')
    process.exit(1)
  }
  
  console.log(`Building: ${slide.title}`)
  
  const html = generateHTML(slide)
  
  // Ensure output directory exists
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output')
  }
  
  fs.writeFileSync('output/slide.html', html)
  console.log('✓ Built output/slide.html')
  console.log('Open in browser to view.')
}

build().catch(console.error)
```

### Step 3.4: Run the Build

```bash
node build-slide.mjs
```

Opens `output/slide.html` in your browser.

### ✓ Checkpoint: Full Flow Working

1. Content from Sanity appears in the slide
2. Chart renders with Highcharts
3. GSAP animations play on load
4. Styling matches your prototype aesthetic

---

## Phase 4: Test the Full Workflow

**Time: ~30 minutes**

### Step 4.1: Workflow Test

1. **Get sample data** from Google Sheet (or create mock data)

2. **Ask Claude** for chart recommendation:
   - Paste CSV data into Claude Project
   - Ask "What chart should I use?"
   - Note the recommendation

3. **Enter in Sanity**:
   - Create new slide
   - Fill in title, subtitle, commentary
   - Select recommended chart type
   - Paste CSV data
   - Configure series based on Claude's advice
   - Choose theme colour

4. **Build HTML**:
   ```bash
   node build-slide.mjs
   ```

5. **View result** in browser

6. **Iterate**:
   - Change a label in Sanity → rebuild
   - Change chart type → rebuild
   - See changes reflected

---

## Folder Structure

When complete, you'll have:

```
your-workspace/
├── gmo-sanity/              # Sanity CMS
│   ├── schemaTypes/
│   │   ├── slide.ts
│   │   └── index.ts
│   ├── sanity.config.ts
│   └── package.json
│
├── gmo-builder/             # Build script
│   ├── build-slide.mjs
│   ├── output/
│   │   └── slide.html       # Generated output
│   └── package.json
│
└── existing-prototype/      # Your original prototype
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Start Sanity Studio | `cd gmo-sanity && npm run dev` |
| Build HTML from Sanity | `cd gmo-builder && node build-slide.mjs` |
| Deploy Sanity Studio (shareable URL) | `cd gmo-sanity && npx sanity deploy` |

---

## What You'll Demo to Client

1. **Sanity Studio** → "Here's where content is entered"
2. **Claude Project** → "Here's how we get chart recommendations"
3. **Generated HTML** → "Here's the output with animations"
4. **Edit cycle** → "Change a label, rebuild, see update"

---

## Next Steps After v2

| Enhancement | Purpose |
|-------------|---------|
| Multiple slides | Full report, not just one slide |
| API automation | No manual build step |
| Live preview | See changes without rebuild |
| Design system integration | Full Figma connection |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sanity won't start | Check Node version (`node -v`), needs 18+ |
| Build script can't connect | Check project ID in script matches Sanity |
| Chart not rendering | Check CSV format (headers on first row) |
| Series not showing | Ensure `dataColumn` exactly matches CSV header |

---

*Ready to build. Start with Phase 1.*
