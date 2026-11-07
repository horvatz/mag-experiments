import type { SortDirection, SortKey, SecondaryKey, SortSettings } from './sorting.ts'

const primaryKeys: { value: SortKey; label: string }[] = [
  { value: 'original', label: 'izvorni' },
  { value: 'title', label: 'naslov' },
  { value: 'assignee', label: 'odgovorna oseba' },
  { value: 'status', label: 'stanje' },
  { value: 'dueDate', label: 'rok' },
]

const secondaryKeys: { value: SecondaryKey; label: string }[] = [
  { value: 'none', label: 'brez' },
  { value: 'title', label: 'naslov' },
  { value: 'assignee', label: 'odgovorna oseba' },
  { value: 'status', label: 'stanje' },
  { value: 'dueDate', label: 'rok' },
]

const directions: { value: SortDirection; label: string }[] = [
  { value: 'asc', label: 'naraščajoče' },
  { value: 'desc', label: 'padajoče' },
]

export function SortControls({ settings, onChange, onReset }: { settings: SortSettings; onChange: (settings: SortSettings) => void; onReset: () => void }) {
  const change = (patch: Partial<SortSettings>) => onChange({ ...settings, ...patch })
  return <div className='sort-controls' role='group' aria-label='Razvrščanje opravil'>
    <label className='sort-field'>
      <span>Primarni ključ</span>
      <select value={settings.primary} onChange={(event) => change({ primary: event.target.value as SortKey })}>
        {primaryKeys.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
      </select>
    </label>
    <label className='sort-field'>
      <span>Primarna smer</span>
      <select value={settings.primaryDirection} onChange={(event) => change({ primaryDirection: event.target.value as SortDirection })}>
        {directions.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
      </select>
    </label>
    <label className='sort-field'>
      <span>Sekundarni ključ</span>
      <select value={settings.secondary} onChange={(event) => change({ secondary: event.target.value as SecondaryKey })}>
        {secondaryKeys.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
      </select>
    </label>
    <label className='sort-field'>
      <span>Sekundarna smer</span>
      <select value={settings.secondaryDirection} onChange={(event) => change({ secondaryDirection: event.target.value as SortDirection })}>
        {directions.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
      </select>
    </label>
    <button type='button' className='button sort-reset' onClick={onReset}>Izvorni vrstni red</button>
  </div>
}
