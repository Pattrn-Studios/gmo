/**
 * Shared Chart.js Configuration Builder
 *
 * This module provides unified Chart.js configuration generation for:
 * - HTML report generation (build.js, build-slide.mjs)
 * - PDF export (pdf-export.js via QuickChart.io)
 *
 * Supports all 15 chart types:
 * Basic: line, column, bar, area, stackedColumn, stackedArea
 * Proportional: pie, donut
 * Analytical: scatter, radar, composed, waterfall
 * Specialized: gauge, treemap, heatmap
 */

import {GMO_COLORS} from './design-tokens/index.js'
import {pdfChartColors} from './design-tokens/colors.js'

// Standard chart color palette (for web)
const CHART_COLORS = [
  '#3E7274', // Blue Dianne (primary)
  '#3D748F', // Coast Blue
  '#AC5359', // Metallic Copper
  '#F07662', // Orange
  '#3A7862', // Silver Tree Green
  '#132728', // Firefly Dark
  '#955073', // Plum
]

// PDF-matched chart color palette (from reference PDF)
// Used for PDF exports to match the official design
const PDF_CHART_COLORS = [
  '#E86E58', // Coral/Red (primary data lines)
  '#3E7274', // Teal (secondary lines)
  '#C9A227', // Gold (tertiary lines)
  '#3D748F', // Coast Blue
  '#3A7862', // Silver Tree Green
  '#CCCCCC', // Muted/Gray
]

/**
 * Parse CSV data into array of objects
 * @param {string} csv - CSV string to parse
 * @returns {Array<Record<string, any>>} Parsed data
 */
export function parseCSV(csv) {
  if (!csv) return []

  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const obj = {}
    headers.forEach((header, i) => {
      const val = values[i]?.trim()
      obj[header] = isNaN(val) ? val : parseFloat(val)
    })
    return obj
  })
}

/**
 * Validate that series data columns exist in the parsed data
 * Filters out series with missing columns and logs warnings
 * @param {Array} series - Chart series configuration
 * @param {Array} parsedData - Parsed CSV data
 * @returns {Array} Validated series with only existing columns
 */
function validateSeries(series, parsedData) {
  if (!parsedData || parsedData.length === 0 || !series) return []
  const dataKeys = Object.keys(parsedData[0])
  return series.filter((s) => {
    if (!s.dataColumn) {
      console.warn(`Chart series "${s.label}" has no dataColumn specified`)
      return false
    }
    if (!dataKeys.includes(s.dataColumn)) {
      console.warn(
        `Chart series "${s.label}" references missing column "${s.dataColumn}". Available columns: ${dataKeys.join(', ')}`
      )
      return false
    }
    return true
  })
}

/**
 * Get the appropriate color palette based on context
 * @param {boolean} forPdf - Whether this is for PDF export
 * @returns {string[]} Color palette array
 */
function getChartColors(forPdf = false) {
  return forPdf ? PDF_CHART_COLORS : CHART_COLORS
}

/**
 * Build Chart.js configuration for a section
 * @param {Object} section - Content section with chart data
 * @param {Object} options - Configuration options
 * @returns {Object|null} Chart.js configuration object
 */
export function buildChartJsConfig(section, options = {}) {
  const {forPdf = false, animation = true} = options
  const colors = getChartColors(forPdf)

  if (!section.hasChart || !section.chartData) return null

  const parsedData = parseCSV(section.chartData)
  if (parsedData.length === 0) return null

  // Limit data points to prevent performance issues
  const MAX_DATA_POINTS = 500
  const limitedData = parsedData.length > MAX_DATA_POINTS
    ? parsedData.slice(0, MAX_DATA_POINTS)
    : parsedData

  const xAxisKey = Object.keys(limitedData[0])[0]
  const labels = limitedData.map((row) => row[xAxisKey])
  const chartType = section.chartType || 'line'

  // Handle different chart types
  switch (chartType) {
    case 'pie':
    case 'donut':
      return buildPieConfig(section, limitedData, labels, chartType, options, colors)

    case 'scatter':
      return buildScatterConfig(section, limitedData, options, colors)

    case 'radar':
      return buildRadarConfig(section, limitedData, labels, options, colors)

    case 'gauge':
      return buildGaugeConfig(section, limitedData, options, colors)

    case 'waterfall':
      return buildWaterfallConfig(section, limitedData, labels, options, colors)

    case 'treemap':
      // Treemap requires chartjs-chart-treemap plugin
      // Fall back to horizontal bar for PDF if not available
      return forPdf
        ? buildBarConfig(section, limitedData, labels, options, colors)
        : buildTreemapConfig(section, limitedData, labels, options, colors)

    case 'heatmap':
      // Heatmap requires chartjs-chart-matrix plugin
      // Fall back to stacked bar for PDF if not available
      return forPdf
        ? buildStackedBarConfig(section, limitedData, labels, options, colors)
        : buildHeatmapConfig(section, limitedData, labels, options, colors)

    case 'composed':
      return buildComposedConfig(section, limitedData, labels, options, colors)

    default:
      return buildStandardConfig(section, limitedData, labels, chartType, options, colors)
  }
}

