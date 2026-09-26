import { useState } from 'react'
import { defaultViewState, type ViewState } from './viewState.ts'

export function ViewControls({ value, onApply }: { value: ViewState; onApply: (state: ViewState) => void }) {
  const [draft, setDraft] = useState(value)
  const apply = (state: ViewState) => {
    const next = { ...state, q: state.q.trim() }
    setDraft(next)
    onApply(next)
  }

  return <form className="view-controls" onSubmit={(event) => { event.preventDefault(); apply(draft) }}>
    <label className="view-search">Iskanje v povezavi
      <input type="search" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} />
    </label>
    <label>Stanje v povezavi
      <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ViewState['status'] })}>
        <option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
      </select>
    </label>
    <label>Vrstni red v povezavi
      <select value={draft.order} onChange={(event) => setDraft({ ...draft, order: event.target.value as ViewState['order'] })}>
        <option value="original">Izvorni vrstni red</option><option value="title-asc">Naslov naraščajoče</option><option value="title-desc">Naslov padajoče</option>
      </select>
    </label>
    <div className="view-actions">
      <button type="submit" className="button apply-view">Uporabi pogled</button>
      <button type="button" className="button" onClick={() => apply(defaultViewState)}>Ponastavi pogled</button>
    </div>
  </form>
}
