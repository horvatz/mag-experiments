import type { Task, TaskStatus } from '../shared/types.ts'

export const EXPORT_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const

export type ExportColumn = (typeof EXPORT_COLUMNS)[number]
export type ExportFilter = 'all' | TaskStatus
export type CsvSeparator = ';' | ','

const cellValue: Record<ExportColumn, (task: Task) => string> = {
  id: (task) => task.id,
  projectId: (task) => task.projectId,
  title: (task) => task.title,
  status: (task) => task.status,
  assignee: (task) => task.assignee,
  dueDate: (task) => task.dueDate,
  description: (task) => task.description,
}

const formulaPattern = /^[ \t\r\n]*[=+@-]/

export function neutralize(value: string) {
  return formulaPattern.test(value) ? `'${value}` : value
}

export function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

export function filterTasks(tasks: Task[], filter: ExportFilter) {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function buildCsv(columns: readonly ExportColumn[], tasks: Task[], separator: CsvSeparator) {
  const lines = [columns.map((column) => quote(column)).join(separator)]
  for (const task of tasks) {
    lines.push(columns.map((column) => quote(neutralize(cellValue[column](task)))).join(separator))
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function downloadTextFile(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
