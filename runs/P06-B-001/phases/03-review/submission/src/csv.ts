import type { Task, TaskStatus } from '../shared/types.ts'

export const csvColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof csvColumns[number]
export type CsvDelimiter = ';' | ','
export type CsvFilter = 'all' | TaskStatus

function quote(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function quoteValue(value: string): string {
  const safeValue = /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
  return quote(safeValue)
}

export function serializeCsv(tasks: readonly Task[], selected: readonly CsvColumn[], delimiter: CsvDelimiter, filter: CsvFilter): string | null {
  const columns = csvColumns.filter((column) => selected.includes(column))
  const rows = tasks.filter((task) => filter === 'all' || task.status === filter)
  if (columns.length === 0 || rows.length === 0) return null

  const records = [
    columns.map(quote).join(delimiter),
    ...rows.map((task) => columns.map((column) => quoteValue(task[column])).join(delimiter)),
  ]
  return `\uFEFF${records.join('\r\n')}\r\n`
}
