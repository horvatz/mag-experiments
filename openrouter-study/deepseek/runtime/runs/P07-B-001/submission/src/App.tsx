import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Star, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, FavoriteButton, LoadError, Loading, StatusBadge, StorageWarning } from './components.tsx'
import { FAVORITES_KEY, loadFavorites, parseFavorites, saveFavorites } from './favorites.ts'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

type FavoritesState = { favorites: Set<string>; storageError: boolean }

function EmptyFavorites({ onShowAll }: { onShowAll: () => void }) {
  return <div className="state-message">
    <Star size={28} aria-hidden="true" />
    <h3>Ni priljubljenih opravil.</h3>
    <p>Označi opravila z zvezdico ali izklopi filter priljubljenih.</p>
    <button type="button" className="button" onClick={onShowAll}>Prikaži vsa opravila</button>
  </div>
}

function ProjectView({ project, taskId, view, favorites, onToggleFavorite, onRemoveProjectFavorites }: {
  project: Project
  taskId: string | null
  view: TaskView
  favorites: Set<string>
  onToggleFavorite: (taskId: string) => void
  onRemoveProjectFavorites: (taskIds: string[]) => void
}) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const allTasks = tasks ?? []
  const visibleTasks = onlyFavorites ? allTasks.filter((task) => favorites.has(task.id)) : allTasks
  const favoriteCount = allTasks.filter((task) => favorites.has(task.id)).length
  const counts = {
    todo: allTasks.filter((task) => task.status === 'todo').length,
    in_progress: allTasks.filter((task) => task.status === 'in_progress').length,
    done: allTasks.filter((task) => task.status === 'done').length,
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
    {tasks && <>
      <section className="task-section" aria-labelledby="tasks-title">
        <div className="section-heading">
          <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{allTasks.length}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="favorites-toolbar">
          <label className="favorites-filter">
            <input type="checkbox" checked={onlyFavorites} onChange={(event) => setOnlyFavorites(event.target.checked)} />
            Prikaži le priljubljena
          </label>
          <span className="favorites-count" role="status" aria-label="Število priljubljenih">Priljubljeno: {favoriteCount} od {allTasks.length}.</span>
          <button type="button" className="button" disabled={favoriteCount === 0} onClick={() => onRemoveProjectFavorites(allTasks.map((task) => task.id))}>Odstrani priljubljene tega projekta</button>
        </div>
        {view === 'board'
          ? <>
            {onlyFavorites && visibleTasks.length === 0 && <EmptyFavorites onShowAll={() => setOnlyFavorites(false)} />}
            <TaskBoard tasks={visibleTasks} favorites={favorites} onToggleFavorite={onToggleFavorite} />
          </>
          : visibleTasks.length === 0
            ? onlyFavorites
              ? <EmptyFavorites onShowAll={() => setOnlyFavorites(false)} />
              : <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div>
            : <div className="table-scroll">
              <table>
                <caption className="visually-hidden">Opravila projekta {project.name}</caption>
                <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Priljubljeno</span></th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
                <tbody>{visibleTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
                  <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
                  <td><StatusBadge status={task.status} /></td>
                  <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
                  <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
                  <td className="favorite-cell"><FavoriteButton taskId={task.id} pressed={favorites.has(task.id)} onToggle={onToggleFavorite} /></td>
                  <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
                </tr>)}</tbody>
              </table>
            </div>}
        {allTasks.length > 0 && <div className="table-footer"><span>Pregled vseh opravil projekta</span><span>{counts.done} / {allTasks.length} končanih</span></div>}
      </section>
    </>}
    {taskId && <TaskDetails key={taskId} project={project} taskId={taskId} view={view} />}
  </>
}

export function App() {
  const route = useRoute()
  const view = route?.view ?? 'table'
  const { data: projects, error, loading, retry } = useResource<Project[]>('/api/projects')
  const project = projects?.find((entry) => entry.id === route?.projectId)
  const [favoritesState, setFavoritesState] = useState<FavoritesState>(() => loadFavorites())

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_KEY) return
      setFavoritesState((current) => ({ ...current, favorites: parseFavorites(event.newValue) }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = (next: Set<string>) => {
    const stored = saveFavorites(next)
    setFavoritesState((current) => ({ favorites: next, storageError: current.storageError || !stored }))
  }

  const toggleFavorite = (taskId: string) => {
    const next = new Set(favoritesState.favorites)
    if (next.has(taskId)) next.delete(taskId)
    else next.add(taskId)
    persist(next)
  }

  const removeProjectFavorites = (taskIds: string[]) => {
    const next = new Set(favoritesState.favorites)
    for (const id of taskIds) next.delete(id)
    persist(next)
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Preskoči na vsebino</a>
    <aside className="app-sidebar" aria-label="Delovni prostor">
      <a className="brand" href={projectUrl('web')} aria-label="Folio – začetna stran"><img src="/favicon.svg" alt="" width="28" height="28" /><span>Folio</span></a>
      <div className="sidebar-projects">
        <p className="nav-label">Projekti</p>
        <nav className="project-nav" aria-label="Projekti">
          {projects?.map((entry) => <a key={entry.id} href={projectUrl(entry.id, view)} className={`project-nav-link ${project?.id === entry.id ? 'active' : ''}`} aria-current={project?.id === entry.id ? 'page' : undefined}><FolderClosed size={15} strokeWidth={1.6} aria-hidden="true" /><span>{entry.name}</span></a>)}
        </nav>
      </div>
      <span className="workspace-label">Delovni prostor</span>
    </aside>

    <div className="workspace">
      <main id="main-content" tabIndex={-1}>
        {favoritesState.storageError && <StorageWarning />}
        {loading && <Loading label="Nalaganje projektov …" />}
        {error && <LoadError message={error} retry={retry} />}
        {projects && !project && <div className="state-message"><FolderClosed size={30} aria-hidden="true" /><h1>Projekt ne obstaja</h1><p>Izberi enega od projektov v navigaciji.</p>{projects[0] && <a className="button" href={projectUrl(projects[0].id, view)}>Nazaj na projekte</a>}</div>}
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} favorites={favoritesState.favorites} onToggleFavorite={toggleFavorite} onRemoveProjectFavorites={removeProjectFavorites} />}
      </main>
    </div>
  </div>
}
