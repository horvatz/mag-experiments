import { Download } from 'lucide-react'
import { useState } from 'react'
import type { Task } from '../shared/types.ts'

const columns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
type Column = typeof columns[number]
type ExportFilter = 'all' | Task['status']

const headers: Record<Column, string> = {
  id: 'id',
  projectId: 'projectId',
  title: 'title',
  status: 'status',
  assignee: 'assignee',
  dueDate: 'dueDate',
  description: 'description',
}

function safeCell(value: string) {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
}

function quoteCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function makeCsv(tasks: Task[], selected: Column[], delimiter: string, filter: ExportFilter) {
  const rows = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  const header = selected.map((column) => quoteCell(headers[column])).join(delimiter)
  const body = rows.map((task) => selected
    .map((column) => quoteCell(safeCell(task[column])))
    .join(delimiter))
  return `\uFEFF${[header, ...body].join('\r\n')}\r\n`
}

function downloadCsv(projectId: string, contents: string) {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `folio-${projectId}.csv`
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const [selected, setSelected] = useState<Column[]>([...columns])
  const [delimiter, setDelimiter] = useState(';')
  const [filter, setFilter] = useState<ExportFilter>('all')
  const matchingTasks = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  const enabled = selected.length > 0 && matchingTasks.length > 0

  return <div className="csv-export" aria-label="Izvoz CSV">
    <div className="csv-export-controls">
      <label className="csv-select-label">Ločilo CSV
        <select aria-label="Ločilo CSV" value={delimiter} onChange={(event) => setDelimiter(event.target.value)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <label className="csv-select-label">Filter izvoza
        <select aria-label="Filter izvoza" value={filter} onChange={(event) => setFilter(event.target.value as ExportFilter)}>
          <option value="all">Vsa opravila</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <button className="csv-download button" type="button" disabled={!enabled} onClick={() => downloadCsv(projectId, makeCsv(tasks, columns.filter((column) => selected.includes(column)), delimiter, filter))}>
        <Download size={15} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
    <fieldset className="csv-columns">
      <legend>Stolpci izvoza</legend>
      {columns.map((column) => <label key={column}>
        <input
          type="checkbox"
          checked={selected.includes(column)}
          aria-label={`Stolpec ${column}`}
          onChange={(event) => setSelected((current) => event.target.checked
            ? [...current, column]
            : current.filter((entry) => entry !== column))}
        />
        {column}
      </label>)}
    </fieldset>
  </div>
}
