# Chart Import Guide - Manual Entry from Chart Agent

When you generate a chart in the Chart Agent and click "Copy for Sanity", you'll get JSON like this:

```json
{
  "chartType": "line",
  "chartData": "date,value1,value2\n2024-01,100,150\n2024-02,110,160",
  "chartSeries": [
    {"label": "Series 1", "dataColumn": "value1", "colour": "#3E7274"},
    {"label": "Series 2", "dataColumn": "value2", "colour": "#3D748F"}
  ],
  "xAxisLabel": "Date",
  "yAxisLabel": "Value",
  "yAxisFormat": "number"
}
```

## Import Steps (2-3 minutes)

1. **Toggle "Include Chart"** to ON

2. **Chart Type**: Copy the `chartType` value → Select matching option from dropdown
   - `line` → Line Chart
   - `column` → Column Chart (Vertical)
   - `bar` → Bar Chart (Horizontal)
   - `area` → Area Chart
   - `stackedColumn` → Stacked Column
   - `stackedArea` → Stacked Area

3. **Chart Data**: Copy the entire `chartData` value → Paste into "Chart Data (CSV)" textarea
   - This is your actual data with newlines (`\n`) separating rows

4. **Data Series**: For each item in `chartSeries` array:
   - Click "Add item" button
   - **Label**: Copy `label` value (e.g., "Series 1")
   - **Data Column**: Copy `dataColumn` value (e.g., "value1") - **must match CSV header exactly!**
   - **Colour**: Copy `colour` value (e.g., "#3E7274") → Select matching color:
     - `#3E7274` → Primary Green
     - `#3D748F` → Coast Blue
     - `#AC5359` → Metallic Copper
     - `#F1875A` → Orange
     - `#76BCA3` → Light Green
     - `#132728` → Dark Blue

5. **X-Axis Label** (optional): Copy `xAxisLabel` value if present (e.g., "Date")

6. **Y-Axis Label** (optional): Copy `yAxisLabel` value if present (e.g., "Value")

7. **Y-Axis Format**: Copy `yAxisFormat` value → Select from dropdown:
   - `number` → Number (1,234)
   - `percent` → Percentage (12.5%)
   - `currency` → Currency ($1,234)

8. **Chart Source** (optional): Add attribution text if needed (e.g., "Bloomberg, December 2025")

9. **Layout**: Choose chart positioning:
   - Chart on Left
   - Chart on Right
   - Chart Full Width (Below Content)

## Tips

- The most important field is **Chart Data** - this contains all the actual data as CSV
- **Data Column** in each series must exactly match a column header from your CSV (case-sensitive)
- If the color isn't one of the 6 available options, pick the closest match
- If Chart Agent JSON format changes, you can still manually map the values to the appropriate fields
- For multiple series (multiple lines/bars), repeat step 4 for each one

## Common Issues

- **"Data column doesn't appear in chart"** - Check that dataColumn exactly matches CSV header (including capitalization)
- **"Wrong colors showing"** - Make sure you selected the matching color from the dropdown
- **"CSV data looks wrong"** - The `\n` in the JSON represents newlines. When you paste, they should convert to actual line breaks

## Example: Full Manual Entry

Given this JSON from Chart Agent:
```json
{
  "chartType": "column",
  "chartData": "month,revenue,expenses\nJan,50000,35000\nFeb,55000,38000",
  "chartSeries": [
    {"label": "Revenue", "dataColumn": "revenue", "colour": "#3E7274"},
    {"label": "Expenses", "dataColumn": "expenses", "colour": "#AC5359"}
  ],
  "xAxisLabel": "Month",
  "yAxisLabel": "Amount",
  "yAxisFormat": "currency"
}
```

You would:
1. Toggle "Include Chart" ON
2. Chart Type: Select "Column Chart (Vertical)"
3. Chart Data: Paste:
   ```
   month,revenue,expenses
   Jan,50000,35000
   Feb,55000,38000
   ```
4. Add first series:
   - Label: Revenue
   - Data Column: revenue
   - Color: Primary Green
5. Add second series:
   - Label: Expenses
   - Data Column: expenses
   - Color: Metallic Copper
6. X-Axis Label: Month
7. Y-Axis Label: Amount
8. Y-Axis Format: Currency ($1,234)
9. Layout: Choose positioning
10. Save!

---

**Time per chart**: ~2-3 minutes

**For 1 chart/month**: 30 minutes per year total

This manual approach is simple, reliable, and requires zero maintenance.