/**
 * Build standard chart config (line, bar, area, stacked variants)
 */
function buildStandardConfig(section, parsedData, labels, chartType, options, colors = CHART_COLORS) {
  const {animation = true} = options

  // Map internal chart types to Chart.js types
  const chartTypeMap = {
    line: 'line',
    column: 'bar',
    bar: 'bar',
    area: 'line',
    stackedColumn: 'bar',
    stackedArea: 'line',
  }

  const isStacked = chartType.includes('stacked')
  const isHorizontal = chartType === 'bar'
  const isArea = chartType.includes('area')
  const isBarChart = chartType === 'column' || chartType === 'bar' || chartType === 'stackedColumn'

  // Validate series columns exist in data
  const validSeries = validateSeries(section.chartSeries, parsedData)
  if (validSeries.length === 0 && section.chartSeries?.length > 0) {
    console.warn('No valid series found for chart - all columns missing from data')
  }

  const datasets = validSeries.map((s, index) => {
    const color = s.colour || colors[index % colors.length]
    return {
      label: s.label,
      data: parsedData.map((row) => row[s.dataColumn]),
      backgroundColor: isArea ? color + '40' : color,
      borderColor: color,
      borderWidth: 2,
      borderRadius: isBarChart && !isStacked ? 4 : 0, // Rounded corners for non-stacked bars
      fill: isArea,
      tension: 0.4, // Smoother curves to match ReCharts monotone
    }
  })

  return {
    type: chartTypeMap[chartType] || 'line',
    data: {labels, datasets},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      indexAxis: isHorizontal ? 'y' : 'x',
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            color: GMO_COLORS.textPrimary,
            font: {size: 11},
          },
        },
        title: {display: false},
      },
      scales: {
        x: {
          stacked: isStacked,
          title: {
            display: !!section.xAxisLabel,
            text: section.xAxisLabel || '',
            color: GMO_COLORS.textSecondary,
          },
          ticks: {color: '#5F5F5F', font: {size: 11}},
          grid: {
            color: '#E8E8E8',
            borderDash: [3, 3], // Dashed grid lines like ReCharts
          },
          border: {display: false},
        },
        y: {
          stacked: isStacked,
          title: {
            display: !!section.yAxisLabel,
            text: section.yAxisLabel || '',
            color: GMO_COLORS.textSecondary,
          },
          ticks: {
            color: '#5F5F5F',
            font: {size: 11},
            callback: function (value) {
              return formatYAxisValue(value, section.yAxisFormat)
            },
          },
          grid: {
            color: '#E8E8E8',
            borderDash: [3, 3], // Dashed grid lines like ReCharts
          },
          border: {display: false}, // Hide left axis line like ReCharts
        },
      },
    },
  }
}

/**
 * Build pie/donut chart config
 */
function buildPieConfig(section, parsedData, labels, chartType, options, colors = CHART_COLORS) {
  const {animation = true} = options
  const valueColumn = section.chartSeries?.[0]?.dataColumn || Object.keys(parsedData[0])[1]

  const sliceColors = parsedData.map((_, index) => colors[index % colors.length])

  return {
    type: chartType === 'donut' ? 'doughnut' : 'pie',
    data: {
      labels,
      datasets: [
        {
          data: parsedData.map((row) => row[valueColumn]),
          backgroundColor: sliceColors,
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: GMO_COLORS.textPrimary,
            font: {size: 11},
          },
        },
      },
    },
  }
}

/**
 * Build scatter chart config
 */
