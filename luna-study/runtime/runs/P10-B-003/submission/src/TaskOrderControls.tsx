import { ArrowDown, ArrowUp } from 'lucide-react'

export function TaskOrderControls({ taskId, position, total, onMove }: {
  taskId: string
  position: number
  total: number
  onMove: (taskId: string, direction: -1 | 1) => void
}) {
  return <div className="task-order-controls">
    <span className="task-order-position" aria-label={`Mesto opravila ${taskId}`}>{position}</span>
    <button type="button" aria-label={`Premakni ${taskId} gor`} disabled={position === 1} onClick={() => onMove(taskId, -1)}><ArrowUp size={13} aria-hidden="true" /></button>
    <button type="button" aria-label={`Premakni ${taskId} dol`} disabled={position === total} onClick={() => onMove(taskId, 1)}><ArrowDown size={13} aria-hidden="true" /></button>
  </div>
}
