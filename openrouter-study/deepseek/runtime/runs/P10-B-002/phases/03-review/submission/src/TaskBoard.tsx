import { ArrowDown, ArrowUp, CalendarDays } from 'lucide-react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { Avatar, StatusIcon } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { taskUrl } from './navigation.ts'
import type { MoveDirection } from './orderHistory.ts'

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Pripravljeno' },
  { status: 'in_progress', label: 'V delu' },
  { status: 'done', label: 'Končano' },
]

export function TaskBoard({ tasks, onMove }: { tasks: Task[]; onMove: (id: string, direction: MoveDirection) => void }) {
  const rank = new Map(tasks.map((task, index) => [task.id, index + 1]))
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
            {entries.map((task) => <li key={task.id} data-task-id={task.id} className="board-card-item">
              <a className="board-card" href={taskUrl(task.projectId, task.id, 'board')} aria-labelledby={`card-title-${task.id} card-id-${task.id}`}>
                <div className="card-topline"><span className="task-rank" aria-label={`Mesto opravila ${task.id}`}>{rank.get(task.id)}</span><span className="task-id" id={`card-id-${task.id}`}>{task.id}</span></div>
                <h4 id={`card-title-${task.id}`}>{task.title}</h4>
                <p className="card-description">{task.description}</p>
                <div className="card-footer">
                  <span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span>
                  <span className="card-date"><CalendarDays size={12} strokeWidth={1.6} aria-hidden="true" /><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></span>
                </div>
              </a>
              <div className="card-actions">
                <button type="button" className="move-button" aria-label={`Premakni ${task.id} gor`} title={`Premakni ${task.id} gor`} disabled={rank.get(task.id) === 1} onClick={() => onMove(task.id, 'up')}><ArrowUp size={13} aria-hidden="true" /></button>
                <button type="button" className="move-button" aria-label={`Premakni ${task.id} dol`} title={`Premakni ${task.id} dol`} disabled={rank.get(task.id) === tasks.length} onClick={() => onMove(task.id, 'down')}><ArrowDown size={13} aria-hidden="true" /></button>
              </div>
            </li>)}
          </ul>}
        </section>
      })}
    </div>
  </div>
}