function buildScatterConfig(section, parsedData, options, colors = CHART_COLORS) {
  const {animation = true} = options
  const dataKeys = Object.keys(parsedData[0] || {})
  const xKey = section.chartSeries?.[0]?.dataColumn || dataKeys[0]
  const yKey = section.chartSeries?.[1]?.dataColumn || dataKeys[1]

  // Validate that the required columns exist
  if (!dataKeys.includes(xKey) || !dataKeys.includes(yKey)) {
    console.warn(`Scatter chart: Missing columns. X: "${xKey}", Y: "${yKey}". Available: ${dataKeys.join(', ')}`)
  }

  const scatterData = parsedData.map((row) => ({
    x: row[xKey],
    y: row[yKey],
  }))

  return {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: section.chartSeries?.[0]?.label || 'Data',
          data: scatterData,
          backgroundColor: section.chartSeries?.[0]?.colour || colors[0],
          borderColor: section.chartSeries?.[0]?.colour || colors[0],
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      plugins: {
        legend: {position: 'top'},
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: !!section.xAxisLabel,
            text: section.xAxisLabel || '',
          },
          ticks: {color: '#5F5F5F', font: {size: 11}},
          grid: {color: '#E8E8E8', borderDash: [3, 3]},
          border: {display: false},
        },
        y: {
          type: 'linear',
          title: {
            display: !!section.yAxisLabel,
            text: section.yAxisLabel || '',
          },
          ticks: {
            color: '#5F5F5F',
            font: {size: 11},
            callback: function (value) {
              return formatYAxisValue(value, section.yAxisFormat)
            },
          },
          grid: {color: '#E8E8E8', borderDash: [3, 3]},
          border: {display: false},
        },
      },
    },
  }
}

/**
 * Build radar chart config
 */
function buildRadarConfig(section, parsedData, labels, options, colors = CHART_COLORS) {
  const {animation = true} = options

  // Validate series columns exist in data
  const validSeries = validateSeries(section.chartSeries, parsedData)

  const datasets = validSeries.map((s, index) => {
    const color = s.colour || colors[index % colors.length]
    return {
      label: s.label,
      data: parsedData.map((row) => row[s.dataColumn]),
      backgroundColor: color + '66', // 40% opacity like ReCharts
      borderColor: color,
      borderWidth: 2,
      pointBackgroundColor: color,
    }
  })

  return {
    type: 'radar',
    data: {labels, datasets},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      plugins: {
        legend: {position: 'top'},
      },
      scales: {
        r: {
          ticks: {
            color: '#5F5F5F',
            font: {size: 10},
            backdropColor: 'transparent',
          },
          grid: {color: '#E8E8E8'},
          pointLabels: {
            color: GMO_COLORS.textPrimary,
            font: {size: 11},
          },
        },
      },
    },
  }
}

/**
 * Build gauge chart config (using doughnut as base)
 */
function buildGaugeConfig(section, parsedData, options, colors = CHART_COLORS) {
  const {animation = true} = options
  const dataKeys = Object.keys(parsedData[0] || {})
  const valueColumn = section.chartSeries?.[0]?.dataColumn || dataKeys[1]
  const value = parsedData[0]?.[valueColumn] || 0
  const maxValue = section.gaugeMax || 100
  const percentage = Math.min((value / maxValue) * 100, 100)

  // Format the value for display
  const formattedValue = formatYAxisValue(value, section.yAxisFormat)
  const formattedMax = formatYAxisValue(maxValue, section.yAxisFormat)

  return {
    type: 'doughnut',
    data: {
      labels: ['Value', 'Remaining'],
      datasets: [
        {
          data: [percentage, 100 - percentage],
          backgroundColor: [section.chartSeries?.[0]?.colour || colors[0], '#e0e0e0'],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      cutout: '70%',
      plugins: {
        legend: {display: false},
        tooltip: {enabled: false},
        // Custom center text plugin data
        centerText: {
          display: true,
          value: formattedValue,
          maxValue: formattedMax,
        },
      },
    },
  }
}

/**
 * Build waterfall chart config (using bar chart with floating bars)
 */
function buildWaterfallConfig(section, parsedData, labels, options, colors = CHART_COLORS) {
  const {animation = true} = options
  const dataKeys = Object.keys(parsedData[0] || {})
  const valueColumn = section.chartSeries?.[0]?.dataColumn || dataKeys[1]

  // Validate column exists
  if (!dataKeys.includes(valueColumn)) {
    console.warn(`Waterfall chart: Missing column "${valueColumn}". Available: ${dataKeys.join(', ')}`)
  }

  let cumulative = 0
  const waterfallData = parsedData.map((row, index) => {
    const value = row[valueColumn] || 0
    const start = cumulative
    cumulative += value
    return {
      y: [start, cumulative],
      color: index === parsedData.length - 1 ? colors[0] : value >= 0 ? '#3A7862' : '#AC5359',
    }
  })

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: section.chartSeries?.[0]?.label || 'Value',
          data: waterfallData.map((d) => d.y),
          backgroundColor: waterfallData.map((d) => d.color),
          borderColor: waterfallData.map((d) => d.color),
          borderWidth: 1,
          borderRadius: 4, // Rounded corners like ReCharts
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      plugins: {
        legend: {display: false},
      },
      scales: {
        x: {
          ticks: {color: '#5F5F5F', font: {size: 11}},
          grid: {display: false},
          border: {display: false},
        },
        y: {
          ticks: {
            color: '#5F5F5F',
            font: {size: 11},
            callback: function (value) {
              return formatYAxisValue(value, section.yAxisFormat)
            },
          },
          grid: {color: '#E8E8E8', borderDash: [3, 3]},
          border: {display: false},
        },
      },
    },
  }
}

