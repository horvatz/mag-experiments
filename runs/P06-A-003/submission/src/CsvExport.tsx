import { Download } from 'lucide-react'
import { useId, useState } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { CSV_COLUMNS, serializeTasksCsv, type CsvColumn, type CsvDelimiter } from './csv.ts'

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: readonly Task[] }) {
  const [selected, setSelected] = useState<readonly CsvColumn[]>(CSV_COLUMNS)
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';')
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const [error, setError] = useState<string | null>(null)
  const statusId = useId()
  const rows = tasks.filter((task) => filter === 'all' || task.status === filter)
  const disabled = selected.length === 0 || rows.length === 0

  function download() {
    if (disabled) return
    setError(null)
    try {
      const csv = serializeTasksCsv(rows, selected, delimiter)
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8', endings: 'transparent' }))
      const link = document.createElement('a')
      try {
        link.href = url
        link.download = `folio-${projectId}.csv`
        document.body.append(link)
        link.click()
      } finally {
        link.remove()
        // Let the browser start consuming the download before releasing its URL.
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch {
      setError('CSV se ni mogel pripraviti. Poskusi znova.')
    }
  }

  return <section className="csv-export" aria-label="Nastavitve izvoza CSV">
    <div className="csv-export-heading">
      <h3>Izvoz CSV</h3>
      <p>Izberi podatke za prenos.</p>
    </div>
    <fieldset className="csv-columns">
      <legend>Stolpci izvoza</legend>
      <div className="csv-column-options">
        {CSV_COLUMNS.map((column) => <label key={column}>
          <input type="checkbox" aria-label={`Stolpec ${column}`} checked={selected.includes(column)} onChange={(event) => {
            const checked = event.currentTarget.checked
            setSelected((current) => checked ? [...current, column] : current.filter((entry) => entry !== column))
          }} />
          <span>{column}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="csv-export-actions">
      <label className="csv-select">Ločilo CSV
        <select value={delimiter} onChange={(event) => setDelimiter(event.currentTarget.value as CsvDelimiter)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <label className="csv-select">Filter izvoza
        <select value={filter} onChange={(event) => setFilter(event.currentTarget.value as 'all' | TaskStatus)}>
          <option value="all">Vsa opravila</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <button className="button csv-download" type="button" disabled={disabled} aria-describedby={statusId} onClick={download}>
        <Download size={15} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
    <p className="csv-export-status" id={statusId} role="status">
      {selected.length === 0 ? 'Izberi vsaj en stolpec za izvoz.' : rows.length === 0 ? 'Za izbrani filter ni opravil za izvoz.' : `Število opravil za izvoz: ${rows.length}. Filter velja samo za izvoz.`}
    </p>
    {error && <p className="csv-export-error" role="alert">{error}</p>}
  </section>
}
