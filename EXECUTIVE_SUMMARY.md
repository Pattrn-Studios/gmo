# Executive Summary

## GMO Digital Transformation Project

**Date:** January 28, 2026
**Prepared for:** AXA Investment Managers / BNP Paribas Asset Management
**Prepared by:** Pattrn Studios

---

## 1. Project Summary

### What Was Built

The GMO Digital Transformation project modernises the way financial market outlook reports are created, managed, and distributed. Instead of manually building PowerPoint presentations each month, content editors now use a web-based content management system with artificial intelligence assistance to create interactive, digital-first reports.

The solution replaces the traditional workflow of designing static slides in PowerPoint with an intelligent platform that helps editors create charts from data, suggests content based on the data, and automatically maintains brand consistency. The final reports can be viewed interactively online in both English and French, or exported back to PowerPoint and PDF for traditional distribution.

### The Business Problem It Addresses

Traditional financial report production is:
- **Time-intensive**: Manual formatting, chart creation, and translation require significant effort
- **Inconsistent**: Brand guidelines are difficult to enforce across multiple editors
- **Inflexible**: PowerPoint files are static and difficult to update or distribute digitally
- **Expensive**: Translation services and design reviews add ongoing costs

### Key Outcomes Achieved

- **Streamlined content workflow** with AI-powered chart creation and content suggestions
- **Automated French translation** eliminating need for external translation services
- **Interactive web viewer** enabling modern digital distribution
- **Brand consistency** enforced through template-driven design
- **Flexible export options** maintaining compatibility with existing distribution channels

---

## 2. Features Delivered

### 2.1 Interactive Report Viewer

An elegant web-based report reader that replaces static PDFs.

**Key Capabilities:**
- Clean, modern design optimised for screen reading
- Dark mode and light mode for user preference
- Smooth scrolling with progress indicator
- Collapsible table of contents for easy navigation
- Fully responsive design (works on desktop, tablet, and mobile)
- Instant access via URL (no downloads required)

**Access:** https://gmo-report.vercel.app

### 2.2 AI-Powered Chart Builder

Intelligent chart creation directly within the content management system.

**How It Works:**
1. Editor uploads an Excel file or CSV with data
2. AI analyses the data structure and content
3. System recommends the best chart type with alternatives
4. Editor selects preferred option and customises if needed
5. Chart is saved and appears in the report automatically

**Alternatively:**
- Editor can upload an image of an existing chart
- AI extracts the data from the image
- System recreates the chart in the new digital format

**Supported Chart Types:**
Line charts, bar charts, area charts, pie charts, donut charts, stacked charts, scatter plots, radar charts, waterfall charts, gauges, treemaps, and heatmaps.

### 2.3 Automatic French Translation

One-click translation of entire reports from English to French.

**How It Works:**
1. Editor creates content in English
2. Single button press generates French version
3. AI translates all text while preserving formatting
4. French report available instantly at /fr/ URL

**Quality Features:**
- Uses formal business French appropriate for institutional investors
- Preserves financial terminology and proper nouns
- Maintains all formatting (bullet points, bold, italic)
- Keeps numbers, percentages, and dates unchanged

**Access:** https://gmo-report.vercel.app/fr/

### 2.4 Content Management System

Professional editing environment for creating and managing reports.

**Key Features:**
- Structured content editing (not free-form like Word)
- Preview changes before publishing
- Publication workflow (draft → review → published)
- Version history and rollback capability
- Multi-user collaboration support

**Access:** https://gmo-prototype.sanity.studio

### 2.5 AI Content Suggestions

Intelligent content assistance for editors.

**Capabilities:**
- Generates section titles based on chart data
- Suggests subtitle text
- Creates bullet point summaries
- Writes key insights for insights panels

### 2.6 PowerPoint & PDF Export

Traditional format export for existing distribution channels.

**PowerPoint Export:**
- Generates branded presentation files
- AI reviews design before export
- Highlights potential issues (text too long, too many bullets, etc.)
- Maintains template colours and fonts

**PDF Export:**
- Print-ready PDF generation
- Preserves all charts and formatting

### 2.7 AI Design Review

Quality assurance for PowerPoint exports.

**What It Checks:**
- Title and subtitle length against brand guidelines
- Number of bullet points per slide
- Colour accuracy against brand palette
- Placeholder content that needs replacing
- Overall layout alignment

**Severity Levels:**
- **High**: Must fix before distribution
- **Medium**: Should review before distribution
- **Low**: Minor improvements suggested

---

## 3. Technology Choices

### Why These Tools Were Chosen

| Tool | What It Does | Why We Chose It |
|------|--------------|-----------------|
| **Sanity CMS** | Content management | Leading headless CMS with excellent customisation; scales to enterprise |
| **Claude AI** | Intelligent assistance | Best-in-class language model for content analysis and translation |
| **Next.js** | Web viewer | Industry-standard framework for fast, SEO-friendly websites |
| **Vercel** | Hosting | Reliable cloud platform with automatic deployments |
| **Recharts** | Charts | Highly customisable charting library that works across web and exports |

### Cost Implications

| Service | Model | Approximate Cost |
|---------|-------|------------------|
| **Sanity CMS** | Team plan | ~$99/month for team features |
| **Claude AI** | Usage-based | ~$0.003-0.015 per 1,000 words processed |
| **Vercel Hosting** | Team plan | ~$20/month per team member |

