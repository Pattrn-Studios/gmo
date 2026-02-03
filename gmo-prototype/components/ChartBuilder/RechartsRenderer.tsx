/**
 * RechartsRenderer - Universal chart rendering component
 *
 * IMPORTANT: This file is intentionally duplicated in two locations:
 * - gmo-prototype/components/ChartBuilder/RechartsRenderer.tsx (this file - for Sanity Studio preview)
 * - gmo-report/src/components/charts/RechartsRenderer.tsx (canonical version - for production viewer)
 *
 * The gmo-report version is the CANONICAL source. When making changes:
 * 1. Update gmo-report/src/components/charts/RechartsRenderer.tsx first
 * 2. Copy the changes to this file
 * 3. Ensure both files remain in sync
 *
 * This duplication exists because:
 * - gmo-prototype (Sanity Studio) needs chart preview in the CMS
 * - gmo-report (Next.js viewer) needs chart rendering for the live report
 * - Both have different build systems that don't easily share code
 *
 * Future improvement: Extract to a shared npm package (@gmo/charts)
 *
 * Supports 14 chart types: line, column, bar, area, stackedColumn, stackedArea,
 * pie, donut, scatter, radar, composed, waterfall, gauge, treemap, heatmap
 */

import React, {useMemo} from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Treemap,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
} from 'recharts'
import {ChartType, ChartSeries} from './types'

// Brand color palette from design tokens
const CHART_COLORS = [
  '#3E7274', // Blue Dianne (primary)
  '#3D748F', // Coast Blue
  '#AC5359', // Metallic Copper
  '#F07662', // Orange
  '#3A7862', // Silver Tree Green
  '#132728', // Firefly Dark
  '#955073', // Plum
]

interface RechartsRendererProps {
  chartType: ChartType
  data: Record<string, any>[]
  series: ChartSeries[]
  xAxisLabel?: string
  yAxisLabel?: string
  yAxisFormat?: 'number' | 'percent' | 'currency'
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  showGrid?: boolean
  showAxes?: boolean
  // Gauge-specific props
  gaugeValue?: number
  gaugeMax?: number
}

// Format Y-axis values based on format type
function formatValue(value: number, format?: string): string {
  if (format === 'percent') return `${value}%`
  if (format === 'currency') return `$${value.toLocaleString()}`
  return value.toLocaleString()
}

