import type { Task } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const satisfies readonly (keyof Task)[]

export type CsvColumn = typeof CSV_COLUMNS[number]
export type CsvDelimiter = ';' | ','

function quoteCell(value: string, protectFormula: boolean): string {
  const safeValue = protectFormula && /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}

export function serializeTasksCsv(tasks: Task[], columns: readonly CsvColumn[], delimiter: CsvDelimiter): string {
  const header = columns.map((column) => quoteCell(column, false)).join(delimiter)
  const rows = tasks.map((task) => columns.map((column) => quoteCell(task[column], true)).join(delimiter))
  return [header, ...rows].join('\r\n') + '\r\n'
}
