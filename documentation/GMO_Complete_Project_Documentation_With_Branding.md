# GMO Digital Transformation: Complete Project Documentation with Branding

## Project Overview

**Client:** BNP Paribas Asset Management
**Project:** Global Market Outlook (GMO) Digital Transformation
**Consultancy:** Pattrn Studios
**Current Phase:** Production
**Last Updated:** January 27, 2026

---

## GMO Brand Guidelines

### Color Palette

**Primary Brand Color:**
- Green: `#3E7274` (Primary GMO brand color)

**Data Visualization Colors (in order of usage):**
1. `#3E7274` - Primary Green (Silver Tree)
2. `#3D748F` - Coast Blue
3. `#AC5359` - Metallic Copper (Red/Pink)
4. `#F1875A` - Orange
5. `#76BCA3` - Light Green (Blue Dianne variant)
6. `#132728` - Dark Blue (Blue Dianne Dark)

**Text Colors:**
- Primary Text: `#1A1A1A` (Black)
- Secondary Text: `#5F5F5F` (Grey-1)
- Inverse Text: `#FFFFFF` (White)

**Background Colors:**
- Primary: `#FFFFFF` (White)
- Secondary: `#F5F5F5` (Light grey)

### Typography

**Font Families:**
- **Heading/Titles:** BNPP Sans Condensed-Bold
- **Body Text:** BNPP Sans-Regular
- **Light Text:** BNPP Sans-Light
- **Buttons:** Source Sans Pro-SemiBold

**Note:** Font files required for full implementation. Fallback: system fonts.

**Type Scale (Desktop):**

| Element | Font | Size | Letter Spacing | Line Height | Weight |
|---------|------|------|----------------|-------------|--------|
| H1 (Title) | BNPP Sans Condensed-Bold | 64px | 0.72px | 105% | Bold |
| H2 (Title) | BNPP Sans Condensed-Bold | 56px | 0.8px | 105% | Bold |
| H3 (Title) | BNPP Sans-Light | 32px | -0.1px | 150% | Light |
| H4 (Title) | BNPP Sans Condensed-Bold | 32px | 0.2px | 120% | Bold |
| H5 (Title) | BNPP Sans Condensed-Bold | 40px | 0.4px | 110% | Bold |
| Headline 1 | BNPP Sans Condensed-Bold | 32px | 0.2px | 120% | Bold |
| Headline 2 | BNPP Sans Condensed-Bold | 20px | 0.2px | 125% | Bold |
| Body 1 | BNPP Sans-Regular | 22px | -0.1px | 32px | Regular |
| Body 2 | BNPP Sans-Regular | 18px | 0.2px | 150% | Regular |
| Body 3 | BNPP Sans-Regular | 16px | 0.2px | 150% | Regular |
| Body 4 (Light) | BNPP Sans-Light | 14px | 0.2px | 150% | Light |
| Button Label | Source Sans Pro-SemiBold | 14px | 1px | 100% | 600 |

---

## Current Architecture (V1)

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Data Input | Google Sheets → CSV/Excel | Source data preparation |
| AI Agent | Claude Sonnet 4 via API | Chart recommendations |
| CMS | Sanity Studio | Content authoring |
| Charts | Highcharts | Interactive visualization |
| Hosting | Vercel | Deployment |

### Application Components

**1. Chart Recommendation Agent**
- **URL:** `https://gmo-chart-agent.vercel.app`
- **Location:** `~/gmo-chart-agent/`
- **Purpose:** AI-powered chart analysis and recommendations
- **Features:**
  - File upload (Excel/CSV)
  - CSV paste
  - Natural language refinement
  - Live Highcharts preview
  - GMO brand color recommendations

**2. Sanity CMS**
- **Project ID:** `mb7v1vpy`
- **Dataset:** `production`
- **Location:** `~/gmo-sanity/`
- **Purpose:** Content management for slides
- **Schema:** Custom slide schema with Content/Chart/Style tabs

**3. Build Script** (if applicable)
- **Location:** `~/gmo-builder/`
- **Purpose:** Generate HTML from Sanity content
- **Output:** Styled slides with Highcharts

---

## File Structure

```
~/gmo-chart-agent/                    # Chart Agent (V1)
├── public/
│   └── index.html                   # Frontend with GMO branding
├── node_modules/
├── .env                             # Environment variables (API key)
├── .gitignore
├── index.js                         # Server with GMO color prompts
├── package.json
├── vercel.json                      # Vercel configuration
├── designTokens.js                  # GMO brand tokens
└── README.md

~/gmo-sanity/                         # Sanity CMS (to be updated)
├── schemaTypes/
│   ├── slide.ts                     # Slide schema (needs GMO colors)
│   └── index.ts
├── sanity.config.ts
└── package.json

~/gmo-builder/                        # Build script (optional)
├── build-slide.mjs
└── output/
```

---

## V1 Workflow

### Chart Agent → Sanity Process

**Time:** 7 minutes per slide

