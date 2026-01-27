# BNP Paribas Asset Management: Design Specification for AI Review

## Document Purpose

This specification provides precise, measurable design standards for reviewing Global Market Outlook (GMO) PowerPoint slides. Every rule references the actual template configuration and includes concrete thresholds for automated review.

**Version:** 1.0
**Last Updated:** January 2026
**Template Config:** template-config.json

---

## Brand Overview

**Company:** BNP Paribas Asset Management
**Report:** Global Market Outlook (GMO)
**Audience:** Institutional investors, financial professionals
**Presentation Context:** High-stakes investment presentations, typically 10-15 slides

---

## Color Palette (Exact Hex Codes)

### Primary Colors
- **Primary Teal:** `#009FB1` - Main brand color, backgrounds for chart sections
- **Teal:** `#51BBB4` - Accent color, TOC cards
- **Cyan:** `#61C3D7` - Lighter accent, section dividers, TOC cards

### Accent Colors
- **Orange:** `#F49F7B` - Warm accent, TOC cards, highlights
- **Brown:** `#A37767` - Secondary accent, TOC cards

### Utility Colors
- **White:** `#FFFFFF` - Text on colored backgrounds, clean elements
- **Text Primary:** `#1A1A1A` - Main body text on white backgrounds
- **Text Secondary:** `#5F5F5F` - Captions, sources, secondary text

### Color Usage Rules

