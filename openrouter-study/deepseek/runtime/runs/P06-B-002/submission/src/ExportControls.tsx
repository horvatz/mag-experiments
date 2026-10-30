import { Download } from 'lucide-react'
import { EXPORT_COLUMNS, type CsvSeparator, type ExportColumn, type ExportFilter } from './exportCsv.ts'

const filterOptions: { value: ExportFilter; label: string }[] = [
  { value: 'all', label: 'Vse' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

export function ExportControls({ columns, separator, filter, canExport, onToggleColumn, onSeparatorChange, onFilterChange, onExport }: {
  columns: ReadonlySet<ExportColumn>
  separator: CsvSeparator
  filter: ExportFilter
  canExport: boolean
  onToggleColumn: (column: ExportColumn) => void
  onSeparatorChange: (separator: CsvSeparator) => void
  onFilterChange: (filter: ExportFilter) => void
  onExport: () => void
}) {
  return <div className="export-controls" role="group" aria-label="Nastavitve izvoza CSV">
    <fieldset className="export-columns">
      <legend>Stolpci izvoza</legend>
      {EXPORT_COLUMNS.map((column) => <label key={column} className="export-check">
        <input type="checkbox" checked={columns.has(column)} onChange={() => onToggleColumn(column)} />
        <span>Stolpec {column}</span>
      </label>)}
    </fieldset>
    <div className="export-options">
      <label className="export-field">
        <span>Ločilo CSV</span>
        <select aria-label="Ločilo CSV" value={separator} onChange={(event) => onSeparatorChange(event.target.value as CsvSeparator)}>
          <option value=";">Podpičje (;)</option>
          <option value=",">Vejica (,)</option>
        </select>
      </label>
      <label className="export-field">
        <span>Filter izvoza</span>
        <select aria-label="Filter izvoza" value={filter} onChange={(event) => onFilterChange(event.target.value as ExportFilter)}>
          {filterOptions.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
        </select>
      </label>
      <button type="button" className="button export-button" disabled={!canExport} onClick={onExport}>
        <Download size={15} aria-hidden="true" />Izvozi CSV
      </button>
    </div>
  </div>
}
