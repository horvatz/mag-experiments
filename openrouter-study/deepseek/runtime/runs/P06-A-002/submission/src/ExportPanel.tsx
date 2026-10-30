import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Project, Task, TaskStatus } from '../shared/types.ts'
import { buildCsv, COLUMNS, type ColumnKey, type CsvSeparator } from './csv.ts'

type ExportFilter = 'all' | TaskStatus

const FILTERS: readonly { value: ExportFilter; label: string }[] = [
  { value: 'all', label: 'Vsa opravila' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

function downloadFile(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function ExportPanel({ project, tasks }: { project: Project; tasks: Task[] }) {
  const [selected, setSelected] = useState<ColumnKey[]>(() => COLUMNS.map((column) => column.key))
  const [separator, setSeparator] = useState<CsvSeparator>(';')
  const [filter, setFilter] = useState<ExportFilter>('all')

  const columns = COLUMNS.filter((column) => selected.includes(column.key)).map((column) => column.key)
  const rows = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  const canExport = columns.length > 0 && rows.length > 0

  const toggle = (key: ColumnKey) => {
    setSelected((current) => current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key])
  }

  return <div className="export-bar" role="group" aria-label="Nastavitve izvoza CSV">
    <div className="export-columns" role="group" aria-label="Stolpci izvoza">
      {COLUMNS.map((column) => <label key={column.key} className="export-option">
        <input type="checkbox" checked={selected.includes(column.key)} onChange={() => toggle(column.key)} />
        <span>Stolpec {column.label}</span>
      </label>)}
    </div>
    <div className="export-actions">
      <label className="export-field">
        <span>Filter izvoza</span>
        <select aria-label="Filter izvoza" value={filter} onChange={(event) => setFilter(event.target.value as ExportFilter)}>
          {FILTERS.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
        </select>
      </label>
      <label className="export-field">
        <span>Ločilo CSV</span>
        <select aria-label="Ločilo CSV" value={separator} onChange={(event) => setSeparator(event.target.value as CsvSeparator)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <button type="button" className="button export-button" disabled={!canExport} onClick={() => { if (canExport) downloadFile(`folio-${project.id}.csv`, buildCsv(rows, columns, separator)) }}>
        <Download size={15} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
  </div>
}
