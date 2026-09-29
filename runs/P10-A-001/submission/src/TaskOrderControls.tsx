import { ArrowDown, ArrowUp } from 'lucide-react'

export type MoveTask = (id: string, direction: -1 | 1) => void

export function TaskOrderControls({ id, position, total, onMove }: {
  id: string
  position: number
  total: number
  onMove: MoveTask
}) {
  return <div className="task-order-controls">
    <span className="order-position" title="Globalno mesto opravila" aria-label={`Mesto opravila ${id}`}>{position}</span>
    <button type="button" className="order-move" aria-label={`Premakni ${id} gor`} title={`Premakni ${id} gor`} disabled={position === 1} onClick={() => onMove(id, -1)}><ArrowUp size={16} aria-hidden="true" /></button>
    <button type="button" className="order-move" aria-label={`Premakni ${id} dol`} title={`Premakni ${id} dol`} disabled={position === total} onClick={() => onMove(id, 1)}><ArrowDown size={16} aria-hidden="true" /></button>
  </div>
}
