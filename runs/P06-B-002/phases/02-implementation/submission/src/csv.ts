import type { Task, TaskStatus } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof CSV_COLUMNS[number]
export type CsvDelimiter = ';' | ','
export type CsvFilter = 'all' | TaskStatus

function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

export function csvValue(value: string) {
  // Only the four specified whitespace characters may precede a formula.
  return quote(/^[ \t\r\n]*[=+@-]/.test(value) ? `'${value}` : value)
}

export function createCsv(tasks: readonly Task[], selected: readonly CsvColumn[], delimiter: CsvDelimiter, filter: CsvFilter): string | null {
  const columns = CSV_COLUMNS.filter((column) => selected.includes(column))
  const rows = tasks.filter((task) => filter === 'all' || task.status === filter)
  if (columns.length === 0 || rows.length === 0) return null

  const header = columns.map(quote).join(delimiter)
  const records = rows.map((task) => columns.map((column) => csvValue(task[column])).join(delimiter))
  return `\uFEFF${[header, ...records].join('\r\n')}\r\n`
}
