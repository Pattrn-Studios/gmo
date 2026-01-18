# Chart Builder User Guide

## Overview

The Chart Builder is an AI-powered tool that simplifies creating charts for GMO reports. Instead of manually configuring chart settings, you simply upload your data file (Excel or CSV), and Claude AI analyzes it to recommend the best chart type and configuration.

## Benefits

- **Time Savings**: Create charts in 3-4 minutes instead of 7+ minutes
- **AI Recommendations**: Claude analyzes your data and suggests the optimal chart type
- **No Manual Configuration**: Chart type, colors, axis labels, and series are configured automatically
- **Live Preview**: See exactly how your chart will look before saving
- **Error Reduction**: Eliminates manual data entry mistakes

---

## How to Use

### Step 1: Create or Edit a Content Section

1. Open Sanity Studio (http://localhost:3333 for development)
2. Navigate to your report document
3. Add a new Content Section or edit an existing one

### Step 2: Enable Chart

1. Toggle **"Include Chart"** to ON
2. A new **"Chart Configuration"** field will appear

### Step 3: Upload Your Data

1. Click the **"Add Chart"** button
2. A modal window will open with a file upload area
3. Either:
   - Drag and drop your Excel (.xlsx, .xls) or CSV (.csv) file, OR
   - Click the upload area to browse and select a file

**File Requirements:**
- **Format**: Excel (.xlsx, .xls) or CSV (.csv)
- **Size**: Maximum 10MB
- **Structure**:
  - First row must contain column headers
  - First column will be used as X-axis categories
  - Remaining columns should contain numeric data series

**Example Data Format:**
```csv
date,fed,ecb,boe
Jan 2022,0.25,0.00,0.25
Feb 2022,0.50,0.00,0.50
Mar 2022,0.75,0.00,0.75
```

### Step 4: Review AI Recommendation

After uploading, Claude AI will:
1. **Analyze your data** (takes 5-10 seconds)
2. **Recommend a chart type** (line, column, bar, area, etc.)
3. **Configure chart settings**:
   - Chart type
   - Data series with GMO brand colors
   - Axis labels
   - Y-axis format (number, percent, or currency)

You'll see:
- **Full-size chart preview** - See exactly how it will look
- **Reasoning box** - Explanation of why this chart type was chosen
- **Alternative charts** (when available) - Other chart type options to choose from

### Step 5: Choose Alternative (Optional)

If alternative chart options are shown:
1. Review the thumbnail previews below the main chart
2. Click any thumbnail to swap it with the main chart
3. The previous main chart moves to the thumbnail grid

### Step 6: Save Your Chart

1. Review the chart preview
2. Click **"Save Chart"** to apply the configuration
3. The modal closes and you'll see a summary showing:
   - Chart type
   - Number of data series
   - Edit and Remove buttons

### Step 7: Configure Additional Settings

After saving the chart, you can configure:

1. **Chart Source** (optional)
   - Add data attribution (e.g., "Bloomberg, December 2025")

2. **Layout** (required)
   - **Chart on Left**: Chart appears on the left side of the content
   - **Chart on Right**: Chart appears on the right side of the content (default)
   - **Chart Full Width**: Chart appears below the content at full width

### Step 8: Publish

1. Save your content section
2. Publish your report document
3. The chart will be rendered in the final HTML output

---

## Editing an Existing Chart

To modify a chart:

1. Click the **"Edit Chart"** button in the Chart Configuration section
2. The modal opens showing your current chart
3. You can:
   - Upload a new file (replaces the entire chart)
   - Review the current configuration
4. Click **"Save Chart"** to keep changes or **"Cancel"** to discard

---

## Removing a Chart

To remove a chart completely:

1. Click the **"Remove Chart"** button in the Chart Configuration section
2. The chart configuration will be deleted
3. You can add a new chart by clicking **"Add Chart"** again

---

## Supported Chart Types

The Chart Builder supports the following chart types:

1. **Line Chart**
   - Best for: Time series data, trends over time
   - Example: Interest rates over months

2. **Column Chart (Vertical Bars)**
   - Best for: Comparing values across categories (fewer than 7 categories)
   - Example: Regional performance comparison

3. **Bar Chart (Horizontal Bars)**
   - Best for: Comparing many categories (7 or more)
   - Example: Country rankings

4. **Area Chart**
   - Best for: Showing magnitude alongside trends
   - Example: Market share over time

5. **Stacked Column**
   - Best for: Part-to-whole relationships with categories
   - Example: Revenue breakdown by product line

6. **Stacked Area**
   - Best for: Part-to-whole trends over time
   - Example: Portfolio allocation over time

---

## GMO Brand Colors

Charts automatically use GMO's approved color palette:

1. **Primary Green** (#3E7274) - Default first series
2. **Coast Blue** (#3D748F) - Second series
3. **Metallic Copper** (#AC5359) - Third series
4. **Orange** (#F1875A) - Fourth series
5. **Light Green** (#76BCA3) - Fifth series
6. **Dark Blue** (#132728) - Sixth series

Colors are assigned automatically by Claude AI based on your data.

---

## Y-Axis Formatting

Claude AI automatically detects and sets the appropriate Y-axis format:

- **Number** (1,234): Standard numeric format with thousand separators
- **Percentage** (12.5%): Adds "%" symbol to values
- **Currency** ($1,234): Adds "$" prefix with thousand separators

---

## Troubleshooting

### "Unable to connect to Chart Agent API"
- **Cause**: Network connectivity issue or API is down
- **Solution**: Check your internet connection and try again

### "Failed to process file"
- **Cause**: File is corrupted or in an unsupported format
- **Solution**:
  - Ensure file is valid Excel (.xlsx, .xls) or CSV (.csv)
  - Try re-saving the file and uploading again
  - Check that the file has the correct structure (headers in first row)

### "File size exceeds 10MB limit"
- **Cause**: File is too large
- **Solution**:
  - Reduce the amount of data in your file
  - Remove unnecessary columns or rows
  - Split into multiple charts if needed

### "Unable to detect data series"
- **Cause**: File doesn't contain numeric columns or is improperly formatted
- **Solution**:
  - Ensure at least one column contains numeric data
  - Check that headers are in the first row
  - Verify CSV format is correct (comma-separated, not semicolon or tab)

### Chart doesn't appear in published report
- **Cause**: Data migration needed or build script issue
- **Solution**:
  - Re-save the chart configuration
  - Verify the chart shows in Sanity Studio preview
  - Check build script logs for errors

---

## Tips for Best Results

1. **Clean Your Data**
   - Remove empty rows and columns
   - Ensure consistent date formats
   - Use clear, descriptive column headers

2. **Keep It Simple**
   - Limit to 3-5 data series for readability
   - Use meaningful labels
   - Choose appropriate time intervals (monthly, quarterly, yearly)

3. **Test Your Chart**
   - Always review the preview before saving
   - Verify axis labels make sense
   - Check that colors are distinguishable

4. **Add Context**
   - Use the Chart Source field for data attribution
   - Consider adding explanatory content text alongside the chart
   - Choose a layout that complements your content

---

## Workflow Comparison

### Old Workflow (Manual)
1. Upload data to standalone Chart Agent web app
2. Copy Claude's recommendation
3. Switch to Sanity Studio
4. Manually paste and configure each field
5. Build and preview

**Time**: ~7 minutes per chart

### New Workflow (Integrated)
1. Click "Add Chart" in Sanity Studio
2. Upload file
3. Review recommendation
4. Click "Save Chart"
5. Build and preview

**Time**: ~3-4 minutes per chart

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Plan Document](../../.claude/plans/graceful-churning-parnas.md) for technical details
2. Review the Chart Agent logs if API errors occur
3. Contact the development team with:
   - Error message (if any)
   - Screenshot of the issue
   - Sample data file (if applicable)

---

## Future Enhancements

Planned improvements for future versions:

- **Alternative Chart Options**: API will return 2-5 alternative chart types to choose from
- **Chart Refinement**: Ability to request adjustments (e.g., "make it a stacked area chart")
- **CSV Preview & Edit**: View and manually edit CSV data before analysis
- **Chart History**: Undo/redo functionality with history tracking
- **Batch Creation**: Upload multiple files at once

---

*Last Updated: January 2026*
*Version: 2.0*
