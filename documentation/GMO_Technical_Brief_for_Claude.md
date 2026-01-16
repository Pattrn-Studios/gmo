# GMO DIGITAL ENHANCEMENTS - TECHNICAL EXPLORATION BRIEF

## YOUR MISSION

I need you to help me architect and prototype a custom solution for transforming a monthly financial publication from static PowerPoint into an interactive, responsive, shareable web-based digital experience. This is a discovery project where we're evaluating whether a custom-built solution (leveraging AI coding assistants like Claude Code) is more effective than buying an off-the-shelf platform.

Your role is to:
1. Analyze the requirements and suggest an optimal technical architecture for a custom build
2. Identify key technical challenges and propose solutions
3. Create a working prototype demonstrating 2-3 interactive GMO slides (desktop + mobile)
4. Prove that the solution can be built and maintained efficiently using AI coding assistants
5. Recommend technology stack decisions that favor internally maintainable, AI-forward development

---

## PROJECT CONTEXT

### What Currently Exists
The Global Market Outlook (GMO) is a monthly macroeconomic publication that provides market analysis and projections to clients. Currently distributed as a PowerPoint deck with templated sections.

**Current GMO Structure - "Market Themes" Section:**
- 5 slides, each covering a specific theme
- Each slide contains:
  - Market theme title
  - Commentary (3-5 bullet points)
  - Custom illustration (sets visual theme/color palette for the slide)
  - Data chart with source attribution

**Current Limitations:**
- PowerPoint format is well-received but offers limited opportunity for:
  - Content repurposing
  - Increased visibility and engagement
  - Cross-channel shareability
  - Interactive data visualization
  - Responsive design for mobile consumption

### The Vision
Transform the GMO into an interactive, responsive, shareable web-based digital experience that:
- Enhances user engagement through interactivity
- Improves data comprehension through interactive visualizations
- Enables flexible deployment (web, embeds, AND PowerPoint export)
- Maintains efficient monthly production workflow

### Strategic Direction for Custom Build
The client's preference would be to:
- Leverage AI coding assistants to develop custom templates
- Minimize ongoing software licensing costs
- Maintain full control over the solution
- Build something that can be maintained internally
- Create reusable templates for monthly production

**However:** They're open to off-the-shelf tools (Flourish, Tableau, etc.) if there's strong rationale. Your job is to prove whether a custom build using AI assistance is viable and superior.

---

## CORE FEATURE REQUIREMENTS

### 1. RESPONSIVE, ON-BRAND INTERACTIVE WEB EXPERIENCE
**Must Have:**
- Generate responsive web experiences from raw data or static charts
- Maintain current GMO structure: commentary + illustration + chart + source
- On-brand styling consistent with AXA BNP visual identity
- Responsive design that works beautifully on mobile, tablet, and desktop

**Technical Challenges:**
- Creating flexible templating system for monthly content updates
- Ensuring brand consistency across all outputs
- Performance optimization for data-heavy interactive charts
- Responsive layout that adapts intelligently across breakpoints

### 2. FLEXIBLE DEPLOYMENT SOLUTION
**Must Have:**
- **Web embedding:** Shareable URLs that can be sent to clients
- **iFrame embeds:** Ability to embed in websites/portals
- **PowerPoint export:** Static format export with high visual fidelity

**Technical Challenges:**
- Building export mechanism that converts interactive web → static PowerPoint
- Maintaining visual fidelity in PowerPoint export
- Generating shareable URLs with proper hosting
- Making embeds work reliably across different platforms

### 3. INTERACTIVE DATA VISUALIZATION
**Must Have:**
- Transform static charts into interactive JavaScript experiences
- Hover states showing additional data
- Tooltips with contextual information
- Smooth animations and transitions
- Maintain source attribution

**Technical Challenges:**
- Creating reusable chart components that work with various data types
- Ensuring interactivity is intuitive and enhances comprehension
- Performance with complex datasets
- Balancing visual richness with load times

### 4. EFFICIENT MONTHLY PRODUCTION WORKFLOW
**Must Have:**
- Template-based system requiring minimal technical expertise
- Ability to input: commentary text, illustration images, data for charts
- Preview functionality before publishing
- Quick turnaround for monthly updates

**Technical Challenges:**
- Designing content input system that's accessible to non-technical users
- Template flexibility for different chart types and layouts
- Data format standardization
- Building preview/publish workflow

### 5. MULTI-LINGUAL SUPPORT
**Must Have:**
- Ability to import translations
- OR ability to generate translations directly within tool

**Nice to Have (Future):**
- Automatic translation generation
- Support for multiple language versions simultaneously

