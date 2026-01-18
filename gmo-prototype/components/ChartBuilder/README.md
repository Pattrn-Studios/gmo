# Chart Builder Component

**Version:** 2.0.0
**Status:** Production
**Last Updated:** January 18, 2026

AI-powered chart recommendation component for Sanity Studio, integrated with the Chart Agent API.

---

## Overview

The Chart Builder is a custom Sanity input component that enables users to:
- Upload Excel or CSV files directly in Sanity Studio
- Receive AI-powered chart type recommendations from Claude Sonnet 4.5
- Preview charts with Highcharts before saving
- Select from 2-3 alternative chart visualizations
- Save chart configurations to Sanity documents

**Workflow Time:** Reduces chart creation from ~7 minutes to ~3-4 minutes.

---

## Architecture

### Component Structure

```
ChartBuilder/
├── index.tsx                      # Main export
├── ChartBuilderInput.tsx          # Entry point (Sanity custom input)
├── ChartBuilderModal.tsx          # Modal orchestrator
├── ChartPreview.tsx               # Highcharts main preview
├── AlternativesThumbnails.tsx     # Alternative chart grid
├── FileUploadArea.tsx             # Drag-drop upload
├── types.ts                       # TypeScript interfaces
├── utils.ts                       # File parsing & API calls
└── styles.ts                      # Styled components
```

### Data Flow

```
User uploads file
    ↓
FileUploadArea (drag-drop)
    ↓
utils.parseFile() → CSV string
    ↓
utils.analyzeChartData() → Chart Agent API
    ↓
Claude analyzes → Returns main + alternatives
    ↓
ChartPreview (Highcharts) + AlternativesThumbnails
    ↓
User selects/saves
    ↓
Saved to Sanity as chartConfig object
```

---

## Key Files

### `ChartBuilderInput.tsx`
**Purpose:** Main entry point for Sanity custom input component

**Critical Requirements:**
- **MUST** use `ObjectInputProps` from 'sanity' package
- **MUST** use `@sanity/ui` components (Stack, Card, Button, Text, Flex)
- **MUST** call `renderDefault(props)` for form integration
- Uses `onChange(set(...))` to save data
- Uses `onChange(unset())` to clear data

**Key Code:**
```typescript
export function ChartBuilderInput(props: ObjectInputProps) {
  const { value, onChange, renderDefault } = props;

  const handleSave = (config: ChartBuilderValue) => {
    onChange(set(config)); // Save to Sanity
  };

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} shadow={1} border>
        {/* Custom UI */}
      </Card>
      <div style={{ display: 'none' }}>
        {renderDefault(props)} {/* Hidden default fields */}
      </div>
    </Stack>
  );
}
```

### `utils.ts`
**Purpose:** File parsing, API integration, chart configuration

**Key Functions:**
- `parseFile(file)` - Converts Excel/CSV to CSV string (client-side)
- `analyzeChartData(csvData)` - Calls Chart Agent API
- `parseCSV(csv)` - Parses CSV into data rows
- `mapChartType(type)` - Maps Sanity chart types to Highcharts
- `getYAxisFormatter(format)` - Returns formatter function

**API Configuration:**
```typescript
const API_BASE_URL = process.env.SANITY_STUDIO_CHART_AGENT_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://gmo-chart-agent.vercel.app');
```

**Auto-switching:**
- `localhost` → `http://localhost:3000` (development)
- Production → `https://gmo-chart-agent.vercel.app`

### `types.ts`
**Purpose:** TypeScript interfaces

**Key Types:**
- `ChartRecommendation` - Response from Chart Agent API
- `ChartSeries` - Individual data series configuration
- `ChartBuilderValue` - Saved data format for Sanity

### `styles.ts`
**Purpose:** Styled components for UI

**Key Components:**
- `ModalOverlay` - Full-screen modal backdrop (z-index: 999999)
- `ModalContent` - Modal container (max-width: 1000px)
- `Button` - Styled buttons with variant support
- `UploadContainer` - Drag-drop upload area
- `LoadingSpinner` - Animated loading indicator

**Important:** All styled components use `shouldForwardProp` to prevent React warnings.

---

## Integration with Sanity

### Schema Definition

**File:** `schemaTypes/contentSection.ts`

