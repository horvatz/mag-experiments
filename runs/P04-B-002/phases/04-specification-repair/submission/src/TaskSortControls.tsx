import { defaultTaskSort, type SortDirection, type TaskSort } from './taskSorting.ts'

const keyOptions = <>
  <option value="title">Naslov</option>
  <option value="assignee">Odgovorna oseba</option>
  <option value="status">Stanje</option>
  <option value="dueDate">Rok</option>
</>
const directionOptions = <><option value="asc">Naraščajoče</option><option value="desc">Padajoče</option></>

export function TaskSortControls({ value, onChange }: { value: TaskSort; onChange: (value: TaskSort) => void }) {
  return <div className="sort-controls" role="group" aria-label="Razvrščanje opravil">
    <label>Primarni ključ<select value={value.primary} onChange={(event) => onChange({ ...value, primary: event.target.value as TaskSort['primary'] })}>
      <option value="original">Izvorni vrstni red</option>{keyOptions}
    </select></label>
    <label>Primarna smer<select value={value.primaryDirection} onChange={(event) => onChange({ ...value, primaryDirection: event.target.value as SortDirection })}>{directionOptions}</select></label>
    <label>Sekundarni ključ<select value={value.secondary} onChange={(event) => onChange({ ...value, secondary: event.target.value as TaskSort['secondary'] })}>
      <option value="none">Brez</option>{keyOptions}
    </select></label>
    <label>Sekundarna smer<select value={value.secondaryDirection} onChange={(event) => onChange({ ...value, secondaryDirection: event.target.value as SortDirection })}>{directionOptions}</select></label>
    <button type="button" className="button" onClick={() => onChange(defaultTaskSort)}>Izvorni vrstni red</button>
  </div>
}
