require('dotenv').config();
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

const app = express();

// GMO Brand Colors (from design tokens)
const GMO_COLORS = {
  primary: '#3E7274',      // Green
  accent1: '#3D748F',      // Coast (Blue)
  accent2: '#AC5359',      // Metallic Copper
  accent3: '#F1875A',      // Orange
  accent4: '#76BCA3',      // Light Green
  accent5: '#132728',      // Dark Blue
};

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

app.use(express.json());

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
    const prompt = `You are a chart recommendation assistant for AXA Investment Managers' Global Market Outlook reports using Highcharts.

Analyse this CSV data and recommend the best chart configuration.

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
  "reasoning": "Brief explanation of why this chart type"
}

RULES:
- Time series with 1-3 numeric columns → "line"
- Time series with 4+ columns → "line" (highlight key series)
- Categories under 7 items → "column" (vertical bar)
- Categories 7+ items → "bar" (horizontal)
- Part of whole data → stacked column or area
- chartType must be one of: "line", "column", "bar", "area"
- yAxisFormat must be one of: "number", "percent", "currency"
- First column is usually the x-axis (dates or categories)

BRAND COLOR PALETTE (GMO / AXA IM):
Use these colors IN ORDER for data series:
1. #3E7274 (Primary Green - GMO brand color)
2. #3D748F (Coast Blue)
3. #AC5359 (Metallic Copper)
4. #F1875A (Orange)
5. #76BCA3 (Light Green)
6. #132728 (Dark Blue)

IMPORTANT:
- Assign colors in the order listed above
- First series gets #3E7274 (green)
- Second series gets #3D748F (blue)
- Third series gets #AC5359 (copper), etc.
- These are the ONLY approved brand colors

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

BRAND COLOR PALETTE (GMO / AXA IM):
When adjusting colors, only use these approved brand colors:
1. #3E7274 (Primary Green)
2. #3D748F (Coast Blue)
3. #AC5359 (Metallic Copper)
4. #F1875A (Orange)
5. #76BCA3 (Light Green)
6. #132728 (Dark Blue)

Common refinement requests and how to handle them:
- "Show every year/month/quarter" → Ensure all x-axis categories are included, don't skip any
- "Change to [chart type]" → Update chartType field to "line", "column", "bar", or "area"
- "Use [color] for [series]" → Update the colour field (must use brand colors above)
- "Remove [series]" → Remove that series from the series array
- "Add title" → Update the title field
- "Change y-axis to percentage" → Update yAxisFormat to "percent"
- "Make it thicker/bolder" → Add note in reasoning (Highcharts styling not in JSON)

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
- chartType must be one of: "line", "column", "bar", "area"
- yAxisFormat must be one of: "number", "percent", "currency"
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

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}