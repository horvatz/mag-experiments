import type { Task } from '../shared/types.ts'

export const csvColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = typeof csvColumns[number]
export type ExportStatusFilter = 'all' | Task['status']
export type CsvSeparator = ';' | ','

export const defaultCsvColumns: readonly CsvColumn[] = csvColumns
export const defaultCsvSeparator: CsvSeparator = ';'
export const defaultExportStatusFilter: ExportStatusFilter = 'all'

export function isExportStatusFilter(value: string): value is ExportStatusFilter {
  return value === 'all' || value === 'todo' || value === 'in_progress' || value === 'done'
}

export function filterExportTasks(tasks: readonly Task[], statusFilter: ExportStatusFilter) {
  return statusFilter === 'all' ? [...tasks] : tasks.filter((task) => task.status === statusFilter)
}

function csvField(value: string, neutralizeFormula: boolean) {
  let result = value
  if (neutralizeFormula && /^[ \t\r\n]*[=+\-@]/.test(result)) result = `'${result}`
  const escaped = result.replaceAll('"', '""')
  return `"${escaped}"`
}

export function createCsv(
  tasks: readonly Task[],
  selectedColumns: readonly CsvColumn[],
  separator: CsvSeparator,
  statusFilter: ExportStatusFilter,
) {
  const rows = filterExportTasks(tasks, statusFilter)
  const columns = csvColumns.filter((column) => selectedColumns.includes(column))
  const lines = [columns.map((column) => csvField(column, false)).join(separator)]
  for (const task of rows) {
    lines.push(columns.map((column) => csvField(task[column], true)).join(separator))
  }
  return '\uFEFF' + lines.join('\r\n') + '\r\n'
}

export function downloadCsv(projectId: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `folio-${projectId}.csv`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
