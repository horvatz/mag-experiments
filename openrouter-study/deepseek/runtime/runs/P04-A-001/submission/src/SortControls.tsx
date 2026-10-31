import type { PrimaryKey, SecondaryKey, SortDirection, SortSettings } from './sorting.ts'

const primaryOptions: { value: PrimaryKey; label: string }[] = [
  { value: 'original', label: 'Original' },
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
  onChange: (settings: SortSettings) => void
  onReset: () => void
}

export function SortControls({ settings, onChange, onReset }: SortControlsProps) {
  const update = (patch: Partial<SortSettings>) => onChange({ ...settings, ...patch })
  return <div className="sort-controls" role="group" aria-label="Razvrščanje opravil">
    <label>Primarni ključ
      <select value={settings.primary} onChange={(event) => update({ primary: event.target.value as PrimaryKey })}>
        {primaryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label>Primarna smer
      <select value={settings.primaryDirection} onChange={(event) => update({ primaryDirection: event.target.value as SortDirection })}>
        {directionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label>Sekundarni ključ
      <select value={settings.secondary} onChange={(event) => update({ secondary: event.target.value as SecondaryKey })}>
        {secondaryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label>Sekundarna smer
      <select value={settings.secondaryDirection} onChange={(event) => update({ secondaryDirection: event.target.value as SortDirection })}>
        {directionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <button type="button" className="button sort-reset" onClick={onReset}>Izvorni vrstni red</button>
  </div>
}
