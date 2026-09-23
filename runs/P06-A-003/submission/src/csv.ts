import type { Task } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof CSV_COLUMNS[number]
export type CsvDelimiter = ';' | ','

function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function quoteData(value: string) {
  // Preserve the original whitespace; the apostrophe precedes the entire value.
  const safe = /^[ \t\r\n]*[=+@-]/.test(value) ? `'${value}` : value
  return quote(safe)
}

export function serializeTasksCsv(tasks: readonly Task[], selected: readonly CsvColumn[], delimiter: CsvDelimiter) {
  const columns = CSV_COLUMNS.filter((column) => selected.includes(column))
  if (columns.length === 0 || tasks.length === 0) return ''

  const rows = [
    columns.map(quote).join(delimiter),
    ...tasks.map((task) => columns.map((column) => quoteData(task[column])).join(delimiter)),
  ]
  return `\uFEFF${rows.join('\r\n')}\r\n`
}
