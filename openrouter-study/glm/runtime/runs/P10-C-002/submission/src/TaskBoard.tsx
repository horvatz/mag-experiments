import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { Avatar, StatusIcon } from './components.tsx'
import { formatDate } from './formatDate.ts'
import type { TaskMoveDirection } from './useTaskOrder.ts'
import { taskUrl } from './navigation.ts'

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Pripravljeno' },
  { status: 'in_progress', label: 'V delu' },
  { status: 'done', label: 'Končano' },
]

export function TaskBoard({ tasks, onMove }: { tasks: Task[]; onMove: (id: string, direction: TaskMoveDirection) => void }) {
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
            {entries.map((task) => {
              const index = tasks.findIndex((entry) => entry.id === task.id)
              return <li key={task.id} data-task-id={task.id}>
                <a className="board-card" href={taskUrl(task.projectId, task.id, 'board')} aria-labelledby={`card-title-${task.id} card-id-${task.id}`}>
                  <div className="card-topline"><span className="task-id" id={`card-id-${task.id}`}>{task.id}</span></div>
                  <h4 id={`card-title-${task.id}`}>{task.title}</h4>
                  <p className="card-description">{task.description}</p>
                  <div className="card-footer">
                    <span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span>
                    <span className="card-date"><CalendarDays size={12} strokeWidth={1.6} aria-hidden="true" /><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></span>
                  </div>
                </a>
                <div className="card-actions">
                  <span className="task-position" aria-label={`Mesto opravila ${task.id}`}>{index + 1}</span>
                  <button type="button" onClick={() => onMove(task.id, 'up')} disabled={index === 0} aria-label={`Premakni ${task.id} gor`}><ChevronUp size={14} aria-hidden="true" />gor</button>
                  <button type="button" onClick={() => onMove(task.id, 'down')} disabled={index === tasks.length - 1} aria-label={`Premakni ${task.id} dol`}><ChevronDown size={14} aria-hidden="true" />dol</button>
                </div>
              </li>
            })}
          </ul>}
        </section>
      })}
    </div>
  </div>
}
