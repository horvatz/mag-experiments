import type { Task } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof CSV_COLUMNS[number]
export type CsvDelimiter = ';' | ','

function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function neutralize(value: string) {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
}

export function createCsv(tasks: readonly Task[], selected: readonly CsvColumn[], delimiter: CsvDelimiter) {
  // Iterate the canonical columns, so selection order never affects the file.
  const columns = CSV_COLUMNS.filter((column) => selected.includes(column))
  const rows = [
    columns.map(quote).join(delimiter),
    ...tasks.map((task) => columns.map((column) => quote(neutralize(task[column]))).join(delimiter)),
  ]
  return '\uFEFF' + rows.join('\r\n') + '\r\n'
}
