import type { Task, TaskStatus } from '../shared/types.ts'

export const exportColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const

export type ExportColumn = (typeof exportColumns)[number]
export type CsvSeparator = ';' | ','
export type ExportFilter = 'all' | TaskStatus

export function filterTasks(tasks: Task[], filter: ExportFilter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function neutralizeFormula(value: string): string {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
}

export function quoteValue(value: string): string {
  return `"${neutralizeFormula(value).replaceAll('"', '""')}"`
}

export function buildCsv(tasks: Task[], columns: readonly ExportColumn[], separator: CsvSeparator): string {
  const header = columns.map((column) => `"${column}"`).join(separator)
  const lines = tasks.map((task) => columns.map((column) => quoteValue(String(task[column]))).join(separator))
  return [header, ...lines].join('\r\n') + '\r\n'
}
