import type { Task } from '../shared/types.ts'

export const csvColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof csvColumns[number]

const formulaPrefix = /^[ \t\r\n]*[=+@-]/

function safeValue(value: string) {
  return formulaPrefix.test(value) ? `'${value}` : value
}

function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

export function serializeTasks(tasks: Task[], selected: CsvColumn[], separator: ';' | ',') {
  const columns = csvColumns.filter((column) => selected.includes(column))
  const header = columns.map(quote).join(separator)
  const rows = tasks.map((task) => columns.map((column) => quote(safeValue(task[column]))).join(separator))
  return `\uFEFF${[header, ...rows].join('\r\n')}\r\n`
}
