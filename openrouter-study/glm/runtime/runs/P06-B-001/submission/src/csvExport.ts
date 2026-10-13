import type { Task } from "../shared/types.ts"

export const csvColumns = ["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const
export type CsvColumn = (typeof csvColumns)[number]
export const csvFilters = ["all", "todo", "in_progress", "done"] as const
export type CsvFilter = (typeof csvFilters)[number]
export type CsvSeparator = ";" | ","
export interface CsvOptions {
  columns: ReadonlySet<CsvColumn>
  filter: CsvFilter
  separator: CsvSeparator
}

const formulaPrefix = /^[ \t\r\n]*[=+\-@]/u
const quoteCharacter = String.fromCharCode(34)
const apostrophe = String.fromCharCode(39)

export function neutralizeFormula(value: string) {
  return formulaPrefix.test(value) ? apostrophe + value : value
}

export function quoteCsvCell(value: string, options: { neutralizeFormula?: boolean } = {}) {
  const cell = options.neutralizeFormula ? neutralizeFormula(value) : value
  return quoteCharacter + cell.replaceAll(quoteCharacter, quoteCharacter + quoteCharacter) + quoteCharacter
}

function taskCell(task: Task, column: CsvColumn) {
  return quoteCsvCell(task[column], { neutralizeFormula: true })
}

export function filterTasksForCsv(tasks: readonly Task[], filter: CsvFilter) {
  return filter === "all" ? tasks : tasks.filter((task) => task.status === filter)
}

export function buildCsv(tasks: readonly Task[], options: CsvOptions) {
  const columns = csvColumns.filter((column) => options.columns.has(column))
  const rows = [
    columns.map((column) => quoteCsvCell(column)),
    ...filterTasksForCsv(tasks, options.filter).map((task) => columns.map((column) => taskCell(task, column))),
  ]
  const records = rows.map((cells) => cells.join(options.separator)).join("\r\n")
  return "\uFEFF" + records + "\r\n"
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.rel = "noopener"
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
