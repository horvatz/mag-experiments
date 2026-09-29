import type { Task } from '../shared/types.ts'

export const CSV_COLUMNS = [
  { key: 'id', label: 'id' },
  { key: 'projectId', label: 'projectId' },
  { key: 'title', label: 'title' },
  { key: 'status', label: 'status' },
  { key: 'assignee', label: 'assignee' },
  { key: 'dueDate', label: 'dueDate' },
  { key: 'description', label: 'description' },
] as const satisfies ReadonlyArray<{ key: keyof Task; label: string }>

export type CsvColumn = (typeof CSV_COLUMNS)[number]['key']
export type CsvFilter = 'all' | Task['status']

function quoteCsv(value: string): string {
  const safeValue = /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}

export function createCsv(tasks: Task[], selected: ReadonlySet<CsvColumn>, separator: ';' | ','): string {
  const columns = CSV_COLUMNS.filter(({ key }) => selected.has(key))
  const rows = [
    columns.map(({ label }) => `"${label}"`).join(separator),
    ...tasks.map((task) => columns.map(({ key }) => quoteCsv(task[key])).join(separator)),
  ]
  return `\uFEFF${rows.join('\r\n')}\r\n`
}

export function downloadCsv(projectId: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `folio-${projectId}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
