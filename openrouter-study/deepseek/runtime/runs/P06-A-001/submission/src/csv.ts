import type { Task, TaskStatus } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const

export type CsvColumn = (typeof CSV_COLUMNS)[number]
export type ExportFilter = 'all' | TaskStatus
export type CsvSeparator = ';' | ','

const FORMULA_TRIGGERS = new Set(['=', '+', '-', '@'])

// R08: an apostrophe is prepended to the original string when it starts with a
// formula trigger after any leading space, tab, CR or LF characters.
export function neutralizeFormula(value: string): string {
  const rest = value.replace(/^[ \t\r\n]+/, '')
  return rest.length > 0 && FORMULA_TRIGGERS.has(rest[0]) ? `'${value}` : value
}

// R06: every header and value is quoted; inner double quotes are doubled.
export function quote(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

// R01/R04: source order is preserved; the filter only limits exported rows.
export function selectRows(tasks: Task[], filter: ExportFilter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

// R01-R09: BOM, fixed column order, quoting, separator, CRLF after every row.
export function buildCsv(tasks: Task[], columns: readonly CsvColumn[], separator: CsvSeparator, filter: ExportFilter): string {
  const lines = [columns.map((column) => quote(column)).join(separator)]
  for (const task of selectRows(tasks, filter)) {
    lines.push(columns.map((column) => quote(neutralizeFormula(String(task[column])))).join(separator))
  }
  return `\uFEFF${lines.map((line) => `${line}\r\n`).join('')}`
}
