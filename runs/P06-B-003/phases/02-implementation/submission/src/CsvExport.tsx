import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Task } from '../shared/types.ts'
import { createCsv, csvColumns, type CsvColumn, type CsvFilter, type CsvSeparator } from './csv.ts'

export function CsvExport({ projectId, tasks }: { projectId: string; tasks: readonly Task[] }) {
  const [selected, setSelected] = useState<readonly CsvColumn[]>(csvColumns)
  const [separator, setSeparator] = useState<CsvSeparator>(';')
  const [filter, setFilter] = useState<CsvFilter>('all')
  const rowCount = tasks.filter((task) => filter === 'all' || task.status === filter).length

  function download() {
    const csv = createCsv(tasks, selected, separator, filter)
    if (csv === null) return
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `folio-${projectId}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <section className="csv-export" aria-label="Izvoz opravil">
    <fieldset className="csv-columns">
      <legend>Stolpci izvoza</legend>
      <div className="csv-column-options">
        {csvColumns.map((column) => <label key={column}>
          <input type="checkbox" aria-label={`Stolpec ${column}`} checked={selected.includes(column)} onChange={(event) => {
            const checked = event.target.checked
            setSelected((current) => checked ? [...current, column] : current.filter((entry) => entry !== column))
          }} />
          {column}
        </label>)}
      </div>
    </fieldset>
    <div className="csv-actions">
      <label>Ločilo CSV
        <select value={separator} onChange={(event) => setSeparator(event.target.value as CsvSeparator)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <label>Filter izvoza
        <select value={filter} onChange={(event) => setFilter(event.target.value as CsvFilter)}>
          <option value="all">Vsa stanja</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <button type="button" className="button csv-download" disabled={selected.length === 0 || rowCount === 0} onClick={download}>
        <Download size={15} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
    <p className="csv-hint" role="status">{selected.length === 0 ? 'Za izvoz izberi vsaj en stolpec.' : rowCount === 0 ? 'Ni opravil za izbrani izvoz.' : `Število opravil za izvoz: ${rowCount}. Filter velja samo za izvoz.`}</p>
  </section>
}