// Custom tooltip with enhanced styling
function CustomTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean
  payload?: any[]
  label?: string
  format?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        background: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '140px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontWeight: 600,
          marginBottom: '8px',
          color: '#132728',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '6px',
        }}
      >
        {label}
      </p>
      {payload.map((entry, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '4px 0',
            gap: '12px',
          }}
        >
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                backgroundColor: entry.color,
              }}
            />
            <span style={{color: '#5F5F5F'}}>{entry.name}</span>
          </span>
          <span style={{fontWeight: 600, color: '#132728'}}>
            {formatValue(entry.value, format)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function RechartsRenderer({
  chartType,
  data,
  series,
  xAxisLabel,
  yAxisLabel,
  yAxisFormat,
  height = 400,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showAxes = true,
  gaugeValue,
  gaugeMax = 100,
}: RechartsRendererProps) {

  // Get the x-axis key (first column of data)
  const xAxisKey = useMemo(() => {
    if (!data || data.length === 0) return ''
    return Object.keys(data[0])[0]
  }, [data])

  // Validate series columns exist in data
  const validSeries = useMemo(() => {
    if (!data || data.length === 0 || !series || series.length === 0) return []
    const dataKeys = Object.keys(data[0])
    return series.filter((s) => dataKeys.includes(s.dataColumn))
  }, [data, series])

  // Early return for empty data
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          color: '#6c757d',
          background: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        No data available
      </div>
    )
  }

  // If no valid series found, show error
  if (validSeries.length === 0 && !['pie', 'donut', 'treemap', 'heatmap'].includes(chartType)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          color: '#6c757d',
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        No matching data columns found for the configured series
      </div>
    )
  }

  // Use validated series for rendering
  const activeSeries = validSeries.length > 0 ? validSeries : series

  // Normalize chartType to handle any whitespace issues
  const trimmedChartType = String(chartType).trim()

  // Check if chart is stacked
  const isStacked = trimmedChartType === 'stackedColumn' || trimmedChartType === 'stackedArea'

  // Get colors for series
  const getColor = (index: number, overrideColor?: string) => {
    return overrideColor || CHART_COLORS[index % CHART_COLORS.length]
  }

  // Container style to ensure proper height constraint
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: height,
    minHeight: Math.min(height, 200),
    maxHeight: Math.max(height, 600),
  }

  // Common axis tick formatter
  const yAxisTickFormatter = (value: number) => formatValue(value, yAxisFormat)

  // Common axis styling
  const axisTickStyle = {fontSize: 11, fill: '#5F5F5F'}
  const axisLineStyle = {stroke: '#E0E0E0'}
  const gridStyle = {strokeDasharray: '3 3', stroke: '#E8E8E8'}

  // Render different chart types using normalized trimmedChartType
  switch (trimmedChartType) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
            {showGrid && <CartesianGrid {...gridStyle} vertical={false} />}
            {showAxes && (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  label={xAxisLabel ? {value: xAxisLabel, position: 'bottom', offset: 0, fill: '#5F5F5F'} : undefined}
                  tick={axisTickStyle}
                  axisLine={axisLineStyle}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={yAxisTickFormatter}
                  label={
                    yAxisLabel
                      ? {value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 10, fill: '#5F5F5F'}
                      : undefined
                  }
                  tick={axisTickStyle}
                  axisLine={false}
                  tickLine={false}
                />
              </>
            )}
            {showTooltip && (
              <Tooltip content={<CustomTooltip format={yAxisFormat} />} cursor={{stroke: '#3E7274', strokeWidth: 1}} />
            )}
            {showLegend && <Legend wrapperStyle={{paddingTop: '20px'}} />}
            {activeSeries.map((s, i) => (
              <Line
                key={s.dataColumn}
                type="monotone"
                dataKey={s.dataColumn}
                name={s.label}
                stroke={getColor(i, s.colour)}
                strokeWidth={2}
                dot={false}
                activeDot={{r: 5, strokeWidth: 2, stroke: '#fff'}}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )

    case 'column':
    case 'stackedColumn':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={showAxes ? {top: 20, right: 30, left: 20, bottom: 40} : {top: 10, right: 10, left: 10, bottom: 10}}
            barCategoryGap="20%"
          >
            {showGrid && <CartesianGrid {...gridStyle} vertical={false} />}
            {/* XAxis is required for data mapping - hide visually when showAxes is false */}
            <XAxis
              dataKey={xAxisKey}
              label={showAxes && xAxisLabel ? {value: xAxisLabel, position: 'bottom', offset: 0, fill: '#5F5F5F'} : undefined}
              tick={showAxes ? axisTickStyle : false}
              axisLine={showAxes ? axisLineStyle : false}
              tickLine={false}
              height={showAxes ? 60 : 0}
            />
            {showAxes && (
              <YAxis
                tickFormatter={yAxisTickFormatter}
                label={
                  yAxisLabel
                    ? {value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 10, fill: '#5F5F5F'}
                    : undefined
                }
                tick={axisTickStyle}
                axisLine={false}
                tickLine={false}
              />
            )}
            {showTooltip && (
              <Tooltip content={<CustomTooltip format={yAxisFormat} />} cursor={{fill: 'rgba(62, 114, 116, 0.08)'}} />
            )}
            {showLegend && <Legend wrapperStyle={{paddingTop: '20px'}} />}
            {activeSeries.map((s, i) => (
              <Bar
                key={s.dataColumn}
                dataKey={s.dataColumn}
                name={s.label}
                fill={getColor(i, s.colour)}
                stackId={isStacked ? 'stack' : undefined}
                radius={isStacked ? undefined : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={showAxes ? {top: 20, right: 30, left: 20, bottom: 20} : {top: 10, right: 10, left: 10, bottom: 10}}
            barCategoryGap="20%"
          >
            {showGrid && <CartesianGrid {...gridStyle} horizontal={false} />}
            {/* XAxis (values) - hide visually when showAxes is false */}
            <XAxis
              type="number"
              tickFormatter={yAxisTickFormatter}
              label={
                showAxes && yAxisLabel
                  ? {value: yAxisLabel, position: 'bottom', offset: 0, fill: '#5F5F5F'}
                  : undefined
              }
              tick={showAxes ? axisTickStyle : false}
              axisLine={showAxes ? axisLineStyle : false}
              tickLine={false}
              height={showAxes ? undefined : 0}
            />
            {/* YAxis (categories) is required for vertical layout data mapping */}
            <YAxis
              type="category"
              dataKey={xAxisKey}
              tick={showAxes ? axisTickStyle : false}
              axisLine={false}
              tickLine={false}
              width={showAxes ? 120 : 0}
            />
            {showTooltip && (
              <Tooltip content={<CustomTooltip format={yAxisFormat} />} cursor={{fill: 'rgba(62, 114, 116, 0.08)'}} />
            )}
            {showLegend && <Legend wrapperStyle={{paddingTop: '20px'}} />}
            {activeSeries.map((s, i) => (
              <Bar
                key={s.dataColumn}
                dataKey={s.dataColumn}
                name={s.label}
                fill={getColor(i, s.colour)}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )

    case 'area':
    case 'stackedArea':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
            {showGrid && <CartesianGrid {...gridStyle} vertical={false} />}
            {showAxes && (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  label={xAxisLabel ? {value: xAxisLabel, position: 'bottom', offset: 0, fill: '#5F5F5F'} : undefined}
                  tick={axisTickStyle}
                  axisLine={axisLineStyle}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={yAxisTickFormatter}
                  label={
                    yAxisLabel
                      ? {value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 10, fill: '#5F5F5F'}
                      : undefined
                  }
                  tick={axisTickStyle}
                  axisLine={false}
                  tickLine={false}
                />
              </>
            )}
            {showTooltip && (
              <Tooltip content={<CustomTooltip format={yAxisFormat} />} cursor={{stroke: '#3E7274', strokeWidth: 1}} />
            )}
            {showLegend && <Legend wrapperStyle={{paddingTop: '20px'}} />}
            {activeSeries.map((s, i) => (
              <Area
                key={s.dataColumn}
                type="monotone"
                dataKey={s.dataColumn}
                name={s.label}
                stroke={getColor(i, s.colour)}
                fill={getColor(i, s.colour)}
                fillOpacity={0.2}
                strokeWidth={2}
                stackId={isStacked ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )

    case 'pie':
    case 'donut': {
      // For pie/donut, use first series dataColumn as value and xAxisKey as label
      const pieDataColumn = activeSeries[0]?.dataColumn || Object.keys(data[0] || {})[1] || ''
      const pieData = data.map((row, index) => ({
        name: String(row[xAxisKey]),
        value: Number(row[pieDataColumn]) || 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))

      // Custom label renderer for cleaner pie labels (only show in full view, not thumbnails)
      const renderCustomLabel = showLegend
        ? ({cx, cy, midAngle, innerRadius, outerRadius, percent, name}: any) => {
            if (percent < 0.05) return null // Don't show labels for small slices
            const RADIAN = Math.PI / 180
            const radius = outerRadius * 1.2
            const x = cx + radius * Math.cos(-midAngle * RADIAN)
            const y = cy + radius * Math.sin(-midAngle * RADIAN)
            return (
              <text
                x={x}
                y={y}
                fill="#5F5F5F"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={11}
              >
                {`${name} (${(percent * 100).toFixed(0)}%)`}
              </text>
            )
          }
        : false

      // Use larger outerRadius for thumbnails to fill the space better
      const outerRadius = showLegend ? '70%' : '85%'
      const innerRadius = trimmedChartType === 'donut' ? (showLegend ? '50%' : '55%') : 0

      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={trimmedChartType === 'donut' ? 3 : 1}
              label={renderCustomLabel}
              labelLine={showLegend ? {stroke: '#BDBDBD', strokeWidth: 1} : false}
              stroke="#fff"
              strokeWidth={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip
                formatter={(value: number) => formatValue(value, yAxisFormat)}
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
            )}
            {showLegend && <Legend wrapperStyle={{paddingTop: '20px'}} />}
          </PieChart>
        </ResponsiveContainer>
      )
    }

    case 'scatter': {
      // Scatter needs x and y coordinates - use first two data columns
      const xKey = activeSeries[0]?.dataColumn || xAxisKey
      const yKey = activeSeries[1]?.dataColumn || (Object.keys(data[0] || {})[1] ?? '')

      return (
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{top: 20, right: 30, left: 20, bottom: 20}}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis
              type="number"
              dataKey={xKey}
              name={xAxisLabel || xKey}
              label={xAxisLabel ? {value: xAxisLabel, position: 'bottom', offset: 0} : undefined}
              tick={{fontSize: 11}}
            />
            <YAxis
              type="number"
              dataKey={yKey}
              name={yAxisLabel || yKey}
              tickFormatter={yAxisTickFormatter}
              label={
                yAxisLabel
                  ? {value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 10}
                  : undefined
              }
              tick={{fontSize: 11}}
            />
            {showTooltip && <Tooltip cursor={{strokeDasharray: '3 3'}} />}
            {showLegend && <Legend />}
            <Scatter
              name={activeSeries[0]?.label || 'Data'}
              data={data}
              fill={getColor(0, activeSeries[0]?.colour)}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )
    }

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data} margin={{top: 20, right: 30, bottom: 20, left: 30}}>
            <PolarGrid stroke="#e0e0e0" />
            {/* PolarAngleAxis is required for radar to render - always include but hide ticks in thumbnail mode */}
            <PolarAngleAxis dataKey={xAxisKey} tick={showAxes ? {fontSize: 11, fill: '#5F5F5F'} : false} />
            {showAxes && <PolarRadiusAxis tick={{fontSize: 10, fill: '#5F5F5F'}} />}
            {activeSeries.map((s, i) => (
              <Radar
                key={s.dataColumn}
                name={s.label}
                dataKey={s.dataColumn}
                stroke={getColor(i, s.colour)}
                fill={getColor(i, s.colour)}
                fillOpacity={0.4}
                strokeWidth={2}
              />
            ))}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </RadarChart>
        </ResponsiveContainer>
      )

    case 'composed':
      // Mixed chart - first series as bars, rest as lines
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            {showAxes && (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  label={xAxisLabel ? {value: xAxisLabel, position: 'bottom', offset: 0} : undefined}
                  tick={{fontSize: 11}}
                />
                <YAxis
                  tickFormatter={yAxisTickFormatter}
                  label={
                    yAxisLabel
                      ? {value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 10}
                      : undefined
                  }
                  tick={{fontSize: 11}}
                />
              </>
            )}
            {showTooltip && (
              <Tooltip content={<CustomTooltip format={yAxisFormat} />} />
            )}
            {showLegend && <Legend />}
            {activeSeries.map((s, i) =>
              i === 0 ? (
                <Bar
                  key={s.dataColumn}
                  dataKey={s.dataColumn}
                  name={s.label}
                  fill={getColor(i, s.colour)}
                  radius={[4, 4, 0, 0]}
                />
              ) : (
                <Line
                  key={s.dataColumn}
                  type="monotone"
                  dataKey={s.dataColumn}
                  name={s.label}
                  stroke={getColor(i, s.colour)}
                  strokeWidth={2}
                  dot={false}
                />
              ),
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )

    case 'waterfall': {
      // Waterfall chart - calculate cumulative values
      let cumulative = 0
      const waterfallData = data.map((row, index) => {
        const value = Number(row[activeSeries[0]?.dataColumn]) || 0
        const start = cumulative
        cumulative += value
        return {
          name: String(row[xAxisKey]),
          value: Math.abs(value),
          start: value >= 0 ? start : cumulative,
          fill: index === data.length - 1 ? '#3E7274' : value >= 0 ? '#3A7862' : '#AC5359',
        }
      })

      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={waterfallData} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            {showAxes && (
              <>
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis tickFormatter={yAxisTickFormatter} tick={{fontSize: 11}} />
              </>
            )}
            {showTooltip && <Tooltip />}
            <Bar
              dataKey="value"
              shape={(props: any) => {
                const {x, y, width, height: barHeight, payload} = props
                return (
                  <Rectangle
                    x={x}
                    y={y}
                    width={width}
                    height={barHeight}
                    fill={payload.fill}
                    radius={[4, 4, 0, 0]}
                  />
                )
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    case 'gauge': {
      // Gauge chart using RadialBarChart
      const value = gaugeValue ?? (activeSeries[0] ? Number(data[0]?.[activeSeries[0].dataColumn]) : 0) ?? 0
      const percentage = (value / gaugeMax) * 100
      const gaugeData = [{name: 'Value', value: percentage, fill: getColor(0, activeSeries[0]?.colour)}]

      return (
        <ResponsiveContainer width="100%" height={height}>
          <RadialBarChart
            innerRadius="60%"
            outerRadius="90%"
            data={gaugeData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              background={{fill: '#e0e0e0'}}
              dataKey="value"
              cornerRadius={10}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{fontSize: '24px', fontWeight: 'bold', fill: '#1A1A1A'}}
            >
              {formatValue(value, yAxisFormat)}
            </text>
            <text
              x="50%"
              y="65%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{fontSize: '12px', fill: '#5F5F5F'}}
            >
              of {formatValue(gaugeMax, yAxisFormat)}
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      )
    }

    case 'treemap': {
      // Treemap - transform data for Recharts format
      const valueColumn = activeSeries[0]?.dataColumn || Object.keys(data[0] || {})[1] || ''
      const treemapData = data.map((row, index) => ({
        name: String(row[xAxisKey]),
        size: Number(row[valueColumn]) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))

      // Custom content renderer for treemap cells
      const TreemapContent = (props: {
        x?: number
        y?: number
        width?: number
        height?: number
        name?: string
        fill?: string
      }) => {
        const {x = 0, y = 0, width = 0, height: rectHeight = 0, name = '', fill = ''} = props
        return (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={rectHeight}
              fill={fill}
              stroke="#fff"
              strokeWidth={2}
              rx={4}
            />
            {width > 50 && rectHeight > 25 && (
              <text
                x={x + width / 2}
                y={y + rectHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize={11}
                fontWeight={500}
              >
                {name}
              </text>
            )}
          </g>
        )
      }

      return (
        <ResponsiveContainer width="100%" height={height}>
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            content={<TreemapContent />}
          />
        </ResponsiveContainer>
      )
    }

    case 'heatmap': {
      // Heatmap - render as a grid of cells
      // For heatmap, data should have row labels in first column, and values in subsequent columns
      const columns = Object.keys(data[0] || {}).filter((k) => k !== xAxisKey)
      const maxValue = Math.max(...data.flatMap((row) => columns.map((col) => Number(row[col]) || 0)))
      const minValue = Math.min(...data.flatMap((row) => columns.map((col) => Number(row[col]) || 0)))

      const getHeatColor = (value: number) => {
        const ratio = (value - minValue) / (maxValue - minValue || 1)
        // Gradient from light to dark green
        const r = Math.round(255 - ratio * (255 - 62))
        const g = Math.round(255 - ratio * (255 - 114))
        const b = Math.round(255 - ratio * (255 - 116))
        return `rgb(${r}, ${g}, ${b})`
      }

      const cellSize = Math.min(40, (height - 60) / data.length, 300 / columns.length)

      return (
        <div style={{width: '100%', height, overflow: 'auto', padding: '10px'}}>
          <div style={{display: 'flex', marginLeft: '80px', marginBottom: '4px'}}>
            {columns.map((col) => (
              <div
                key={col}
                style={{
                  width: cellSize,
                  fontSize: '10px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {col}
              </div>
            ))}
          </div>
          {data.map((row, rowIndex) => (
            <div key={rowIndex} style={{display: 'flex', alignItems: 'center', marginBottom: '2px'}}>
              <div
                style={{
                  width: '80px',
                  fontSize: '11px',
                  paddingRight: '8px',
                  textAlign: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {String(row[xAxisKey])}
              </div>
              {columns.map((col) => {
                const value = Number(row[col]) || 0
                return (
                  <div
                    key={col}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getHeatColor(value),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: value > (maxValue + minValue) / 2 ? '#fff' : '#1A1A1A',
                      margin: '1px',
                      borderRadius: '2px',
                    }}
                    title={`${row[xAxisKey]}, ${col}: ${formatValue(value, yAxisFormat)}`}
                  >
                    {cellSize >= 30 ? formatValue(value, yAxisFormat) : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )
    }

    default:
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height,
            color: '#6c757d',
          }}
        >
          Unsupported chart type: {chartType}
        </div>
      )
  }
}
