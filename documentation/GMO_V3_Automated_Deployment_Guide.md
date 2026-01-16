# GMO v3 Prototype: Automated Deployment Guide

## What We're Building

When you click **Publish** in Sanity, the slide automatically builds and appears at a live URL — no terminal commands needed.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   V3 WORKFLOW                                                                   │
│                                                                                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐ │
│   │             │     │             │     │             │     │             │ │
│   │   SANITY    │────►│  WEBHOOK    │────►│   VERCEL    │────►│  LIVE URL   │ │
│   │   Publish   │     │  (auto)     │     │   Build     │     │             │ │
│   │             │     │             │     │   (auto)    │     │             │ │
│   └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘ │
│                                                                                 │
│   You click            Sanity tells       Vercel runs         You view at      │
│   Publish              Vercel             the build           gmo.vercel.app   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Time required: 4-6 hours**

---

## Prerequisites

- Your working v2 prototype (Sanity + build script)
- A GitHub account (free)
- A Vercel account (free) — sign up at vercel.com

---

## Part 1: Prepare the Project for Vercel

### Step 1.1: Create a New Project Folder

We'll create a fresh folder that contains everything Vercel needs.

**In PowerShell:**

```
cd C:\Users\User
mkdir gmo-v3
cd gmo-v3
```

### Step 1.2: Initialise the Project

```
npm init -y
```

### Step 1.3: Install Dependencies

```
npm install @sanity/client
```

### Step 1.4: Create Project Structure

Create these files and folders:

```
gmo-v3/
├── api/
│   └── build.js          ← Serverless function
├── public/
│   └── (empty for now)   ← Built files go here
├── package.json
└── vercel.json           ← Vercel configuration
```

---

## Part 2: Create the Serverless Function

### Step 2.1: Create the api Folder

In VS Code (with gmo-v3 open):

1. Right-click in sidebar → **New Folder**
2. Name it: `api`

### Step 2.2: Create build.js

1. Right-click on `api` folder → **New File**
2. Name it: `build.js`
3. Paste this code:

```javascript
// api/build.js
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

const themeColours = {
  teal: { accent: '#00A3A3' },
  coral: { accent: '#FF6B5B' },
  gold: { accent: '#E5A93D' },
  purple: { accent: '#7B5EA7' },
  navy: { accent: '#00005E' },
};

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      const val = values[i]?.trim();
      obj[header] = isNaN(val) ? val : parseFloat(val);
    });
    return obj;
  });
}

function portableTextToHTML(blocks) {
  if (!blocks) return '';
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      const text = block.children?.map(child => {
        let t = child.text || '';
        if (child.marks?.includes('strong')) t = `<strong>${t}</strong>`;
        if (child.marks?.includes('em')) t = `<em>${t}</em>`;
        return t;
      }).join('') || '';
      
      if (block.listItem === 'bullet') {
        return `<li>${text}</li>`;
      }
      return text;
    })
    .join('\n');
}

function buildChartConfig(slide, parsedData) {
  const xAxisKey = Object.keys(parsedData[0])[0];
  const categories = parsedData.map(row => row[xAxisKey]);
  
  const series = (slide.series || []).map(s => ({
    name: s.label,
    data: parsedData.map(row => row[s.dataColumn]),
    color: s.colour,
  }));

  const chartTypeMap = {
    line: 'line',
    column: 'column',
    bar: 'bar',
    area: 'area',
    stackedColumn: 'column',
    stackedArea: 'area',
  };

  const isStacked = slide.chartType?.includes('stacked');

  return {
    chart: {
      type: chartTypeMap[slide.chartType] || 'line',
      style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      backgroundColor: 'transparent',
    },
    title: { text: null },
    xAxis: {
      categories: categories,
      title: { text: slide.xAxisLabel || null },
      labels: { style: { color: '#6B7280' } },
      lineColor: '#E5E7EB',
    },
    yAxis: {
      title: { text: slide.yAxisLabel || null },
      labels: { style: { color: '#6B7280' } },
      gridLineColor: '#E5E7EB',
    },
    legend: {
      align: 'left',
      verticalAlign: 'top',
      itemStyle: { color: '#374151', fontWeight: 'normal' },
    },
    plotOptions: {
      series: {
        animation: { duration: 1000 },
        marker: { enabled: false },
      },
      column: { stacking: isStacked ? 'normal' : undefined },
      area: { stacking: isStacked ? 'normal' : undefined, fillOpacity: 0.3 },
    },
    series: series,
    credits: { enabled: false },
  };
}

function generateHTML(slide) {
  const theme = themeColours[slide.themeColour] || themeColours.teal;
  const parsedData = slide.chartData ? parseCSV(slide.chartData) : [];
  const chartConfig = buildChartConfig(slide, parsedData);
  const commentary = portableTextToHTML(slide.body);
  
  const isChartLeft = slide.layout === 'chartLeft';
  const isChartFull = slide.layout === 'chartFull';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${slide.title || 'GMO Slide'}</title>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
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
    .content { order: ${isChartLeft ? '2' : '1'}; }
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
    .commentary { list-style: none; padding: 0; }
    .commentary li {
      padding: 0.875rem 0;
      padding-left: 1.75rem;
      position: relative;
      font-size: 1.0625rem;
      line-height: 1.6;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .commentary li:last-child { border-bottom: none; }
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
    .source { margin-top: 2rem; font-size: 0.875rem; opacity: 0.5; }
    #chart { width: 100%; height: 400px; }
    @media (max-width: 900px) {
      .slide { grid-template-columns: 1fr; padding: 2rem; }
      .content, .chart-container { order: unset; }
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="content">
      <h1>${slide.title || ''}</h1>
      <h2>${slide.subtitle || ''}</h2>
      <ul class="commentary">${commentary}</ul>
      <p class="source">Source: ${slide.source || ''}</p>
    </div>
    <div class="chart-container">
      <div id="chart"></div>
    </div>
  </div>
  <script>
    Highcharts.chart('chart', ${JSON.stringify(chartConfig)});
    gsap.from('h1', {opacity: 0, y: 30, duration: 0.8, delay: 0.2, ease: 'power3.out'});
    gsap.from('h2', {opacity: 0, y: 20, duration: 0.6, delay: 0.4, ease: 'power3.out'});
    gsap.from('.commentary li', {opacity: 0, x: -20, duration: 0.5, stagger: 0.1, delay: 0.6, ease: 'power2.out'});
    gsap.from('.chart-container', {opacity: 0, scale: 0.95, duration: 0.8, delay: 0.3, ease: 'power3.out'});
  </script>
</body>
</html>`;
}

