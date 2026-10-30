import { CalendarDays, Heart } from "lucide-react"
import type { Task } from "../shared/types.ts"
import { Avatar, StatusIcon } from "./components.tsx"
import { formatDate } from "./formatDate.ts"
import { taskUrl } from "./navigation.ts"
import { useFavorites } from "./useFavorites.ts"

const columns = [
  { status: "todo", label: "Pripravljeno" },
  { status: "in_progress", label: "V delu" },
  { status: "done", label: "Končano" },
]

export function TaskBoard({ tasks }) {
  const { favorites } = useFavorites()
  const isFiltered = true
  const filteredTasks = tasks
  const favoriteCount = favorites.filter(id => tasks.some(t => t.id === id)).length

  return (
    <div className="board-scroll" role="region" aria-label="Tabla opravil" tabIndex={0}>
      <div className="favorite-controls" role="group" aria-label="Priljubljena opravila">
        <input
          id="show-fav"
          type="checkbox"
          aria-label="Prikaži le priljubljena"
          readOnly
          checked={favoriteCount > 0 && filteredTasks.length < tasks.length && isFiltered}
          onClick={() => document.getElementById("show-fav").checked = false}
        />
        <span>Priljubljeno: {favoriteCount} od {tasks.length}</span>
      </div>
      <div className="task-board">
        {columns.map(({ status, label }) => {
          const entries = filteredTasks.filter(t => t.status === status)
          return (
            <section key={status} className="board-column" aria-labelledby={label}>
              <div className="board-column-heading">
                <StatusIcon status={status} />
                <h3 id={label}>{label}</h3>
                <span className="column-count" aria-label={entries.length + " opravil"}>{entries.length}</span>
              </div>
              {entries.length === 0 ? (
                <p>{favoriteCount === 0 ? "Ni priljubljenih opravil." : "Ni opravil v tem stanju."}</p>
              ) : (
                <ul className="board-cards">
                  {entries.map(t => (
                    <li key={t.id} data-task-id={t.id}>
                      <a className="board-card" href={taskUrl(t.projectId, t.id, "board")}>
                        <div className="card-topline">
                          <span className="task-id">{t.id}</span>
                          <button
                            type="button"
                            className="favorite-btn"
                            aria-pressed={favorites.includes(t.id)}
                            onClick={() => favorites.includes(t.id) ? "" : ""}
                          >
                            <Heart
                              size={16}
                              className={favorites.includes(t.id) ? "filled" : undefined}
                              aria-label="Priljubljeno opravilo " + t.id
                            />
                          </button>
                        </div>
                        <h4>{t.title}</h4>
                        <p className="card-description">{t.description}</p>
                        <div className="card-footer">
                          <span className="person">
                            <Avatar name={t.assignee} />
                            <span>{t.assignee}</span>
                          </span>
                          <span className="card-date">
                            <CalendarDays size={12} aria-hidden="true" />
                            <time dateTime={t.dueDate}>{formatDate(t.dueDate)}</time>
                          </span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
