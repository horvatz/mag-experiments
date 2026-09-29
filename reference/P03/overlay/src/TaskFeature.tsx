import { useState } from 'react'
import type { FeatureContext, FeatureModel } from './feature-types.ts'
import { normalise } from './feature-utils.ts'

export function useTaskFeature({ tasks }: FeatureContext): FeatureModel {
  const [query, setQuery] = useState(''), [status, setStatus] = useState('all'), [assignee, setAssignee] = useState('all')
  const words = normalise(query).split(/\s+/).filter(Boolean)
  const people = [...new Set(tasks.map(task => task.assignee).filter(Boolean))].sort()
  const items = tasks.filter(task => {
    const text = normalise([task.id, task.title, task.description, task.assignee].join(' '))
    return words.every(word => text.includes(word)) && (status === 'all' || task.status === status) && (assignee === 'all' || task.assignee === assignee)
  })
  return { items, countItems: items, emptyMessage: 'Ni zadetkov.', controls: <div className="feature-controls">
    <label>Išči opravila<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <label>Filter stanja<select value={status} onChange={e => setStatus(e.target.value)}><option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option></select></label>
    <label>Filter odgovorne osebe<select value={assignee} onChange={e => setAssignee(e.target.value)}><option value="all">Vse osebe</option>{people.map(person => <option key={person} value={person}>{person}</option>)}</select></label>
    <button type="button" onClick={() => { setQuery(''); setStatus('all'); setAssignee('all') }}>Počisti filtre</button>
    <p role="status" aria-label="Rezultati filtriranja">Prikazano: {items.length} od {tasks.length}.</p>
  </div> }
}