**Background Colors by Slide Type:**
- Title: Cyan gradient (#61C3D7)
- TOC: White
- Section Divider: Cyan (#61C3D7)
- Chart Section: Primary Teal (#009FB1)
- Insights: White
- Timeline: White

**Text Color Rules:**
- On teal/cyan backgrounds: White (#FFFFFF) only
- On white backgrounds: Primary text (#1A1A1A)
- Sources/captions: Secondary text (#5F5F5F)

**Common Mistake to Flag:**
- Using black text (#000000) on colored backgrounds instead of white
- Using primary text on light cyan backgrounds (poor contrast)

---

## Typography Standards

### Font Family
**All slides:** Arial (system font)
**Reason:** BNPP Sans fonts not currently embedded in template

### Font Specifications by Element

| Element | Size | Weight | Color | Use Case |
|---------|------|--------|-------|----------|
| **Section Number** | 32pt | Bold | #1A1A1A | Chart section badge |
| **Title (Main)** | 24pt | Bold | White or #1A1A1A | All slide types |
| **Title (Large)** | 48pt | Bold | White | Title slide, section dividers |
| **Subtitle** | 16pt | Regular | White or #1A1A1A | Supporting context |
| **Body Text** | 12pt | Regular | White or #1A1A1A | Bullet points |
| **Chart Title** | 12pt | Bold | White or #1A1A1A | Chart labels |
| **Source** | 10pt | Italic | #5F5F5F or White | Data attribution |
| **Disclaimer** | 9pt | Bold | #1A1A1A | Title slide legal text |

### Text Length Limits

**CRITICAL THRESHOLDS:**

| Element | Character Limit | Reasoning | Severity if Exceeded |
|---------|----------------|-----------|---------------------|
| Main Title | 80 characters | Readability from 10+ feet | HIGH |
| Subtitle | 120 characters | Two-line maximum | MEDIUM |
| Single Bullet | 150 characters | One-line preferred, two max | MEDIUM |
| Chart Title | 60 characters | Single line above chart | MEDIUM |

**Bullet Point Limits:**
- **Recommended:** 3-4 bullets per slide
- **Maximum:** 5 bullets per slide
- **Severity:** 6+ bullets = HIGH (suggest split into two slides)

### Typography Common Mistakes

| Issue | Detection | Severity | Suggestion |
|-------|-----------|----------|------------|
| Title exceeds 80 chars | `title.length > 80` | HIGH | "Title is {X} chars (max 80). Suggest shorter version maintaining key message." |
| 6+ bullet points | `bullets.length >= 6` | HIGH | "Too many bullets ({X}). Recommend splitting into 2 slides or condensing to 4-5 key points." |
| Bullet text wraps 3+ lines | Word count > 30 words | MEDIUM | "Bullet point too long. Recommend breaking into two bullets or shortening." |
| Inconsistent font sizes | Manual detection | MEDIUM | "Font size {X}pt doesn't match template standard of {Y}pt for {element}." |

---

## Slide Type Specifications

### 1. Chart Section (Most Common)

**Layout Reference:** `template-config.json > slideTypes.chartSection`

#### Required Elements & Positions

**Background:**
- Full slide: x=0, y=0, w=13.33", h=7.5"
- Fill: Primary Teal (#009FB1)

**Section Number Badge:**
- Position: x=0.5", y=0.36", w=0.72", h=0.72"
- Background: White circle
- Number text: 32pt Bold, centered, color=#009FB1

**Title:**
- Position: x=1.21", y=0.43", w=11.86", h=0.36"
- Font: 24pt Bold Arial
- Color: White (#FFFFFF)
- Max length: 80 characters

**Subtitle:**
- Position: x=1.24", y=0.85", w=11.86", h=0.24"
- Font: 16pt Regular Arial
- Color: White (#FFFFFF)
- Max length: 120 characters

**Left Panel (Image + Bullets):**
- Image area: x=0.5", y=1.59", w=2.5", h=1.73"
- Content area: x=0.5", y=3.48", w=2.5", h=2.69"
- Bullet font: 10pt Regular Arial, White

**Chart:**
- Title: x=3.35", y=1.57", w=4.44", h=0.2" (12pt Bold)
- Chart area: x=3.33", y=1.93", w=7.61", h=3.94"
- **Size validation:** Chart should occupy ~57% of slide width (7.61" / 13.33")

**Source:**
- Position: x=0.5", y=6.14", w=12.47", h=0.29"
- Font: 10pt Italic Arial
- Color: White (#FFFFFF)
- Format: "Source: [data provider], [date]"

#### Chart Section Quality Criteria

**Visual Balance:**
- Chart must be clearly visible and dominate right 2/3 of slide
- Left panel bullets: 3-4 recommended, 5 maximum
- White space between elements: minimum 0.15" margins

**Common Mistakes - Chart Section:**

| Issue | Detection | Severity | Specific Suggestion |
|-------|-----------|----------|---------------------|
| Chart too small | Chart height < 3.5" | HIGH | "Chart area is only {X}" tall. Should be 3.94" per template to ensure visibility from presentation distance." |
| Too many bullets | > 5 bullets in left panel | HIGH | "Left panel has {X} bullets (max 5). Recommend condensing to 3-4 key points." |
| Missing chart title | No text at chartTitle position | MEDIUM | "Chart missing descriptive title. Add at position (3.35", 1.57")." |
| Image placeholder not replaced | Image shows generic icon | MEDIUM | "Left panel image not customized. Replace with relevant visual." |
| Source not formatted | Missing "Source:" prefix | LOW | "Source should follow format: 'Source: [provider], [date]'" |

---

### 2. Insights Section

**Layout Reference:** `template-config.json > slideTypes.insightsSection`

#### Required Elements & Positions

**Background:**
- Full slide: White (#FFFFFF)

**Title:**
- Position: x=0.5", y=0.29", w=12.33", h=0.39"
- Font: 24pt Bold Arial
- Color: Primary Text (#1A1A1A)

**Subtitle:**
- Position: x=0.5", y=0.81", w=5.77", h=0.23"
- Font: 16pt Regular Arial
- Color: Primary Text

**Main Chart:**
- Title: x=0.5", y=1.46", w=2.48", h=0.2" (12pt Bold)
- Chart area: x=0.47", y=1.85", w=8.66", h=4.33"
- **Size validation:** Chart occupies ~65% of slide width (8.66" / 13.33")

**Insights Panel (Right Side):**
- Panel background: x=9.79", y=0, w=3.54", h=7.5"
- Color: Subtle tint or white
- Divider line: x=9.53", w=0.26" (vertical separator)
- Insights title: x=10.28", y=1.46" ("Key Insights" or similar)
- Insights list: x=10.28", y=1.78", w=3.28", h=3.28"

**Source:**
- Position: x=0.5", y=6.27", w=9.04", h=0.33"
- Font: 10pt Italic Arial

#### Insights Section Quality Criteria

**Key Insight Panel:**
- Should contain 2-4 concise insights
- Each insight: 1-2 sentences, max 50 words
- Insights should synthesize chart data, not just repeat it

**Common Mistakes - Insights Section:**

| Issue | Detection | Severity | Specific Suggestion |
|-------|-----------|----------|---------------------|
| Chart too small | Chart width < 8" | HIGH | "Main chart should be 8.66" wide to provide space for data visualization." |
| Too many insights | > 4 items in insights panel | MEDIUM | "Insights panel has {X} items (max 4). Condense to most critical 2-3 insights." |
| Insight text too long | Any insight > 50 words | MEDIUM | "Insight #{X} is too long. Recommend shortening to 1-2 sentences." |
| Missing divider | No visual separation between chart and panel | LOW | "Add vertical divider at x=9.53" to separate chart from insights panel." |
| Repetitive insights | Insights just state chart data | MEDIUM | "Insights should synthesize/interpret data, not just describe it." |

---

### 3. Section Divider

**Layout Reference:** `template-config.json > slideTypes.sectionDivider`

#### Required Elements

**Background:**
- Full slide: Cyan (#61C3D7)

**Section Name:**
- Position: x=0.46", y=2.7", w=6.2", h=0.65"
- Font: 48pt Bold Arial
- Color: White (#FFFFFF)
- Max length: 40 characters (large text, fewer chars)

**Decorative Image:**
- Position: x=7.24", y=0.88", w=5.74", h=5.74"
- Should be relevant to section theme

#### Common Mistakes - Section Divider:

| Issue | Detection | Severity | Suggestion |
|-------|-----------|----------|------------|
| Section name too long | > 40 characters | HIGH | "Section name is {X} chars. At 48pt size, max 40 chars recommended." |
| Image missing | No image element | MEDIUM | "Add relevant visual at position (7.24", 0.88") to balance composition." |
| Wrong background color | Not #61C3D7 | HIGH | "Section divider background should be Cyan (#61C3D7) per brand guidelines." |

---

### 4. Title Slide

**Layout Reference:** `template-config.json > slideTypes.title`

#### Required Elements

**Background:**
- Cyan (#61C3D7) or gradient

**Title:**
- Position: x=0.5", y=3.0", w=7.6", h=1.5"
- Font: 48pt Bold Arial
- Color: White (#FFFFFF)
- Max length: 60 characters (large, prominent)

**Subtitle:**
- Position: x=0.5", y=4.67", w=4.0", h=0.4"
- Font: 16pt Regular Arial
- Color: White

**Disclaimer:**
- Position: x=0.5", y=0.27", w=11.2", h=0.45"
- Font: 9pt Bold Arial
- Color: Primary Text (#1A1A1A)
- Should be present for regulatory compliance

#### Common Mistakes - Title Slide:

| Issue | Detection | Severity | Suggestion |
|-------|-----------|----------|------------|
| Title too long | > 60 characters | HIGH | "Title is {X} chars. At 48pt size, recommend max 60 characters." |
| Missing disclaimer | No text in disclaimer area | HIGH | "Regulatory disclaimer required at top of title slide." |
| Poor contrast | Title color not white on cyan | HIGH | "Title must be white (#FFFFFF) on cyan background for legibility." |

---

### 5. Table of Contents

**Layout Reference:** `template-config.json > slideTypes.tableOfContents`

#### Card Specifications

**Card Layout:**
- 5 cards total
- Starting position: x=0.5", y=1.7"
- Card dimensions: w=2.25", h=5.0"
- Spacing between cards: 0.26"
- Card colors (in order): #009FB1, #51BBB4, #61C3D7, #F49F7B, #A37767

**Card Elements:**
- Section number: 32pt Bold, y=2.02"
- Section blurb: y=2.95", height=1.58"
- Section image: y=4.91", height=1.8"

#### Common Mistakes - TOC:

| Issue | Detection | Severity | Suggestion |
|-------|-----------|----------|------------|
| Wrong number of cards | ≠ 5 cards | HIGH | "TOC should have exactly 5 cards for 5 sections." |
| Inconsistent card heights | Heights vary | MEDIUM | "All cards should be 5.0" tall for visual consistency." |
| Wrong color sequence | Colors not in specified order | MEDIUM | "Cards should use colors in order: Primary Teal, Teal, Cyan, Orange, Brown." |
| Section text too long | > 80 chars in blurb area | MEDIUM | "Section {X} text too long for card. Recommend shortening to 60-80 characters." |

---

### 6. Timeline Section

**Layout Reference:** `template-config.json > slideTypes.timelineSection`

#### Layout Specifications

**Timeline Items:**
- 3 items arranged horizontally
- Item width: 3.4" each
- Spacing: 1.5" between items

**Item Elements:**
- Number badge: 0.94" diameter circle
- Content area: 1.52" height
- Positions defined in template-config.json for items 0, 1, 2

#### Common Mistakes - Timeline:

| Issue | Detection | Severity | Suggestion |
|-------|-----------|----------|------------|
| Wrong number of items | ≠ 3 items | MEDIUM | "Timeline should have exactly 3 items for balanced horizontal layout." |
| Inconsistent spacing | Items not evenly spaced | MEDIUM | "Timeline items should be spaced 1.5" apart per template." |
| Content overflow | Text exceeds content area | MEDIUM | "Timeline item {X} text too long. Recommend max 100 words per item." |

---

## Chart Formatting Standards

### Chart Size Guidelines

**By Data Complexity:**

| Data Series Count | Recommended Chart Width | Minimum Height | Reasoning |
|-------------------|-------------------------|----------------|-----------|
| 1-3 series | 7.61" (57% of slide) | 3.94" | Standard visibility |
| 4-5 series | 7.61" - 8.66" | 3.94" | Good for moderate complexity |
| 6+ series | 8.66" (65% of slide) | 4.33" | Needs extra space for clarity |

**Chart Section Position Validation:**
- Chart section chart: Must be at x=3.33", y=1.93", w=7.61", h=3.94"
- Insights section chart: Must be at x=0.47", y=1.85", w=8.66", h=4.33"

### Chart Elements

**Required Elements:**
- Chart title (12pt Bold)
- Axis labels (10pt Regular)
- Legend with clear labels
- Grid lines (subtle, #E0E0E0)
- Data labels (when beneficial, 10pt)

**Chart Colors:**
- Use brand palette in order
- First series: Primary Teal (#009FB1)
- Subsequent series: Teal, Cyan, Orange, Brown
- Ensure sufficient contrast between adjacent series

### Common Chart Mistakes

| Issue | Detection | Severity | Specific Suggestion |
|-------|-----------|----------|---------------------|
| Too many series | > 6 data series | HIGH | "{X} data series is too many for clarity. Recommend highlighting 4-5 key series or splitting chart." |
| Chart title missing | No title element | MEDIUM | "Chart missing descriptive title. Add at chartTitle position (12pt Bold)." |
| Poor legend placement | Legend obscures data | MEDIUM | "Move legend to top-right or bottom to avoid obscuring data points." |
| Insufficient contrast | Similar colors adjacent | MEDIUM | "Series {X} and {Y} colors too similar. Use colors from opposite ends of palette." |
| Axis labels missing | No x or y axis labels | HIGH | "Chart missing axis labels. Add descriptive labels for context." |
| Chart placeholder | Text says "Chart" | HIGH | "Replace 'Chart' placeholder with actual data visualization." |
| Too small for data | Chart area < 3" | HIGH | "Chart is only {X}" tall. Minimum 3.94" needed for {Y} series to be readable." |

---

## Content Quality Standards

### Bullet Point Best Practices

**Structure:**
- Start with action verbs or key nouns
- One main idea per bullet
- Use parallel structure
- Include specific numbers/data when relevant

**Good Example:**
```
• Fed cut rates in December, expected 3 more cuts to 3% in 2026
• Fed leadership change expected in Q2 impacting policy direction
• ECB pause on rate cuts extends into 2026
```

**Bad Example:**
```
• The Federal Reserve made an important decision about interest rates
• There could be changes in leadership
• Monetary policy decisions are being carefully considered
```

**Why Bad:**
- Too wordy (violates 150-char limit)
- Vague (no specific data)
- Not actionable/informative

### Source Citation

**Required Format:**
```
Source: [Data Provider], [Organization], [Date]
```

**Good Examples:**
- "Source: Bloomberg, BNP Paribas Asset Management, 31 December 2025"
- "Source: Federal Reserve, ECB, Bank of England, Q4 2025"

**Bad Examples:**
- "Source: Source A" (placeholder not replaced)
- "Source: various" (too vague)
- Missing source entirely

**Severity:** Missing or placeholder source = MEDIUM

---

## Layout Quality Checklist

### Visual Balance Assessment

**White Space Requirements:**
- Minimum margins: 0.5" from slide edges
- Element spacing: Minimum 0.15" between distinct elements
- Text padding: 0.1" within containers

**Alignment:**
- All text elements left-aligned within their containers
- Chart aligned to template grid
- Consistent x-positions for similar elements across slides

**Common Layout Mistakes:**

| Issue | Detection | Severity | Suggestion |
|-------|-----------|----------|------------|
| Elements too close | Spacing < 0.15" | MEDIUM | "Increase spacing between {element1} and {element2} to minimum 0.15"." |
| Poor alignment | x-positions inconsistent | MEDIUM | "Align {element} to template grid. Should be at x={value}"." |
| Insufficient margins | Element < 0.5" from edge | LOW | "Move {element} inward. Minimum 0.5" margin from slide edges." |
| Overcrowded slide | > 70% of slide filled | HIGH | "Slide too dense. Consider splitting into 2 slides or removing less critical content." |

---

## Severity Definitions (Updated)

### HIGH Severity
**Impact:** Significantly impairs readability, violates brand standards, or damages professionalism

**Examples:**
- Title exceeds 80 characters
- 6+ bullet points (information overload)
- Chart placeholder not replaced ("Chart" text visible)
- Wrong background color for slide type
- Missing required elements (title, source, chart)
- Chart too small for data complexity (< 3" height)
- Poor text contrast (black on dark background)

**Action:** MUST fix before presentation

---

### MEDIUM Severity
**Impact:** Noticeable issue that detracts from quality but doesn't prevent comprehension

**Examples:**
- Subtitle exceeds 120 characters
- 5 bullet points (within limit but approaching too many)
- Chart title missing or generic
- Source not properly formatted
- Minor alignment inconsistencies
- Bullet points wrapping to 3 lines
- Chart colors not following brand palette order

**Action:** SHOULD fix for optimal quality

---

### LOW Severity
**Impact:** Minor polish opportunity that slightly improves presentation

**Examples:**
- Spacing slightly inconsistent (0.12" vs 0.15")
- Font size 1-2pt off from template
- Image could be higher resolution
- Minor text could be shortened
- Decorative elements could be enhanced

**Action:** Nice to fix, but not critical

---

## Example-Based Rules (Good vs Bad)

### Good Slide Example Analysis

**Reference:** Good.png (Central banks slide)

**What Makes It Good:**
- Clear visual hierarchy (title > subtitle > content > chart)
- Decorative image adds interest without cluttering (compass/navigation theme)
- 4 bullet points (optimal range)
- Chart occupies significant space (~60% of right side)
- Chart has proper title: "US and Eurozone central bank rates and 30y government bond yields"
- Legend is clear with 4 distinct series
- Source properly formatted: "Source: Bloomberg, BNP Paribas Asset Management, 31 December 2025"
- White text on teal background (proper contrast)
- Consistent spacing between elements

**Specific Measurements:**
- Bullet points: 4 (ideal)
- Chart title length: ~75 characters (good)
- Chart area: Large enough for 4 data series
- Visual balance: 30% left panel, 70% chart area

---

### Bad Slide Example Analysis

**Reference:** Bad.png (Tariffs slide)

**What Makes It Bad:**
- Chart shows placeholder text "Chart" (not actual data visualization)
- 5 bullet points with very long text (approaching information overload)
- Bullet 4 is extremely long (~90 words) and wraps 4+ lines
- Source reads "Source: Source A" (placeholder not replaced)
- No decorative image to balance composition
- Chart takes up large area but has minimal data (single series)
- Visual imbalance (too much empty space in chart area)

**Specific Issues to Flag:**

| Element | Issue | Severity | Suggestion |
|---------|-------|----------|------------|
| Chart | Placeholder text "Chart" visible | HIGH | "Replace chart placeholder with actual data visualization showing tariff rates over time." |
| Bullets | 5 bullets, bullet #4 ~90 words | HIGH | "Bullet 4 is too long (90 words). Split into 2 separate bullets or condense to key point." |
| Source | "Source: Source A" is placeholder | MEDIUM | "Replace 'Source A' with actual data provider (e.g., 'US Trade Representative, 2025')." |
| Image | No decorative image | MEDIUM | "Add relevant image in left panel to balance white space and add visual interest." |
| Chart area | Large area for minimal data | MEDIUM | "Chart area oversized for single data series. Consider adding comparative data or reducing chart size." |

---

## Quick Reference Tables

### Character Limits by Element

| Element | Max Characters | Severity if Exceeded |
|---------|----------------|---------------------|
| Main Title | 80 | HIGH |
| Large Title (48pt) | 60 | HIGH |
| Subtitle | 120 | MEDIUM |
| Bullet Point | 150 | MEDIUM |
| Chart Title | 60 | MEDIUM |

### Bullet Point Limits

| Count | Status | Action |
|-------|--------|--------|
| 3-4 | Ideal | None needed |
| 5 | Maximum | Acceptable but monitor length |
| 6+ | Too many | HIGH severity, must reduce |

### Chart Size by Series Count

| Series Count | Minimum Width | Minimum Height |
|--------------|---------------|----------------|
| 1-3 | 7.61" | 3.94" |
| 4-5 | 7.61" | 3.94" |
| 6+ | 8.66" | 4.33" |

---

## Validation Checklist

Use this checklist to validate every slide:

### All Slides
- [ ] Correct background color for slide type
- [ ] Text color provides sufficient contrast
- [ ] Font sizes match template specifications
- [ ] Minimum 0.5" margins from edges
- [ ] Elements aligned to template grid

### Chart Section
- [ ] Section number badge present and correct size
- [ ] Title <= 80 characters
- [ ] Subtitle <= 120 characters (if present)
- [ ] 3-5 bullet points in left panel
- [ ] Chart title present and descriptive
- [ ] Chart area = 7.61" x 3.94"
- [ ] Source properly formatted

### Insights Section
- [ ] Title <= 80 characters
- [ ] Main chart area = 8.66" x 4.33"
- [ ] Insights panel has 2-4 items
- [ ] Each insight <= 50 words
- [ ] Vertical divider present at x=9.53"
- [ ] Source properly formatted

### Common Issues Across All Slides
- [ ] No placeholder text ("Chart", "Source A", etc.)
- [ ] No elements overlapping
- [ ] Consistent spacing (0.15" minimum)
- [ ] All images at appropriate resolution
- [ ] Text not truncated or cut off

---

## Conclusion

This specification provides concrete, measurable standards for AI review of BNP Paribas Asset Management slides. Every rule references actual template positions, includes severity thresholds, and provides specific, actionable suggestions.

**Key Principles:**
1. **Be Specific:** Reference exact measurements, not vague descriptions
2. **Be Actionable:** Provide concrete fixes, not just identify problems
3. **Be Consistent:** Apply same standards across all slides
4. **Be Professional:** Consider investor audience and high-stakes context

**When in doubt:** Reference template-config.json for exact specifications.

---

*Document version 1.0 - January 2026*
*For questions or updates, reference template-config.json as source of truth*
