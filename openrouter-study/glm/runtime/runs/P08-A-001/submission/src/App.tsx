import { useState } from "react"
import { ArrowUpRight, CalendarDays, Check, Columns3, FolderClosed, ListTodo, Table2 } from "lucide-react"
import type { Project, Task } from "../shared/types.ts"
import { Avatar, LoadError, Loading, StatusBadge } from "./components.tsx"
import { formatDate } from "./formatDate.ts"
import { REFERENCE_DATE, getDateCounts, filterDateGroup, isValidDate, type DateGroupView } from "./dateGroups.ts"
import { projectUrl, taskUrl, useRoute, type TaskView } from "./navigation.ts"
import { TaskBoard } from "./TaskBoard.tsx"
import { TaskDetails } from "./TaskDetails.tsx"
import { useResource } from "./useResource.ts"

const groupOptions: { value: DateGroupView; label: string }[] = [
  { value: "all", label: "Vsi roki" },
  { value: "overdue", label: "Zapadlo" },
  { value: "today", label: "Danes" },
  { value: "week", label: "Naslednjih 7 dni" },
  { value: "later", label: "Pozneje" },
  { value: "done", label: "Končano" },
]

const summaryLabels: Record<Exclude<DateGroupView, "all">, string> = {
  overdue: "Zapadlo",
  today: "Danes",
  week: "Naslednjih 7 dni",
  later: "Pozneje",
  done: "Končano",
}

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [referenceDate, setReferenceDate] = useState(REFERENCE_DATE)
  const [dateInput, setDateInput] = useState(REFERENCE_DATE)
  const [dateInvalid, setDateInvalid] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<DateGroupView>("all")
  const counts = tasks ? getDateCounts(tasks, referenceDate) : null
  const selectedTasks = tasks ? filterDateGroup(tasks, referenceDate, selectedGroup) : []

  const handleDateChange = (value: string) => {
    setDateInput(value)
    if (isValidDate(value)) {
      setReferenceDate(value)
      setDateInvalid(false)
    } else {
      setDateInvalid(true)
    }
  }

  return <>
    <div className="project-overview">
      <div className="project-heading">
        <h1>{project.name}</h1>
        <p className="project-intro">Opravila, odgovornosti in roki na enem mestu.</p>
        <div className="date-controls">
          <div className="date-field">
            <label htmlFor="reference-date">Referenčni datum</label>
            <input id="reference-date" type="date" value={dateInput} onChange={(event) => handleDateChange(event.currentTarget.value)} />
          </div>
          <div className="date-field">
            <label htmlFor="date-group">Pogled rokov</label>
            <select id="date-group" value={selectedGroup} onChange={(event) => setSelectedGroup(event.currentTarget.value as DateGroupView)}>
              {groupOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
        {dateInvalid && <p className="date-error" role="alert">Vnesi veljaven referenčni datum.</p>}
      </div>
      {counts && <div className="summary-grid" aria-label="Pregled stanj opravil">
        {(Object.keys(summaryLabels) as Exclude<DateGroupView, "all">[]).map((group) => (
          <div key={group} className="summary-item">
            <span className="summary-label">{summaryLabels[group]}</span>
            <strong aria-label={`Število rokov ${group}`}>{counts[group]}</strong>
          </div>
        ))}
      </div>}
    </div>

    {loading && <Loading label="Nalaganje opravil …" />}
    {error && <LoadError message={error} retry={retry} />}
    {tasks && <>
      <section className="task-section" aria-labelledby="tasks-title">
        <div className="section-heading">
          <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{selectedTasks.length}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === "table"} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === "board"} onClick={() => { window.location.hash = projectUrl(project.id, "board") }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        {tasks.length === 0 ? (
          <div className="state-message">
            <ListTodo size={28} aria-hidden="true" />
            <h3>V tem projektu še ni opravil</h3>
            <p>Opravila bodo prikazana tukaj.</p>
          </div>
        ) : selectedGroup !== "all" && selectedTasks.length === 0 ? (
          <div className="state-message empty-group">
            <CalendarDays size={28} aria-hidden="true" />
            <h3>Ni opravil v izbrani skupini.</h3>
            <p>Izberi drugo skupino ali vse roke.</p>
          </div>
        ) : null}
        {view === "board" ? <TaskBoard tasks={selectedTasks} /> : selectedTasks.length === 0 ? null : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{selectedTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === "done" ? "completed" : ""}`} aria-hidden="true">{task.status === "done" ? <Check size={13} /> : task.status === "in_progress" ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {tasks.length > 0 && <div className="table-footer"><span>Pregled izbranih opravil projekta</span><span>{counts?.done ?? 0} / {tasks.length} končanih</span></div>}
      </section>
    </>}
    {taskId && <TaskDetails key={taskId} project={project} taskId={taskId} view={view} />}
  </>
}

export function App() {
  const route = useRoute()
  const view = route?.view ?? "table"
  const { data: projects, error, loading, retry } = useResource<Project[]>("/api/projects")
  const project = projects?.find((entry) => entry.id === route?.projectId)

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById("main-content")?.focus() }}>Preskoči na vsebino</a>
    <aside className="app-sidebar" aria-label="Delovni prostor">
      <a className="brand" href={projectUrl(projects?.[0]?.id ?? "web", view)} aria-label="Folio – začetna stran"><img src="/favicon.svg" alt="" width="28" height="28" /><span>Folio</span></a>
      <div className="sidebar-projects">
        <p className="nav-label">Projekti</p>
        <nav className="project-nav" aria-label="Projekti">
          {projects?.map((entry) => <a key={entry.id} href={projectUrl(entry.id, view)} className={`project-nav-link ${project?.id === entry.id ? "active" : ""}`} aria-current={project?.id === entry.id ? "page" : undefined}><FolderClosed size={15} strokeWidth={1.6} aria-hidden="true" /><span>{entry.name}</span></a>)}
        </nav>
      </div>
      <span className="workspace-label">Delovni prostor</span>
    </aside>

    <div className="workspace">
      <main id="main-content" tabIndex={-1}>
        {loading && <Loading label="Nalaganje projektov …" />}
        {error && <LoadError message={error} retry={retry} />}
        {projects && !project && <div className="state-message"><FolderClosed size={30} aria-hidden="true" /><h1>Projekt ne obstaja</h1><p>Izberi enega od projektov v navigaciji.</p>{projects[0] && <a className="button" href={projectUrl(projects[0].id, view)}>Nazaj na projekte</a>}</div>}
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} />}
      </main>
    </div>
  </div>
}