/**
 * Build composed (mixed) chart config
 */
function buildComposedConfig(section, parsedData, labels, options, colors = CHART_COLORS) {
  const {animation = true} = options

  // Validate series columns exist in data
  const validSeries = validateSeries(section.chartSeries, parsedData)

  const datasets = validSeries.map((s, index) => {
    const color = s.colour || colors[index % colors.length]
    // First series as bar, rest as lines
    if (index === 0) {
      return {
        type: 'bar',
        label: s.label,
        data: parsedData.map((row) => row[s.dataColumn]),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4, // Rounded corners like ReCharts
        order: 2,
      }
    }
    return {
      type: 'line',
      label: s.label,
      data: parsedData.map((row) => row[s.dataColumn]),
      borderColor: color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.4, // Smoother curves like ReCharts
      pointRadius: 0,
      order: 1,
    }
  })

  return {
    type: 'bar', // Base type for mixed charts
    data: {labels, datasets},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
        },
      },
      scales: {
        x: {
          title: {display: !!section.xAxisLabel, text: section.xAxisLabel || ''},
          ticks: {color: '#5F5F5F', font: {size: 11}},
          grid: {color: '#E8E8E8', borderDash: [3, 3]},
          border: {display: false},
        },
        y: {
          title: {display: !!section.yAxisLabel, text: section.yAxisLabel || ''},
          ticks: {
            color: '#5F5F5F',
            font: {size: 11},
            callback: function (value) {
              return formatYAxisValue(value, section.yAxisFormat)
            },
          },
          grid: {color: '#E8E8E8', borderDash: [3, 3]},
          border: {display: false},
        },
      },
    },
  }
}

/**
 * Build treemap config (requires chartjs-chart-treemap plugin)
 */
function buildTreemapConfig(section, parsedData, labels, options, colors = CHART_COLORS) {
  const {animation = true} = options
  const dataKeys = Object.keys(parsedData[0] || {})
  const valueColumn = section.chartSeries?.[0]?.dataColumn || dataKeys[1]

  // Pre-compute colors for each data point (functions can't survive JSON.stringify)
  const treemapData = parsedData.map((row, index) => ({
    label: row[dataKeys[0]],
    value: row[valueColumn] || 0,
    color: colors[index % colors.length],
  }))

  // Pre-compute backgroundColor array since functions don't serialize
  const backgroundColors = treemapData.map((d) => d.color)

  return {
    type: 'treemap',
    data: {
      datasets: [
        {
          tree: treemapData,
          key: 'value',
          groups: ['label'],
          backgroundColor: backgroundColors,
          borderColor: '#fff',
          borderWidth: 2,
          labels: {
            display: true,
            color: '#fff',
            font: {size: 11, weight: 'bold'},
          },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      plugins: {
        legend: {display: false},
      },
    },
  }
}

/**
 * Build heatmap config (requires chartjs-chart-matrix plugin)
 * Falls back to stacked bar for browsers without plugin support
 */
function buildHeatmapConfig(section, parsedData, labels, options, colors = CHART_COLORS) {
  const xAxisKey = Object.keys(parsedData[0])[0]
  const columns = Object.keys(parsedData[0]).filter((k) => k !== xAxisKey)

  // If too many rows, fall back to stacked bar for better display
  if (parsedData.length > 20 || columns.length > 15) {
    return buildStackedBarConfig(section, parsedData, labels, options, colors)
  }

  // Calculate value range for color scaling
  const allValues = parsedData.flatMap((row) => columns.map((col) => row[col] || 0))
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)

  // Helper function for color calculation
  const getHeatColor = (value) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1)
    // Green gradient
    const r = Math.round(255 - ratio * (255 - 62))
    const g = Math.round(255 - ratio * (255 - 114))
    const b = Math.round(255 - ratio * (255 - 116))
    return `rgb(${r}, ${g}, ${b})`
  }

  const matrixData = []
  const backgroundColors = []
  parsedData.forEach((row, rowIndex) => {
    columns.forEach((col, colIndex) => {
      const value = row[col] || 0
      matrixData.push({
        x: colIndex,
        y: rowIndex,
        v: value,
      })
      backgroundColors.push(getHeatColor(value))
    })
  })

  return {
    type: 'matrix',
    data: {
      datasets: [
        {
          label: 'Heatmap',
          data: matrixData,
          backgroundColor: backgroundColors, // Pre-computed colors
          borderColor: '#fff',
          borderWidth: 1,
          width: 30, // Fixed width since functions don't serialize
          height: 30, // Fixed height since functions don't serialize
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            title: () => '',
            label: (ctx) => {
              const data = ctx.dataset.data[ctx.dataIndex]
              const rowLabel = labels[data.y]
              const colLabel = columns[data.x]
              return `${rowLabel}, ${colLabel}: ${data.v}`
            },
          },
        },
      },
      scales: {
        x: {
          type: 'category',
          labels: columns,
          ticks: {color: GMO_COLORS.textSecondary},
          grid: {display: false},
        },
        y: {
          type: 'category',
          labels: labels,
          offset: true,
          ticks: {color: GMO_COLORS.textSecondary},
          grid: {display: false},
        },
      },
    },
  }
}

