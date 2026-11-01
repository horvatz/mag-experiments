import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from "lucide-react"
import { useState } from "react"
import type { Project, Task, TaskStatus } from "../shared/types.ts"
import { Avatar, LoadError, Loading, StatusBadge } from "./components.tsx"
import { formatDate } from "./formatDate.ts"
import { projectUrl, taskUrl, useRoute, type TaskView } from "./navigation.ts"
import { TaskBoard } from "./TaskBoard.tsx"
import { TaskDetails } from "./TaskDetails.tsx"
import { useResource } from "./useResource.ts"

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036F]/g, "").toLowerCase()
}

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>("/api/projects/" + encodeURIComponent(project.id) + "/tasks")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")

  if (!tasks) {
    return <>
      {loading && <Loading label="Nalaganje opravil …" />}
      {error && <LoadError message={error} retry={retry} />}
    </>
  }

  const searchTerms = search.split(/\s+/).filter((term) => term.length > 0).map(normalizeSearch)
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter
    const searchable = normalizeSearch([task.id, task.title, task.description, task.assignee].join(" "))
    return matchesStatus && matchesAssignee && searchTerms.every((term) => searchable.includes(term))
  })
  const assignees = [...new Set(tasks.map((task) => task.assignee).filter((assignee) => assignee.length > 0))]
  const counts = {
    todo: filteredTasks.filter((task) => task.status === "todo").length,
    in_progress: filteredTasks.filter((task) => task.status === "in_progress").length,
    done: filteredTasks.filter((task) => task.status === "done").length,
  }

  return <>
    <div className="project-overview">
      <div className="project-heading">
        <h1>{project.name}</h1>
        <p className="project-intro">Opravila, odgovornosti in roki na enem mestu.</p>
      </div>
      <div className="summary-grid" aria-label="Pregled stanj opravil">
        <div className="summary-item"><span className="summary-label">Pripravljeno</span><strong>{counts.todo}</strong></div>
        <div className="summary-item"><span className="summary-label">V delu</span><strong>{counts.in_progress}</strong></div>
        <div className="summary-item"><span className="summary-label">Končano</span><strong>{counts.done}</strong></div>
      </div>
    </div>

    <section className="task-section" aria-labelledby="tasks-title">
      <div className="section-heading">
        <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{filteredTasks.length}</span></div>
        <div className="view-switch" role="group" aria-label="Prikaz opravil">
          <button type="button" aria-pressed={view === "table"} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
          <button type="button" aria-pressed={view === "board"} onClick={() => { window.location.hash = projectUrl(project.id, "board") }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-field">
          <label htmlFor="task-search">Išči opravila</label>
          <input id="task-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="filter-field">
          <label htmlFor="task-status-filter">Filter stanja</label>
          <select id="task-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "all")}>
            <option value="all">Vsa stanja</option>
            <option value="todo">Pripravljeno</option>
            <option value="in_progress">V delu</option>
            <option value="done">Končano</option>
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="task-assignee-filter">Filter odgovorne osebe</label>
          <select id="task-assignee-filter" value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
            <option value="all">Vse osebe</option>
            {assignees.map((assignee) => <option key={assignee} value={assignee}>{assignee}</option>)}
          </select>
        </div>
        <button className="button filter-clear" type="button" onClick={() => { setSearch(""); setStatusFilter("all"); setAssigneeFilter("all") }}>Počisti filtre</button>
      </div>
      <p className="filter-results" role="status" aria-label="Rezultati filtriranja">Prikazano: {filteredTasks.length} od {tasks.length}.</p>

      {tasks.length === 0 ? view === "board" ? <TaskBoard tasks={filteredTasks} /> : <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : filteredTasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>Ni zadetkov.</h3><p>Spremeni iskalni pogoj ali filtra.</p></div> : view === "board" ? <TaskBoard tasks={filteredTasks} /> : <div className="table-scroll">
        <table>
          <caption className="visually-hidden">Opravila projekta {project.name}</caption>
          <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
          <tbody>{filteredTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
            <td><div className="task-cell"><span className={"task-state-icon " + (task.status === "done" ? "completed" : "")} aria-hidden="true">{task.status === "done" ? <Check size={13} /> : task.status === "in_progress" ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
            <td><StatusBadge status={task.status} /></td>
            <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
            <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
            <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
          </tr>)}</tbody>
        </table>
      </div>}
      <div className="table-footer"><span>Pregled filtriranih opravil projekta</span><span>{counts.done} / {filteredTasks.length} končanih</span></div>
    </section>
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
        <span className="workspace-label">Projekti</span>
        <nav className="project-nav" aria-label="Projekti">
          {projects?.map((entry) => <a key={entry.id} href={projectUrl(entry.id, view)} className={"project-nav-link " + (project?.id === entry.id ? "active" : "")} aria-current={project?.id === entry.id ? "page" : undefined}><FolderClosed size={15} strokeWidth={1.6} aria-hidden="true" /><span>{entry.name}</span></a>)}
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
