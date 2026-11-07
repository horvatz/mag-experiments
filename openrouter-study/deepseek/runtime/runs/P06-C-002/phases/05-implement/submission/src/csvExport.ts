import type { Task, TaskStatus } from "../shared/types.ts"

export const EXPORT_COLUMNS = ["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const
export type ExportColumn = (typeof EXPORT_COLUMNS)[number]
export type ExportFilter = "all" | TaskStatus
export type ExportSeparator = ";" | ","

export interface ExportSettings {
  columns: ExportColumn[]
  filter: ExportFilter
  separator: ExportSeparator
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = { columns: [...EXPORT_COLUMNS], filter: "all", separator: ";" }

export function filterRows(tasks: Task[], filter: ExportFilter): Task[] {
  return filter === "all" ? tasks : tasks.filter((task) => task.status === filter)
}

export function neutralizeFormula(value: string): string {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? "\u0027" + value : value
}

function quoteField(value: string): string {
  return "\"" + value.split("\"").join("\"\"") + "\""
}

export function serializeCsv(tasks: Task[], settings: ExportSettings): string {
  const columns = EXPORT_COLUMNS.filter((column) => settings.columns.includes(column))
  const header = columns.map((column) => quoteField(column)).join(settings.separator)
  const lines = filterRows(tasks, settings.filter).map((task) => columns.map((column) => quoteField(neutralizeFormula(task[column]))).join(settings.separator))
  return "\uFEFF" + [header, ...lines].map((line) => line + "\r\n").join("")
}
