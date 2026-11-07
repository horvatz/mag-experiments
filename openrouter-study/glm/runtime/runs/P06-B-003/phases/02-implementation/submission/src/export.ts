import type { Project, Task, TaskStatus } from '../shared/types.ts'

export const exportColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type ExportColumn = typeof exportColumns[number]
export type ExportFilter = 'all' | TaskStatus
export type ExportSeparator = ';' | ','

export function needsFormulaNeutralization(value: string): boolean {
  return /^[ \t\r\n]*[=+\-@]/.test(value)
}

export function buildCsv({ project, tasks, selectedColumns, separator, filter }: {
  project: Project
  tasks: Task[]
  selectedColumns: ExportColumn[]
  separator: ExportSeparator
  filter: ExportFilter
}): string {
  const columns = exportColumns.filter((column) => selectedColumns.includes(column))
  const quotedColumns = columns.map((column) => '"' + column.replace(/"/g, '""') + '"')
  const rows = tasks
    .filter((task) => task.projectId === project.id && (filter === 'all' || task.status === filter))
    .map((task) => columns.map((column) => {
      const value = needsFormulaNeutralization(task[column]) ? "'" + task[column] : task[column]
      return '"' + value.replace(/"/g, '""') + '"'
    }).join(separator))

  return '\uFEFF' + [quotedColumns.join(separator), ...rows].join('\r\n') + '\r\n'
}

export function triggerCsvDownload(options: Parameters<typeof buildCsv>[0]): void {
  const csv = buildCsv(options)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = 'folio-' + options.project.id + '.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}
