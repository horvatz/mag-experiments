import { useState } from 'react'
import { defaultFilters, type ViewFilters } from './viewState.ts'

export function ViewControls({ filters, onApply }: { filters: ViewFilters; onApply: (filters: ViewFilters) => void }) {
  const [draft, setDraft] = useState(filters)

  function apply(next: ViewFilters) {
    const trimmed = { ...next, q: next.q.trim() }
    setDraft(trimmed)
    onApply(trimmed)
  }

  return <form className="view-controls" onSubmit={(event) => { event.preventDefault(); apply(draft) }}>
    <label className="view-search">Iskanje v povezavi
      <input type="search" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} />
    </label>
    <label>Stanje v povezavi
      <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ViewFilters['status'] })}>
        <option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
      </select>
    </label>
    <label>Vrstni red v povezavi
      <select value={draft.order} onChange={(event) => setDraft({ ...draft, order: event.target.value as ViewFilters['order'] })}>
        <option value="original">Izvorni vrstni red</option><option value="title-asc">Naslov naraščajoče</option><option value="title-desc">Naslov padajoče</option>
      </select>
    </label>
    <div className="view-actions">
      <button type="submit" className="button view-apply">Uporabi pogled</button>
      <button type="button" className="button" onClick={() => apply(defaultFilters)}>Ponastavi pogled</button>
    </div>
  </form>
}
