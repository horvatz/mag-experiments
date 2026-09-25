import { deadlineGroups, type DeadlineCounts, type DeadlineFilter } from './deadlines.ts'

interface DeadlineFiltersProps {
  draft: string
  invalid: boolean
  filter: DeadlineFilter
  counts: DeadlineCounts
  onDateChange: (value: string) => void
  onFilterChange: (value: DeadlineFilter) => void
}

export function DeadlineFilters({ draft, invalid, filter, counts, onDateChange, onFilterChange }: DeadlineFiltersProps) {
  return <div className="deadline-panel">
    <div className="deadline-controls">
      <div className="deadline-field">
        <label htmlFor="reference-date">Referenčni datum</label>
        <input id="reference-date" type="date" min="0001-01-01" max="9999-12-31" value={draft}
          aria-invalid={invalid} aria-describedby={invalid ? 'reference-date-error' : undefined}
          onChange={(event) => onDateChange(event.currentTarget.value)} />
      </div>
      <div className="deadline-field">
        <label htmlFor="deadline-view">Pogled rokov</label>
        <select id="deadline-view" value={filter} onChange={(event) => onFilterChange(event.currentTarget.value as DeadlineFilter)}>
          <option value="all">Vsa opravila</option>
          {deadlineGroups.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
    </div>
    {invalid && <p className="deadline-error" id="reference-date-error" role="alert">Vnesi veljaven referenčni datum.</p>}
    <div className="deadline-counts" role="group" aria-label="Pregled rokov">
      {deadlineGroups.map(({ key, label }) => <div className="deadline-count" key={key}>
        <span>{label}</span><strong aria-label={`Število rokov ${key}`}>{counts[key]}</strong>
      </div>)}
    </div>
  </div>
}
