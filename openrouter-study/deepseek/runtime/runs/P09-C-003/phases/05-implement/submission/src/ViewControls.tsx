import { useState } from "react"
import { DEFAULT_VIEW_PARAMS, type ViewOrder, type ViewParams, type ViewStatus } from "./viewState.ts"

const STATUS_OPTIONS: { value: ViewStatus; label: string }[] = [
  { value: "all", label: "Vsa stanja" },
  { value: "todo", label: "Pripravljeno" },
  { value: "in_progress", label: "V delu" },
  { value: "done", label: "Končano" },
]

const ORDER_OPTIONS: { value: ViewOrder; label: string }[] = [
  { value: "original", label: "Izvirni vrstni red" },
  { value: "title-asc", label: "Naslov A–Ž" },
  { value: "title-desc", label: "Naslov Ž–A" },
]

export function ViewControls({ params, count, total, onApply, onReset }: {
  params: ViewParams
  count: number
  total: number
  onApply: (params: ViewParams) => void
  onReset: () => void
}) {
  const [draft, setDraft] = useState<ViewParams>(params)

  const apply = () => {
    const next = { ...draft, q: draft.q.trim() }
    setDraft(next)
    onApply(next)
  }

  const reset = () => {
    setDraft(DEFAULT_VIEW_PARAMS)
    onReset()
  }

  return <div className="view-controls">
    <label className="view-control view-search">
      <span>Iskanje v povezavi</span>
      <input type="search" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} />
    </label>
    <label className="view-control">
      <span>Stanje v povezavi</span>
      <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ViewStatus })}>
        {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label className="view-control">
      <span>Vrstni red v povezavi</span>
      <select value={draft.order} onChange={(event) => setDraft({ ...draft, order: event.target.value as ViewOrder })}>
        {ORDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <div className="view-actions">
      <button type="button" className="button" onClick={apply}>Uporabi pogled</button>
      <button type="button" className="button" onClick={reset}>Ponastavi pogled</button>
    </div>
    <span className="view-count" role="status" aria-label="Rezultati povezave">Prikazano: {count} od {total}.</span>
  </div>
}
