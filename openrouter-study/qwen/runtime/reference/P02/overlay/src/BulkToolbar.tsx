import { useEffect, useRef } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'
import type { useBulkTasks } from './useBulkTasks.ts'
import './bulk.css'

export function BulkToolbar({ tasks, bulk }: { tasks: Task[]; bulk: ReturnType<typeof useBulkTasks> }) {
  const all = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (all.current) all.current.indeterminate = bulk.selected.length > 0 && bulk.selected.length < tasks.length
  }, [bulk.selected.length, tasks.length])

  return <div className="bulk-panel">
    <div className="bulk-toolbar">
      <label className="bulk-all"><input ref={all} type="checkbox" checked={tasks.length > 0 && bulk.selected.length === tasks.length} disabled={bulk.locked || tasks.length === 0} onChange={bulk.chooseAll} />Izberi vsa opravila</label>
      <span className="bulk-count" aria-label="Število izbranih opravil">Izbrano: {bulk.selected.length}</span>
      <label className="bulk-target">Novo stanje<select value={bulk.target} disabled={bulk.locked} onChange={(event) => { bulk.changeTarget(event.target.value as TaskStatus | '') }}>
        <option value="">Izberi stanje …</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
      </select></label>
      <button className="button bulk-apply" disabled={bulk.locked || !bulk.target || bulk.selected.length === 0} onClick={() => { void bulk.save() }}>Uporabi za izbrana</button>
      {bulk.hasFailures && <button className="button bulk-apply" disabled={bulk.busy} onClick={() => { void bulk.save(true) }}>Ponovi neuspele</button>}
      <button className="button" disabled={bulk.busy} onClick={bulk.clear}>Počisti izbor</button>
    </div>
    {bulk.busy && <p className="bulk-message" role="status" aria-label="Potek množične spremembe">Shranjevanje izbranih opravil …</p>}
    {bulk.result && <p className="bulk-message" role="status" aria-label="Rezultat množične spremembe">Uspešno: {bulk.result.successful}. Neuspešno: {bulk.result.failed}.</p>}
    {Object.entries(bulk.failures).map(([id, message]) => <p key={id} className="bulk-error" role="alert"><strong>{id} — {tasks.find((task) => task.id === id)?.title}</strong>: {message}</p>)}
  </div>
}
