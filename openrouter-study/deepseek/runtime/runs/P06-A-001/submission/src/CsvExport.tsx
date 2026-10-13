import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Task } from '../shared/types.ts'
import { buildCsv, CSV_COLUMNS, selectRows, type CsvColumn, type CsvSeparator, type ExportFilter } from './csv.ts'

function downloadCsv(projectId: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `folio-${projectId}.csv`
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  // State is local to the mounted project view: project change and refresh reset it (R11),
  // while the Preglednica/Tabla switch keeps the same component instance (R10).
  const [selected, setSelected] = useState<ReadonlySet<CsvColumn>>(() => new Set(CSV_COLUMNS))
  const [separator, setSeparator] = useState<CsvSeparator>(';')
  const [filter, setFilter] = useState<ExportFilter>('all')
  const columns = CSV_COLUMNS.filter((column) => selected.has(column))
  const rowCount = selectRows(tasks, filter).length
  const canExport = columns.length > 0 && rowCount > 0

  const toggleColumn = (column: CsvColumn) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(column)) next.delete(column)
      else next.add(column)
      return next
    })
  }

  return <section className="export-panel" aria-label="Izvoz CSV">
    <div className="export-columns" role="group" aria-label="Stolpci izvoza">
      <span className="export-label">Stolpci</span>
      <div className="export-checkboxes">
        {CSV_COLUMNS.map((column) => <label key={column} className="export-check">
          <input type="checkbox" checked={selected.has(column)} onChange={() => toggleColumn(column)} aria-label={`Stolpec ${column}`} />
          <span>{column}</span>
        </label>)}
      </div>
    </div>
    <div className="export-settings">
      <label className="export-field">Filter izvoza
        <select value={filter} onChange={(event) => setFilter(event.target.value as ExportFilter)}>
          <option value="all">Vsa opravila</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <label className="export-field">Ločilo CSV
        <select value={separator} onChange={(event) => setSeparator(event.target.value as CsvSeparator)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <button type="button" className="button export-button" disabled={!canExport} onClick={() => downloadCsv(projectId, buildCsv(tasks, columns, separator, filter))}>
        <Download size={15} strokeWidth={1.6} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
  </section>
}
