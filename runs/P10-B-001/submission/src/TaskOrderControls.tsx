import { ArrowDown, ArrowUp } from 'lucide-react'

export type MoveTask = (id: string, direction: -1 | 1) => void

export function TaskOrderControls({ id, position, total, onMove }: {
  id: string; position: number; total: number; onMove: MoveTask
}) {
  return <div className="task-order-controls">
    <span className="task-position" aria-label={`Mesto opravila ${id}`}>{position}</span>
    <button type="button" aria-label={`Premakni ${id} gor`} title="Premakni gor" disabled={position === 1} onClick={() => onMove(id, -1)}><ArrowUp size={14} strokeWidth={1.6} aria-hidden="true" /></button>
    <button type="button" aria-label={`Premakni ${id} dol`} title="Premakni dol" disabled={position === total} onClick={() => onMove(id, 1)}><ArrowDown size={14} strokeWidth={1.6} aria-hidden="true" /></button>
  </div>
}
