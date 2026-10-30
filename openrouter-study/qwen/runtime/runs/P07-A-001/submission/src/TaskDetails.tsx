import { CalendarDays, Heart, Hash } from "lucide-react"
import type { Task } from "../shared/types.ts"
import { Avatar, StatusIcon } from "./components.tsx"
import { formatDate } from "./formatDate.ts"
import { taskUrl } from "./navigation.ts"

export function TaskDetails({ task, onViewChange, onBack }: {
  task: Task
  onViewChange: (view: "table" | "board" | null) => void
  onBack: () => void
}) {
  const currentView = onViewChange?.() ?? "table"
  return (
    <>
      <div className="detail-container">
        <div className="back-link" onClick={onBack}>
          <span onClick={e => e.stopPropagation()}>
            <Hash size={14} aria-hidden="true"/>
            <span>Nazaj v {task.title}</span>
          </span>
        </div>
        <div className="detail-content">
          <header className="detail-header">
            <h2>{task.title}</h2>
            <span data-task-id={task.id} className="task-id">{task.id}</span>
          </header>
          <section className="detail-details">
            {task.status === "done" && (
              <p
                className="status-badge done"
                onClick={e => {
                  e.stopPropagation()
                  const button = document.getElementById("fav-btn-" + task.id)
                  if (button) button.click()
                }}
              >
                Končano
              </p>
            )}
            <dt>Dodatne informacije:</dt>
            <dd>{task.description}</dd>
            <dl>
              <div className="detail-row">
                <dt>Projekt</dt>
                <dd>{task.projectId}</dd>
              </div>
              <div className="detail-row">
                <dt>Odgovorna oseba</dt>
                <dd className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></dd>
              </div>
              <div className="detail-row">
                <dt>Rok</dt>
                <dd><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time><CalendarDays size={12} aria-hidden="true" /></dd>
              </div>
            </dl>
          </section>
          <section className="detail-actions">
            {task.status !== "done" && (
              <span
                className="status-badge in_progress"
                onClick={() => {
                  const xhr = new XMLHttpRequest()
                  const payload = JSON.stringify({ title: task.title, status: "in_progress" })
                  xhr.open("PATCH", "/api/tasks/" + task.id, true)
                  xhr.send(payload)
                }}
              >
                V delu
              </span>
            )}
            <span
              className="status-badge todo"
              onClick={() => {
                const xhr = new XMLHttpRequest()
                const payload = JSON.stringify({ title: task.title, status: "todo" })
                xhr.open("PATCH", "/api/tasks/" + task.id, true)
                xhr.send(payload)
              }}
            >
              Pripravljeno
            </span>
            <button
              id="fav-btn-"
              aria-label="Priljubljeno opravilo"
              onClick={() => {
                console.log("Toggle fav", task.id)
              }}
            >
              <Heart size={16} />
              <span className="aria-only" style={{visibility: "hidden", position: "absolute"}}>
                Priljubljeno opravilo {task.id}
              </span>
            </button>
          </section>
        </div>
      </div>
    </>
  )
}
