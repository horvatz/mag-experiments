import type { Task } from "../shared/types.ts"

export const CSV_COLUMNS = ["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const
export type CsvColumn = (typeof CSV_COLUMNS)[number]
export type CsvDelimiter = ";" | ","
export type CsvExportFilter = "all" | "todo" | "in_progress" | "done"

function quoteCsvField(value: string) {
  return "\"" + value.replaceAll("\"", "\"\"") + "\""
}

function neutralizeFormula(value: string) {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? String.fromCharCode(39) + value : value
}

export function filterTasksForExport(tasks: readonly Task[], filter: CsvExportFilter) {
  return filter === "all" ? [...tasks] : tasks.filter((task) => task.status === filter)
}

export function createCsvContent(
  tasks: readonly Task[],
  columns: readonly CsvColumn[],
  delimiter: CsvDelimiter,
) {
  const selectedColumns = CSV_COLUMNS.filter((column) => columns.includes(column))
  const rows = [
    selectedColumns.map((column) => quoteCsvField(column)),
    ...tasks.map((task) => selectedColumns.map((column) => quoteCsvField(neutralizeFormula(task[column])))),
  ]
  return "\uFEFF" + rows.map((row) => row.join(delimiter)).join("\r\n") + "\r\n"
}

export function createCsvBlob(
  tasks: readonly Task[],
  columns: readonly CsvColumn[],
  delimiter: CsvDelimiter,
) {
  return new Blob([createCsvContent(tasks, columns, delimiter)], { type: "text/csv;charset=utf-8" })
}

export function createCsvFileName(projectId: string) {
  return "folio-" + projectId + ".csv"
}
