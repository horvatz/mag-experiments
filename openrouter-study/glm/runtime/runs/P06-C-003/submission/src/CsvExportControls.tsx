import type { Task } from '../shared/types.ts'
import { downloadCsv, filterTasks, type CsvDelimiter, type ExportColumn, type ExportFilter } from './export.ts'

const FILTERS: { value: ExportFilter; label: string }[] = [
  { value: 'all', label: 'Vsi' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

export function CsvExportControls({
  projectId,
  tasks,
  selectedColumns,
  onSelectedColumnsChange,
  delimiter,
  onDelimiterChange,
  exportFilter,
  onExportFilterChange,
}: {
  projectId: string
  tasks: Task[]
  selectedColumns: readonly ExportColumn[]
  onSelectedColumnsChange: (columns: ExportColumn[]) => void
  delimiter: CsvDelimiter
  onDelimiterChange: (delimiter: CsvDelimiter) => void
  exportFilter: ExportFilter
  onExportFilterChange: (filter: ExportFilter) => void
}) {
  const rows = filterTasks(tasks, exportFilter)
  const exportDisabled = selectedColumns.length === 0 || rows.length === 0

  function toggleColumn(column: ExportColumn, checked: boolean) {
    const next = new Set(selectedColumns)
    if (checked) next.add(column)
    else next.delete(column)
    onSelectedColumnsChange([...next])
  }

  return <div className="export-panel">
    <fieldset className="export-columns">
      <legend>Stolpci izvoza</legend>
      {(["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const).map((column) => (
        <label key={column}>
          <input
            type="checkbox"
            checked={selectedColumns.includes(column)}
            onChange={(event) => toggleColumn(column, event.target.checked)}
          />
          Stolpec {column}
        </label>
      ))}
    </fieldset>
    <label className="export-select">
      Ločilo CSV
      <select value={delimiter} onChange={(event) => onDelimiterChange(event.target.value as CsvDelimiter)}>
        <option value=";">Podpičje</option>
        <option value=",">Vejica</option>
      </select>
    </label>
    <label className="export-select">
      Filter izvoza
      <select value={exportFilter} onChange={(event) => onExportFilterChange(event.target.value as ExportFilter)}>
        {FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
      </select>
    </label>
    <button
      className="button export-button"
      type="button"
      disabled={exportDisabled}
      onClick={() => downloadCsv(projectId, tasks, { columns: selectedColumns, delimiter, filter: exportFilter })}
    >
      Izvozi CSV
    </button>
  </div>
}