export default async function handler(req, res) {
  try {
    const slide = await client.fetch('*[_type == "slide"][0]');
    
    if (!slide) {
      return res.status(404).send('No slide found');
    }
    
    const html = generateHTML(slide);
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Build failed: ' + error.message);
  }
}
```

4. Save the file

---

## Part 3: Create Vercel Configuration

### Step 3.1: Create vercel.json

1. Right-click in sidebar (not in a folder) → **New File**
2. Name it: `vercel.json`
3. Paste this:

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/", "destination": "/api/build" },
    { "source": "/slide", "destination": "/api/build" }
  ]
}
```

4. Save the file

### Step 3.2: Update package.json

Open `package.json` and replace the contents with:

```json
{
  "name": "gmo-v3",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@sanity/client": "^6.0.0"
  }
}
```

Save the file.

---

## Part 4: Upload to GitHub

Vercel deploys from GitHub, so we need to put the code there.

### Step 4.1: Create a GitHub Repository

1. Go to **github.com** and log in
2. Click the **+** icon (top right) → **New repository**
3. Repository name: `gmo-v3`
4. Keep it **Public** (or Private if you prefer)
5. Do NOT tick "Add a README file"
6. Click **Create repository**

### Step 4.2: Push Your Code to GitHub

In VS Code, open the terminal and run these commands one at a time:

```
git init
```

```
git add .
```

```
git commit -m "Initial v3 prototype"
```

```
git branch -M main
```

```
git remote add origin https://github.com/YOUR_USERNAME/gmo-v3.git
```

(Replace `YOUR_USERNAME` with your actual GitHub username)

```
git push -u origin main
```

If prompted, log in to GitHub.

---

## Part 5: Deploy to Vercel

### Step 5.1: Connect Vercel to GitHub

1. Go to **vercel.com** and log in (or sign up with GitHub)
2. Click **Add New...** → **Project**
3. Find your `gmo-v3` repository and click **Import**
4. Leave all settings as default
5. Click **Deploy**

Wait 1-2 minutes for the build.

### Step 5.2: Get Your Live URL

Once deployed, Vercel will show you a URL like:

```
https://gmo-v3.vercel.app
```

Open it in your browser — you should see your slide!

---

## Part 6: Set Up Auto-Rebuild (Webhook)

Now we'll make Sanity trigger a rebuild whenever you publish.

### Step 6.1: Get Your Vercel Deploy Hook

1. In Vercel, go to your project
2. Click **Settings** (top menu)
3. Click **Git** (left sidebar)
4. Scroll to **Deploy Hooks**
5. Create a new hook:
   - Name: `Sanity Publish`
   - Branch: `main`
6. Click **Create Hook**
7. **Copy the URL** (looks like `https://api.vercel.com/v1/integrations/deploy/...`)

### Step 6.2: Add Webhook to Sanity

1. Go to **sanity.io/manage**
2. Select your project
3. Click **API** (left sidebar)
4. Scroll to **Webhooks**
5. Click **Create webhook**
6. Fill in:
   - Name: `Vercel Deploy`
   - URL: Paste the Vercel hook URL
   - Dataset: `production`
   - Trigger on: **Create**, **Update**, **Delete**
7. Click **Create**

---

## Part 7: Test the Full Flow

### The Magic Moment

1. Open **Sanity Studio** (localhost:3333 or your deployed version)
2. Edit your slide (change the title or a bullet point)
3. Click **Publish**
4. Wait 30-60 seconds
5. Refresh your Vercel URL
6. **See the changes live!**

---

## Final Result

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   YOUR V3 WORKFLOW                                              │
│                                                                  │
│   1. Paste data into Claude → get recommendation                │
│   2. Fill in Sanity fields                                      │
│   3. Click Publish                                              │
│   4. View live at: https://gmo-v3.vercel.app                   │
│                                                                  │
│   No terminal. No code. Just publish and view.                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Vercel build fails | Check the build logs in Vercel dashboard |
| Slide not updating | Check webhook fired in Sanity (API → Webhooks → Logs) |
| "No slide found" | Make sure you've published a slide in Sanity |
| Git push fails | Make sure you've created the GitHub repo first |

---

## Optional Enhancements

| Enhancement | Effort | Value |
|-------------|--------|-------|
| Deploy Sanity Studio to web (no localhost) | 30 mins | Access from anywhere |
| Add multiple slides | 2-3 hours | Full report, not just one slide |
| Custom domain | 30 mins | Professional URL |
| Password protection | 1 hour | Client-only access |

---

## Quick Reference

| What | URL |
|------|-----|
| Sanity Studio (local) | http://localhost:3333 |
| Sanity Manage | sanity.io/manage |
| Vercel Dashboard | vercel.com/dashboard |
| Live Slide | https://gmo-v3.vercel.app |

---

*Good luck! This gets you to a "publish and view" workflow with no manual build steps.*
