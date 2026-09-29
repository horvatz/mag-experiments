import type { Task, TaskStatus } from '../shared/types.ts'

export const csvColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof csvColumns[number]
export type CsvDelimiter = ';' | ','
export type CsvFilter = 'all' | TaskStatus

function quote(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function quoteValue(value: string): string {
  // Preserve the original whitespace; only these four leading characters count.
  return quote(/^[ \t\r\n]*[=+@-]/.test(value) ? `'${value}` : value)
}

export function createCsv(
  tasks: readonly Task[],
  selected: readonly CsvColumn[],
  delimiter: CsvDelimiter,
  filter: CsvFilter,
): string {
  const columns = csvColumns.filter((column) => selected.includes(column))
  const rows = tasks.filter((task) => filter === 'all' || task.status === filter)
  if (columns.length === 0 || rows.length === 0) return ''

  const header = columns.map(quote).join(delimiter)
  const records = rows.map((task) => columns.map((column) => quoteValue(task[column])).join(delimiter))
  return `\uFEFF${[header, ...records].join('\r\n')}\r\n`
}
