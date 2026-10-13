import { DEADLINE_GROUPS, DEADLINE_VIEWS, type DeadlineGroup, type DeadlineView } from './deadlines.ts'

const groupLabels: Record<DeadlineGroup, string> = {
  overdue: 'Zapadlo',
  today: 'Danes',
  week: 'Naslednjih 7 dni',
  later: 'Pozneje',
  done: 'Končano',
}

export function DeadlineControls({ dateText, view, counts, invalid, onDateChange, onViewChange }: {
  dateText: string
  view: DeadlineView
  counts: Record<DeadlineGroup, number>
  invalid: boolean
  onDateChange: (value: string) => void
  onViewChange: (value: DeadlineView) => void
}) {
  return <section className="deadline-overview" aria-label="Pregled rokov">
    <label className="deadline-field"><span>Referenčni datum</span>
      <input type="date" value={dateText} onChange={(event) => onDateChange(event.target.value)} /></label>
    <label className="deadline-field"><span>Pogled rokov</span>
      <select value={view} onChange={(event) => onViewChange(event.target.value as DeadlineView)}>
        {DEADLINE_VIEWS.map((entry) => <option key={entry} value={entry}>{entry === "all" ? "Vsi roki" : groupLabels[entry as DeadlineGroup]}</option>)}
      </select></label>
    <div className="deadline-counts">
      {DEADLINE_GROUPS.map((group) => <div key={group} className="deadline-count">
        <span className="deadline-count-label">{groupLabels[group]}</span>
        <strong aria-label={`Število rokov ${group}`}>{counts[group]}</strong></div>)}
    </div>
    {invalid && <p className="deadline-alert" role="alert">Vnesi veljaven referenčni datum.</p>}
  </section>
}
