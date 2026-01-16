require('dotenv').config();
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

    const content = data.content[0].text;
    
    let recommendation;
    try {
      recommendation = JSON.parse(content);
    } catch {
      return res.status(500).json({ error: 'Failed to parse recommendation', raw: content });
    }

    res.json(recommendation);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});