import type { Task, TaskStatus } from '../shared/types.ts'

export const csvColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof csvColumns[number]
export type CsvFilter = 'all' | TaskStatus
export type CsvSeparator = ';' | ','

function quote(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function neutralize(value: string): string {
  return /^[ \t\r\n]*[=+@-]/.test(value) ? `'${value}` : value
}

export function createCsv(tasks: readonly Task[], selected: readonly CsvColumn[], separator: CsvSeparator, filter: CsvFilter): string | null {
  const columns = csvColumns.filter((column) => selected.includes(column))
  const rows = tasks.filter((task) => filter === 'all' || task.status === filter)
  if (columns.length === 0 || rows.length === 0) return null

  const header = columns.map(quote).join(separator)
  const records = rows.map((task) => columns.map((column) => quote(neutralize(task[column]))).join(separator))
  return `\uFEFF${[header, ...records].join('\r\n')}\r\n`
}
