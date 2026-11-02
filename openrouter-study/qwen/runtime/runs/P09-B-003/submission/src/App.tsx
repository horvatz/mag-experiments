import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from "lucide-react"
import type { Project, Task } from "../shared/types.ts"
import { Avatar, LoadError, Loading, StatusBadge } from "./components.tsx"
import { formatDate } from "./formatDate.ts"
import { projectUrl, taskUrl, useRoute } from "./navigation.ts"
import { TaskBoard } from "./TaskBoard.tsx"
import { TaskDetails } from "./TaskDetails.tsx"
import { useResource } from "./useResource.ts"
import type { TaskView, TaskStatus } from "../shared/types.ts"
import { useEffect, useState, useCallback } from "react"

interface ViewState {
  q?: string
  status?: "all"|"todo"|"in_progress"|"done"
  order?: "original"|"title-asc"|"title-desc"
}

function ProjectView({ project, taskId }: { project: Project; taskId: string | null }) {
  const route = useRoute()
  const [view, setView] = useState<TaskView>(route?.view ?? "table")
  const [draftView, setDraftView] = useState<ViewState>({})
  
  const storageKey = "view-state-" + project.id
  const savedState = window.sessionStorage.getItem(storageKey) as ViewState | null
  
  const [displayStatus, setDisplayStatus] = useState<string>(
    route?.status ?? (savedState?.status ?? "all")
  )
  const [displayOrder, setDisplayOrder] = useState<string>(
    route?.order ?? (savedState?.order ?? "original")
  )
  const [currentQuery, setCurrentQuery] = useState<string>(
    route?.q || (savedState?.q ?? "")
  )
  
  const viewState: ViewState = {
    ...draftView,
    q: currentQuery || draftView.q,
    status: displayStatus || draftView.status,
    order: displayOrder || draftView.order
  }
  
  const applyView = () => {
    const params: string[] = []
    if (viewState.q) params.push(`q=${encodeURIComponent(viewState.q)}`)
    if (viewState.status && viewState.status !== "all") params.push(`status=${encodeURIComponent(viewState.status)}`)
    if (viewState.order && viewState.order !== "original") params.push(`order=${encodeURIComponent(viewState.order)}`)
    
    const newUrl = `#/projects/${encodeURIComponent(project.id)}`
      + (params.length > 0 ? "?" + params.join("&") : "")
      + (view === "board" ? "?view=board" : "")
    
    window.location.hash = newUrl
  }
  
  const resetView = () => {
    window.history.replaceState(null, "", `#/projects/${encodeURIComponent(project.id)}` + (view === "board" ? "?view=board" : ""))
    setDraftView({})
    setDisplayStatus(route?.status ?? "all")
    setDisplayOrder(route?.order ?? "original")
    setCurrentQuery(route?.q || "")
    
    const key = "view-state-" + project.id
    window.sessionStorage.removeItem(key)
    window.dispatchEvent(new Event("hashchange"))
  }
  
  const setQuery = (q: string) => {
    setDraftView(prev => ({ ...prev, q: q }))
  }
  const setStatus = (status: "all"|"todo"|"in_progress"|"done") => {
    setDraftView(prev => ({ ...prev, status: status }))
  }
  const setOrder = (order: "original"|"title-asc"|"title-desc") => {
    setDraftView(prev => ({ ...prev, order: order }))
  }

  const { data: tasks, error, loading, retry } = useResource(
    "/api/projects/" + encodeURIComponent(project.id) + "/tasks",
    false
  )
  
  const counts = {
    all: tasks?.length ?? 0,
    todo: tasks?.filter((t) => t.status === "todo").length ?? 0,
    in_progress: tasks?.filter((t) => t.status === "in_progress").length ?? 0,
    done: tasks?.filter((t) => t.status === "done").length ?? 0,
  }
  
  const normalizeQuery = useCallback((str: string): string => {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  }, [])
  
  const filteredTasks = tasks?.filter((task) => {
    const qNormalized = normalizeQuery(currentQuery)
    if (!qNormalized) return true
    return (
      task.title.toLowerCase().includes(qNormalized) ||
      (task.description || "").toLowerCase().includes(qNormalized) ||
      task.assignee.toLowerCase().includes(qNormalized) ||
      task.id.toLowerCase().includes(qNormalized)
    )
  })
  
  let sortedTasks = filteredTasks || []
  if (displayOrder === "title-asc") {
    sortedTasks = sortedTasks.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
  } else if (displayOrder === "title-desc") {
    sortedTasks = sortedTasks.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: "base" }))
  }
  
  return <>
    <div className="project-overview">
      <div className="project-heading">
        <h1>{project.name}</h1>
        <p className="project-intro">Opravila, odgovornosti in roki na enem mestu.</p>
      </div>
      {tasks && <div className="summary-grid" aria-label="Pregled stanj opravil">
        <div className="summary-item"><span className="summary-label">Pripravljeno</span><strong>{counts.todo}</strong></div>
        <div className="summary-item"><span className="summary-label">V delu</span><strong>{counts.in_progress}</strong></div>
        <div className="summary-item"><span className="summary-label">Končano</span><strong>{counts.done}</strong></div>
      </div>}
    </div>

    {loading && <Loading label="Nalaganje opravil …" />}
    {error && <LoadError message={error} retry={retry} />}
    {tasks && <section className="task-section" aria-labelledby="tasks-title">
      <div className="section-heading">
        <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{sortedTasks?.length}</span></div>
        <div className="filter-controls" style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
          <input
            type="search"
            placeholder="Iskanje v povezavi"
            value={currentQuery}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Iskanje v povezavi"
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
          <select
            value={displayStatus}
            onChange={(e) => setStatus(e.target.value as any)}
            aria-label="Stanje v povezavi"
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="all">Stanje vseh</option>
            <option value="todo">Pripravljeno</option>
            <option value="in_progress">V delu</option>
            <option value="done">Končano</option>
          </select>
          <select
            value={displayOrder}
            onChange={(e) => setOrder(e.target.value as any)}
            aria-label="Vrstni red v povezavi"
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="original">Vrstni red original</option>
            <option value="title-asc">Vrstni red naslov-naraščajoče</option>
            <option value="title-desc">Vrstni red naslov-sepadajoče</option>
          </select>
          <button type="button" onClick={applyView} aria-label="Potrdi pogled" style={{ padding: "4px 12px", cursor: "pointer" }}>Uporabi pogled</button>
          <button type="button" onClick={resetView} aria-label="Ponastavi pogled" style={{ padding: "4px 12px", cursor: "pointer" }}>Ponastavi pogled</button>
        </div>
        <div className="view-switch" role="group" aria-label="Prikaz opravil">
          <button type="button" aria-pressed={view === "table"} onClick={() => { setView("table"); setDraftView(prev => ({ ...prev, ...route })); }}>
            <Table2 size={15} aria-hidden="true" />Preglednica
          </button>
          <button type="button" aria-pressed={view === "board"} onClick={() => { setView("board"); setDraftView(prev => ({ ...prev, ...route })); }}>
            <Columns3 size={15} aria-hidden="true" />Tabla
          </button>
        </div>
      </div>
      {sortedTasks === undefined ? (
        <div className="state-message"><Loading label="Nalaganje opravil …" /></div>
      ) : sortedTasks.length === 0 ? (
        <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>Ni zadetkov</h3><p>Filtri so nastavili.</p></div>
      ) : (
        <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovornose</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{sortedTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === "done" ? "completed" : ""}`} aria-hidden="true">{task.status === "done" ? <Check size={13} /> : task.status === "in_progress" ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id, view)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
      {sortedTasks?.length > 0 && <div className="table-footer"><span>Prikazano: {sortedTasks.length} od {counts.all}</span></div>}
    </section>}
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
      <a className="brand" href={projectUrl(projects?.[0]?.id ?? "web", view)} aria-label="Folio – začitna stran"><img src="/favicon.svg" alt="" width="28" height="28" /><span>Folio</span></a>
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
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} />}
      </main>
    </div>
  </div>
}
