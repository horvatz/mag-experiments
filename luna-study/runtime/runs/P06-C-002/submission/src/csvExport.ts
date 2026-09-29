import type { Task } from '../shared/types.ts'

export const CSV_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
export type CsvColumn = (typeof CSV_COLUMNS)[number]
export type CsvFilter = 'all' | Task['status']
export type CsvDelimiter = ';' | ','

function neutralizeFormula(value: string): string {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
}

function quote(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

export function serializeCsv(tasks: readonly Task[], columns: readonly CsvColumn[], filter: CsvFilter, delimiter: CsvDelimiter): string {
  const selectedColumns = CSV_COLUMNS.filter((column) => columns.includes(column))
  const selectedTasks = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  const records = [
    selectedColumns.map(quote).join(delimiter),
    ...selectedTasks.map((task) => selectedColumns
      .map((column) => quote(neutralizeFormula(task[column])))
      .join(delimiter)),
  ]
  return `\uFEFF${records.join('\r\n')}\r\n`
}
