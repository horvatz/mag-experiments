import { CalendarDays } from 'lucide-react'
import { calendarDay, deadlineGroups, type DeadlineFilter, type DeadlineGroup } from './deadlines.ts'

interface DeadlineControlsProps {
  dateInput: string
  onDateChange: (value: string) => void
  filter: DeadlineFilter
  onFilterChange: (value: DeadlineFilter) => void
  counts: Record<DeadlineGroup, number>
}

export function DeadlineControls({ dateInput, onDateChange, filter, onFilterChange, counts }: DeadlineControlsProps) {
  const invalidDate = calendarDay(dateInput) === null
  return <section className="deadline-overview" aria-labelledby="deadlines-title">
    <h3 id="deadlines-title"><CalendarDays size={16} strokeWidth={1.6} aria-hidden="true" />Pregled rokov</h3>
    <div className="deadline-controls">
      <label htmlFor="reference-date">Referenčni datum
        <input id="reference-date" type="date" min="0001-01-01" max="9999-12-31" value={dateInput} onChange={(event) => onDateChange(event.target.value)} aria-invalid={invalidDate} aria-describedby={invalidDate ? 'reference-date-error' : undefined} />
      </label>
      <label htmlFor="deadline-filter">Pogled rokov
        <select id="deadline-filter" value={filter} onChange={(event) => onFilterChange(event.target.value as DeadlineFilter)}>
          <option value="all">Vsa opravila</option>
          {deadlineGroups.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
    </div>
    {invalidDate && <p id="reference-date-error" className="deadline-error" role="alert">Vnesi veljaven referenčni datum.</p>}
    <div className="deadline-counts" aria-label="Pregled skupin rokov">
      {deadlineGroups.map(({ key, label }) => <div key={key} className="deadline-count">
        <span>{label}</span><strong aria-label={`Število rokov ${key}`}>{counts[key]}</strong>
      </div>)}
    </div>
  </section>
}
