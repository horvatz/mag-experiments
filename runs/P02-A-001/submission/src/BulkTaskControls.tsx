import { useEffect, useRef } from 'react'
import type { TaskStatus } from '../shared/types.ts'
import type { useBulkTaskUpdate } from './useBulkTaskUpdate.ts'

type BulkUpdate = ReturnType<typeof useBulkTaskUpdate>

export function TaskSelection({ id, selected, disabled, onToggle }: {
  id: string; selected: boolean; disabled: boolean; onToggle: (id: string) => void
}) {
  return <label className="task-selection">
    <input type="checkbox" aria-label={`Izberi opravilo ${id}`} checked={selected} disabled={disabled} onChange={() => onToggle(id)} />
  </label>
}

export function BulkTaskControls({ bulk, total }: { bulk: BulkUpdate; total: number }) {
  const all = useRef<HTMLInputElement>(null)
  const count = bulk.selected.size
  useEffect(() => {
    if (all.current) all.current.indeterminate = count > 0 && count < total
  }, [count, total])

  return <div className="bulk-panel">
    <div className="bulk-controls" role="group" aria-label="Množična sprememba stanja">
      <label className="select-all"><input ref={all} type="checkbox" aria-label="Izberi vsa opravila" checked={total > 0 && count === total} disabled={total === 0 || bulk.locked} onChange={bulk.toggleAll} />Izberi vsa</label>
      <span className="selection-count" aria-label="Število izbranih opravil">Izbrano: {count}</span>
      <div className="bulk-target"><label htmlFor="bulk-status">Novo stanje</label>
        <select id="bulk-status" value={bulk.target} disabled={bulk.locked} onChange={(event) => bulk.changeTarget(event.target.value as TaskStatus | '')}>
          <option value="">Izberi stanje …</option>
          <option value="todo">Pripravljeno</option>
          <option value="in_progress">V delu</option>
          <option value="done">Končano</option>
        </select>
      </div>
      <div className="bulk-actions">
        <button type="button" className="button primary-button" disabled={bulk.locked || !count || !bulk.target} onClick={bulk.apply}>Uporabi za izbrana</button>
        {(bulk.failures.length > 0 || bulk.saving) && <button type="button" className="button" disabled={bulk.saving} onClick={bulk.retry}>Ponovi neuspele</button>}
        <button type="button" className="button" disabled={bulk.saving} onClick={bulk.clear}>Počisti izbor</button>
      </div>
    </div>
    {bulk.progress && <p className="bulk-message" role="status" aria-label="Potek množične spremembe">Shranjevanje: {bulk.progress.completed} / {bulk.progress.total} obdelanih.</p>}
    {bulk.result && <p className="bulk-message" role="status" aria-label="Rezultat množične spremembe">Uspešno: {bulk.result.successful}. Neuspešno: {bulk.result.failed}.</p>}
    {bulk.failures.length > 0 && <div className="bulk-errors">
      <p>Neuspele spremembe lahko ponoviš ali počistiš izbor za novo operacijo.</p>
      {bulk.failures.map(({ task, reason }) => <p key={task.id} role="alert"><strong>{task.id} — {task.title}:</strong> {reason}</p>)}
    </div>}
  </div>
}
