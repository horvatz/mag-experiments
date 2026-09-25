import { Download } from 'lucide-react'
import { useState } from 'react'
import type { Task } from '../shared/types.ts'
import { createCsv, csvColumns, type CsvColumn, type CsvDelimiter, type CsvFilter } from './csv.ts'

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: readonly Task[] }) {
  const [selected, setSelected] = useState<readonly CsvColumn[]>(csvColumns)
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';')
  const [filter, setFilter] = useState<CsvFilter>('all')
  const hasRows = tasks.some((task) => filter === 'all' || task.status === filter)
  const enabled = selected.length > 0 && hasRows

  function download() {
    if (!enabled) return
    const csv = createCsv(tasks, selected, delimiter, filter)
    if (!csv) return
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `folio-${projectId}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <div className="csv-export">
    <fieldset className="csv-columns">
      <legend>Stolpci izvoza</legend>
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
      <label>Ločilo CSV
        <select value={delimiter} onChange={(event) => setDelimiter(event.target.value as CsvDelimiter)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <label>Filter izvoza
        <select value={filter} onChange={(event) => setFilter(event.target.value as CsvFilter)}>
          <option value="all">Vsa opravila</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <button type="button" className="button csv-download" disabled={!enabled} onClick={download}><Download size={15} aria-hidden="true" />Izvozi CSV</button>
      {!enabled && <span className="csv-hint">{selected.length === 0 ? 'Izberi vsaj en stolpec.' : 'Ni opravil za izbrane nastavitve.'}</span>}
    </div>
  </div>
}
