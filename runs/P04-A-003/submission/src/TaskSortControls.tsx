import { RotateCcw } from 'lucide-react'
import { DEFAULT_SORT, type SortKey, type SortSettings } from './taskSorting.ts'

const keys: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Naslov' },
  { value: 'assignee', label: 'Odgovorna oseba' },
  { value: 'status', label: 'Stanje' },
  { value: 'dueDate', label: 'Rok' },
]

export function TaskSortControls({ settings, onChange }: {
  settings: Readonly<SortSettings>
  onChange: (settings: SortSettings) => void
}) {
  return <div className="sort-controls" role="group" aria-label="Razvrščanje opravil">
    <label>Primarni ključ
      <select value={settings.primaryKey} onChange={(event) => onChange({ ...settings, primaryKey: event.target.value as SortSettings['primaryKey'] })}>
        <option value="original">Izvorni vrstni red</option>
        {keys.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <label>Primarna smer
      <select value={settings.primaryDirection} onChange={(event) => onChange({ ...settings, primaryDirection: event.target.value as SortSettings['primaryDirection'] })}>
        <option value="asc">Naraščajoče</option><option value="desc">Padajoče</option>
      </select>
    </label>
    <label>Sekundarni ključ
      <select value={settings.secondaryKey} onChange={(event) => onChange({ ...settings, secondaryKey: event.target.value as SortSettings['secondaryKey'] })}>
        <option value="none">Brez</option>
        {keys.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <label>Sekundarna smer
      <select value={settings.secondaryDirection} onChange={(event) => onChange({ ...settings, secondaryDirection: event.target.value as SortSettings['secondaryDirection'] })}>
        <option value="asc">Naraščajoče</option><option value="desc">Padajoče</option>
      </select>
    </label>
    <button type="button" className="button" onClick={() => onChange({ ...DEFAULT_SORT })}><RotateCcw size={14} aria-hidden="true" />Izvorni vrstni red</button>
  </div>
}