/**
 * Build horizontal bar config (fallback for treemap in PDF)
 */
function buildBarConfig(section, parsedData, labels, options, colors = CHART_COLORS) {
  const {animation = true} = options
  const dataKeys = Object.keys(parsedData[0] || {})
  const valueColumn = section.chartSeries?.[0]?.dataColumn || dataKeys[1]

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: section.chartSeries?.[0]?.label || 'Value',
          data: parsedData.map((row) => row[valueColumn]),
          backgroundColor: parsedData.map((_, i) => colors[i % colors.length]),
          borderWidth: 0,
          borderRadius: 4, // Rounded corners
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {duration: 800} : false,
      indexAxis: 'y',
      plugins: {
        legend: {display: false},
      },
      scales: {
        x: {
          ticks: {
            color: '#5F5F5F',
            font: {size: 11},
            callback: function (value) {
              return formatYAxisValue(value, section.yAxisFormat)
            },
          },
          grid: {color: '#E8E8E8', borderDash: [3, 3]},
          border: {display: false},
        },
        y: {
          ticks: {color: '#5F5F5F', font: {size: 11}},
          grid: {display: false},
          border: {display: false},
        },
      },
    },
  }
}

/**
 * Build stacked bar config (fallback for heatmap in PDF)
 */
function buildStackedBarConfig(section, parsedData, labels, options, colors = CHART_COLORS) {
  const xAxisKey = Object.keys(parsedData[0])[0]
  const columns = Object.keys(parsedData[0]).filter((k) => k !== xAxisKey)

  const datasets = columns.map((col, index) => ({
    label: col,
    data: parsedData.map((row) => row[col]),
    backgroundColor: colors[index % colors.length],
  }))

  return {
    type: 'bar',
    data: {labels, datasets},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {position: 'top'},
      },
      scales: {
        x: {
          stacked: true,
          ticks: {color: '#5F5F5F', font: {size: 11}},
          grid: {display: false},
          border: {display: false},
        },
        y: {
          stacked: true,
          ticks: {color: '#5F5F5F', font: {size: 11}},
          grid: {color: '#E8E8E8', borderDash: [3, 3]},
          border: {display: false},
        },
      },
    },
  }
}

/**
 * Format Y-axis values based on format type
 * @param {number} value - Value to format
 * @param {string} format - Format type (number, percent, currency)
 * @returns {string} Formatted value
 */
export function formatYAxisValue(value, format) {
  if (format === 'percent') return `${value}%`
  if (format === 'currency') return `$${value.toLocaleString()}`
  return value.toLocaleString()
}

/**
 * Get JavaScript code for initializing charts in HTML
 * @param {Array} sections - Report sections
 * @returns {string} JavaScript code string
 */
export function buildChartsInitScript(sections) {
  const configs = sections
    .map((section, index) => {
      if (!section.hasChart || !section.chartData) return null
      const config = buildChartJsConfig(section, {animation: true})
      if (!config) return null
      return `new Chart(document.getElementById('chart-${index}'), ${JSON.stringify(config)});`
    })
    .filter(Boolean)

  return configs.join('\n')
}