```typescript
import { ChartBuilderInput } from '../components/ChartBuilder/ChartBuilderInput';

defineField({
  name: 'chartConfig',
  title: 'Chart Configuration',
  type: 'object',
  hidden: ({parent}: any) => !parent?.hasChart,
  components: {
    input: ChartBuilderInput // Custom component
  },
  fields: [
    { name: 'chartType', type: 'string' },
    { name: 'chartData', type: 'text' },
    { name: 'chartSeries', type: 'array', of: [...] },
    { name: 'xAxisLabel', type: 'string' },
    { name: 'yAxisLabel', type: 'string' },
    { name: 'yAxisFormat', type: 'string' },
  ]
})
```

**Important:** Fields are NOT `hidden: true` - Sanity requires visible fields for custom components to render.

### Saved Data Format

```json
{
  "chartConfig": {
    "chartType": "line",
    "chartData": "Year,US,Euro area,China,Japan\n2.9,2.8,2.0,...",
    "chartSeries": [
      { "label": "US", "dataColumn": "US", "colour": "#3E7274" },
      { "label": "Euro area", "dataColumn": "Euro area", "colour": "#3D748F" }
    ],
    "xAxisLabel": "Year",
    "yAxisLabel": "Inflation (%)",
    "yAxisFormat": "percent"
  }
}
```

---

## Chart Agent API

### Endpoint
`POST https://gmo-chart-agent.vercel.app/api/analyse`

### Request Format
```json
{
  "csvData": "Month,Sales\nJan,100\nFeb,150\nMar,200"
}
```

### Response Format
```json
{
  "chartType": "line",
  "series": [
    { "label": "Sales", "dataColumn": "Sales", "colour": "#3E7274" }
  ],
  "xAxisLabel": "Month",
  "yAxisLabel": "Sales",
  "yAxisFormat": "number",
  "reasoning": "Time series data best shown with line chart",
  "alternatives": [
    {
      "chartType": "column",
      "series": [...],
      "xAxisLabel": "Month",
      "yAxisLabel": "Sales",
      "yAxisFormat": "number",
      "reasoning": "Emphasizes individual month comparisons"
    },
    {
      "chartType": "area",
      "series": [...],
      "reasoning": "Shows magnitude alongside trend"
    }
  ]
}
```

### CORS Configuration
- `http://localhost:3333` (Sanity Studio dev)
- `https://gmo-prototype.sanity.studio` (Sanity Studio prod)
- `/*.sanity.studio$/` (all Sanity Studio domains)

---

## Dependencies

### npm Packages
- `xlsx` (^0.18.5) - Excel file parsing (.xlsx, .xls)
- `papaparse` (^5.5.3) - CSV parsing and validation
- `highcharts` (^12.5.0) - Chart rendering library
- `highcharts-react-official` (^3.2.3) - React wrapper
- `react-dropzone` (^14.3.8) - File upload UI
- `@types/papaparse` (^5.5.2) - TypeScript definitions
- `@sanity/ui` - Sanity's UI component library (peer dependency)

### External APIs
- Chart Agent API (Vercel) - Claude Sonnet 4.5 powered analysis

---

## Usage

### In Sanity Studio

1. Navigate to a Content Section document
2. Toggle "Include Chart" to ON
3. Click "Add Chart" button
4. Upload Excel (.xlsx, .xls) or CSV (.csv) file (max 10MB)
5. Wait for AI analysis (~2-8 seconds)
6. Review main chart recommendation
7. Click alternative thumbnails to compare (optional)
8. Click "Save Chart" to persist
9. Configure Chart Source and Layout separately

### File Format Requirements

**CSV Format:**
```
Year,US,Euro area,China
2024,2.8,2.4,2.0
2025,2.9,2.5,2.1
```

**Rules:**
- First row = column headers
- First column = x-axis categories (dates, labels, etc.)
- Remaining columns = data series (numeric values)
- Column names are case-sensitive

**Excel Format:**
- Uses first sheet only
- Same rules as CSV
- Supports .xlsx and .xls formats

---

## Color Palette

GMO Brand Colors (applied in order to data series):

1. `#3E7274` - Primary Green (GMO brand color)
2. `#3D748F` - Coast Blue
3. `#AC5359` - Metallic Copper
4. `#F1875A` - Orange
5. `#76BCA3` - Light Green
6. `#132728` - Dark Blue

**Note:** Colors are automatically assigned by Chart Agent API based on series order.

