import type { Task } from '../shared/types.ts'

export const EXPORT_COLUMNS = [
  'id',
  'projectId',
  'title',
  'status',
  'assignee',
  'dueDate',
  'description',
] as const

export type ExportColumn = typeof EXPORT_COLUMNS[number]
export type ExportDelimiter = ';' | ','
export type ExportFilter = 'all' | 'todo' | 'in_progress' | 'done'

const UTF8_BOM = '\uFEFF'
const CRLF = '\r\n'
const FORMULA_PREFIX = /^[ \t\r\n]*[=+\-@]/

function quoteCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function neutralizeFormula(value: string) {
  return FORMULA_PREFIX.test(value) ? `'${value}` : value
}

export function filterTasksForExport(tasks: Task[], filter: ExportFilter) {
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
}

export function buildCsvContent({
  tasks,
  selectedColumns,
  delimiter,
  filter,
}: {
  tasks: Task[]
  selectedColumns: readonly ExportColumn[]
  delimiter: ExportDelimiter
  filter: ExportFilter
}) {
  const columns = EXPORT_COLUMNS.filter((column) => selectedColumns.includes(column))
  const filteredTasks = filterTasksForExport(tasks, filter)
  const header = columns.map(quoteCsvValue).join(delimiter)
  const rows = filteredTasks.map((task) => (
    columns
      .map((column) => quoteCsvValue(neutralizeFormula(task[column])))
      .join(delimiter)
  ))

  return `${UTF8_BOM}${[header, ...rows].join(CRLF)}${CRLF}`
}
