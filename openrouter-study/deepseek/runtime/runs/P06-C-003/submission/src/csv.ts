import type { Task } from "../shared/types.ts"

export const EXPORT_COLUMNS = ["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const
export type ExportColumn = (typeof EXPORT_COLUMNS)[number]
export type CsvSeparator = ";" | ","
export type ExportFilter = "all" | "todo" | "in_progress" | "done"

const formulaPrefixes = ["=", "+", "-", "@"]

export function neutralizeFormula(value: string): string {
  let index = 0
  while (index < value.length && (value[index] === " " || value[index] === "\t" || value[index] === "\r" || value[index] === "\n")) index += 1
  return formulaPrefixes.includes(value[index]) ? "\u0027" + value : value
}

export function quoteField(value: string): string {
  return "\"" + value.replaceAll("\"", "\"\"") + "\""
}

export function buildCsv(tasks: Task[], columns: ExportColumn[], separator: CsvSeparator): string {
  const header = columns.map(quoteField).join(separator)
  const rows = tasks.map((task) => columns.map((column) => quoteField(neutralizeFormula(task[column]))).join(separator))
  return "\uFEFF" + [header, ...rows].join("\r\n") + "\r\n"
}

export function downloadCsv(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
