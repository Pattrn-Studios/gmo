require('dotenv').config();
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const cors = require('cors');
const { chartColors, getColorPromptInstructions } = require('./lib/design-tokens.cjs');

const app = express();

// Configure CORS to allow Sanity Studio access
app.use(cors({
  origin: [
    'http://localhost:3333', // Sanity Studio dev
    'https://gmo-prototype.sanity.studio', // Sanity Studio production
    /\.sanity\.studio$/ // Allow all Sanity Studio domains
  ],
  credentials: true
}));

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.match(/\.(csv|xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload CSV or Excel files only.'));
    }
  }
});

app.use(express.json({ limit: '15mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to convert Excel/CSV file to CSV string
function fileToCSV(buffer, filename) {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csv = xlsx.utils.sheet_to_csv(worksheet);
    return csv;
  } catch (error) {
    throw new Error(`Failed to parse file: ${error.message}`);
  }
}

// Helper function to extract JSON from Claude's response
function extractJSON(text) {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Try to find JSON object in the text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Helper function to call Claude API
async function callClaudeAPI(prompt) {
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
        content: prompt
      }]
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  const content = data.content[0].text;
  
  // Log the raw response for debugging
  console.log('Claude raw response:', content);
  
  try {
    // Extract and clean JSON from response
    const cleanedJSON = extractJSON(content);
    console.log('Cleaned JSON:', cleanedJSON);
    return JSON.parse(cleanedJSON);
  } catch (parseError) {
    console.error('Failed to parse JSON:', parseError);
    console.error('Raw content was:', content);
    throw new Error('Failed to parse Claude response as JSON. Raw response: ' + content.substring(0, 200));
  }
}

// Helper function to call Claude Vision API (for image analysis)
async function callClaudeVisionAPI(base64Image, mediaType, prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const content = data.content[0].text;

  // Log the raw response for debugging
  console.log('Claude Vision raw response:', content);

  try {
    const cleanedJSON = extractJSON(content);
    console.log('Cleaned JSON:', cleanedJSON);
    return JSON.parse(cleanedJSON);
  } catch (parseError) {
    console.error('Failed to parse Vision JSON:', parseError);
    console.error('Raw content was:', content);
    throw new Error('Failed to parse Claude Vision response as JSON. Raw response: ' + content.substring(0, 200));
  }
}

// Endpoint for file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvData = fileToCSV(req.file.buffer, req.file.originalname);
    
    if (!csvData || csvData.trim().length === 0) {
      return res.status(400).json({ error: 'File appears to be empty' });
    }

    res.json({ csvData: csvData });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initial analysis endpoint
app.post('/api/analyse', async (req, res) => {
  const { csvData } = req.body;

  if (!csvData) {
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    const prompt = `You are a chart recommendation assistant for AXA Investment Managers' Global Market Outlook reports.

Analyse this CSV data and recommend the BEST chart configuration, plus 2-3 viable alternative chart types.

DATA:
${csvData}

CRITICAL: Respond with ONLY valid JSON in this exact format, no other text, no markdown, no explanation:
{
  "chartType": "line",
  "title": "Suggested chart title",
  "series": [
    {"label": "Display Name", "dataColumn": "csv_column_name", "colour": "#hexcode"}
  ],
  "xAxisLabel": "Label for X axis",
  "yAxisLabel": "Label for Y axis",
  "yAxisFormat": "number",
  "reasoning": "Brief explanation of why this chart type",
  "alternatives": [
    {
      "chartType": "column",
      "series": [{"label": "Display Name", "dataColumn": "csv_column_name", "colour": "#hexcode"}],
      "xAxisLabel": "Label for X axis",
      "yAxisLabel": "Label for Y axis",
      "yAxisFormat": "number",
      "reasoning": "Why this alternative works"
    }
  ]
}

CHART TYPE SELECTION RULES:

Basic Charts:
- Time series with 1-3 numeric columns → "line"
- Time series with 4+ columns → "line" (highlight key series)
- Categories under 7 items → "column" (vertical bar)
- Categories 7+ items → "bar" (horizontal bar)
- Time series emphasizing magnitude → "area"
- Part of whole over time → "stackedArea"
- Part of whole by category → "stackedColumn"

Proportional Charts:
- Single series showing proportions/percentages → "pie"
- Same as pie but with emphasis on total → "donut"

Analytical Charts:
- Correlation between two numeric variables → "scatter"
- Multi-dimensional comparison (3+ axes) → "radar"
- Mixed visualization (bars + lines) → "composed"
- Sequential changes with running total → "waterfall"

Specialized Charts:
- Single KPI value with target/threshold → "gauge" (include gaugeMax field)
- Hierarchical or nested category data → "treemap"
- Matrix data (row × column with values) → "heatmap"

chartType must be one of: "line", "column", "bar", "area", "stackedColumn", "stackedArea", "pie", "donut", "scatter", "radar", "composed", "waterfall", "gauge", "treemap", "heatmap"

yAxisFormat must be one of: "number", "percent", "currency"

RULES FOR ALTERNATIVES (provide exactly 3 unique alternatives):
- CRITICAL: Each alternative MUST have a DIFFERENT chartType - NO DUPLICATES allowed
- CRITICAL: Do NOT repeat the main recommendation's chartType in alternatives
- For time series: if main is "line", alternatives should be "area", "column", "stackedArea" (all different)
- For categories: if main is "column", alternatives should be "bar", "pie", "donut" (all different)
- For proportions: if main is "pie", alternatives should be "donut", "column", "bar" (all different)
- For part-to-whole: suggest "stackedColumn", "stackedArea", "treemap" as alternatives
- Each alternative should have the SAME series, xAxisLabel, and yAxisLabel as the main recommendation
- Only change the chartType and update the reasoning to explain why this alternative could work
- If few viable alternatives exist, provide fewer alternatives but NEVER duplicate chart types

${getColorPromptInstructions()}
- Use the SAME colors for each series across main and alternatives

DO NOT include any text before or after the JSON. DO NOT wrap in markdown code blocks.`;

    const recommendation = await callClaudeAPI(prompt);
    res.json(recommendation);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refinement endpoint
app.post('/api/refine', async (req, res) => {
  const { csvData, currentRecommendation, refinementRequest } = req.body;

  if (!csvData || !currentRecommendation || !refinementRequest) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  try {
    const prompt = `You are a chart recommendation assistant for AXA Investment Managers' Global Market Outlook reports. A user has asked you to refine a chart recommendation.

ORIGINAL DATA:
${csvData}

CURRENT CHART CONFIGURATION:
${JSON.stringify(currentRecommendation, null, 2)}

USER'S REFINEMENT REQUEST:
"${refinementRequest}"

Please update the chart configuration to apply the user's request while keeping everything else the same.

${getColorPromptInstructions()}

Common refinement requests and how to handle them:
- "Show every year/month/quarter" → Ensure all x-axis categories are included, don't skip any
- "Change to [chart type]" → Update chartType field
- "Use [color] for [series]" → Update the colour field (must use brand colors above)
- "Remove [series]" → Remove that series from the series array
- "Add title" → Update the title field
- "Change y-axis to percentage" → Update yAxisFormat to "percent"
- "Make it a pie chart" → Change chartType to "pie" or "donut"
- "Show as radar" → Change chartType to "radar"
- "Add a gauge" → Change chartType to "gauge" and add gaugeMax field

CRITICAL: Respond with ONLY valid JSON in this exact format, no other text, no markdown, no explanation:
{
  "chartType": "line",
  "title": "Chart title",
  "series": [
    {"label": "Display Name", "dataColumn": "csv_column_name", "colour": "#hexcode"}
  ],
  "xAxisLabel": "Label for X axis",
  "yAxisLabel": "Label for Y axis",
  "yAxisFormat": "number",
  "reasoning": "Brief explanation of the change you made"
}

IMPORTANT:
- Keep all the same data columns and structure. Only change what the user specifically requested.
- chartType must be one of: "line", "column", "bar", "area", "stackedColumn", "stackedArea", "pie", "donut", "scatter", "radar", "composed", "waterfall", "gauge", "treemap", "heatmap"
- yAxisFormat must be one of: "number", "percent", "currency"
- For gauge charts, include "gaugeMax": number field
- Colors must be from the brand palette above
- DO NOT include any text before or after the JSON
- DO NOT wrap in markdown code blocks`;

    const refinedRecommendation = await callClaudeAPI(prompt);
    res.json(refinedRecommendation);

  } catch (error) {
    console.error('Refinement error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image analysis endpoint - analyse a chart image and extract data
app.post('/api/analyse-image', async (req, res) => {
  const { imageData, mediaType } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  const allowedMediaTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!mediaType || !allowedMediaTypes.includes(mediaType)) {
    return res.status(400).json({ error: `Invalid media type: ${mediaType}. Allowed: ${allowedMediaTypes.join(', ')}` });
  }

  try {
    const prompt = `You are a chart data extraction assistant for AXA Investment Managers' Global Market Outlook reports.

TASK: Analyze this image and extract chart data. Follow these steps:

STEP 1 - VALIDATION:
Determine if this image contains a chart or graph. If it does NOT contain a chart (e.g., it's a photo, diagram, text, or other non-chart image), respond with ONLY this JSON:
{"error": "NOT_A_CHART", "message": "The uploaded image does not appear to contain a chart or graph. Please upload an image of a chart."}

STEP 2 - CHART TYPE IDENTIFICATION:
Identify the chart type. Must be one of: "line", "column", "bar", "area", "stackedColumn", "stackedArea", "pie", "donut", "scatter", "radar", "composed", "waterfall", "gauge", "treemap", "heatmap"

STEP 3 - DATA EXTRACTION:
Extract ALL data points from the chart as accurately as possible:
- Read axis labels, tick marks, and values carefully
- For line/bar/area charts: extract each data point for each series
- For pie/donut charts: extract each slice label and its value/percentage
- For gauge charts: extract the current value and maximum value
- If exact values are unclear, estimate based on grid lines and axis scales
- Preserve the original axis labels exactly as shown

STEP 4 - CONSTRUCT CSV DATA:
Convert the extracted data into CSV format:
- First row = column headers
- First column = x-axis categories/labels
- Remaining columns = data series (one per series)
- Use the exact labels visible in the chart's legend or axis

CRITICAL: Respond with ONLY valid JSON in this exact format, no other text:
{
  "chartType": "line",
  "series": [
    {"label": "Display Name", "dataColumn": "csv_column_name", "colour": "#hexcode"}
  ],
  "xAxisLabel": "Label for X axis",
  "yAxisLabel": "Label for Y axis",
  "yAxisFormat": "number",
  "reasoning": "Extracted from uploaded chart image. [describe what you see]",
  "csvData": "header1,header2,header3\\nval1,val2,val3\\n...",
  "alternatives": [
    {
      "chartType": "column",
      "series": [{"label": "Display Name", "dataColumn": "csv_column_name", "colour": "#hexcode"}],
      "xAxisLabel": "Label for X axis",
      "yAxisLabel": "Label for Y axis",
      "yAxisFormat": "number",
      "reasoning": "Why this alternative works"
    }
  ]
}

RULES FOR DATA EXTRACTION:
- Numbers must be actual numeric values, not strings
- Percentages should be stored as numbers (e.g., 45.2 not "45.2%") with yAxisFormat set to "percent"
- Currency values should be stored as numbers with yAxisFormat set to "currency"
- If the chart has a legend, use those exact names for series labels
- If no legend, create descriptive labels from context
- The csvData field must be a valid CSV string with \\n for newlines
- The dataColumn in each series must exactly match a CSV column header

RULES FOR ALTERNATIVES (provide 2-3 unique alternatives):
- Each alternative MUST have a DIFFERENT chartType - NO DUPLICATES
- Do NOT repeat the main recommendation's chartType in alternatives
- Each alternative uses the SAME series, xAxisLabel, and yAxisLabel
- Only change chartType and reasoning

${getColorPromptInstructions()}
- Use the SAME colors for each series across main and alternatives

DO NOT include any text before or after the JSON. DO NOT wrap in markdown code blocks.`;

    const result = await callClaudeVisionAPI(imageData, mediaType, prompt);

    // Check if Claude determined it's not a chart
    if (result.error === 'NOT_A_CHART') {
      return res.status(400).json({
        error: result.message || 'The uploaded image does not contain a chart.'
      });
    }

    // Validate the response has required fields
    if (!result.chartType || !result.series || !result.csvData) {
      return res.status(500).json({
        error: 'Failed to extract complete chart data from the image. Please try a clearer image.'
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Content suggestion endpoint - analyse chart and suggest content for section fields
app.post('/api/content-suggest', async (req, res) => {
  const { sectionType, sectionData, reportContext } = req.body;

  if (!sectionType || !sectionData) {
    return res.status(400).json({ error: 'Missing sectionType or sectionData' });
  }

  const chartConfig = sectionData.chartConfig;
  if (!chartConfig?.chartData) {
    return res.status(400).json({ error: 'No chart data found in section. Please add a chart first.' });
  }

  try {
    const existingTitle = sectionData.title || '';
    const existingSubtitle = sectionData.subtitle || '';
    const existingInsights = sectionData.insights || [];

    const prompt = `You are a content writer for AXA Investment Managers' Global Market Outlook reports.

Generate professional content suggestions for a ${sectionType} based on the chart data provided.

${reportContext?.reportTitle ? `REPORT CONTEXT: "${reportContext.reportTitle}"` : ''}

CHART DATA (CSV format):
${chartConfig.chartData}

CHART CONFIGURATION:
- Type: ${chartConfig.chartType || 'not specified'}
- X-Axis: ${chartConfig.xAxisLabel || 'not specified'}
- Y-Axis: ${chartConfig.yAxisLabel || 'not specified'}
- Format: ${chartConfig.yAxisFormat || 'number'}

EXISTING CONTENT (may be partial or empty):
- Title: "${existingTitle}"
- Subtitle: "${existingSubtitle}"
${sectionType === 'chartInsightsSection' ? `- Insights: ${JSON.stringify(existingInsights)}` : ''}

YOUR TASK:
Generate compelling, professional content that:
1. Accurately reflects the data in the chart
2. Uses financial/investment industry language appropriate for AXA IM
3. Highlights key trends, insights, or takeaways from the data
4. Is concise and scannable

REQUIREMENTS:
- Title: Max 80 characters, compelling headline that references specific data insights
- Subtitle: Max 200 characters, provides supporting context
- Content: 3-5 bullet points as an array of strings, each highlighting a key insight from the chart data
${sectionType === 'chartInsightsSection' ? '- Insights: 3-4 short, punchy takeaways (max 50 words each) for the insights panel' : ''}

CRITICAL: Respond with ONLY valid JSON in this exact format, no other text:
{
  "title": {
    "suggested": "Your suggested title here",
    "reasoning": "Why this title works"
  },
  "subtitle": {
    "suggested": "Your suggested subtitle here",
    "reasoning": "Why this subtitle works"
  },
  "content": {
    "suggested": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
    "reasoning": "Key insights extracted from the data"
  }${sectionType === 'chartInsightsSection' ? `,
  "insights": {
    "suggested": ["Insight 1", "Insight 2", "Insight 3"],
    "reasoning": "Concise takeaways for the insights panel"
  }` : ''}
}

DO NOT include any text before or after the JSON. DO NOT wrap in markdown code blocks.`;

    const startTime = Date.now();
    const suggestions = await callClaudeAPI(prompt);
    const responseTimeMs = Date.now() - startTime;

    res.json({
      success: true,
      suggestions,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        responseTimeMs,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Content suggestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}