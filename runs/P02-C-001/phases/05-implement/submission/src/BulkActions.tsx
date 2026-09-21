import { useEffect, useRef } from 'react'
import type { TaskStatus } from '../shared/types.ts'
import type { useBulkStatus } from './useBulkStatus.ts'

type BulkState = ReturnType<typeof useBulkStatus>

export function BulkActions({ bulk, total }: { bulk: BulkState; total: number }) {
  const all = useRef<HTMLInputElement>(null)
  const count = bulk.selected.size
  useEffect(() => {
    if (all.current) all.current.indeterminate = count > 0 && count < total
  }, [count, total])

  return <div className="bulk-actions">
    <div className="bulk-toolbar">
      <label className="bulk-select-all"><input ref={all} type="checkbox" aria-label="Izberi vsa opravila" checked={total > 0 && count === total} disabled={bulk.locked || total === 0} onChange={bulk.toggleAll} />Izberi vsa opravila</label>
      <span className="bulk-count" aria-label="Število izbranih opravil">Izbrano: {count}</span>
      <label className="bulk-target">Novo stanje
        <select value={bulk.target} disabled={bulk.locked} onChange={(event) => bulk.changeTarget(event.target.value as TaskStatus | '')}>
          <option value="">Izberi stanje …</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </label>
      <div className="bulk-buttons">
        <button type="button" className="button bulk-primary" disabled={bulk.locked || count === 0 || !bulk.target} onClick={bulk.apply}>Uporabi za izbrana</button>
        {bulk.failures.length > 0 && <button type="button" className="button bulk-primary" disabled={bulk.busy} onClick={bulk.retry}>Ponovi neuspele</button>}
        <button type="button" className="button" disabled={bulk.busy} onClick={bulk.clear}>Počisti izbor</button>
      </div>
    </div>
    {bulk.busy && <p className="bulk-message" role="status" aria-label="Potek množične spremembe">Shranjevanje: {bulk.progress.completed} / {bulk.progress.total}.</p>}
    {!bulk.busy && bulk.result && <p className="bulk-message" role="status" aria-label="Rezultat množične spremembe">Uspešno: {bulk.result.successful}. Neuspešno: {bulk.result.failed}.</p>}
    {!bulk.busy && bulk.failures.map((failure) => <p className="bulk-error" role="alert" key={failure.id}>{failure.id} — {failure.title}: {failure.reason}</p>)}
  </div>
}
