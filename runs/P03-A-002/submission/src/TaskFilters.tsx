import type { Task } from '../shared/types.ts'
import { defaultTaskFilters, type TaskFilterValues } from './filterTasks.ts'

export function TaskFilters({ tasks, values, onChange, resultCount }: {
  tasks: Task[]
  values: TaskFilterValues
  onChange: (values: TaskFilterValues) => void
  resultCount: number
}) {
  const assignees = [...new Set(tasks.map((task) => task.assignee).filter((name) => name !== ''))]

  return <div className="task-filters">
    <label className="filter-field filter-search">
      <span>Išči opravila</span>
      <input type="search" value={values.query} onChange={(event) => onChange({ ...values, query: event.target.value })} placeholder="ID, naslov, opis ali oseba" />
    </label>
    <label className="filter-field">
      <span>Filter stanja</span>
      <select value={values.status} onChange={(event) => onChange({ ...values, status: event.target.value as TaskFilterValues['status'] })}>
        <option value="all">Vsa stanja</option>
        <option value="todo">Pripravljeno</option>
        <option value="in_progress">V delu</option>
        <option value="done">Končano</option>
      </select>
    </label>
    <label className="filter-field">
      <span>Filter odgovorne osebe</span>
      <select value={values.assignee} onChange={(event) => onChange({ ...values, assignee: event.target.value })}>
        <option value="all">Vse osebe</option>
        {assignees.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
    </label>
    <button type="button" className="button clear-filters" onClick={() => onChange(defaultTaskFilters)}>Počisti filtre</button>
    <p className="filter-results" role="status" aria-label="Rezultati filtriranja">Prikazano: {resultCount} od {tasks.length}.</p>
  </div>
}
