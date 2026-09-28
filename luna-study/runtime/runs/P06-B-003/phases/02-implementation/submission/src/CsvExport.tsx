import { useState } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'

const columns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const satisfies readonly (keyof Task)[]
type Column = (typeof columns)[number]
type ExportFilter = 'all' | TaskStatus

const columnLabels: Record<Column, string> = {
  id: 'ID',
  projectId: 'ID projekta',
  title: 'Naslov',
  status: 'Stanje',
  assignee: 'Odgovorna oseba',
  dueDate: 'Rok',
  description: 'Opis',
}

function neutralizeFormula(value: string) {
  return /^[ \t\r\n]*[=+\-@]/.test(value) ? `'${value}` : value
}

function quoteCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function serializeCsv(tasks: Task[], selectedColumns: readonly Column[], separator: string) {
  const header = selectedColumns.map((column) => quoteCell(column)).join(separator)
  const rows = tasks.map((task) => selectedColumns
    .map((column) => quoteCell(neutralizeFormula(task[column])))
    .join(separator))
  return `\uFEFF${[header, ...rows].join('\r\n')}\r\n`
}

function downloadCsv(projectId: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `folio-${projectId}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const [selectedColumns, setSelectedColumns] = useState<Set<Column>>(() => new Set(columns))
  const [separator, setSeparator] = useState(';' as ';' | ',')
  const [filter, setFilter] = useState<ExportFilter>('all')
  const filteredTasks = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  const canExport = selectedColumns.size > 0 && filteredTasks.length > 0

  function toggleColumn(column: Column) {
    setSelectedColumns((current) => {
      const next = new Set(current)
      if (next.has(column)) next.delete(column)
      else next.add(column)
      return next
    })
  }

  function exportTasks() {
    if (!canExport) return
    downloadCsv(projectId, serializeCsv(tasks.filter((task) => filter === 'all' || task.status === filter), columns.filter((column) => selectedColumns.has(column)), separator))
  }

  return <div className="csv-export" aria-label="Izvoz CSV">
    <fieldset className="csv-columns">
      <legend>Stolpci</legend>
      {columns.map((column) => <label key={column}>
        <input type="checkbox" aria-label={`Stolpec ${column}`} checked={selectedColumns.has(column)} onChange={() => toggleColumn(column)} />
        <span>{columnLabels[column]}</span>
      </label>)}
    </fieldset>
    <div className="csv-options">
      <label>Ločilo CSV
        <select aria-label="Ločilo CSV" value={separator} onChange={(event) => setSeparator(event.target.value as ';' | ',')}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <label>Filter izvoza
        <select aria-label="Filter izvoza" value={filter} onChange={(event) => setFilter(event.target.value as ExportFilter)}>
          <option value="all">Vsa opravila</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <button className="button csv-download" type="button" onClick={exportTasks} disabled={!canExport}>Izvozi CSV</button>
    </div>
  </div>
}