**Technical Challenges:**
- Handling text expansion/contraction across languages
- Managing multiple language versions
- Layout adjustments for different text lengths

---

## ADDITIONAL FEATURES (Nice to Have - Future Vision)

### Template Library Approach
- Create and manage multiple report templates (not just GMO slides)
- Maintain consistent brand identity with format flexibility
- Reusable component library

### AI-Powered Features
- Analyze data and suggest best visualization approach
- Auto-generate commentary summaries
- Smart data labeling and annotations

### Centralized Data Management
- Connect to internal or external data sources
- Automatic chart updates when data changes
- Data governance to ensure accuracy and licensing

---

## TECHNOLOGY REQUIREMENTS

### Must-Haves:
1. **Tech stack agnostic** - Compatible with standard modern web infrastructure
2. **Data source agnostic** - Works with Excel, database, API, etc.
3. **Internally maintainable** - Can be developed and maintained using AI coding assistants
4. **No heavy dependencies** - Minimize reliance on third-party platforms where possible

### Technical Stack to Consider:
- **Frontend Framework:** React, Vue, or vanilla JS? Consider bundle size and maintainability
- **Data Visualization:** D3.js, Chart.js, Recharts, or custom WebGL?
- **Styling:** Tailwind, CSS-in-JS, or traditional CSS?
- **PowerPoint Generation:** How do we export to .pptx format programmatically?
- **Hosting/Deployment:** Static site generation? Server-side rendering? CDN strategy?
- **Build Tools:** Vite, Webpack, or other?
- **State Management:** How complex does state need to be?

### Key Constraints:
- Monthly production must be fast (ideally same day turnaround)
- Non-technical users must be able to create new editions
- PowerPoint export must maintain high visual fidelity
- Interactive features must work reliably across browsers
- Mobile experience must be excellent (not an afterthought)

---

## CONTENT STRUCTURE & SPECIFICATIONS

### GMO Slide Anatomy
Each slide in the Market Themes section contains:

**1. Title**
- Market theme title (e.g., "Central Banks Pivoting to Easing")
- Should be prominent and clear

**2. Commentary**
- 3-5 bullet points
- Concise analysis or insights
- May include emphasis (bold) on key terms

**3. Custom Illustration**
- Sets the visual theme and color palette for the slide
- Creates visual interest and reinforces the theme
- Not just decoration - communicates concept

**4. Data Chart**
- Line charts, bar charts, area charts, etc.
- Interactive hover states
- Clear axis labels and legends
- Data points should be explorable

**5. Source Attribution**
- Required for compliance
- Small but visible
- Format: "Source: [data source name]"

### Layout Considerations
- Desktop: Likely side-by-side or multi-column layouts
- Mobile: Stacked, vertical scroll
- White space and breathing room important
- Professional financial services aesthetic

---

## PROTOTYPE REQUIREMENTS

### What You Need to Build
Create a working prototype demonstrating **2-3 GMO slides** (Market Themes section) that includes:

**Core Functionality:**
- Responsive layout (mobile, tablet, desktop)
- Interactive data visualizations with hover states
- Custom illustrations integrated
- Commentary formatted clearly
- Source attribution visible
- Professional, on-brand styling

**Deployment Options:**
- Hosted web version (shareable URL)
- Demonstration of iframe embed capability
- PowerPoint export sample (even if manual process for now)

**Content to Use:**
- Sample market themes (you can use realistic financial data examples)
- Mock commentary (3-5 bullets per theme)
- Sample charts (line chart, bar chart, area chart showing trends)
- Placeholder illustrations (focus on layout, can use simple graphics)

### Success Criteria for Prototype
✓ Proves that custom build is technically viable
✓ Demonstrates interactive features enhance comprehension
✓ Shows responsive design works across devices
✓ Provides clear path to PowerPoint export
✓ Template system is evident (shows how monthly updates would work)
✓ Built efficiently using AI coding assistants (document the process!)

---

## KEY TECHNICAL CHALLENGES TO SOLVE

### 1. Template System Architecture
**Challenge:** How do we build a flexible template system that:
- Allows non-technical users to create new GMO editions monthly
- Supports different chart types and data formats
- Maintains brand consistency automatically
- Enables quick preview and publish workflow

**Questions to Explore:**
- Content input format? (JSON, YAML, spreadsheet, CMS?)
- How modular should components be?
- Build-time generation vs. runtime rendering?
- Preview environment before publishing?

### 2. Interactive Data Visualization
**Challenge:** Build chart components that are:
- Interactive and intuitive
- Performant with financial data
- Reusable across different data types
- Export-friendly (for PowerPoint)

