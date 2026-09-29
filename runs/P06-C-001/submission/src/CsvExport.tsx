import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Task } from '../shared/types.ts'
import { createCsv, CSV_COLUMNS, type CsvColumn, type CsvDelimiter, type CsvFilter } from './csv.ts'

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: readonly Task[] }) {
  const [columns, setColumns] = useState<readonly CsvColumn[]>(CSV_COLUMNS)
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';')
  const [filter, setFilter] = useState<CsvFilter>('all')
  const canExport = columns.length > 0 && tasks.some((task) => filter === 'all' || task.status === filter)

  function download() {
    const csv = createCsv(tasks, columns, delimiter, filter)
    if (csv === null) return
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `folio-${projectId}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return <div className="csv-export">
    <fieldset className="csv-columns">
      <legend>Stolpci izvoza</legend>
      <div className="csv-column-options">
        {CSV_COLUMNS.map((column) => <label key={column}>
          <input type="checkbox" aria-label={`Stolpec ${column}`} checked={columns.includes(column)} onChange={(event) => {
            const checked = event.target.checked
            setColumns((current) => checked ? [...current, column] : current.filter((entry) => entry !== column))
          }} />
          {column}
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
      <button type="button" className="button csv-download" disabled={!canExport} onClick={download}>
        <Download size={15} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
  </div>
}
