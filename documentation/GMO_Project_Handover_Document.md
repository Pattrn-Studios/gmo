# GMO Digital Transformation: Project Handover Document

## Purpose

This document captures all context, decisions, and progress from the discovery and prototyping phase. Use this as the knowledge base for a new Claude Project to continue development.

---

## Project Overview

### Client
AXA Investment Managers (AXA IM)

### Project
Global Market Outlook (GMO) — A monthly publication covering macroeconomic trends, fixed income, equities, and market outlook.

### Objective
Transform the GMO report from a static PowerPoint/PDF into an interactive, digital-first experience with an efficient, AI-assisted production workflow.

### Consultancy
Pattrn Studios

---

## Recommended Solution

**Claude + Sanity + Highcharts**

A modular, AI-assisted workflow:

| Layer | Tool | Role |
|-------|------|------|
| Data | Google Sheets | Source data preparation |
| AI | Claude | Chart recommendations, content refinement |
| CMS | Sanity | Content authoring & management |
| Charts | Highcharts | Interactive data visualisation |
| Hosting | Vercel | Automated publishing |

### Why This Solution

- Bespoke authoring experience tailored to GMO workflow
- AI-assisted chart recommendations
- Modular architecture (swap any component)
- Low running cost (~$200-400/year)
- Full ownership and control
- Future-ready for AI improvements

---

## What's Been Built (v2 Prototype)

### 1. Sanity CMS Setup

**Location:** `C:\Users\User\gmo-sanity`

**Schema:** Custom slide schema with three tabs:
- **Content** — Title, subtitle, commentary (rich text), source
- **Chart** — Chart type dropdown, CSV data paste, series configuration (label, data column, colour), axis labels, y-axis format
- **Style** — Theme colour, layout options

**Key files:**
- `schemaTypes/slide.ts` — Main schema definition
- `schemaTypes/index.ts` — Schema registration

**Project ID:** `mb7v1vpy`

**How to run:**
```
cd C:\Users\User\gmo-sanity
npm run dev
```
Opens at: http://localhost:3333

---

### 2. Build Script

**Location:** `C:\Users\User\gmo-builder`

**What it does:** Fetches content from Sanity, generates HTML with Highcharts and GSAP animations.

**Key file:** `build-slide.mjs`

**How to run:**
```
cd C:\Users\User\gmo-builder
node build-slide.mjs
```

**Output:** `output/slide.html`

---

### 3. Claude Project (Chart Recommender)

**Location:** Claude.ai → Projects → "GMO Chart Generator"

**Custom instructions:** Analyses CSV data structure, recommends chart type, provides Sanity configuration with series labels, columns, and colours.

**Colour palette:**
- Navy (primary): #00005E
- Teal: #00A3A3
- Coral: #FF6B5B
- Gold: #E5A93D
- Purple: #7B5EA7
- Green: #2E8B57

---

## Current Workflow (v2)

```
Google Sheets → Claude Project → Sanity CMS → Build Script → HTML Output
   (data)       (recommendation)   (author)     (manual run)   (view)
```

**Time per edition:** 4-6 hours (vs 8-12 current)

---

## Planned Next Steps

### Immediate: Chart Recommendation Web App

A standalone web app that:
1. User pastes CSV data
2. Calls Claude API
3. Displays recommendation with live Highcharts preview
4. (Future) "Apply to Sanity" button

**Build guide exists at:** `GMO_Chart_Agent_Build_Guide.md`

**Tech stack:**
- Node.js + Express
- Claude API (Sonnet)
- Highcharts for preview

**Folder:** `C:\Users\User\gmo-chart-agent` (to be created)

---

### V3: Auto-Publish Pipeline

**Goal:** Publish in Sanity → Webhook → Vercel builds → Live URL (no manual steps)

**Components:**
- Sanity webhook triggers on publish
- Vercel deploy hook receives trigger
- Build runs automatically
- Output at: `https://gmo-v3.vercel.app`

**Build guide exists at:** `GMO_V3_Automated_Deployment_Guide.md`

---

### Future Enhancements

| Enhancement | Purpose |
|-------------|---------|
| Multi-slide support | Full 10-15 slide report |
| Slide navigation | Arrow keys / swipe between slides |
| Claude → Sanity integration | One-click apply recommendations to CMS |
| Design system | Figma ↔ Code tokens, component library |
| Analytics | GA4 tracking on all reports |
| Review workflow | Staging preview, approval process |

---

## Key Technical Decisions

### Why Sanity (not WordPress)
- Better structured content UX
- Schema-driven (we control every field)
- API-first (easy to connect to build pipeline)
- WordPress could work but requires more plugins and is clunkier for this use case

### Why Highcharts (not Recharts)
- JSON configuration (easier for non-developers to edit)
- Recharts outputs JSX code (requires technical skills)
- Sanity structured fields → Highcharts config is straightforward

### Why Claude Pro + API (not waiting for better AI)
- AI is evolving fast — no "perfect" tool coming
- Current capabilities already deliver value
- Modular architecture means we can swap models later
- Waiting = indefinite delay

### Why Custom Build (not Shorthand/Flourish)
- Off-the-shelf platforms are template-bound
- Manual chart embedding, no AI assistance
- Higher cost at scale ($6,000-30,000/year)
- Less flexibility for GMO's specific requirements

---

## Documents Created

All saved to `/mnt/user-data/outputs/`:

