/**
 * CSV utilities for generating Excel-compatible CSV files
 * Uses BOM (Byte Order Mark) for proper UTF-8 display in Excel
 */

/**
 * Escape a CSV field value (wrap in quotes if contains comma, quote, or newline)
 */
export function escapeCsvField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Generate a CSV string from headers and data rows
 * Includes BOM for Excel UTF-8 compatibility
 */
export function generateCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  // BOM for Excel UTF-8 recognition
  const BOM = '\uFEFF'
  
  const headerRow = headers.map(h => escapeCsvField(h)).join(',')
  const dataRows = rows.map(row => 
    row.map(cell => escapeCsvField(cell)).join(',')
  ).join('\r\n')
  
  return `${BOM}${headerRow}\r\n${dataRows}`
}

/**
 * Create a Response object for CSV download
 */
export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache'
    }
  })
}

/**
 * Parse a CSV text string into headers and rows
 */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    return { headers: [], rows: [] }
  }

  // Parse with support for quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = false
          }
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          result.push(current.trim())
          current = ''
        } else if (char === '\r') {
          // skip carriage returns
        } else {
          current += char
        }
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase())
  const rows = lines.slice(1).map(line => parseLine(line))

  return { headers, rows }
}

/**
 * Default import templates for each entity type
 */
export interface TemplateDefinition {
  headers: string[]
  description: string
  notes: string
  sampleRow: string[]
}

export const importTemplates: Record<string, TemplateDefinition> = {
  students: {
    headers: ['studentid', 'fullname', 'email', 'class'],
    description: 'Required columns: studentid, fullname, email, class',
    notes: 'Class must match an existing class name (e.g., "ICT Year 1")',
    sampleRow: ['STU001', 'John Doe', 'john.doe@university.edu', 'ICT Year 1']
  },
  lecturers: {
    headers: ['employeeid', 'fullname', 'email', 'modules'],
    description: 'Required columns: employeeid, fullname, email, modules',
    notes: 'Modules should be semicolon-separated module codes (e.g., COS101;DBT301). Modules field is optional.',
    sampleRow: ['LEC001', 'John Doe', 'john.doe@university.edu', 'COS101;DBT301']
  },
  modules: {
    headers: ['code', 'name', 'program', 'class', 'lecturer_email'],
    description: 'Required columns: code, name, program. Optional: class, lecturer_email',
    notes: 'Program and class names must match existing records. Use lecturer email to assign a lecturer.',
    sampleRow: ['COS101', 'Computer Science 101', 'ICT', 'ICT Year 1', 'jane.smith@university.edu']
  },
  programs: {
    headers: ['name'],
    description: 'Required columns: name',
    notes: 'Program name must be unique. Creating a program will auto-generate 4 classes (Year 1-4).',
    sampleRow: ['Information Technology']
  }
}