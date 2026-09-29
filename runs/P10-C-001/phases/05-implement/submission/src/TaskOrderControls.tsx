import { ArrowDown, ArrowUp } from 'lucide-react'
import type { MoveDirection } from './taskOrder.ts'

export function TaskOrderControls({ id, position, count, onMove }: {
  id: string
  position: number
  count: number
  onMove: (id: string, direction: MoveDirection) => void
}) {
  return <div className="task-order-controls">
    <span className="task-position"><span aria-hidden="true">#</span><span aria-label={`Mesto opravila ${id}`}>{position}</span></span>
    <button type="button" aria-label={`Premakni ${id} gor`} title="Premakni gor" disabled={position === 1} onClick={() => onMove(id, -1)}><ArrowUp size={14} aria-hidden="true" /></button>
    <button type="button" aria-label={`Premakni ${id} dol`} title="Premakni dol" disabled={position === count} onClick={() => onMove(id, 1)}><ArrowDown size={14} aria-hidden="true" /></button>
  </div>
}
