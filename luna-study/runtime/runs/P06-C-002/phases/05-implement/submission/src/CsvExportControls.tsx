import { useState } from 'react'
import type { Task } from '../shared/types.ts'
import { CSV_COLUMNS, serializeCsv, type CsvColumn, type CsvDelimiter, type CsvFilter } from './csvExport.ts'

export function CsvExportControls({ projectId, tasks }: { projectId: string; tasks: readonly Task[] }) {
  const [columns, setColumns] = useState<CsvColumn[]>(() => [...CSV_COLUMNS])
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';')
  const [filter, setFilter] = useState<CsvFilter>('all')
  const matchingTasks = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  const disabled = columns.length === 0 || matchingTasks.length === 0

  function toggleColumn(column: CsvColumn) {
    setColumns((current) => current.includes(column)
      ? current.filter((selected) => selected !== column)
      : [...current, column])
  }

  function download() {
    if (disabled) return
    const blob = new Blob([serializeCsv(tasks, columns, filter, delimiter)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `folio-${projectId}.csv`
    link.style.display = 'none'
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return <div className="csv-export-controls">
    <fieldset className="csv-export-columns">
      <legend>Stolpci CSV</legend>
      {CSV_COLUMNS.map((column) => <label className="csv-export-column" key={column}>
        <input type="checkbox" aria-label={`Stolpec ${column}`} checked={columns.includes(column)} onChange={() => toggleColumn(column)} />
        <span>{column}</span>
      </label>)}
    </fieldset>
    <div className="csv-export-options">
      <label>Ločilo CSV
        <select aria-label="Ločilo CSV" value={delimiter} onChange={(event) => setDelimiter(event.target.value as CsvDelimiter)}>
          <option value=";">;</option>
          <option value=",">,</option>
        </select>
      </label>
      <label>Filter izvoza
        <select aria-label="Filter izvoza" value={filter} onChange={(event) => setFilter(event.target.value as CsvFilter)}>
          <option value="all">all</option>
          <option value="todo">todo</option>
          <option value="in_progress">in_progress</option>
          <option value="done">done</option>
        </select>
      </label>
      <button className="button csv-export-button" type="button" onClick={download} disabled={disabled}>Izvozi CSV</button>
    </div>
  </div>
}
