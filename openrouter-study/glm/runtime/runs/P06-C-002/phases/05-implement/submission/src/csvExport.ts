import type { Task } from "../shared/types.ts"

export const exportColumns = ["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const
export type ExportColumn = typeof exportColumns[number]
export type ExportFilter = "all" | "todo" | "in_progress" | "done"
export type CsvDelimiter = ";" | ","
export const defaultExportColumns: readonly ExportColumn[] = exportColumns

const formulaPrefix = /^[ \t\r\n]*[=+\-@]/

function quoteCsvValue(value: string) {
  return "\"" + value.replaceAll("\"", "\"\"") + "\""
}

function neutralizeFormula(value: string) {
  return formulaPrefix.test(value) ? "\u0027" + value : value
}

function exportValue(task: Task, column: ExportColumn) {
  const value = task[column]
  return quoteCsvValue(neutralizeFormula(value))
}

export function filterTasksForExport(tasks: readonly Task[], filter: ExportFilter) {
  return filter === "all" ? [...tasks] : tasks.filter((task) => task.status === filter)
}

export function buildCsv(
  tasks: readonly Task[],
  selectedColumns: readonly ExportColumn[],
  filter: ExportFilter,
  delimiter: CsvDelimiter,
) {
  const columns = exportColumns.filter((column) => selectedColumns.includes(column))
  const filteredTasks = filterTasksForExport(tasks, filter)
  const header = columns.map((column) => quoteCsvValue(column)).join(delimiter)
  const rows = filteredTasks.map((task) => columns.map((column) => exportValue(task, column)).join(delimiter))
  return [header, ...rows].join("\r\n") + "\r\n"
}

export function createCsvBlob(
  tasks: readonly Task[],
  selectedColumns: readonly ExportColumn[],
  filter: ExportFilter,
  delimiter: CsvDelimiter,
) {
  const encoded = new TextEncoder().encode(buildCsv(tasks, selectedColumns, filter, delimiter))
  const bom = new Uint8Array([0xef, 0xbb, 0xbf])
  const bytes = new Uint8Array(bom.length + encoded.length)
  bytes.set(bom)
  bytes.set(encoded, bom.length)
  return new Blob([bytes], { type: "text/csv;charset=utf-8" })
}

export function exportCsv(options: {
  projectId: string
  tasks: readonly Task[]
  selectedColumns: readonly ExportColumn[]
  filter: ExportFilter
  delimiter: CsvDelimiter
}) {
  const blob = createCsvBlob(options.tasks, options.selectedColumns, options.filter, options.delimiter)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "folio-" + options.projectId + ".csv"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
