import type { Task } from '../shared/types.ts'

export type ColumnKey = keyof Task

export const COLUMNS: readonly { key: ColumnKey; label: string }[] = [
  { key: 'id', label: 'id' },
  { key: 'projectId', label: 'projectId' },
  { key: 'title', label: 'title' },
  { key: 'status', label: 'status' },
  { key: 'assignee', label: 'assignee' },
  { key: 'dueDate', label: 'dueDate' },
  { key: 'description', label: 'description' },
]

export type CsvSeparator = ';' | ','

const FORMULA_LEAD = /^[\t\r\n ]*[=+\-@]/

export function neutralizeFormula(value: string): string {
  return FORMULA_LEAD.test(value) ? `'${value}` : value
}

function quote(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

export function buildCsv(tasks: readonly Task[], columns: readonly ColumnKey[], separator: CsvSeparator): string {
  const header = columns.map((key) => quote(key)).join(separator)
  const rows = tasks.map((task) => columns.map((key) => quote(neutralizeFormula(task[key]))).join(separator))
  return `\uFEFF${[header, ...rows].join('\r\n')}\r\n`
}
