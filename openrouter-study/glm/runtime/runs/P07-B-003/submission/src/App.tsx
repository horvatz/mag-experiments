import { useCallback, useEffect, useState } from "react"
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from "lucide-react"
import type { Project, Task } from "../shared/types.ts"
import { Avatar, FavoriteTaskButton, LoadError, Loading, StatusBadge } from "./components.tsx"
import { formatDate } from "./formatDate.ts"
import { projectUrl, taskUrl, useRoute, type TaskView } from "./navigation.ts"
import { TaskBoard } from "./TaskBoard.tsx"
import { TaskDetails } from "./TaskDetails.tsx"
import { useResource } from "./useResource.ts"

const FAVORITES_STORAGE_KEY = "folio:favorites:v1"
const STORAGE_ERROR = "Shramba ni na voljo."

type FavoritesState = { ids: Set<string>; error: string | null }

function parseFavorites(value: string | null): Set<string> {
  if (value === null) return new Set()
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return new Set()
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return new Set()
  const payload = parsed as { version?: unknown; ids?: unknown }
  if (payload.version !== 1 || !Array.isArray(payload.ids) || payload.ids.some((id) => typeof id !== "string")) return new Set()
  return new Set(payload.ids)
}

function readFavorites(): FavoritesState {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_STORAGE_KEY)), error: null }
  } catch {
    return { ids: new Set(), error: STORAGE_ERROR }
  }
}

function saveFavorites(ids: ReadonlySet<string>): string | null {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    return null
  } catch {
    return STORAGE_ERROR
  }
}

type ProjectViewProps = {
  project: Project
  taskId: string | null
  view: TaskView
  favoriteIds: ReadonlySet<string>
  showFavoritesOnly: boolean
  storageError: string | null
  onToggleFavorite: (taskId: string) => void
  onShowFavoritesOnlyChange: (checked: boolean) => void
  onRemoveProjectFavorites: (projectTaskIds: ReadonlySet<string>) => void
}

function ProjectView({ project, taskId, view, favoriteIds, showFavoritesOnly, storageError, onToggleFavorite, onShowFavoritesOnlyChange, onRemoveProjectFavorites }: ProjectViewProps) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const visibleTasks = tasks ? (showFavoritesOnly ? tasks.filter((task) => favoriteIds.has(task.id)) : tasks) : []
  const counts = {
    todo: visibleTasks.filter((task) => task.status === "todo").length,
    in_progress: visibleTasks.filter((task) => task.status === "in_progress").length,
    done: visibleTasks.filter((task) => task.status === "done").length,
  }
  const projectFavoriteCount = tasks ? tasks.filter((task) => favoriteIds.has(task.id)).length : 0

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
    {tasks && <>
      <section className="task-section" aria-labelledby="tasks-title">
        <div className="section-heading">
          <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{visibleTasks.length}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === "table"} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === "board"} onClick={() => { window.location.hash = projectUrl(project.id, "board") }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="favorites-bar">
          <label className="favorite-filter">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(event) => onShowFavoritesOnlyChange(event.target.checked)}
            />
            <span>Prikaži le priljubljena</span>
          </label>
          <button
            type="button"
            className="button remove-favorites-button"
            disabled={projectFavoriteCount === 0}
            onClick={() => onRemoveProjectFavorites(new Set(tasks.map((task) => task.id)))}
          >
            Odstrani priljubljene tega projekta
          </button>
          <span role="status" aria-label="Število priljubljenih">Priljubljeno: {projectFavoriteCount} od {tasks.length}.</span>
        </div>
        {storageError && <p className="storage-warning" role="alert">{storageError}</p>}
        {view === "board"
          ? <TaskBoard tasks={visibleTasks} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} />
          : visibleTasks.length === 0
            ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>{showFavoritesOnly ? "Ni priljubljenih opravil." : "V tem projektu še ni opravil"}</h3><p>{showFavoritesOnly ? "Označi opravilo kot priljubljeno ali izklopi filter." : "Opravila bodo prikazana tukaj."}</p></div>
            : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{visibleTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell">
                <FavoriteTaskButton taskId={task.id} isFavorite={favoriteIds.has(task.id)} onToggle={onToggleFavorite} />
                <span className={`task-state-icon ${task.status === "done" ? "completed" : ""}`} aria-hidden="true">{task.status === "done" ? <Check size={13} /> : task.status === "in_progress" ? <span /> : null}</span>
                <a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a>
              </div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {visibleTasks.length > 0 && <div className="table-footer"><span>Pregled vidnih opravil projekta</span><span>{counts.done} / {visibleTasks.length} končanih</span></div>}
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
  const [favorites, setFavorites] = useState<FavoritesState>(readFavorites)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_STORAGE_KEY) return
      setFavorites({ ids: parseFavorites(event.newValue), error: null })
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    setShowFavoritesOnly(false)
  }, [project?.id])

  const writeFavorites = useCallback((ids: Set<string>) => {
    setFavorites({ ids, error: null })
    const error = saveFavorites(ids)
    setFavorites({ ids, error })
  }, [])

  const toggleFavorite = useCallback((taskId: string) => {
    const ids = new Set(favorites.ids)
    if (ids.has(taskId)) ids.delete(taskId)
    else ids.add(taskId)
    writeFavorites(ids)
  }, [favorites.ids, writeFavorites])

  const removeProjectFavorites = useCallback((projectTaskIds: ReadonlySet<string>) => {
    const ids = new Set(favorites.ids)
    for (const taskId of projectTaskIds) ids.delete(taskId)
    writeFavorites(ids)
  }, [favorites.ids, writeFavorites])

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
        {project && <ProjectView
          key={project.id}
          project={project}
          taskId={route?.taskId ?? null}
          view={view}
          favoriteIds={favorites.ids}
          showFavoritesOnly={showFavoritesOnly}
          storageError={favorites.error}
          onToggleFavorite={toggleFavorite}
          onShowFavoritesOnlyChange={setShowFavoritesOnly}
          onRemoveProjectFavorites={removeProjectFavorites}
        />}
      </main>
    </div>
  </div>
}
