import { ArrowDown, ArrowUp, CalendarDays } from 'lucide-react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { Avatar, StatusIcon } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { taskUrl } from './navigation.ts'

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Pripravljeno' },
  { status: 'in_progress', label: 'V delu' },
  { status: 'done', label: 'Končano' },
]

export function TaskBoard({ tasks, onMove }: { tasks: Task[]; onMove: (id: string, direction: 'up' | 'down') => void }) {
  const positions = new Map(tasks.map((task, index) => [task.id, index + 1]))
  return <div className="board-scroll" role="region" aria-label="Tabla opravil" tabIndex={0}>
    <div className="task-board">
      {columns.map(({ status, label }) => {
        const entries = tasks.filter((task) => task.status === status)
        return <section key={status} className={`board-column board-${status}`} aria-labelledby={`column-${status}`}>
          <div className="board-column-heading">
            <StatusIcon status={status} />
            <h3 id={`column-${status}`}>{label}</h3>
            <span className="column-count" aria-label={`${entries.length} opravil`}>{entries.length}</span>
          </div>
          {entries.length === 0 ? <p className="board-empty">Ni opravil v tem stanju.</p> : <ul className="board-cards">
            {entries.map((task) => <li key={task.id} data-task-id={task.id}>
              <div className="board-card-controls">
                <span className="task-position" aria-label={`Mesto opravila ${task.id}`}>{positions.get(task.id)}</span>
                <div className="move-actions">
                  <button type="button" className="move-button" aria-label={`Premakni ${task.id} gor`} disabled={positions.get(task.id) === 1} onClick={() => onMove(task.id, 'up')}><ArrowUp size={13} aria-hidden="true" /><span>Gor</span></button>
                  <button type="button" className="move-button" aria-label={`Premakni ${task.id} dol`} disabled={positions.get(task.id) === tasks.length} onClick={() => onMove(task.id, 'down')}><ArrowDown size={13} aria-hidden="true" /><span>Dol</span></button>
                </div>
              </div>
              <a className="board-card" href={taskUrl(task.projectId, task.id, 'board')} aria-labelledby={`card-title-${task.id} card-id-${task.id}`}>
                <div className="card-topline"><span className="task-id" id={`card-id-${task.id}`}>{task.id}</span></div>
                <h4 id={`card-title-${task.id}`}>{task.title}</h4>
                <p className="card-description">{task.description}</p>
                <div className="card-footer">
                  <span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span>
                  <span className="card-date"><CalendarDays size={12} strokeWidth={1.6} aria-hidden="true" /><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></span>
                </div>
              </a>
            </li>)}
          </ul>}
        </section>
      })}
    </div>
  </div>
}
