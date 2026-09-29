import { useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { DEFAULT_FILTERS, projectUrl, taskUrl, useRoute, type TaskView, type ViewFilters } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function normalizeSearch(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function visibleTasks(tasks: Task[], filters: ViewFilters) {
  const query = normalizeSearch(filters.q)
  const ordered = tasks.map((task, index) => ({ task, index })).filter(({ task }) =>
    (filters.status === 'all' || task.status === filters.status) &&
    (!query || [task.title, task.description, task.assignee, task.id].some((value) => normalizeSearch(value).includes(query))),
  )
  if (filters.order !== 'original') {
    const direction = filters.order === 'title-asc' ? 1 : -1
    ordered.sort((a, b) => {
      const first = normalizeSearch(a.task.title)
      const second = normalizeSearch(b.task.title)
      return (first < second ? -1 : first > second ? 1 : 0) * direction || a.index - b.index
    })
  }
  return ordered.map(({ task }) => task)
}

function FilterControls({ projectId, view, filters }: { projectId: string; view: TaskView; filters: ViewFilters }) {
  const [draft, setDraft] = useState(filters)
  const update = (next: ViewFilters) => setDraft(next)
  const commit = (next: ViewFilters) => {
    const normalized = { ...next, q: next.q.trim() }
    setDraft(normalized)
    const target = projectUrl(projectId, view, normalized)
    const same = normalized.q === filters.q.trim() && normalized.status === filters.status && normalized.order === filters.order
    if (same) {
      if (window.location.hash !== target) {
        window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${target}`)
      }
    } else if (window.location.hash !== target) {
      window.location.hash = target
    }
  }

  return <form className="view-filters" onSubmit={(event) => { event.preventDefault(); commit(draft) }}>
    <label className="filter-field filter-search">Iskanje v povezavi
      <input type="search" value={draft.q} onChange={(event) => update({ ...draft, q: event.target.value })} />
    </label>
    <label className="filter-field">Stanje v povezavi
      <select value={draft.status} onChange={(event) => update({ ...draft, status: event.target.value as ViewFilters['status'] })}>
        <option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
      </select>
    </label>
    <label className="filter-field">Vrstni red v povezavi
      <select value={draft.order} onChange={(event) => update({ ...draft, order: event.target.value as ViewFilters['order'] })}>
        <option value="original">Izvorni vrstni red</option><option value="title-asc">Naslov naraščajoče</option><option value="title-desc">Naslov padajoče</option>
      </select>
    </label>
    <div className="filter-actions">
      <button className="button button-primary" type="submit">Uporabi pogled</button>
      <button className="button" type="button" onClick={() => commit(DEFAULT_FILTERS)}>Ponastavi pogled</button>
    </div>
  </form>
}

function ProjectView({ project, taskId, view, filters, routeHash }: { project: Project; taskId: string | null; view: TaskView; filters: ViewFilters; routeHash: string }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const shownTasks = tasks ? visibleTasks(tasks, filters) : []
  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
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
        <FilterControls key={routeHash} projectId={project.id} view={view} filters={filters} />
        <p className="results-count" role="status" aria-label="Rezultati povezave">Prikazano: {shownTasks.length} od {tasks.length}.</p>
        {tasks.length > 0 && shownTasks.length === 0 ? <div className="state-message"><p>Ni zadetkov.</p></div>
        : view === 'board' ? <TaskBoard tasks={shownTasks} filters={filters} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{shownTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id, view, filters)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {tasks.length > 0 && <div className="table-footer"><span>Pregled vseh opravil projekta</span><span>{shownTasks.filter((task) => task.status === 'done').length} / {shownTasks.length} končanih</span></div>}
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
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} filters={route?.filters ?? DEFAULT_FILTERS} routeHash={window.location.hash} />}
      </main>
    </div>
  </div>
}
