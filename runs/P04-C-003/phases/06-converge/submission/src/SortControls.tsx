import type { SortKey, SortSettings } from './taskSorting.ts'

const keyOptions: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Naslov' },
  { value: 'assignee', label: 'Odgovorna oseba' },
  { value: 'status', label: 'Stanje' },
  { value: 'dueDate', label: 'Rok' },
]

export function SortControls({ settings, onChange, onReset }: {
  settings: SortSettings
  onChange: (settings: SortSettings) => void
  onReset: () => void
}) {
  return <div className="sort-controls" role="group" aria-label="Razvrščanje opravil">
    <label>Primarni ključ
      <select value={settings.primary} onChange={event => onChange({ ...settings, primary: event.target.value as SortSettings['primary'] })}>
        <option value="original">Izvorni vrstni red</option>
        {keyOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <label>Primarna smer
      <select value={settings.primaryDirection} onChange={event => onChange({ ...settings, primaryDirection: event.target.value as SortSettings['primaryDirection'] })}>
        <option value="asc">Naraščajoče</option><option value="desc">Padajoče</option>
      </select>
    </label>
    <label>Sekundarni ključ
      <select value={settings.secondary} onChange={event => onChange({ ...settings, secondary: event.target.value as SortSettings['secondary'] })}>
        <option value="none">Brez</option>
        {keyOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <label>Sekundarna smer
      <select value={settings.secondaryDirection} onChange={event => onChange({ ...settings, secondaryDirection: event.target.value as SortSettings['secondaryDirection'] })}>
        <option value="asc">Naraščajoče</option><option value="desc">Padajoče</option>
      </select>
    </label>
    <button type="button" className="button" onClick={onReset}>Izvorni vrstni red</button>
  </div>
}
