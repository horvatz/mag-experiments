import { useState } from "react"
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Star, Table2, Trash2 } from "lucide-react"
import type { Project, Task } from "../shared/types.ts"
import { Avatar, LoadError, Loading, StatusBadge } from "./components.tsx"
import { formatDate } from "./formatDate.ts"
import { projectUrl, taskUrl, useRoute, type TaskView } from "./navigation.ts"
import { TaskBoard } from "./TaskBoard.tsx"
import { TaskDetails } from "./TaskDetails.tsx"
import { useFavorites } from "./favorites.ts"
import { useResource } from "./useResource.ts"

type ProjectViewProps = {
  favoriteIds: Set<string>
  project: Project
  removeFavorites: (taskIds: readonly string[]) => void
  storageError: boolean
  taskId: string | null
  toggleFavorite: (taskId: string) => void
  view: TaskView
}

function ProjectView({ favoriteIds, project, removeFavorites, storageError, taskId, toggleFavorite, view }: ProjectViewProps) {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { data: tasks, error, loading, retry } = useResource<Task[]>("/api/projects/" + encodeURIComponent(project.id) + "/tasks")
  const projectTasks = tasks?.filter((task) => task.projectId === project.id) ?? []
  const visibleTasks = showFavoritesOnly ? projectTasks.filter((task) => favoriteIds.has(task.id)) : projectTasks
  const favoriteCount = projectTasks.filter((task) => favoriteIds.has(task.id)).length
  const counts = {
    todo: visibleTasks.filter((task) => task.status === "todo").length,
    in_progress: visibleTasks.filter((task) => task.status === "in_progress").length,
    done: visibleTasks.filter((task) => task.status === "done").length,
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

    {storageError && <div className="storage-warning" role="alert">
      <strong>Shramba ni dostopna.</strong>
      <span>Priljubljena so na voljo samo v tem odprtem prikazu.</span>
    </div>}
    {loading && <Loading label="Nalaganje opravil …" />}
    {error && <LoadError message={error} retry={retry} />}
    {tasks && <>
      <section className="task-section" aria-labelledby="tasks-title">
        <div className="section-heading">
          <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{visibleTasks.length}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === "table"} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === "board"} onClick={() => { window.location.hash = projectUrl(project.id, "board") }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="favorites-toolbar">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(event) => setShowFavoritesOnly(event.currentTarget.checked)}
            />
            <span>Prikaži le priljubljena</span>
          </label>
          <p className="favorite-count" role="status" aria-label="Število priljubljenih">Priljubljeno: {favoriteCount} od {projectTasks.length}.</p>
          <button
            className="button clear-favorites"
            type="button"
            disabled={favoriteCount === 0}
            onClick={() => removeFavorites(projectTasks.map((task) => task.id))}
          >
            <Trash2 size={14} aria-hidden="true" />Odstrani priljubljene tega projekta
          </button>
        </div>
        {visibleTasks.length === 0 && showFavoritesOnly
          ? <div className="state-message"><Star size={28} aria-hidden="true" /><h3>Ni priljubljenih opravil.</h3><p>Vključi prikaz vseh opravil ali dodaj priljubljeno.</p></div>
          : view === "board"
            ? <TaskBoard tasks={visibleTasks} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
            : visibleTasks.length === 0
              ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div>
              : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{visibleTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={"task-state-icon" + (task.status === "done" ? " completed" : "")} aria-hidden="true">{task.status === "done" ? <Check size={13} /> : task.status === "in_progress" ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a><button className="favorite-toggle" type="button" aria-label={"Priljubljeno opravilo " + task.id} aria-pressed={favoriteIds.has(task.id)} onClick={() => toggleFavorite(task.id)}><Star size={15} aria-hidden="true" /></button></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {visibleTasks.length > 0 && <div className="table-footer"><span>Pregled prikazanih opravil projekta</span><span>{counts.done} / {visibleTasks.length} končanih</span></div>}
      </section>
    </>}
    {taskId && <TaskDetails key={taskId} project={project} taskId={taskId} view={view} />}
  </>
}

export function App() {
  const route = useRoute()
  const view = route?.view ?? "table"
  const { data: projects, error, loading, retry } = useResource<Project[]>("/api/projects")
  const { favoriteIds, removeFavorites, storageError, toggleFavorite } = useFavorites()
  const project = projects?.find((entry) => entry.id === route?.projectId)

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById("main-content")?.focus() }}>Preskoči na vsebino</a>
    <aside className="app-sidebar" aria-label="Delovni prostor">
      <a className="brand" href={projectUrl(projects?.[0]?.id ?? "web", view)} aria-label="Folio – začetna stran"><img src="/favicon.svg" alt="" width="28" height="28" /><span>Folio</span></a>
      <div className="sidebar-projects">
        <p className="nav-label">Projekti</p>
        <nav className="project-nav" aria-label="Projekti">
          {projects?.map((entry) => <a key={entry.id} href={projectUrl(entry.id, view)} className={"project-nav-link" + (project?.id === entry.id ? " active" : "")} aria-current={project?.id === entry.id ? "page" : undefined}><FolderClosed size={15} strokeWidth={1.6} aria-hidden="true" /><span>{entry.name}</span></a>)}
        </nav>
      </div>
      <span className="workspace-label">Delovni prostor</span>
    </aside>

    <div className="workspace">
      <main id="main-content" tabIndex={-1}>
        {loading && <Loading label="Nalaganje projektov …" />}
        {error && <LoadError message={error} retry={retry} />}
        {projects && !project && <div className="state-message"><FolderClosed size={30} aria-hidden="true" /><h1>Projekt ne obstaja</h1><p>Izberi enega od projektov v navigaciji.</p>{projects[0] && <a className="button" href={projectUrl(projects[0].id, view)}>Nazaj na projekte</a>}</div>}
        {project && <ProjectView key={project.id} favoriteIds={favoriteIds} project={project} removeFavorites={removeFavorites} storageError={storageError} taskId={route?.taskId ?? null} toggleFavorite={toggleFavorite} view={view} />}
      </main>
    </div>
  </div>
}
