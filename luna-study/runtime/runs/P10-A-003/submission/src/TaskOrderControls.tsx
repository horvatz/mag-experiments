import { ArrowDown, ArrowUp } from 'lucide-react'
import type { MoveDirection } from './taskOrder.ts'

export function TaskPosition({ taskId, position }: { taskId: string; position: number }) {
  return <span className="task-position" aria-label={`Mesto opravila ${taskId}`}>{position}</span>
}

export function TaskMoveButtons({
  taskId,
  position,
  total,
  onMove,
}: {
  taskId: string
  position: number
  total: number
  onMove: (id: string, direction: MoveDirection) => void
}) {
  return <span className="task-move-buttons">
    <button type="button" aria-label={`Premakni ${taskId} gor`} title={`Premakni ${taskId} gor`} disabled={position === 1} onClick={() => onMove(taskId, 'up')}><ArrowUp size={14} aria-hidden="true" /></button>
    <button type="button" aria-label={`Premakni ${taskId} dol`} title={`Premakni ${taskId} dol`} disabled={position === total} onClick={() => onMove(taskId, 'down')}><ArrowDown size={14} aria-hidden="true" /></button>
  </span>
}
