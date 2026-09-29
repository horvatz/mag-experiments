import type { Task } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof CSV_COLUMNS[number]
export type CsvSeparator = ';' | ','

function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function quoteValue(value: string) {
  // Only these four leading whitespace characters belong to the formula rule.
  const safe = /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
  return quote(safe)
}

export function createCsv(tasks: readonly Task[], selected: readonly CsvColumn[], separator: CsvSeparator): string {
  const columns = CSV_COLUMNS.filter((column) => selected.includes(column))
  const lines = [
    columns.map(quote).join(separator),
    ...tasks.map((task) => columns.map((column) => quoteValue(task[column])).join(separator)),
  ]
  return `\uFEFF${lines.join('\r\n')}\r\n`
}