**Questions to Explore:**
- Which charting library balances interactivity and export capability?
- How to handle complex datasets efficiently?
- Animation and transition strategy?
- Accessibility for interactive elements?

### 3. PowerPoint Export Mechanism
**Challenge:** Convert interactive web experience to static PowerPoint with visual fidelity

**Questions to Explore:**
- Programmatic .pptx generation? (e.g., PptxGenJS, python-pptx)
- Screenshot-based approach?
- Manual export workflow for now, automate later?
- How to maintain layout and styling in PowerPoint format?

### 4. Responsive Design Strategy
**Challenge:** Same content, different layouts across device sizes

**Questions to Explore:**
- Mobile-first or desktop-first approach?
- Breakpoint strategy?
- How do interactive charts adapt to small screens?
- Touch interactions vs. mouse interactions?

### 5. Hosting and Deployment
**Challenge:** Where and how does this get hosted?

**Questions to Explore:**
- Static site generation vs. server-side rendering?
- CDN strategy for performance?
- How are shareable URLs generated/managed?
- Versioning for monthly editions?

### 6. Monthly Production Workflow
**Challenge:** Make it fast and easy for content team to create new editions

**Questions to Explore:**
- What's the user interface for inputting content?
- Data upload/input mechanism?
- Image asset management?
- Quality assurance checks before publish?
- How long should monthly update take?

---

## WHAT   - Interactive data visualizations
   - Multiple chart types
   - Mobile/tablet/desktop views
2. **Document the build process:**
   - How AI coding assistant was used
   - Time estimates for development
   - Challenges encountered
   - Code maintainability assessment
3. **Create deployment examples:**
   - Live hosted version with shareable URL
   - Iframe embed demonstration
   - PowerPoint export sample (or clear path to it)

### Phase 3: Production Workflow Design
1. **Design content input system:**
   - How would content team input monthly data?
   - Template structure and data format
   - Asset management approach
2. **Document monthly production process:**
   - Step-by-step workflow
   - Time estimates per step
   - Required technical skills (should be minimal)
3. **Identify automation opportunities:**
   - What can be automated?
   - Where does AI assistance help most?
   - Bottlenecks and solutions

---

## COMPARISON CONTEXT: BUILD VS. BUY

To help you understand the decision we're making, here are the alternative approaches:

### Off-the-Shelf Platforms (Buy)
**Examples:** Flourish, Tableau, Microsoft Power BI, Datawrapper

**Pros:**
- Faster initial setup
- Proven technology
- Built-in features and templates
- Regular updates and support

**Cons:**
- Ongoing licensing costs
- Limited customization
- Dependency on third-party
- May not perfectly fit workflow
- Less control over roadmap

### Your Mission (Custom Build)
Prove that a custom build leveraging AI coding assistants:
- Can be developed efficiently (time competitive with platform setup)
- Provides better fit for specific workflow
- Offers more flexibility and control
- Has manageable ongoing maintenance
- Minimizes licensing costs
- Can be maintained internally with AI assistance

**Success means:** Demonstrating that custom build is viable, cost-effective, and superior for this specific use case.

---

## SAMPLE DATA FOR PROTOTYPE

Here's sample content you can use for your prototype:

### Slide 1: "Central Banks Pivoting to Easing"
**Commentary:**
- Major central banks have begun cutting interest rates after prolonged tightening cycle
- Fed signals data-dependent approach with potential for further cuts in 2025
- ECB and BOE following similar trajectory amid cooling inflation
- Rate cuts expected to support economic growth and market sentiment

**Chart:** Line chart showing central bank policy rates over time (Fed, ECB, BOE) from 2022-2025
**Illustration theme:** Arrows pointing downward, cool blue tones
**Source:** Central Bank websites, Bloomberg

### Slide 2: "Emerging Markets Gaining Momentum"
**Commentary:**
- EM equities outperforming developed markets in Q4
- Strong fundamentals supported by commodity price stability
- Asian markets particularly resilient amid global uncertainty
- Currency stabilization creating favorable conditions

**Chart:** Bar chart comparing YTD returns across regions (US, Europe, Asia EM, LATAM)
**Illustration theme:** Upward trajectory, green growth motif
**Source:** MSCI, Bloomberg

### Slide 3: "Technology Sector Consolidation"
**Commentary:**
- AI-driven tech stocks showing volatility amid regulation concerns
- Traditional tech showing stability and strong cash flows
- Sector rotation favoring profitable growth over speculation
- Cloud infrastructure spending remains robust

