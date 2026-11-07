import type { Task } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const

export type CsvColumn = (typeof CSV_COLUMNS)[number]
export type CsvDelimiter = ';' | ','
export type CsvFilter = 'all' | 'todo' | 'in_progress' | 'done'

export const CSV_BOM = '\uFEFF'

export function neutralizeFormula(value: string): string {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? "'" + value : value
}

export function quoteCsv(value: string): string {
  return '"' + value.replaceAll('"', '""') + '"'
}

export function buildCsv(tasks: readonly Task[], columns: readonly CsvColumn[], delimiter: CsvDelimiter): string {
  const header = columns.map((column) => quoteCsv(column)).join(delimiter)
  const rows = tasks.map((task) => columns.map((column) => quoteCsv(neutralizeFormula(task[column]))).join(delimiter))
  return CSV_BOM + [header, ...rows].join('\r\n') + '\r\n'
}
