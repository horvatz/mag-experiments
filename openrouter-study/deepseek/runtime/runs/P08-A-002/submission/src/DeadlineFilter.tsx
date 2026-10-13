import { CalendarRange } from 'lucide-react'
import { DEADLINE_FILTERS, DEADLINE_GROUPS, DEADLINE_LABELS, type DeadlineFilter as Filter, type DeadlineGroup } from './deadlines.ts'

export function DeadlineControls({ dateValue, filter, counts, invalidDate, onDateChange, onFilterChange }: {
  dateValue: string
  filter: Filter
  counts: Record<DeadlineGroup, number>
  invalidDate: boolean
  onDateChange: (value: string) => void
  onFilterChange: (value: Filter) => void
}) {
  return <section className="deadline-bar" aria-label="Pregled rokov">
    <div className="deadline-fields">
      <label className="deadline-field">
        <span className="deadline-label">Referenčni datum</span>
        <input type="date" value={dateValue} aria-invalid={invalidDate || undefined} onChange={(event) => onDateChange(event.target.value)} />
      </label>
      <label className="deadline-field">
        <span className="deadline-label">Pogled rokov</span>
        <select value={filter} onChange={(event) => onFilterChange(event.target.value as Filter)}>
          {DEADLINE_FILTERS.map((value) => <option key={value} value={value}>{DEADLINE_LABELS[value]}</option>)}
        </select>
      </label>
    </div>
    {invalidDate && <p className="deadline-alert" role="alert"><CalendarRange size={14} aria-hidden="true" />Vnesi veljaven referenčni datum.</p>}
    <div className="deadline-counts" aria-label="Število rokov po skupinah">
      {DEADLINE_GROUPS.map((group) => <div key={group} className="deadline-count">
        <span className="summary-label">{DEADLINE_LABELS[group]}</span>
        <strong aria-label={`Število rokov ${group}`}>{counts[group]}</strong>
      </div>)}
    </div>
  </section>
}
