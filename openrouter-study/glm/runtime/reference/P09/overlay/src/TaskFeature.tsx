import { useState } from 'react'
import type { FeatureContext, FeatureModel } from './feature-types.ts'
import { normalise, compare } from './feature-utils.ts'
type State = { q: string; status: string; order: string }
function parse(): State {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const status = params.get('status') || 'all', order = params.get('order') || 'original'
  return { q: (params.get('q') || '').trim(), status: ['todo', 'in_progress', 'done'].includes(status) ? status : 'all', order: ['title-asc', 'title-desc'].includes(order) ? order : 'original' }
}
function apply(next: State) {
  const old = parse(), normal = { ...next, q: next.q.trim() }, params = new URLSearchParams()
  if (new URLSearchParams(window.location.hash.split('?')[1]).get('view') === 'board') params.set('view', 'board')
  if (normal.q) params.set('q', normal.q)
  if (normal.status !== 'all') params.set('status', normal.status)
  if (normal.order !== 'original') params.set('order', normal.order)
  const hash = window.location.hash.split('?')[0] + (params.size ? '?' + params.toString() : '')
  if (JSON.stringify(old) === JSON.stringify(normal)) {
    if (window.location.hash !== hash) { history.replaceState(null, '', hash); window.dispatchEvent(new HashChangeEvent('hashchange')) }
  } else window.location.hash = hash
}
function Controls({ initial, count, total }: { initial: State; count: number; total: number }) {
  const [draft, setDraft] = useState(initial)
  return <div className="feature-controls">
    <label>Iskanje v povezavi<input type="search" value={draft.q} onChange={e => setDraft({ ...draft, q: e.target.value })} /></label>
    <label>Stanje v povezavi<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option></select></label>
    <label>Vrstni red v povezavi<select value={draft.order} onChange={e => setDraft({ ...draft, order: e.target.value })}><option value="original">Izvorno</option><option value="title-asc">Naslov naraščajoče</option><option value="title-desc">Naslov padajoče</option></select></label>
    <button type="button" onClick={() => { const next = { ...draft, q: draft.q.trim() }; setDraft(next); apply(next) }}>Uporabi pogled</button>
    <button type="button" onClick={() => { const next = { q: '', status: 'all', order: 'original' }; setDraft(next); apply(next) }}>Ponastavi pogled</button>
    <p role="status" aria-label="Rezultati povezave">Prikazano: {count} od {total}.</p>
  </div>
}
export function useTaskFeature({ tasks }: FeatureContext): FeatureModel {
  const state = parse(), phrase = normalise(state.q)
  const filtered = tasks.filter(task => (state.status === 'all' || task.status === state.status) && [task.title, task.description, task.assignee, task.id].some(value => normalise(value).includes(phrase)))
  const items = state.order === 'original' ? filtered : filtered.map((task, index) => ({ task, index })).sort((a, b) => compare(normalise(a.task.title), normalise(b.task.title)) * (state.order === 'title-asc' ? 1 : -1) || a.index - b.index).map(entry => entry.task)
  return { items, emptyMessage: 'Ni zadetkov.', controls: <Controls key={window.location.hash} initial={state} count={items.length} total={tasks.length} /> }
}
