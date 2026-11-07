import { useEffect, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { DEFAULT_VIEW_STATE, type ViewOrder, type ViewState, type ViewStatus } from './viewState.ts'

const STATUS_OPTIONS: { value: ViewStatus; label: string }[] = [
  { value: 'all', label: 'Vsa stanja' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

const ORDER_OPTIONS: { value: ViewOrder; label: string }[] = [
  { value: 'original', label: 'Prvotni vrstni red' },
  { value: 'title-asc', label: 'Naslov A–Ž' },
  { value: 'title-desc', label: 'Naslov Ž–A' },
]

export function ViewFilters({ state, navKey, total, visible, onCommit }: {
  state: ViewState
  navKey: string
  total: number
  visible: number
  onCommit: (next: ViewState) => void
}) {
  const [draft, setDraft] = useState<ViewState>(state)

  useEffect(() => {
    setDraft({ q: state.q, status: state.status, order: state.order })
  }, [navKey, state.q, state.status, state.order])

  const apply = () => {
    const next = { ...draft, q: draft.q.trim() }
    setDraft(next)
    onCommit(next)
  }

  const reset = () => {
    setDraft(DEFAULT_VIEW_STATE)
    onCommit(DEFAULT_VIEW_STATE)
  }

  return <form className="view-filters" aria-label="Nastavitve pogleda" onSubmit={(event) => { event.preventDefault(); apply() }}>
    <div className="filter-field filter-search">
      <Search size={15} strokeWidth={1.6} aria-hidden="true" />
      <input type="search" aria-label="Iskanje v povezavi" placeholder="Iskanje v povezavi" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} />
    </div>
    <div className="filter-field">
      <select aria-label="Stanje v povezavi" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ViewStatus })}>
        {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="filter-field">
      <select aria-label="Vrstni red v povezavi" value={draft.order} onChange={(event) => setDraft({ ...draft, order: event.target.value as ViewOrder })}>
        {ORDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
    <div className="filter-actions">
      <button className="button button-primary" type="submit">Uporabi pogled</button>
      <button className="button" type="button" onClick={reset}><RotateCcw size={14} strokeWidth={1.6} aria-hidden="true" />Ponastavi pogled</button>
    </div>
    <p className="results-count" role="status" aria-label="Rezultati povezave">Prikazano: {visible} od {total}.</p>
  </form>
}