1. **Upload Data to Chart Agent** (2 min)
   - Upload Excel/CSV file OR paste CSV data
   - Click "Analyse Data"
   - AI recommends chart type, series, colors (GMO palette)
   - Refine with natural language if needed

2. **Copy to Sanity CMS** (5 min)
   - Create new slide in Sanity
   - **Content Tab:** Add title, subtitle, commentary, source
   - **Chart Tab:** 
     - Select chart type from agent
     - Paste CSV data
     - Add series (label, column, color from agent)
     - Set axis labels and format
   - **Style Tab:** Choose theme and layout
   - Click Publish

3. **Optional: Generate HTML** (1 min)
   - Run build script: `node build-slide.mjs`
   - View `output/slide.html`

---

## Brand Implementation Status

### ✅ Implemented in Chart Agent

**Colors:**
- AI recommends charts using GMO color palette
- Primary green (#3E7274) assigned to first series
- Subsequent series use approved accent colors in order
- Frontend UI uses GMO green for buttons, accents
- Chart previews show GMO colors

**Typography:**
- System fonts as fallback (BNPP fonts need to be added)
- Proper font stack specified in CSS
- Ready for web font integration

### ⏳ To Be Implemented

**In Sanity Schema:**
- Update color dropdown to only show GMO colors
- Lock down palette to prevent off-brand choices
- Add GMO color names to labels

**In Build Script:**
- Apply GMO typography (when font files provided)
- Enforce GMO spacing and layout rules
- Add brand-specific chart styling

**Font Files Needed:**
- BNPP Sans Condensed-Bold (.woff2, .woff)
- BNPP Sans-Regular (.woff2, .woff)
- BNPP Sans-Light (.woff2, .woff)
- Source Sans Pro-SemiBold (can use Google Fonts)

---

## API Configuration

### Claude API
- **Model:** `claude-sonnet-4-20250514`
- **Cost:** ~$0.006 per recommendation
- **Key Location:** `.env` file (`CLAUDE_API_KEY`)
- **Endpoint:** `https://api.anthropic.com/v1/messages`

### Sanity API
- **Project ID:** `mb7v1vpy`
- **Dataset:** `production`
- **API Version:** `2024-01-01`

---

## Deployment Configuration

### Vercel (Chart Agent)
- **URL:** `https://gmo-chart-agent.vercel.app`
- **Git:** Connected to GitHub repo
- **Environment Variables:** `CLAUDE_API_KEY`
- **Build Command:** Automatic (detects Node.js)
- **Framework:** Node.js/Express

### Environment Variables Required
```
CLAUDE_API_KEY=sk-ant-your-key-here
PORT=3000
```

---

## Features by Version

### V1 (Completed)
✅ File upload (Excel, CSV)
✅ CSV paste input
✅ AI chart recommendations with GMO colors
✅ Natural language refinement
✅ Live Highcharts preview
✅ Deployed to Vercel
✅ GMO brand colors in recommendations
✅ GMO brand colors in UI

### V2 (Completed — January 18, 2026)
✅ Chart Builder integrated into Sanity Studio
✅ AI-powered chart recommendations in-context
✅ 2-3 alternative chart visualizations
✅ No context switching required

### V3 (Completed — January 2026)
✅ Auto-publish pipeline (Sanity → Vercel)
✅ React report viewer (interactive web-based)
✅ PowerPoint export (PptxGenJS + QuickChart.io)
✅ Embedded images from Sanity (logos, cards, section images)
✅ 6 slide types supported (Title, TOC, Divider, Chart, Insights, Timeline)
✅ Theme color mapping from Sanity to PowerPoint
✅ AI-powered slide design review (Claude Vision API)
✅ BNP Paribas design specification integration
✅ Suggestion categories: textLength, chartSize, bulletCount, colorAccuracy, placeholder, layoutAlignment
✅ Severity-based review (HIGH/MEDIUM/LOW)
✅ currentValue/expectedValue badges on suggestions

---

## Brand Color Usage Guidelines

### Chart Data Series
**Rule:** Assign colors in this specific order:

1. **First series:** `#3E7274` (Primary Green)
2. **Second series:** `#3D748F` (Coast Blue)
3. **Third series:** `#AC5359` (Metallic Copper)
4. **Fourth series:** `#F1875A` (Orange)
5. **Fifth series:** `#76BCA3` (Light Green)
6. **Sixth series:** `#132728` (Dark Blue)

**Why this order:**
- Primary green for main/most important data
- Blue for secondary data
- Warm colors (copper, orange) for contrast
- Additional greens/blues for supporting data

### UI Elements
- **Primary actions (buttons):** `#3E7274` (Green)
- **Hover states:** `#2d5557` (Darker green)
- **Success messages:** Green with 10% opacity background
- **Error messages:** `#AC5359` (Metallic Copper)
- **Text:** `#1A1A1A` (Black) and `#5F5F5F` (Grey)

---

## Key Documents in This Project

### Design & Branding
- `GMO_Typestack.pdf` - Typography specifications
- `GMO_Colours.pdf` - Color palette
- `designTokens.js` - Coded design tokens

### Setup & Deployment
- `GMO_Deployment_Guide.md` - How to deploy to Vercel
- `GMO_Vercel_404_Fix.md` - Troubleshooting deployment
- `GMO_Build_From_Scratch_Mac.md` - Setup from nothing

### Workflow & Features
- `GMO_Chart_Agent_to_Sanity_Workflow.md` - V1 manual process
- `GMO_File_Upload_Implementation_Guide.md` - File upload feature
- `GMO_Refinement_Implementation_Guide.md` - Natural language refinement

### Reference
- `GMO_Project_Handover_Document.md` - Original project overview
- `GMO_V2_Prototype_Step_by_Step.md` - Sanity setup guide
- `GMO_V3_Automated_Deployment_Guide.md` - Future automation

---

## Technical Decisions & Rationale

### Why Claude + Sanity?
- **Flexibility:** Not locked into templates
- **AI Integration:** Easy to connect Claude API
- **Cost:** ~$200-400/year vs $6,000+ for alternatives
- **Control:** Own the entire stack
- **Future-proof:** Can swap any component

### Why Vercel?
- **Serverless:** Perfect for Node.js apps
- **Free tier:** Sufficient for demos and low-traffic use
- **Auto-deploy:** Push to GitHub = automatic deployment
- **Fast:** Global CDN, quick cold starts

### Why GMO Color Order?
- **Primary first:** Most important data gets brand color
- **Contrast:** Warm/cool alternation for visibility
- **Accessibility:** Tested color combinations
- **Brand consistency:** Always uses approved palette

---

## Cost Breakdown

### Annual Costs
| Item | Cost |
|------|------|
| Claude API (1-2 seats) | $200-400 |
| Sanity CMS | Free tier |
| Vercel Hosting | Free tier |
| Highcharts | Free (CDN) |
| **Total** | **$200-400/year** |

### Per-Use Costs
| Action | Cost |
|--------|------|
| Chart analysis | ~$0.006 |
| Chart refinement | ~$0.006 |
| 10-slide report | ~$0.06-0.12 |

---

## Known Issues & Solutions

### Font Files Not Yet Integrated
**Issue:** BNPP Sans fonts not available as web fonts  
**Current:** Using system font fallbacks  
**Solution:** Need font files from client (.woff2, .woff format)  
**Impact:** Typography not 100% on-brand yet  

### Sanity Colors Not Yet Restricted
**Issue:** Sanity schema still has generic colors  
**Current:** Users can choose any color  
**Solution:** Update `slide.ts` schema with GMO colors only  
**Impact:** Risk of off-brand color choices  

### Build Script Not Updated
**Issue:** Build script doesn't apply GMO branding  
**Current:** Uses generic styling  
**Solution:** Update `build-slide.mjs` with design tokens  
**Impact:** Final output needs manual styling  

---

## Next Steps (Priority Order)

### 1. Get Font Files from Client (High Priority)
- Request BNPP Sans family (.woff2, .woff)
- Convert to web fonts if needed
- Add @font-face declarations
- Update all HTML/CSS

### 2. Update Sanity Schema (High Priority)
- Replace color options with GMO palette
- Update `slide.ts` with brand colors
- Add color names/descriptions
- Test in Sanity Studio

### 3. Update Build Script (Medium Priority)
- Import design tokens
- Apply GMO typography
- Use GMO spacing/layout
- Test output HTML

### 4. Test End-to-End (Medium Priority)
- Create test slide with GMO data
- Verify brand consistency
- Check all color combinations
- Test on multiple devices

### 5. Client Demo Prep (High Priority)
- Prepare demo script
- Test with real GMO data
- Have backup plan ready
- Gather feedback

---

## For Future Chat Sessions

When starting a new chat about this project, reference:

**For branding questions:**
- This document (GMO project documentation)
- `designTokens.js` for exact values
- `GMO_Typestack.pdf` and `GMO_Colours.pdf` as source of truth

**For technical questions:**
- Current file structure above
- Deployment configuration above
- API configuration above

**For workflow questions:**
- `GMO_Chart_Agent_to_Sanity_Workflow.md`
- V1 workflow section above

**Key facts to remember:**
- Primary color: `#3E7274` (green)
- Font family: BNPP Sans (not yet integrated)
- Sanity Project ID: `mb7v1vpy`
- Chart Agent URL: `https://gmo-chart-agent.vercel.app`
- Client: BNP Paribas Asset Management
- Project: Global Market Outlook (GMO)

---

## Contact & Context

**Project Lead:** Joe (Pattrn Studios)  
**Client:** BNP Paribas Asset Management  
**Phase:** Production
**Status:** All features deployed — Chart Builder, PowerPoint export, AI design review, React viewer

---

*Last Updated: January 27, 2026*
*Version: 3.0 — Production*

**Note:** For the latest deployment status and architecture overview, see [DEPLOYMENT_SUMMARY.md](../DEPLOYMENT_SUMMARY.md). For BNP Paribas design specifications used by the AI review, see [BNP_Paribas_Design_Specification.md](BNP_Paribas_Design_Specification.md).