**Chart:** Area chart showing tech sector performance vs. broader market
**Illustration theme:** Network nodes, purple/tech colors
**Source:** S&P, FactSet

Feel free to adjust these or create your own sample content that demonstrates the functionality well.

---

## DELIVERABLES SUMMARY

### What I Expect from You:

**1. Technical Architecture Document**
- Recommended technology stack with rationale
- System architecture diagram
- Data flow and component structure
- PowerPoint export strategy
- Deployment approach
- Risk assessment

**2. Working Prototype**
- 2-3 interactive GMO slides
- Responsive (mobile/tablet/desktop)
- Hosted with shareable URL
- Iframe embed demo
- PowerPoint export sample or clear path
- Source code with documentation

**3. Development Assessment**
- Time taken to build prototype
- AI coding assistant usage and effectiveness
- Maintainability evaluation
- Complexity assessment
- Ongoing maintenance considerations

**4. Production Workflow Proposal**
- Content input system design
- Monthly update process documentation
- Time estimates for monthly production
- Automation opportunities
- Training requirements

### Timeline Expectations:
This is discovery work - focus on proving viability rather than perfection. A functional prototype that demonstrates core concepts is more valuable than a polished product.

---

## ADDITIONAL CONTEXT

### Why This Matters
The GMO is a flagship publication sent to high-value clients. The experience needs to be:
- **Professional:** Reflects well on AXA BNP's brand
- **Trustworthy:** Financial data must be accurate and clearly sourced
- **Engaging:** More compelling than static PowerPoint
- **Accessible:** Works for all clients regardless of device

### Current Pain Points
- **Static format** limits engagement with data
- **No mobile optimization** - clients read on phones but PowerPoint doesn't adapt
- **Limited shareability** - hard to share specific insights vs. entire deck
- **Production overhead** - updating PowerPoint is manual and time-consuming
- **No analytics** - don't know how clients engage with content

### Success Criteria
A successful custom build would:
- **Enhance engagement:** Interactive features make data exploration intuitive
- **Improve accessibility:** Responsive design works beautifully on any device
- **Streamline production:** Monthly updates faster and easier than current process
- **Maintain brand quality:** Professional appearance consistent with AXA BNP standards
- **Enable insights:** Analytics on how clients consume content
- **Future-proof:** Flexible foundation for additional features

---

## QUESTIONS YOU MIGHT HAVE

**Q: How much design polish is expected in the prototype?**
A: Focus on functionality and proving technical approach. Clean, professional appearance is good, but pixel-perfect design is not required. Show that the concept works.

**Q: Should I use real financial data?**
A: Use realistic sample data that demonstrates the use case. Accuracy of actual market data is not critical - showing how the system handles data is.

**Q: How important is the PowerPoint export?**
A: Very important strategically (clients want PowerPoint), but for prototype, showing a clear path forward is acceptable if full automation isn't feasible yet.

**Q: What if I discover the custom build isn't viable?**
A: Honest assessment is valuable! If you hit blockers that make custom build impractical, document why and what alternatives would work better.

**Q: How involved should I be in design decisions?**
A: You're building a prototype to prove technical feasibility. Make reasonable design decisions that serve the use case, but note where design refinement would be needed.

**Q: Should this work offline?**
A: No, assume online/hosted experience. Offline capability not required.

---

## GETTING STARTED

### Recommended Approach:

1. **Start with architecture** - Review requirements, propose tech stack, get feedback on direction

2. **Build one slide first** - Prove core functionality with single interactive slide before expanding

3. **Iterate on interactivity** - Get the data visualization right, then add responsive behavior

4. **Expand to 2-3 slides** - Show template reusability and variety

5. **Add deployment options** - Hosting, embeds, export strategy

6. **Document workflow** - How would monthly production actually work?

### Key Success Factors:
- **Prove it's doable** with AI coding assistance
- **Show it's maintainable** by internal team
- **Demonstrate it's flexible** for monthly production
- **Validate it's superior** to off-the-shelf options for this use case

---

## FINAL NOTES

This is discovery work where we're evaluating "build vs. buy." Your prototype and analysis will directly inform a strategic decision about how to proceed. Be thorough, be honest about trade-offs, and focus on proving (or disproving) that a custom build is the right path forward.

The client values:
- **Efficiency in development** (AI coding assistants should help here)
- **Control over the solution** (custom build advantage)
- **Cost-effectiveness long-term** (minimize licensing costs)
- **Quality of output** (must match or exceed PowerPoint quality)

Your work will help determine whether custom build with AI assistance can deliver on all these dimensions.

Good luck! I'm excited to see what you come up with. I