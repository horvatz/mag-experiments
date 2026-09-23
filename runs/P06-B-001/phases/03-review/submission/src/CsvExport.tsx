import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Task } from '../shared/types.ts'
import { csvColumns, serializeCsv, type CsvColumn, type CsvDelimiter, type CsvFilter } from './csv.ts'

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: readonly Task[] }) {
  const [selected, setSelected] = useState<readonly CsvColumn[]>(csvColumns)
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';')
  const [filter, setFilter] = useState<CsvFilter>('all')
  const rowCount = tasks.filter((task) => filter === 'all' || task.status === filter).length
  const canExport = selected.length > 0 && rowCount > 0

  function download() {
    const content = serializeCsv(tasks, selected, delimiter, filter)
    if (content === null) return
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `folio-${projectId}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    // Keep the URL alive until the browser has started consuming the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <div className="csv-export" role="group" aria-label="Izvoz CSV">
    <fieldset className="csv-columns">
      <legend>Stolpci za izvoz</legend>
      <div className="csv-column-options">
        {csvColumns.map((column) => <label key={column}>
          <input type="checkbox" aria-label={`Stolpec ${column}`} checked={selected.includes(column)} onChange={(event) => {
            const checked = event.target.checked
            setSelected((current) => checked ? [...current, column] : current.filter((entry) => entry !== column))
          }} />
          <span>{column}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="csv-actions">
      <label>Ločilo CSV<select value={delimiter} onChange={(event) => setDelimiter(event.target.value as CsvDelimiter)}>
        <option value=";">Podpičje (;)</option><option value=",">Vejica (,)</option>
      </select></label>
      <label>Filter izvoza<select value={filter} onChange={(event) => setFilter(event.target.value as CsvFilter)}>
        <option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
      </select></label>
      <button type="button" className="button csv-download" disabled={!canExport} onClick={download}><Download size={15} strokeWidth={1.6} aria-hidden="true" />Izvozi CSV</button>
      <span className="csv-hint" role="status">{selected.length === 0 ? 'Izberi vsaj en stolpec.' : rowCount === 0 ? 'Ni opravil za izvoz.' : `Opravil za izvoz: ${rowCount}`}</span>
    </div>
  </div>
}
