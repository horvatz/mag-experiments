import type { Task, TaskStatus } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof CSV_COLUMNS[number]
export type CsvDelimiter = ';' | ','
export type CsvFilter = 'all' | TaskStatus

export function neutralizeFormula(value: string): string {
  return /^[ \t\r\n]*[=+@-]/.test(value) ? `'${value}` : value
}

function quote(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

export function createCsv(
  tasks: readonly Task[],
  selected: readonly CsvColumn[],
  delimiter: CsvDelimiter,
  filter: CsvFilter,
): string | null {
  const columns = CSV_COLUMNS.filter((column) => selected.includes(column))
  const rows = tasks.filter((task) => filter === 'all' || task.status === filter)
  if (columns.length === 0 || rows.length === 0) return null

  const header = columns.map(quote).join(delimiter)
  const lines = rows.map((task) => columns.map((column) => quote(neutralizeFormula(task[column]))).join(delimiter))
  return `\uFEFF${[header, ...lines].join('\r\n')}\r\n`
}
