import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { createCsv, CSV_COLUMNS, type CsvColumn, type CsvSeparator } from './csv.ts'

type ExportFilter = 'all' | TaskStatus

const columnLabels: Record<CsvColumn, string> = {
  id: 'ID opravila',
  projectId: 'ID projekta',
  title: 'Naslov',
  status: 'Stanje',
  assignee: 'Odgovorna oseba',
  dueDate: 'Rok',
  description: 'Opis',
}

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: readonly Task[] }) {
  const [selected, setSelected] = useState<CsvColumn[]>([...CSV_COLUMNS])
  const [separator, setSeparator] = useState<CsvSeparator>(';')
  const [filter, setFilter] = useState<ExportFilter>('all')
  const rows = tasks.filter((task) => filter === 'all' || task.status === filter)
  const disabled = selected.length === 0 || rows.length === 0

  function download() {
    if (disabled) return
    const blob = new Blob([createCsv(rows, selected, separator)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `folio-${projectId}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    // Give the browser time to start reading the download before releasing it.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <div className="csv-export" role="group" aria-label="Izvoz CSV">
    <fieldset className="csv-columns">
      <legend>Stolpci izvoza</legend>
      <div className="csv-column-options">
        {CSV_COLUMNS.map((column) => <label key={column}>
          <input type="checkbox" aria-label={`Stolpec ${column}`} checked={selected.includes(column)} onChange={(event) => {
            const checked = event.currentTarget.checked
            setSelected((current) => checked ? [...current, column] : current.filter((entry) => entry !== column))
          }} />
          {columnLabels[column]}
        </label>)}
      </div>
    </fieldset>
    <div className="csv-actions">
      <label>Ločilo CSV
        <select value={separator} onChange={(event) => setSeparator(event.currentTarget.value as CsvSeparator)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <label>Filter izvoza
        <select value={filter} onChange={(event) => setFilter(event.currentTarget.value as ExportFilter)}>
          <option value="all">Vsa opravila</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <button type="button" className="button csv-download" disabled={disabled} aria-describedby="csv-export-hint" onClick={download}>
        <Download size={15} strokeWidth={1.6} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
    <p id="csv-export-hint" className="csv-hint" aria-live="polite">
      {selected.length === 0 ? 'Za izvoz izberi vsaj en stolpec.' : rows.length === 0 ? 'Za izbrani filter ni opravil za izvoz.' : `Opravila za izvoz: ${rows.length} od ${tasks.length}. Filter velja samo za izvoz.`}
    </p>
  </div>
}
