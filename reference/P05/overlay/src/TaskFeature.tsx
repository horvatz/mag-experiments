import { useState } from 'react'
import type { FeatureContext, FeatureModel } from './feature-types.ts'

export function useTaskFeature({ tasks }: FeatureContext): FeatureModel {
  const [size, setSize] = useState('all'), [filter, setFilter] = useState('all'), [page, setPage] = useState(1)
  const filtered = tasks.filter(task => filter === 'all' || task.status === filter)
  const capacity = size === 'all' ? Math.max(1, filtered.length) : Number(size)
  const pages = Math.ceil(filtered.length / capacity), current = pages ? Math.min(page, pages) : 0
  const start = current ? (current - 1) * capacity : 0
  const items = filtered.slice(start, start + capacity)
  return { items, controls: <div className="feature-controls">
    <label>Velikost strani<select value={size} onChange={e => { setSize(e.target.value); setPage(1) }}><option value="all">Vsa</option>{[2, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
    <label>Filter strani<select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}><option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option></select></label>
    <button type="button" disabled={current <= 1} onClick={() => setPage(1)}>Prva stran</button>
    <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)}>Prejšnja stran</button>
    <button type="button" disabled={!pages || current >= pages} onClick={() => setPage(current + 1)}>Naslednja stran</button>
    <button type="button" disabled={!pages || current >= pages} onClick={() => setPage(pages)}>Zadnja stran</button>
    <p role="status" aria-label="Stanje straničenja">Stran {current} od {pages}. Prikazano {current ? start + 1 : 0}–{start + items.length} od {filtered.length}.</p>
  </div> }
}
