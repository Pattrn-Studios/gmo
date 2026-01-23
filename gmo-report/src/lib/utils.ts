/**
 * Parse CSV string into array of objects
 */
export function parseCSV(csvString: string): Record<string, any>[] {
  if (!csvString || typeof csvString !== 'string') return []

  const lines = csvString.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const obj: Record<string, any> = {}

    headers.forEach((header, i) => {
      const val = values[i]?.trim()
      // Try to parse as number, otherwise keep as string
      const numVal = parseFloat(val)
      obj[header] = isNaN(numVal) ? val : numVal
    })

    return obj
  })
}

/**
 * Format value based on format type
 */
export function formatValue(
  value: number,
  format?: 'number' | 'percent' | 'currency'
): string {
  if (typeof value !== 'number') return String(value)

  switch (format) {
    case 'percent':
      return `${value}%`
    case 'currency':
      return `$${value.toLocaleString()}`
    default:
      return value.toLocaleString()
  }
}

/**
 * Class name utility for conditional classes
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
