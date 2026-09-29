import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Task } from '../shared/types.ts'
import { CSV_COLUMNS, createCsv, type CsvColumn, type CsvDelimiter, type CsvFilter } from './csv.ts'

export function CsvExport({ tasks, projectId }: { tasks: readonly Task[]; projectId: string }) {
  const [selected, setSelected] = useState<readonly CsvColumn[]>(CSV_COLUMNS)
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';')
  const [filter, setFilter] = useState<CsvFilter>('all')
  const rowCount = tasks.filter((task) => filter === 'all' || task.status === filter).length
  const disabled = selected.length === 0 || rowCount === 0

  function download() {
    const csv = createCsv(tasks, selected, delimiter, filter)
    if (csv === null) return

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `folio-${projectId}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    // Allow the browser to start the download before releasing its URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <div className="csv-export" role="group" aria-label="Nastavitve izvoza CSV">
    <fieldset className="csv-columns">
      <legend>Stolpci za izvoz</legend>
      <div className="csv-column-options">
        {CSV_COLUMNS.map((column) => <label key={column}>
          <input type="checkbox" aria-label={`Stolpec ${column}`} checked={selected.includes(column)} onChange={(event) => {
            const checked = event.target.checked
            setSelected((previous) => checked ? [...previous, column] : previous.filter((entry) => entry !== column))
          }} />
          <span>{column}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="csv-actions">
      <label className="csv-select">Ločilo CSV
        <select value={delimiter} onChange={(event) => setDelimiter(event.target.value as CsvDelimiter)}>
          <option value=";">Podpičje (;)</option><option value=",">Vejica (,)</option>
        </select>
      </label>
      <label className="csv-select">Filter izvoza
        <select value={filter} onChange={(event) => setFilter(event.target.value as CsvFilter)}>
          <option value="all">Vsa opravila</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
        </select>
      </label>
      <button type="button" className="button csv-download" disabled={disabled} onClick={download} aria-describedby="csv-hint"><Download size={15} aria-hidden="true" />Izvozi CSV</button>
    </div>
    <p className="csv-hint" id="csv-hint">{selected.length === 0 ? 'Izberi vsaj en stolpec za izvoz.' : rowCount === 0 ? 'Ni opravil za izbrani filter izvoza.' : `Število opravil za izvoz: ${rowCount}. Filter velja samo za izvoz.`}</p>
  </div>
}