---

## Supported Chart Types

- `line` - Line chart (time series)
- `column` - Vertical bar chart (categories)
- `bar` - Horizontal bar chart (long category names)
- `area` - Area chart (magnitude visualization)
- `stackedColumn` - Stacked vertical bars (part-to-whole)
- `stackedArea` - Stacked area (cumulative trends)

---

## Error Handling

### Common Errors

**File Upload Errors:**
- "Invalid file type" → Only .xlsx, .xls, .csv allowed
- "File size exceeds 10MB" → Reduce file size or split data
- "File appears to be empty" → Check file has data
- "Unable to parse file" → Check CSV format or Excel corruption

**API Errors:**
- "API error: Internal Server Error" → Chart Agent API issue
- "Failed to fetch" → Network error or CORS issue
- "No data provided" → CSV parsing failed

**Chart Rendering Errors:**
- "Cannot read property of undefined" → Missing required fields
- Column mismatch → dataColumn doesn't match CSV header

### Troubleshooting

1. **Component not rendering:**
   - Check browser console for errors
   - Verify `@sanity/ui` components are used (not plain HTML)
   - Ensure `renderDefault(props)` is called

2. **CORS errors:**
   - Verify Chart Agent API has CORS middleware
   - Check allowed origins include current domain

3. **Charts not displaying:**
   - Verify Highcharts dependency is installed
   - Check CSV data format matches requirements
   - Ensure dataColumn values match CSV headers exactly

---

## Testing

### Local Development

```bash
# Start Chart Agent locally
cd gmo-chart-agent
node index.js  # Runs on port 3000

# Start Sanity Studio
cd gmo-prototype
npm run dev    # Runs on port 3333
```

**Note:** Component auto-switches to `http://localhost:3000` when running on localhost.

### Production Testing

1. Open https://gmo-prototype.sanity.studio
2. Follow usage steps above
3. Verify:
   - File upload works
   - Chart preview renders
   - Alternatives appear (2-3 thumbnails)
   - Save persists data
   - Edit reloads saved data

---

## Performance Considerations

### File Size Limits
- **Max file size:** 10MB
- **Recommended:** < 1MB for optimal performance
- **Row limit:** No hard limit, but 1000+ rows may slow rendering

### API Response Time
- **Typical:** 2-5 seconds (depends on data complexity)
- **Max:** 30 seconds (timeout)

### Chart Rendering
- **Client-side rendering** with Highcharts
- **No server load** for chart generation
- **Renders in:** < 500ms typically

---

## Known Issues

### Minor UI Issues (Non-Blocking)
1. **Modal z-index overlap** - Rare edge cases on certain browsers
2. **styled-components warnings** - Dev console warnings (non-critical)

### Feature Limitations
1. **No chart refinement** - Cannot modify AI recommendation (deferred to v3)
2. **No CSV preview** - Cannot see/edit CSV before analysis
3. **No chart history** - Cannot undo or view previous versions

---

## Future Enhancements

### Planned (v3)
- Chart refinement with natural language ("Make it a stacked area chart")
- CSV preview and inline editing
- Chart history with undo/redo
- More chart types (pie, scatter, gauge)
- Batch chart import

### Under Consideration
- Custom color selection
- Chart templates
- Export to image/PDF
- Chart annotations

---

## Maintenance

### Updating Dependencies

```bash
cd gmo-prototype
npm update xlsx papaparse highcharts highcharts-react-official react-dropzone
```

### Monitoring

**Chart Agent API:**
- Monitor at https://vercel.com/dashboard
- Check error rates, response times
- Review Claude API usage

**Sanity Studio:**
- Check browser console for errors
- Monitor user feedback
- Track chart creation metrics

---

## Support

### Documentation
- [User Guide](../CHART_BUILDER_USER_GUIDE.md)
- [Feature Summary](../CHART_BUILDER_FEATURE_SUMMARY.md)
- [Deployment Plan](../../../.claude/plans/deployment-plan.md)

### Contact
- GitHub Issues: [Report bugs](https://github.com/Pattrn-Studios/gmo/issues)
- Technical Lead: [Your Name]

---

**Built with:** React 19, TypeScript 5.8, Sanity Studio v4, Claude Sonnet 4.5
**License:** Proprietary
**Copyright:** © 2026 Pattrn Studios / GMO

