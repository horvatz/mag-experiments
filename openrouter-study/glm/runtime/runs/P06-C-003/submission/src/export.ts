import type { Task, TaskStatus } from '../shared/types.ts'

export const EXPORT_COLUMNS = ["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const
export type ExportColumn = (typeof EXPORT_COLUMNS)[number]
export type ExportFilter = 'all' | TaskStatus
export type CsvDelimiter = ';' | ','

const BOM = '﻿'
const LINE_ENDING = '\r\n'
const FORMULA_PREFIX = /^[ \t\r\n]*[=+\-@]/

export function filterTasks(tasks: readonly Task[], filter: ExportFilter): Task[] {
  return filter === 'all' ? [...tasks] : tasks.filter((task) => task.status === filter)
}

export function quoteCsvValue(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"'
}

export function neutralizeFormula(value: string): string {
  return FORMULA_PREFIX.test(value) ? `'${value}` : value
}

export function selectedExportColumns(selected: readonly string[]): ExportColumn[] {
  return EXPORT_COLUMNS.filter((column) => selected.includes(column))
}

export function buildCsv(tasks: readonly Task[], options: {
  columns: readonly ExportColumn[]
  delimiter: CsvDelimiter
  filter: ExportFilter
}): string {
  const columns = selectedExportColumns(options.columns)
  const rows = filterTasks(tasks, options.filter)
  const lines = [
    columns.map((column) => quoteCsvValue(column)),
    ...rows.map((task) => columns.map((column) => quoteCsvValue(neutralizeFormula(task[column])))),
  ]

  return BOM + lines.map((line) => line.join(options.delimiter)).join(LINE_ENDING) + LINE_ENDING
}

export function downloadCsv(projectId: string, tasks: readonly Task[], options: {
  columns: readonly ExportColumn[]
  delimiter: CsvDelimiter
  filter: ExportFilter
}): void {
  const csv = buildCsv(tasks, options)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `folio-${projectId}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