| Document | Purpose |
|----------|---------|
| `GMO_Platform_Landscape_Analysis.md` | Tool comparison research |
| `GMO_Production_Workflow_Architecture.md` | Four-layer system design |
| `GMO_Design_System_Requirements.md` | Tokens, components, motion, variety rules |
| `GMO_Claude_Content_Creation_Role.md` | How Claude fits in the workflow |
| `GMO_Client_Workflow_Presentation.md` | Simplified non-technical overview |
| `GMO_V2_Prototype_Step_by_Step.md` | Full v2 build instructions |
| `GMO_V3_Automated_Deployment_Guide.md` | Vercel auto-publish setup |
| `GMO_Sanity_Setup_Beginner_Guide.md` | Beginner-friendly Sanity instructions |
| `GMO_Technical_Explainer.md` | Sanity, comments, analytics explained |
| `GMO_Presentation_Slide_Content.md` | Risk, benefits, next steps slides |
| `GMO_Approach_Comparison_Introduction.md` | How we evaluated the landscape |
| `GMO_AI_Positioning_Slide.md` | Build now vs wait argument |
| `GMO_Why_Claude_Sanity_Slide.md` | Why this solution |
| `GMO_Current_Unknowns_Slide.md` | Known unknowns for Claude + Sanity |
| `GMO_Shorthand_Alternative_Slides.md` | Alternative solution analysis |
| `GMO_Claude_Sanity_Overview_Slide.md` | Scannable solution overview |
| `GMO_Chart_Agent_Build_Guide.md` | Web app build instructions |
| `sanity-schema-slide-v2.ts` | Current Sanity schema |

---

## Cost Summary

| Item | Annual Cost |
|------|-------------|
| Claude Pro (1-2 seats) | $200-400 |
| Sanity | Free tier |
| Vercel | Free tier |
| Highcharts | Free via CDN |
| **Total** | **~$200-400/year** |

Claude API (for web app): ~$0.006 per recommendation call

---

## Known Unknowns (To Validate in Prototyping)

| Unknown | Summary |
|---------|---------|
| Sanity flexibility | How complex can authoring interface become? Edge cases? |
| Claude chart accuracy | How often will human override be needed? |
| Frontend output quality | Can we achieve exact brand fidelity? |
| Multi-slide complexity | Performance and transitions with 10-15 slides |
| Data integration | Resilience to inconsistent or malformed data |
| Review workflow | Is document-level commenting sufficient? |
| AI consistency | Will model updates change behaviour? |
| Team adoption | How long does onboarding take? |
| Performance | Build times, API limits, page load |
| Maintainability | Ongoing maintenance burden |

---

## Alternative Solution Considered (Not Recommended)

**Shorthand + Highcharts**

| Aspect | Detail |
|--------|--------|
| What it is | Visual drag-and-drop publishing platform + embedded charts |
| Why considered | Established, lower technical risk, visual editing |
| Why not chosen | Rigid templates, manual chart embedding, no AI, higher cost, platform lock-in |

---

## How to Continue in New Project

### Step 1: Create Claude Project
1. Go to Claude.ai on shared account
2. Create new Project: "GMO Digital Transformation"
3. Add this document to Project Knowledge

### Step 2: Add Supporting Documents
Upload key documents to Project Knowledge:
- `GMO_Chart_Agent_Build_Guide.md` (immediate next step)
- `GMO_V2_Prototype_Step_by_Step.md` (reference)
- `GMO_V3_Automated_Deployment_Guide.md` (future reference)
- `sanity-schema-slide-v2.ts` (current schema)

### Step 3: Set Project Instructions
Add to Project Instructions:

```
You are assisting with the GMO Digital Transformation project for AXA Investment Managers.

Context:
- Building an AI-assisted workflow for producing the Global Market Outlook report
- Tech stack: Claude (AI), Sanity (CMS), Highcharts (charts), Vercel (hosting)
- v2 prototype exists and works (Sanity → build script → HTML)
- Currently building: Chart recommendation web app

Immediate focus:
- Complete the chart recommendation web app (guide in knowledge)
- Add "Apply to Sanity" functionality
- Prepare for client demonstration

Key decisions already made:
- Claude + Sanity over Shorthand/Flourish (flexibility, AI, cost)
- Highcharts over Recharts (JSON config, easier editing)
- Build now, not wait for AI maturity (modular architecture)

Sanity Project ID: mb7v1vpy
```

### Step 4: Resume Work
Start a conversation with:
> "I'm continuing the GMO prototype build. The chart recommendation web app is the next step. Can you help me work through the build guide?"

---

## Key Contacts / Context

- **Joe** — Product Manager at Pattrn Studios, leading the engagement
- **Client** — AXA Investment Managers
- **Project** — GMO (Global Market Outlook) digital transformation
- **Phase** — Discovery / Prototyping

---

## Summary: Where We Are

| Milestone | Status |
|-----------|--------|
| Platform research | ✓ Complete |
| Solution recommendation | ✓ Complete (Claude + Sanity) |
| v2 prototype (single slide) | ✓ Complete |
| Client presentation content | ✓ Complete |
| Chart recommendation web app | 🔄 Ready to build |
| V3 auto-publish | ○ Planned |
| Multi-slide support | ○ Planned |
| Design system | ○ Planned |

**Next action:** Build the chart recommendation web app using `GMO_Chart_Agent_Build_Guide.md`

---

*Document prepared for project handover — December 2025*
