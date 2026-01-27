# Chart Builder User Guide

## Overview

The Chart Builder is an AI-powered tool for creating charts in GMO reports. Upload a data file (Excel or CSV) or a chart image (PNG/JPG/WebP), and Claude AI recommends the best chart type and configuration.

## Benefits

- **Two Input Methods**: Upload data files or chart images
- **AI Recommendations**: Claude suggests the optimal chart type with 2-3 alternatives
- **Image Extraction**: Upload an existing chart image and AI recreates it as an editable Recharts chart
- **Editable Data**: Correct AI-extracted values and column headers directly in the modal
- **Live Preview**: See exactly how your chart will look before saving
- **Persistent Edit Flow**: Reopen saved charts with the same editing experience as creation

---

## How to Use — CSV/Excel Upload

### Step 1: Create or Edit a Content Section

1. Open Sanity Studio
2. Navigate to your report document
3. Add a new Content Section or edit an existing one

### Step 2: Enable Chart

1. Toggle **"Include Chart"** to ON
2. A **"Chart Configuration"** field will appear

### Step 3: Upload Your Data

1. Click **"Add Chart"**
2. Drag and drop your Excel (.xlsx, .xls) or CSV (.csv) file, or click to browse

**File Requirements:**
- **Format**: Excel (.xlsx, .xls) or CSV (.csv)
- **Size**: Maximum 10MB
- **Structure**: First row = headers, first column = X-axis categories, remaining columns = numeric data

### Step 4: Review AI Recommendation

After uploading, Claude AI will:
1. Analyze your data
2. Recommend a chart type with brand colors, axis labels, and formatting
3. Provide 2-3 alternative chart types

### Step 5: Choose Alternative (Optional)

Click any alternative thumbnail below the main chart to swap it in.

### Step 6: Save

Click **"Save Chart"** to apply the configuration.

---

## How to Use — Image Upload

### Step 1: Upload a Chart Image

1. Click **"Upload Image"** (available alongside "Add Chart")
2. Drag and drop a chart image (PNG, JPG, or WebP, max 10MB)

### Step 2: AI Analysis

Claude Vision will:
1. Validate the image contains a chart
2. Extract all data points, series names, axis labels, and values
3. Recreate the chart as an editable Recharts visualization
4. Provide 2-3 alternative chart types

### Step 3: Review and Edit Extracted Data

- The **editable data table** shows all extracted values
- Click any cell to correct a value
- Edit column headers to rename series (updates chart legend and tooltips automatically)

### Step 4: Choose Alternative (Optional)

Click any alternative thumbnail to switch chart types.

### Step 5: Save

Click **"Save Chart"** to apply.

---

## Editing an Existing Chart

1. Click **"Edit Chart"** — the modal reopens in the original mode (CSV or image)
2. For **CSV-created charts**: chart renders immediately, alternatives load in the background
3. For **image-created charts**: chart renders with the editable data table and alternatives
4. Make changes and click **"Save Chart"**, or **"Cancel"** to discard

To replace a chart with a new image, click **"Upload Image"** instead of "Edit Chart".

---

## Removing a Chart

1. Click **"Remove Chart"** in the Chart Configuration section
2. The configuration is cleared; add a new chart with "Add Chart" or "Upload Image"

---

## Supported Chart Types

| Chart Type | Best For |
|------------|----------|
| Line | Time series, trends |
| Column | Comparing values (< 7 categories) |
| Bar (Horizontal) | Comparing many categories (7+) |
| Area | Magnitude alongside trends |
| Stacked Column | Part-to-whole by category |
| Stacked Area | Part-to-whole over time |
| Pie / Donut | Proportional breakdowns |
| Scatter | Correlation between variables |
| Radar | Multi-variable comparison |
| Waterfall | Cumulative effect of values |
| Gauge | Single metric against target |
| Treemap / Heatmap | Hierarchical or matrix data |

---

## GMO Brand Colors

Charts automatically use the approved color palette:

1. **Primary Green** (#3E7274)
2. **Coast Blue** (#3D748F)
3. **Metallic Copper** (#AC5359)
4. **Orange** (#F1875A)
5. **Light Green** (#76BCA3)
6. **Dark Blue** (#132728)

---

## Troubleshooting

### "Unable to connect to Chart Agent API"
- Check your internet connection and try again

### "Failed to process file"
- Ensure the file is valid Excel or CSV with headers in the first row

### "The uploaded image does not appear to contain a chart"
- Upload a clear chart image (not a photo, diagram, or text)

### "Failed to analyze image"
- Try a higher resolution image with clear axis labels and data points

### Chart doesn't appear in published report
- Re-save the chart configuration and verify it shows in Sanity Studio

---

## Tips

1. **Clean data**: Remove empty rows/columns, use clear headers
2. **Keep it simple**: Limit to 3-5 data series for readability
3. **For image upload**: Use high-contrast chart images with clear labels for best extraction accuracy
4. **Review before saving**: Always check the preview, axis labels, and data values

---

## Getting Help

If you encounter issues:
1. Review the Chart Agent logs if API errors occur
2. Contact the development team with the error message, a screenshot, and the file used

---

*Last Updated: January 2026*
*Version: 3.0*
