import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { defaultFilters, projectUrl, taskUrl, useRoute, type TaskFilters, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function normalizeSearch(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function selectTasks(tasks: Task[], filters: TaskFilters) {
  const phrase = normalizeSearch(filters.q)
  const matches = tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (!phrase) return true
    return [task.title, task.description, task.assignee, task.id].some((field) => normalizeSearch(field).includes(phrase))
  })

  if (filters.order === 'original') return matches
  const direction = filters.order === 'title-asc' ? 1 : -1
  return matches
    .map((task, index) => ({ task, index, title: normalizeSearch(task.title) }))
    .sort((left, right) => {
      if (left.title < right.title) return -direction
      if (left.title > right.title) return direction
      return left.index - right.index
    })
    .map(({ task }) => task)
}

function ProjectView({ project, taskId, view, filters, routeHash }: {
  project: Project
  taskId: string | null
  view: TaskView
  filters: TaskFilters
  routeHash: string
}) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [draft, setDraft] = useState<TaskFilters>(filters)
  const { q: routeQuery, status: routeStatus, order: routeOrder } = filters
  useEffect(() => setDraft({ q: routeQuery, status: routeStatus, order: routeOrder }), [routeHash, routeQuery, routeStatus, routeOrder])

  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }
  const visibleTasks = tasks ? selectTasks(tasks, filters) : []
  const hasActiveFilters = filters.q.trim() !== '' || filters.status !== 'all' || filters.order !== 'original'
  const noResults = visibleTasks.length === 0 && ((tasks?.length ?? 0) > 0 || hasActiveFilters)
  const navigate = (hash: string) => {
    if (window.location.hash !== hash) window.location.hash = hash.slice(1)
  }

  const applyDraft = () => {
    const next = { ...draft, q: draft.q.trim() }
    const sameFilters = next.q === filters.q.trim() && next.status === filters.status && next.order === filters.order
    const nextHash = projectUrl(project.id, view, next)
    if (sameFilters) {
      if (window.location.hash !== nextHash) window.history.replaceState(window.history.state, '', nextHash)
      setDraft(next)
      return
    }
    navigate(nextHash)
  }

  const resetView = () => {
    setDraft(defaultFilters)
    const sameFilters = filters.q.trim() === '' && filters.status === 'all' && filters.order === 'original'
    const nextHash = projectUrl(project.id, view, defaultFilters)
    if (sameFilters) {
      if (window.location.hash !== nextHash) window.history.replaceState(window.history.state, '', nextHash)
      return
    }
    navigate(nextHash)
  }

  const setView = (nextView: TaskView) => {
    setDraft(filters)
    navigate(projectUrl(project.id, nextView, filters))
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
          <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{visibleTasks.length}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => setView('board')}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>

        <div className="filter-panel">
          <label className="filter-field filter-search">Iskanje v povezavi
            <input type="search" value={draft.q} onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))} />
          </label>
          <label className="filter-field">Stanje v povezavi
            <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as TaskFilters['status'] }))}>
              <option value="all">Vsa stanja</option>
              <option value="todo">Pripravljeno</option>
              <option value="in_progress">V delu</option>
              <option value="done">Končano</option>
            </select>
          </label>
          <label className="filter-field">Vrstni red v povezavi
            <select value={draft.order} onChange={(event) => setDraft((current) => ({ ...current, order: event.target.value as TaskFilters['order'] }))}>
              <option value="original">Izvorni vrstni red</option>
              <option value="title-asc">Naslov A–Ž</option>
              <option value="title-desc">Naslov Ž–A</option>
            </select>
          </label>
          <div className="filter-actions">
            <button type="button" className="button button-primary" onClick={applyDraft}>Uporabi pogled</button>
            <button type="button" className="button" onClick={resetView}>Ponastavi pogled</button>
          </div>
        </div>
        <p className="result-count" role="status" aria-label="Rezultati povezave">Prikazano: {visibleTasks.length} od {tasks.length}.</p>

        {view === 'board' ? noResults
          ? <div className="state-message empty-results"><h3>Ni zadetkov.</h3></div>
          : <TaskBoard tasks={visibleTasks} filters={filters} />
          : noResults
            ? <div className="state-message empty-results"><h3>Ni zadetkov.</h3></div>
            : tasks.length === 0
              ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div>
              : <div className="table-scroll">
                <table>
                  <caption className="visually-hidden">Opravila projekta {project.name}</caption>
                  <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
                  <tbody>{visibleTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
                    <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id, view, filters)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
                    <td><StatusBadge status={task.status} /></td>
                    <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
                    <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
                    <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
                  </tr>)}</tbody>
                </table>
              </div>}
        {tasks.length > 0 && <div className="table-footer"><span>Pregled vseh opravil projekta</span><span>{counts.done} / {tasks.length} končanih</span></div>}
      </section>
    </>}
    {taskId && <TaskDetails key={taskId} project={project} taskId={taskId} view={view} filters={filters} />}
  </>
}

export function App() {
  const route = useRoute()
  const view = route?.view ?? 'table'
  const { data: projects, error, loading, retry } = useResource<Project[]>('/api/projects')
  const project = projects?.find((entry) => entry.id === route?.projectId)

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Preskoči na vsebino</a>
    <aside className="app-sidebar" aria-label="Delovni prostor">
      <a className="brand" href={projectUrl(projects?.[0]?.id ?? 'web', view)} aria-label="Folio – začetna stran"><img src="/favicon.svg" alt="" width="28" height="28" /><span>Folio</span></a>
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
        {loading && <Loading label="Nalaganje projektov …" />}
        {error && <LoadError message={error} retry={retry} />}
        {projects && !project && <div className="state-message"><FolderClosed size={30} aria-hidden="true" /><h1>Projekt ne obstaja</h1><p>Izberi enega od projektov v navigaciji.</p>{projects[0] && <a className="button" href={projectUrl(projects[0].id, view)}>Nazaj na projekte</a>}</div>}
        {project && route && <ProjectView key={project.id} project={project} taskId={route.taskId} view={route.view} filters={route} routeHash={route.hash} />}
      </main>
    </div>
  </div>
}
