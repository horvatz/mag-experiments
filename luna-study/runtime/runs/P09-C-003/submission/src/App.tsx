import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { DEFAULT_FILTERS, projectUrl, stateUrl, taskUrl, useRoute, type TaskFilters, type TaskOrder, type TaskStatusFilter, type TaskView } from './navigation.ts'
import { selectTasks } from './taskView.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function sameFilters(a: TaskFilters, b: TaskFilters) {
  return a.q === b.q && a.status === b.status && a.order === b.order
}

function ProjectView({ project, taskId, view, filters, path, hash }: {
  project: Project
  taskId: string | null
  view: TaskView
  filters: TaskFilters
  path: string
  hash: string
}) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [draft, setDraft] = useState(filters)
  const { q: committedQuery, status: committedStatus, order: committedOrder } = filters
  useEffect(() => setDraft({ q: committedQuery, status: committedStatus, order: committedOrder }), [hash, committedQuery, committedStatus, committedOrder])

  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }
  const visibleTasks = tasks ? selectTasks(tasks, filters) : []

  const commit = (next: TaskFilters) => {
    const committed = { ...next, q: next.q.trim() }
    const target = stateUrl(path, view, committed)
    if (!sameFilters(filters, committed)) {
      window.location.hash = target
    } else if (window.location.hash !== target) {
      window.history.replaceState(null, '', target)
      window.dispatchEvent(new Event('hashchange'))
    }
    setDraft(committed)
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
          <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{tasks.length}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id, 'table', filters) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board', filters) }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="filter-controls">
          <label>Iskanje v povezavi<input type="search" aria-label="Iskanje v povezavi" value={draft.q} onChange={event => setDraft({ ...draft, q: event.target.value })} /></label>
          <label>Stanje v povezavi<select aria-label="Stanje v povezavi" value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as TaskStatusFilter })}>
            <option value="all">all</option><option value="todo">todo</option><option value="in_progress">in_progress</option><option value="done">done</option>
          </select></label>
          <label>Vrstni red v povezavi<select aria-label="Vrstni red v povezavi" value={draft.order} onChange={event => setDraft({ ...draft, order: event.target.value as TaskOrder })}>
            <option value="original">original</option><option value="title-asc">title-asc</option><option value="title-desc">title-desc</option>
          </select></label>
          <div className="filter-actions"><button type="button" className="button" onClick={() => commit(draft)}>Uporabi pogled</button><button type="button" className="button secondary-button" onClick={() => commit(DEFAULT_FILTERS)}>Ponastavi pogled</button></div>
        </div>
        <div className="result-count" role="status" aria-label="Rezultati povezave">Prikazano: {visibleTasks.length} od {tasks.length}.</div>
        {visibleTasks.length === 0 && <p className="filter-empty">Ni zadetkov.</p>}
        {view === 'board' ? <TaskBoard tasks={visibleTasks} view={view} filters={filters} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : visibleTasks.length === 0 ? null : <div className="table-scroll">
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
  const filters = route?.filters ?? DEFAULT_FILTERS
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
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} filters={filters} path={route?.path ?? '#/projects/web'} hash={route?.hash ?? ''} />}
      </main>
    </div>
  </div>
}
