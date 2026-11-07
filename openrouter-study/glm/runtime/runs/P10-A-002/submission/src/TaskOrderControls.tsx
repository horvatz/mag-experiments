import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Task } from '../shared/types.ts'

export type MoveDirection = 'up' | 'down'

interface TaskOrderControlsProps {
  task: Task
  rank: number
  isFirst: boolean
  isLast: boolean
  onMove: (taskId: string, direction: MoveDirection) => void
  className?: string
}

export function TaskOrderControls({ task, rank, isFirst, isLast, onMove, className = '' }: TaskOrderControlsProps) {
  return <div className={`order-controls ${className}`.trim()}>
    <span className='task-rank' aria-label={`Mesto opravila ${task.id}`}>{rank}</span>
    <button type='button' className='order-button' disabled={isFirst} aria-label={`Premakni ${task.id} gor`} onClick={() => onMove(task.id, 'up')}>
      <ArrowUp size={14} strokeWidth={1.7} aria-hidden='true' />
      <span className='visually-hidden'>Premakni {task.id} gor</span>
    </button>
    <button type='button' className='order-button' disabled={isLast} aria-label={`Premakni ${task.id} dol`} onClick={() => onMove(task.id, 'down')}>
      <ArrowDown size={14} strokeWidth={1.7} aria-hidden='true' />
      <span className='visually-hidden'>Premakni {task.id} dol</span>
    </button>
  </div>
}
