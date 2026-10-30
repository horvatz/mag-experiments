import { CalendarDays } from 'lucide-react'
import type { Task } from '../shared/types.ts'
import { Avatar, StatusIcon, FavoritesCount, FavoriteButton } from '.components.tsx'
import { formatDate } from '.formatDate.ts'
import { taskUrl } from '.navigation.ts'

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  return (
    <div className="board-scroll" role="region" aria-label="Tabla opravil" tabIndex={0}>
      <div className="task-board">
        {tasks.map((task) => (
          <section key={task.id} className="board-column" data-task-id={task.id}>
            <h3>TaskName</h3>
            <div className="board-card" href={taskUrl(task.projectId, task.id)}>
              <span className="task-id">{task.id}</span>
              <span>{task.title}</span>
              <button className="favorite-button" aria-label="Priljubljeno opravilo #{task.id}" aria-pressed={false}>
                <span className="star-icon" aria-hidden="true">★</span>
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
