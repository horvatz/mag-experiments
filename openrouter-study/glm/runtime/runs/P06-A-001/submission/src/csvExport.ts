import type { Task, TaskStatus } from '../shared/types.ts'

export const exportColumns = [
  'id',
  'projectId',
  'title',
  'status',
  'assignee',
  'dueDate',
  'description',
] as const

export type ExportColumn = typeof exportColumns[number]
export type ExportFilter = TaskStatus | 'all'
export type ExportSeparator = ';' | ','

export const defaultExportColumns: readonly ExportColumn[] = exportColumns
export const defaultExportFilter: ExportFilter = 'all'
export const defaultExportSeparator: ExportSeparator = ';'

function csvValue(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function neutralizeFormula(value: string): string {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
}

export function taskValue(task: Task, column: ExportColumn): string {
  return neutralizeFormula(task[column])
}

export function filterTasks(tasks: readonly Task[], filter: ExportFilter): readonly Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function createCsv(
  tasks: readonly Task[],
  columns: readonly ExportColumn[],
  separator: ExportSeparator,
): string {
  const lines = [
    columns.map(csvValue).join(separator),
    ...tasks.map((task) => columns.map((column) => csvValue(taskValue(task, column))).join(separator)),
  ]

  return `\uFEFF${lines.join('\r\n')}\r\n`
}
