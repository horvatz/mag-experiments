import { ArrowDown, ArrowUp } from 'lucide-react'

export function TaskOrderControls({
  id,
  rank,
  count,
  onMove,
}: {
  id: string
  rank: number
  count: number
  onMove: (id: string, direction: 'up' | 'down') => void
}) {
  return <div className="task-order-controls">
    <span className="task-rank" aria-label={`Mesto opravila ${id}`}>{rank}</span>
    <button type="button" className="order-button" aria-label={`Premakni ${id} gor`} disabled={rank === 1} onClick={() => onMove(id, 'up')}><ArrowUp size={13} strokeWidth={1.6} aria-hidden="true" /></button>
    <button type="button" className="order-button" aria-label={`Premakni ${id} dol`} disabled={rank === count} onClick={() => onMove(id, 'down')}><ArrowDown size={13} strokeWidth={1.6} aria-hidden="true" /></button>
  </div>
}
