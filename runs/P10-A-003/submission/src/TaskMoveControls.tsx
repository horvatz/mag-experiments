import { ArrowDown, ArrowUp } from 'lucide-react'
import type { MoveDirection } from './taskOrder.ts'

export function TaskMoveControls({ id, position, total, onMove }: {
  id: string
  position: number
  total: number
  onMove: (id: string, direction: MoveDirection) => void
}) {
  return <div className="task-move-controls">
    <span className="task-position" aria-label={`Mesto opravila ${id}`} title={`Globalno mesto ${position} od ${total}`}>{position}</span>
    <button type="button" aria-label={`Premakni ${id} gor`} title={`Premakni ${id} gor`} disabled={position <= 1} onClick={() => onMove(id, -1)}><ArrowUp size={15} aria-hidden="true" /></button>
    <button type="button" aria-label={`Premakni ${id} dol`} title={`Premakni ${id} dol`} disabled={position >= total} onClick={() => onMove(id, 1)}><ArrowDown size={15} aria-hidden="true" /></button>
  </div>
}
