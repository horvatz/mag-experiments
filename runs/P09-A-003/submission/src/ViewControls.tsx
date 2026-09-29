import { useEffect, useState } from 'react'
import { readRoute, subscribeNavigation } from './navigation.ts'
import { defaultViewState, type ViewOrder, type ViewState, type ViewStatus } from './viewState.ts'

export function ViewControls({ state, apply }: { state: ViewState; apply: (state: ViewState) => void }) {
  const [draft, setDraft] = useState(state)
  useEffect(() => subscribeNavigation(() => {
    setDraft(readRoute(window.location.hash)?.state ?? defaultViewState)
  }), [])

  return <form className="view-controls" aria-label="Pogled v povezavi" onSubmit={event => {
    event.preventDefault()
    apply({ ...draft, q: draft.q.trim() })
  }}>
    <div className="view-fields">
      <label className="view-search">Iskanje v povezavi
        <input type="search" value={draft.q} onChange={event => setDraft({ ...draft, q: event.target.value })} />
      </label>
      <label>Stanje v povezavi
        <select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as ViewStatus })}>
          <option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
        </select>
      </label>
      <label>Vrstni red v povezavi
        <select value={draft.order} onChange={event => setDraft({ ...draft, order: event.target.value as ViewOrder })}>
          <option value="original">Izvorni vrstni red</option><option value="title-asc">Naslov naraščajoče</option><option value="title-desc">Naslov padajoče</option>
        </select>
      </label>
    </div>
    <div className="view-actions">
      <button className="button apply-view" type="submit">Uporabi pogled</button>
      <button className="button" type="button" onClick={() => apply(defaultViewState)}>Ponastavi pogled</button>
      <span>Spremembe potrdi z gumbom Uporabi pogled.</span>
    </div>
  </form>
}
