import type { SortDirection, SortKey, SortState, SecondarySortKey } from './sorting.ts'

const primaryOptions: { value: SortKey; label: string }[] = [
  { value: 'original', label: 'Izvorni vrstni red' },
  { value: 'title', label: 'Naslov' },
  { value: 'assignee', label: 'Odgovorna oseba' },
  { value: 'status', label: 'Stanje' },
  { value: 'dueDate', label: 'Rok' },
]

const secondaryOptions: { value: SecondarySortKey; label: string }[] = [
  { value: 'none', label: 'Brez' },
  { value: 'title', label: 'Naslov' },
  { value: 'assignee', label: 'Odgovorna oseba' },
  { value: 'status', label: 'Stanje' },
  { value: 'dueDate', label: 'Rok' },
]

const directionOptions: { value: SortDirection; label: string }[] = [
  { value: 'asc', label: 'Naraščajoče' },
  { value: 'desc', label: 'Padajoče' },
]

export function SortControls({ state, onChange, onReset }: {
  state: SortState
  onChange: (state: SortState) => void
  onReset: () => void
}) {
  return <div className="sort-controls" role="group" aria-label="Razvrščanje opravil">
    <div className="sort-field">
      <label htmlFor="sort-primary">Primarni ključ</label>
      <select id="sort-primary" value={state.primary} onChange={(event) => onChange({ ...state, primary: event.target.value as SortKey })}>
        {primaryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="sort-field">
      <label htmlFor="sort-primary-direction">Primarna smer</label>
      <select id="sort-primary-direction" value={state.primaryDirection} onChange={(event) => onChange({ ...state, primaryDirection: event.target.value as SortDirection })}>
        {directionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="sort-field">
      <label htmlFor="sort-secondary">Sekundarni ključ</label>
      <select id="sort-secondary" value={state.secondary} onChange={(event) => onChange({ ...state, secondary: event.target.value as SecondarySortKey })}>
        {secondaryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="sort-field">
      <label htmlFor="sort-secondary-direction">Sekundarna smer</label>
      <select id="sort-secondary-direction" value={state.secondaryDirection} onChange={(event) => onChange({ ...state, secondaryDirection: event.target.value as SortDirection })}>
        {directionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <button type="button" className="button sort-reset" onClick={onReset}>Izvorni vrstni red</button>
  </div>
}
