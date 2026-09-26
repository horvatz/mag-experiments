import { ArrowDown, ArrowUp } from 'lucide-react'

export function TaskOrderControls({ id, position, count, onMove }: {
  id: string
  position: number
  count: number
  onMove: (id: string, direction: -1 | 1) => void
}) {
  return <div className="task-order-controls">
    <span className="task-position" aria-label={`Mesto opravila ${id}`}>{position}</span>
    <button type="button" aria-label={`Premakni ${id} gor`} disabled={position <= 1} onClick={() => onMove(id, -1)}><ArrowUp size={14} aria-hidden="true" /></button>
    <button type="button" aria-label={`Premakni ${id} dol`} disabled={position >= count} onClick={() => onMove(id, 1)}><ArrowDown size={14} aria-hidden="true" /></button>
  </div>
}
