import type { Task, TaskStatus } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const

export type CsvColumn = (typeof CSV_COLUMNS)[number]
export type CsvFilter = 'all' | TaskStatus
export type CsvSeparator = ';' | ','

export function filterTasks(tasks: Task[], filter: CsvFilter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function quoteCsv(value: string): string {
  return '"' + value.replaceAll('"', '""') + '"'
}

export function neutralizeFormula(value: string): string {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? "'" + value : value
}

export function buildCsv(tasks: Task[], columns: readonly CsvColumn[], filter: CsvFilter, separator: CsvSeparator): string {
  const selected = CSV_COLUMNS.filter((column) => columns.includes(column))
  const rows = filterTasks(tasks, filter)
  const lines = [selected.map(quoteCsv).join(separator)]
  for (const task of rows) {
    lines.push(selected.map((column) => quoteCsv(neutralizeFormula(task[column]))).join(separator))
  }
  return '\uFEFF' + lines.map((line) => line + '\r\n').join('')
}

export function downloadCsv(projectId: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `folio-${projectId}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
