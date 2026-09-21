import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { createCsv, CSV_COLUMNS, type CsvColumn, type CsvDelimiter } from './csv.ts'

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: readonly Task[] }) {
  const [columns, setColumns] = useState<readonly CsvColumn[]>(CSV_COLUMNS)
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';')
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')
  const rows = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  const enabled = columns.length > 0 && rows.length > 0

  function download() {
    if (!enabled) return
    const blob = new Blob([createCsv(rows, columns, delimiter)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `folio-${projectId}.csv`
    document.body.append(link)
    try {
      link.click()
    } finally {
      link.remove()
      // Give the browser time to start reading the download before releasing it.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }

  return <section className="csv-export" aria-labelledby="csv-title">
    <div className="csv-heading">
      <h3 id="csv-title">Izvoz CSV</h3>
      <p>Nastavitve veljajo samo za izvoz.</p>
    </div>
    <fieldset className="csv-columns">
      <legend>Stolpci</legend>
      <div className="csv-column-options">
        {CSV_COLUMNS.map((column) => <label key={column}>
          <input type="checkbox" aria-label={`Stolpec ${column}`} checked={columns.includes(column)} onChange={(event) => {
            const checked = event.currentTarget.checked
            setColumns((current) => checked ? [...current, column] : current.filter((entry) => entry !== column))
          }} />
          <span>{column}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="csv-actions">
      <label className="csv-select">Ločilo CSV
        <select value={delimiter} onChange={(event) => setDelimiter(event.currentTarget.value as CsvDelimiter)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <label className="csv-select">Filter izvoza
        <select value={filter} onChange={(event) => setFilter(event.currentTarget.value as TaskStatus | 'all')}>
          <option value="all">Vsa stanja</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <button type="button" className="button csv-download" disabled={!enabled} aria-describedby="csv-summary" onClick={download}>
        <Download size={15} strokeWidth={1.6} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
    <p id="csv-summary" className="csv-summary" role="status">
      {columns.length === 0 ? 'Izberi vsaj en stolpec.' : rows.length === 0 ? 'Za izbrani filter ni opravil za izvoz.' : `Vrstice za izvoz: ${rows.length} · Stolpci: ${columns.length}`}
    </p>
  </section>
}