**Estimated Monthly Operating Cost**: $150-300 depending on usage volume

### Scalability Potential

The architecture supports significant growth:
- **Content volume**: No practical limit on reports or sections
- **User traffic**: Auto-scales to handle increased readership
- **Team size**: Multiple editors can work simultaneously
- **Languages**: Framework supports additional languages beyond French
- **Export formats**: New export formats can be added

---

## 4. Current Status

### What's Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Interactive report viewer | Complete | Live at gmo-report.vercel.app |
| English content display | Complete | Full feature set |
| French translation | Complete | Automated via AI |
| AI chart builder | Complete | CSV, Excel, and image upload |
| Content management system | Complete | Full editing workflow |
| PowerPoint export | Complete | With AI design review |
| PDF export | Complete | Print-ready output |
| AI content suggestions | Complete | Title, subtitle, bullets, insights |
| Dark/light mode | Complete | User preference saved |
| Mobile responsive | Complete | Works on all devices |

### What's Working

- **Content creation**: Editors can create and publish reports
- **Chart generation**: AI successfully recommends appropriate chart types
- **Translation**: French versions generate accurately
- **Web viewing**: Reports display correctly across browsers
- **Exports**: PowerPoint and PDF files generate correctly
- **Design review**: AI catches common design issues

### Demo Access

| System | URL | Access |
|--------|-----|--------|
| Live Report (English) | https://gmo-report.vercel.app | Public |
| Live Report (French) | https://gmo-report.vercel.app/fr/ | Public |
| Content Management | https://gmo-prototype.sanity.studio | Team members only |

---

## 5. Success Metrics

### Time Savings

| Task | Traditional Approach | With This Platform | Savings |
|------|---------------------|-------------------|---------|
| Chart creation | 15-30 min per chart | 2-5 min per chart | 70-85% |
| French translation | 2-4 hours per report | 2-3 minutes | 95%+ |
| Design consistency check | 30-60 min per report | 5 min (automated) | 85-90% |
| Report distribution | Email attachments | Share URL | Instant |

### Cost Comparison vs Alternatives

| Approach | Estimated Cost | Limitations |
|----------|---------------|-------------|
| Manual production | £2,000-5,000/month (staff time + translation) | Slow, inconsistent |
| Off-the-shelf report builder | £500-2,000/month | Limited customisation |
| Custom enterprise solution | £50,000-200,000 build + ongoing | Long development |
| **This platform** | £150-300/month | Fully customised, AI-powered |

### Efficiency Improvements

- **Faster time to publication**: Same-day publishing vs multi-day traditional process
- **Reduced revision cycles**: AI catches issues before review
- **Improved accessibility**: Web viewer reaches more readers
- **Better engagement**: Interactive format more engaging than static PDFs
- **Consistent branding**: Enforced through templates

---

## 6. Key Stakeholder Information

### Access Levels

| Role | System Access | Capabilities |
|------|--------------|--------------|
| **Editors** | Sanity Studio | Create, edit, publish content |
| **Reviewers** | Sanity Studio | View, comment, approve content |
| **Readers** | Report Viewer | View published reports |
| **Administrators** | All systems | Full configuration access |

### Training Requirements

| Role | Training Needed | Duration |
|------|-----------------|----------|
| Content Editor | Sanity Studio basics, Chart Builder, Export workflow | 2-3 hours |
| Administrator | Above + Vercel dashboard, API configuration | 4-6 hours |
| Reader | None (intuitive web interface) | N/A |

**Training Materials Available:**
- Chart Builder User Guide (included in project)
- Sanity Studio documentation (online)

### Support Considerations

| Aspect | Current State | Recommendation |
|--------|--------------|----------------|
| Bug fixes | Pattrn Studios support | Transition to internal team or support contract |
| Feature requests | Ad-hoc | Prioritised backlog |
| System monitoring | Basic | Implement alerting (see Next Steps) |
| Backup/recovery | Sanity managed | Content automatically versioned |

### Key Contacts

| Role | Responsibility |
|------|---------------|
| Pattrn Studios | Development, initial support |
| Sanity Support | CMS platform issues |
| Vercel Support | Hosting and deployment |
| Anthropic | AI API (Claude) issues |

---

## Appendix: Screen Descriptions

### Report Viewer (Main Screen)

The report viewer presents a clean, full-width reading experience:
- **Header**: Contains title, theme toggle (sun/moon icon), and language selector (flag icons)
- **Left sidebar**: Table of contents showing all sections; highlights current section as user scrolls
- **Main content area**: Displays report sections sequentially
- **Progress bar**: Thin line at top showing scroll progress through document
- **Footer**: Publication date and source information

### Sanity Studio (Editor Interface)

The content management interface is divided into:
- **Left panel**: Document list showing all reports
- **Main area**: Form fields for editing selected document
- **Right panel**: Preview and publishing controls
- **Custom components**: Chart Builder modal, AI suggestion panels

### Chart Builder Modal

When adding a chart:
- **Step 1**: File upload area (drag-drop or click to browse)
- **Step 2**: AI processing indicator
- **Step 3**: Recommended chart with preview
- **Step 4**: Alternative thumbnails at bottom
- **Step 5**: "Use this chart" confirmation button

---

**Document prepared by**: Pattrn Studios
**Version**: 1.0
**Date**: January 28, 2026
