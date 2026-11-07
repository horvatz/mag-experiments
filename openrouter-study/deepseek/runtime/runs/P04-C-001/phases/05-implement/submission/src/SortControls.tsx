import type { SortDirection, SortKey, SecondaryKey, SortSettings } from './sorting.ts'

const keyOptions: { value: SortKey; label: string }[] = [
  { value: 'original', label: 'Izvirni vrstni red' },
  { value: 'title', label: 'Naslov' },
  { value: 'assignee', label: 'Odgovorna oseba' },
  { value: 'status', label: 'Stanje' },
  { value: 'dueDate', label: 'Rok' },
]

const secondaryOptions: { value: SecondaryKey; label: string }[] = [
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

interface SortControlsProps {
  settings: SortSettings
  onChange: (patch: Partial<SortSettings>) => void
  onReset: () => void
}

export function SortControls({ settings, onChange, onReset }: SortControlsProps) {
  return <div className="sort-controls" role="group" aria-label="Razvrščanje opravil">
    <div className="sort-field">
      <label htmlFor="sort-primary">Primarni ključ</label>
      <select id="sort-primary" value={settings.primary} onChange={(event) => onChange({ primary: event.target.value as SortKey })}>
        {keyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="sort-field">
      <label htmlFor="sort-primary-direction">Primarna smer</label>
      <select id="sort-primary-direction" value={settings.primaryDirection} onChange={(event) => onChange({ primaryDirection: event.target.value as SortDirection })}>
        {directionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="sort-field">
      <label htmlFor="sort-secondary">Sekundarni ključ</label>
      <select id="sort-secondary" value={settings.secondary} onChange={(event) => onChange({ secondary: event.target.value as SecondaryKey })}>
        {secondaryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="sort-field">
      <label htmlFor="sort-secondary-direction">Sekundarna smer</label>
      <select id="sort-secondary-direction" value={settings.secondaryDirection} onChange={(event) => onChange({ secondaryDirection: event.target.value as SortDirection })}>
        {directionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <button type="button" className="button sort-reset" onClick={onReset}>Izvorni vrstni red</button>
  </div>
}
