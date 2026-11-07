import type { PrimarySortKey, SecondarySortKey, SortingState, SortDirection } from './sorting.ts'
import { defaultSorting } from './sorting.ts'

const primaryKeys: { value: PrimarySortKey; label: string }[] = [
  { value: 'original', label: 'Izvorni vrstni red' },
  { value: 'title', label: 'Naslov' },
  { value: 'assignee', label: 'Odgovorna oseba' },
  { value: 'status', label: 'Stanje' },
  { value: 'dueDate', label: 'Rok' },
]

const secondaryKeys: { value: SecondarySortKey; label: string }[] = [
  { value: 'none', label: 'Brez' },
  { value: 'title', label: 'Naslov' },
  { value: 'assignee', label: 'Odgovorna oseba' },
  { value: 'status', label: 'Stanje' },
  { value: 'dueDate', label: 'Rok' },
]

const directions: { value: SortDirection; label: string }[] = [
  { value: 'asc', label: 'Naraščajoče' },
  { value: 'desc', label: 'Padajoče' },
]

function Select<Value extends string>({ id, label, value, options, onChange }: {
  id: string
  label: string
  value: Value
  options: { value: Value; label: string }[]
  onChange: (value: Value) => void
}) {
  return <div className="sorting-field">
    <label htmlFor={id}>{label}</label>
    <select id={id} value={value} onChange={(event) => onChange(event.target.value as Value)}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>
}

export function SortingControls({ sorting, onChange }: {
  sorting: SortingState
  onChange: (sorting: SortingState) => void
}) {
  const setPrimary = (primary: PrimarySortKey) => onChange({ ...sorting, primary })
  const setPrimaryDirection = (primaryDirection: SortDirection) => onChange({ ...sorting, primaryDirection })
  const setSecondary = (secondary: SecondarySortKey) => onChange({ ...sorting, secondary })
  const setSecondaryDirection = (secondaryDirection: SortDirection) => onChange({ ...sorting, secondaryDirection })

  return <div className="sorting-controls" aria-label="Razvrščanje opravil">
    <Select id="primary-sort-key" label="Primarni ključ" value={sorting.primary} options={primaryKeys} onChange={setPrimary} />
    <Select id="primary-sort-direction" label="Primarna smer" value={sorting.primaryDirection} options={directions} onChange={setPrimaryDirection} />
    <Select id="secondary-sort-key" label="Sekundarni ključ" value={sorting.secondary} options={secondaryKeys} onChange={setSecondary} />
    <Select id="secondary-sort-direction" label="Sekundarna smer" value={sorting.secondaryDirection} options={directions} onChange={setSecondaryDirection} />
    <button type="button" className="button reset-sort" onClick={() => onChange(defaultSorting)}>Izvorni vrstni red</button>
  </div>
}
