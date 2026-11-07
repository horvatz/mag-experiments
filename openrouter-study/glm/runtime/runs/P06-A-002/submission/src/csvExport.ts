import type { Task, TaskStatus } from '../shared/types.ts'

export const exportColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type ExportColumn = typeof exportColumns[number]
export type CsvSeparator = ';' | ','
export type ExportFilter = 'all' | TaskStatus

const formulaPrefix = /^[\t\r\n ]*[-+=@]/

export function csvCell(value: string, isHeader = false) {
  const safeValue = isHeader ? value : formulaPrefix.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}

export function createCsv({
  columns,
  separator,
  tasks,
}: {
  columns: readonly ExportColumn[]
  separator: CsvSeparator
  tasks: readonly Task[]
}) {
  const header = columns.map((column) => csvCell(column, true))
  const rows = tasks.map((task) => columns.map((column) => csvCell(task[column])))
  return `\uFEFF${[header, ...rows].map((row) => row.join(separator)).join('\r\n')}\r\n`
}
