import type { Task } from '../shared/types.ts'
import { calendarDay, deadlineGroups, type DeadlineFilter, type DeadlineGroup } from './deadlines.ts'
import { formatDate } from './formatDate.ts'

interface DeadlineOverviewProps {
  draft: string
  referenceDate: string
  filter: DeadlineFilter
  groups: Record<DeadlineGroup, Task[]>
  onDateChange: (value: string) => void
  onFilterChange: (value: DeadlineFilter) => void
}

export function DeadlineOverview({ draft, referenceDate, filter, groups, onDateChange, onFilterChange }: DeadlineOverviewProps) {
  const invalid = calendarDay(draft) === null
  return <section className="deadline-overview" aria-label="Pregled rokov">
    <div className="deadline-controls">
      <div className="deadline-field">
        <label htmlFor="reference-date">Referenčni datum</label>
        <input id="reference-date" type="date" value={draft} aria-invalid={invalid} aria-describedby={invalid ? 'reference-date-error reference-date-hint' : 'reference-date-hint'} onChange={(event) => onDateChange(event.target.value)} />
      </div>
      <div className="deadline-field">
        <label htmlFor="deadline-filter">Pogled rokov</label>
        <select id="deadline-filter" value={filter} onChange={(event) => onFilterChange(event.target.value as DeadlineFilter)}>
          <option value="all">Vsa opravila</option>
          {deadlineGroups.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
    </div>
    {invalid && <p id="reference-date-error" className="deadline-error" role="alert">Vnesi veljaven referenčni datum.</p>}
    <p id="reference-date-hint" className="deadline-hint">Roki glede na {formatDate(referenceDate)}. Števci zajemajo vsa opravila projekta.</p>
    <dl className="deadline-counts">
      {deadlineGroups.map(({ key, label }) => <div key={key}>
        <dt>{label}</dt>
        <dd aria-label={`Število rokov ${key}`}>{groups[key].length}</dd>
      </div>)}
    </dl>
  </section>
}
