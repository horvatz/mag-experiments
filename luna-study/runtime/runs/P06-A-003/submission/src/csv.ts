import type { Task } from '../shared/types.ts'

export const csvColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = (typeof csvColumns)[number]
export type CsvFilter = 'all' | Task['status']

function quoteCsv(value: string) {
  const safeValue = /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}

export function createCsv(tasks: Task[], columns: CsvColumn[], delimiter: ';' | ',') {
  const orderedColumns = csvColumns.filter((column) => columns.includes(column))
  const records = [
    orderedColumns.map((column) => `"${column}"`).join(delimiter),
    ...tasks.map((task) => orderedColumns.map((column) => quoteCsv(task[column])).join(delimiter)),
  ]
  return `\uFEFF${records.join('\r\n')}\r\n`
}
