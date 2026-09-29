import { useState } from 'react'
import { defaultFilters, filtersEqual, normalizeFilters, projectUrl, type TaskFilters, type TaskView } from './navigation.ts'

export function ViewFilters({ filters, view, projectId, shown, total }: {
  filters: TaskFilters; view: TaskView; projectId: string; shown: number; total: number
}) {
  const [draft, setDraft] = useState<TaskFilters>(filters)

  function confirm(next: TaskFilters) {
    const committed = normalizeFilters(next)
    setDraft(committed)
    const target = projectUrl(projectId, view, committed)
    if (filtersEqual(filters, committed)) {
      if (window.location.hash !== target) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${target}`)
      }
      return
    }
    if (window.location.hash !== target) window.location.hash = target
  }

  return <div className="filter-area">
    <div className="view-filters">
      <label className="filter-control filter-search">
        <span>Iskanje v povezavi</span>
        <input type="search" value={draft.q} onChange={(event) => setDraft((value) => ({ ...value, q: event.target.value }))} />
      </label>
      <label className="filter-control">
        <span>Stanje v povezavi</span>
        <select value={draft.status} onChange={(event) => setDraft((value) => ({ ...value, status: event.target.value as TaskFilters['status'] }))}>
          <option value="all">Vsa stanja</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <label className="filter-control">
        <span>Vrstni red v povezavi</span>
        <select value={draft.order} onChange={(event) => setDraft((value) => ({ ...value, order: event.target.value as TaskFilters['order'] }))}>
          <option value="original">Izvirni vrstni red</option>
          <option value="title-asc">Naslov naraščajoče</option>
          <option value="title-desc">Naslov padajoče</option>
        </select>
      </label>
      <div className="filter-actions">
        <button type="button" className="button primary-button" onClick={() => confirm(draft)}>Uporabi pogled</button>
        <button type="button" className="button" onClick={() => confirm(defaultFilters)}>Ponastavi pogled</button>
      </div>
    </div>
    <p className="result-count" role="status" aria-label="Rezultati povezave">Prikazano: {shown} od {total}.</p>
  </div>
}
