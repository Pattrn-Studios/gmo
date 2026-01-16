# Chart Recommendation Web App: Build Guide

## What We're Building

A simple web app where users:
1. Paste CSV data
2. Click "Analyse"
3. See chart recommendation with live preview

No Claude login required.

---

## Prerequisites

- Your existing `gmo-builder` or `gmo-v3` folder
- A Claude API key (we'll get this in Step 1)
- Node.js installed (you already have this)

---

## Step 1: Get a Claude API Key

1. Go to **console.anthropic.com**
2. Sign up or log in
3. Click **API Keys** in the sidebar
4. Click **Create Key**
5. Name it: `gmo-prototype`
6. Copy the key (starts with `sk-ant-...`)
7. Save it somewhere safe — you'll need it in Step 4

**Cost:** ~$5-10 of credit is plenty for testing. New accounts often get free credits.

---

## Step 2: Create Project Folder

Open **PowerShell** and run:

```
cd C:\Users\User
mkdir gmo-chart-agent
cd gmo-chart-agent
npm init -y
npm install express
```

Then open in VS Code:

```
code .
```

(Or open VS Code manually → File → Open Folder → `gmo-chart-agent`)

---

## Step 3: Create the Server File

1. In VS Code, right-click in sidebar → **New File**
2. Name it: `server.js`
3. Paste this code:

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Claude API endpoint
app.post('/api/analyse', async (req, res) => {
  const { csvData } = req.body;
  
  if (!csvData) {
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are a chart recommendation assistant for financial reports using Highcharts.

Analyse this CSV data and recommend the best chart configuration.

DATA:
${csvData}

Respond with ONLY valid JSON in this exact format, no other text:
{
  "chartType": "line|column|bar|area",
  "title": "Suggested chart title",
  "series": [
    {"label": "Display Name", "dataColumn": "csv_column_name", "colour": "#hexcode"}
  ],
  "xAxisLabel": "Label for X axis",
  "yAxisLabel": "Label for Y axis",
  "yAxisFormat": "number|percent|currency",
  "reasoning": "Brief explanation of why this chart type"
}

RULES:
- Time series with 1-3 numeric columns → line
- Time series with 4+ columns → line (highlight key series)
- Categories under 7 items → column (vertical bar)
- Categories 7+ items → bar (horizontal)
- Part of whole data → stacked column or area
- Use these colours in order: #00005E (Navy), #00A3A3 (Teal), #FF6B5B (Coral), #E5A93D (Gold), #7B5EA7 (Purple)
- First column is usually the x-axis (dates or categories)`
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Parse Claude's response
    const content = data.content[0].text;
    
    // Try to extract JSON from response
    let recommendation;
    try {
      recommendation = JSON.parse(content);
    } catch {
      // If JSON parsing fails, return raw content
      return res.status(500).json({ error: 'Failed to parse recommendation', raw: content });
    }

    res.json(recommendation);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

4. Save the file

---

## Step 4: Create the Frontend

1. Right-click in sidebar → **New Folder**
2. Name it: `public`
3. Right-click on `public` folder → **New File**
4. Name it: `index.html`
5. Paste this code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GMO Chart Recommender</title>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #00005E;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: #666;
      margin-bottom: 2rem;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    
    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .card h2 {
      color: #333;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
    
    textarea {
      width: 100%;
      height: 200px;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      resize: vertical;
    }
    
    textarea:focus {
      outline: none;
      border-color: #00A3A3;
    }
    
    button {
      background: #00005E;
      color: white;
      border: none;
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
      width: 100%;
    }
    
    button:hover {
      background: #000080;
    }
    
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .recommendation {
      margin-top: 1rem;
    }
    
    .rec-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }
    
    .rec-item:last-child {
      border-bottom: none;
    }
    
    .rec-label {
      color: #666;
      font-size: 0.875rem;
    }
    
    .rec-value {
      color: #333;
      font-weight: 500;
    }
    
    .series-list {
      margin-top: 0.5rem;
    }
    
    .series-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }
    
    .colour-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .reasoning {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #555;
      line-height: 1.5;
    }
    
    #chart-container {
      margin-top: 1rem;
      min-height: 300px;
    }
    
    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .error {
      background: #fee;
      color: #c00;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }
    
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>GMO Chart Recommender</h1>
    <p class="subtitle">Paste your data to get an AI-powered chart recommendation</p>
    
    <div class="grid">
      <div class="card">
        <h2>1. Paste Your Data</h2>
        <textarea id="csv-input" placeholder="date,fed,ecb,boe
Jan 2022,0.25,0.00,0.25
Apr 2022,0.50,0.00,0.75
Jul 2022,2.50,0.50,1.25
Oct 2022,3.25,1.25,2.25
Jan 2023,4.50,2.50,3.50"></textarea>
        <button id="analyse-btn" onclick="analyseData()">Analyse Data</button>
        
        <div id="error" class="error hidden"></div>
      </div>
      
      <div class="card">
        <h2>2. Recommendation</h2>
        <div id="loading" class="loading hidden">Analysing your data...</div>
        <div id="recommendation" class="recommendation hidden"></div>
        <div id="chart-container"></div>
      </div>
    </div>
  </div>

  <script>
    let currentRecommendation = null;

    async function analyseData() {
      const csvData = document.getElementById('csv-input').value.trim();
      const btn = document.getElementById('analyse-btn');
      const loading = document.getElementById('loading');
      const recommendation = document.getElementById('recommendation');
      const error = document.getElementById('error');
      const chartContainer = document.getElementById('chart-container');
      
      // Reset state
      error.classList.add('hidden');
      recommendation.classList.add('hidden');
      chartContainer.innerHTML = '';
      
      if (!csvData) {
        error.textContent = 'Please paste some data first';
        error.classList.remove('hidden');
        return;
      }
      
      // Show loading
      btn.disabled = true;
      btn.textContent = 'Analysing...';
      loading.classList.remove('hidden');
      
      try {
        const response = await fetch('/api/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData })
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        currentRecommendation = data;
        displayRecommendation(data);
        renderChart(data, csvData);
        
      } catch (err) {
        error.textContent = 'Error: ' + err.message;
        error.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Analyse Data';
        loading.classList.add('hidden');
      }
    }

    function displayRecommendation(rec) {
      const container = document.getElementById('recommendation');
      
      const seriesHtml = rec.series.map(s => `
        <div class="series-item">
          <span class="colour-dot" style="background: ${s.colour}"></span>
          <span>${s.label}</span>
          <span style="color: #999; font-size: 0.75rem;">(${s.dataColumn})</span>
        </div>
      `).join('');
      
      container.innerHTML = `
        <div class="rec-item">
          <span class="rec-label">Chart Type</span>
          <span class="rec-value">${rec.chartType.charAt(0).toUpperCase() + rec.chartType.slice(1)} Chart</span>
        </div>
        <div class="rec-item">
          <span class="rec-label">X-Axis</span>
          <span class="rec-value">${rec.xAxisLabel || 'Auto'}</span>
        </div>
        <div class="rec-item">
          <span class="rec-label">Y-Axis</span>
          <span class="rec-value">${rec.yAxisLabel || 'Auto'} (${rec.yAxisFormat || 'number'})</span>
        </div>
        <div class="rec-item" style="flex-direction: column; align-items: flex-start;">
          <span class="rec-label">Data Series</span>
          <div class="series-list">${seriesHtml}</div>
        </div>
        <div class="reasoning">
          <strong>Why this chart:</strong> ${rec.reasoning}
        </div>
      `;
      
      container.classList.remove('hidden');
    }

    function renderChart(rec, csvData) {
      // Parse CSV
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => {
          const val = values[i]?.trim();
          obj[h] = isNaN(val) ? val : parseFloat(val);
        });
        return obj;
      });
      
      // Build categories (first column)
      const xKey = headers[0];
      const categories = data.map(row => row[xKey]);
      
      // Build series
      const series = rec.series.map(s => ({
        name: s.label,
        data: data.map(row => row[s.dataColumn]),
        color: s.colour
      }));
      
      // Render chart
      Highcharts.chart('chart-container', {
        chart: {
          type: rec.chartType,
          style: { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }
        },
        title: { text: rec.title || null },
        xAxis: {
          categories: categories,
          title: { text: rec.xAxisLabel }
        },
        yAxis: {
          title: { text: rec.yAxisLabel },
          labels: {
            formatter: function() {
              if (rec.yAxisFormat === 'percent') return this.value + '%';
              if (rec.yAxisFormat === 'currency') return '$' + this.value;
              return this.value;
            }
          }
        },
        legend: {
          align: 'left',
          verticalAlign: 'top'
        },
        plotOptions: {
          series: { marker: { enabled: false } }
        },
        series: series,
        credits: { enabled: false }
      });
    }
  </script>
</body>
</html>
```

6. Save the file

---

## Step 5: Create Environment File

1. Right-click in sidebar (root folder, not public) → **New File**
2. Name it: `.env`
3. Add your API key:

```
CLAUDE_API_KEY=sk-ant-your-key-here
```

4. Save the file

---

## Step 6: Update Server to Use Environment Variable

We need to load the `.env` file. 

First, install dotenv:

**In VS Code terminal (Terminal → New Terminal):**

```
npm install dotenv
```

Then update the first line of `server.js`:

**Change:**
```javascript
const express = require('express');
```

**To:**
```javascript
require('dotenv').config();
const express = require('express');
```

Save the file.

---

## Step 7: Run the App

In the VS Code terminal:

```
node server.js
```

You should see:
```
Server running at http://localhost:3000
```

---

## Step 8: Test It

1. Open your browser
2. Go to **http://localhost:3000**
3. Paste this sample data:

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

4. Click **Analyse Data**
5. See the recommendation and live chart preview

---

## Folder Structure

```
gmo-chart-agent/
├── node_modules/
├── public/
│   └── index.html
├── .env
├── package.json
└── server.js
```

---

## Stopping and Restarting

**To stop:** Press `Ctrl + C` in the terminal

**To restart:** Run `node server.js` again

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module 'express'" | Run `npm install express` |
| "Cannot find module 'dotenv'" | Run `npm install dotenv` |
| "401 Unauthorized" | Check your API key in `.env` |
| "Port 3000 in use" | Stop other servers, or change PORT in server.js |
| No chart appears | Check browser console for errors (F12) |

---

## Next Steps (After This Works)

1. **Add "Apply to Sanity" button** — Sends recommendation to Sanity API
2. **Add slide content fields** — Title, subtitle, commentary inputs
3. **Deploy to Vercel** — Make accessible without localhost
4. **Connect to existing prototype** — Full data → chart → slide flow

---

*Ready to build. Work through each step, and let me know when you hit the test phase or if you get stuck.*
