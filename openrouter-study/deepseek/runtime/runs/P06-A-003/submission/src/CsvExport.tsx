import { useState } from 'react'
import type { Task } from '../shared/types.ts'
import { buildCsv, exportColumns, filterTasks, type CsvSeparator, type ExportColumn, type ExportFilter } from './csv.ts'

const separatorOptions: { value: CsvSeparator; label: string }[] = [
  { value: ';', label: 'Podpičje (;)' },
  { value: ',', label: 'Vejica (,)' },
]

const filterOptions: { value: ExportFilter; label: string }[] = [
  { value: 'all', label: 'Vsa opravila' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

const allSelected = () => Object.fromEntries(exportColumns.map((column) => [column, true])) as Record<ExportColumn, boolean>

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const [selected, setSelected] = useState<Record<ExportColumn, boolean>>(allSelected)
  const [separator, setSeparator] = useState<CsvSeparator>(';')
  const [filter, setFilter] = useState<ExportFilter>('all')
  const columns = exportColumns.filter((column) => selected[column])
  const rows = filterTasks(tasks, filter)
  const enabled = columns.length > 0 && rows.length > 0

  const download = () => {
    if (!enabled) return
    const csv = buildCsv(rows, columns, separator)
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `folio-${projectId}.csv`
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return <div className="export-controls" role="group" aria-label="Izvoz CSV">
    <div className="export-columns" role="group" aria-label="Stolpci izvoza">
      {exportColumns.map((column) => <label key={column} className="export-column">
        <input type="checkbox" checked={selected[column]} aria-label={`Stolpec ${column}`} onChange={() => setSelected((current) => ({ ...current, [column]: !current[column] }))} />
        <span>{column}</span>
      </label>)}
    </div>
    <div className="export-options">
      <label className="export-field">Filter izvoza
        <select aria-label="Filter izvoza" value={filter} onChange={(event) => setFilter(event.target.value as ExportFilter)}>
          {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label className="export-field">Ločilo CSV
        <select aria-label="Ločilo CSV" value={separator} onChange={(event) => setSeparator(event.target.value as CsvSeparator)}>
          {separatorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <button type="button" className="button export-button" disabled={!enabled} onClick={download}>Izvozi CSV</button>
    </div>
  </div>
}
