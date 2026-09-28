import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { DEFAULT_FILTERS, filtersFromHash, projectUrl, taskUrl, useRoute, type TaskFilters, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function sameFilters(left: TaskFilters, right: TaskFilters) {
  return left.q === right.q && left.status === right.status && left.order === right.order
}

function ProjectView({ project, taskId, view, filters, routeHash, draft, setDraft }: { project: Project; taskId: string | null; view: TaskView; filters: TaskFilters; routeHash: string; draft: TaskFilters; setDraft: (value: TaskFilters) => void }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  useEffect(() => setDraft(filtersFromHash(routeHash)), [routeHash, setDraft])

  const confirm = (next: TaskFilters) => {
    const confirmed = { ...next, q: next.q.trim() }
    setDraft(confirmed)
    const destination = projectUrl(project.id, view, confirmed)
    if (sameFilters(confirmed, filters)) {
      if (window.location.hash !== destination) {
        window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${destination}`)
      }
    } else {
      window.location.hash = destination
    }
  }

  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }
  const visibleTasks = (tasks ?? []).map((task, index) => ({ task, index })).filter(({ task }) => {
    const query = normalize(filters.q.trim())
    const queryMatches = !query || [task.title, task.description, task.assignee, task.id].some((value) => normalize(value).includes(query))
    return queryMatches && (filters.status === 'all' || task.status === filters.status)
  })
  if (filters.order !== 'original') {
    const direction = filters.order === 'title-asc' ? 1 : -1
    visibleTasks.sort((left, right) => {
      const leftTitle = normalize(left.task.title)
      const rightTitle = normalize(right.task.title)
      return (leftTitle < rightTitle ? -1 : leftTitle > rightTitle ? 1 : 0) * direction || left.index - right.index
    })
  }
  const displayedTasks = visibleTasks.map(({ task }) => task)
  const hasActiveFilters = filters.q.trim() !== '' || filters.status !== 'all' || filters.order !== 'original'

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
            <button type="button" aria-pressed={view === 'table'} onClick={() => { setDraft(filters); window.location.hash = projectUrl(project.id, 'table', filters) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => { setDraft(filters); window.location.hash = projectUrl(project.id, 'board', filters) }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="view-filters">
          <label className="filter-field filter-search">Iskanje v povezavi<input type="search" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} /></label>
          <label className="filter-field">Stanje v povezavi<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskFilters['status'] })}>
            <option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
          </select></label>
          <label className="filter-field">Vrstni red v povezavi<select value={draft.order} onChange={(event) => setDraft({ ...draft, order: event.target.value as TaskFilters['order'] })}>
            <option value="original">Izvirni vrstni red</option><option value="title-asc">Naslov naraščajoče</option><option value="title-desc">Naslov padajoče</option>
          </select></label>
          <div className="filter-actions"><button className="button filter-apply" type="button" onClick={() => confirm(draft)}>Uporabi pogled</button><button className="button" type="button" onClick={() => confirm(DEFAULT_FILTERS)}>Ponastavi pogled</button></div>
        </div>
        <div className="filter-result" role="status" aria-label="Rezultati povezave">Prikazano: {displayedTasks.length} od {tasks.length}.</div>
        {view === 'board' ? <>
          {displayedTasks.length === 0 && (hasActiveFilters || tasks.length === 0) && <p className="no-results">Ni zadetkov.</p>}
          <TaskBoard tasks={displayedTasks} view={view} filters={filters} />
        </> : tasks.length === 0 && !hasActiveFilters ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p><p>Ni zadetkov.</p></div> : displayedTasks.length === 0 ? <div className="state-message no-results"><p>Ni zadetkov.</p></div> : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{displayedTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id, view, filters)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {displayedTasks.length > 0 && <div className="table-footer"><span>Pregled opravil projekta</span><span>{displayedTasks.filter((task) => task.status === 'done').length} / {displayedTasks.length} končanih</span></div>}
      </section>
    </>}
    {taskId && <TaskDetails key={taskId} project={project} taskId={taskId} view={view} filters={filters} />}
  </>
}

export function App() {
  const route = useRoute()
  const view = route?.view ?? 'table'
  const filters = route?.filters ?? DEFAULT_FILTERS
  const [draft, setDraft] = useState(filters)
  const { data: projects, error, loading, retry } = useResource<Project[]>('/api/projects')
  const project = projects?.find((entry) => entry.id === route?.projectId)

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Preskoči na vsebino</a>
    <aside className="app-sidebar" aria-label="Delovni prostor">
      <a className="brand" href={projectUrl(projects?.[0]?.id ?? 'web', view, projects?.[0]?.id === project?.id ? filters : DEFAULT_FILTERS)} onClick={() => setDraft(filters)} aria-label="Folio – začetna stran"><img src="/favicon.svg" alt="" width="28" height="28" /><span>Folio</span></a>
      <div className="sidebar-projects">
        <p className="nav-label">Projekti</p>
        <nav className="project-nav" aria-label="Projekti">
          {projects?.map((entry) => <a key={entry.id} href={projectUrl(entry.id, view, entry.id === project?.id ? filters : DEFAULT_FILTERS)} onClick={() => { if (entry.id === project?.id) setDraft(filters) }} className={`project-nav-link ${project?.id === entry.id ? 'active' : ''}`} aria-current={project?.id === entry.id ? 'page' : undefined}><FolderClosed size={15} strokeWidth={1.6} aria-hidden="true" /><span>{entry.name}</span></a>)}
        </nav>
      </div>
      <span className="workspace-label">Delovni prostor</span>
    </aside>

    <div className="workspace">
      <main id="main-content" tabIndex={-1}>
        {loading && <Loading label="Nalaganje projektov …" />}
        {error && <LoadError message={error} retry={retry} />}
        {projects && !project && <div className="state-message"><FolderClosed size={30} aria-hidden="true" /><h1>Projekt ne obstaja</h1><p>Izberi enega od projektov v navigaciji.</p>{projects[0] && <a className="button" href={projectUrl(projects[0].id, view)}>Nazaj na projekte</a>}</div>}
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} filters={filters} routeHash={route?.hash ?? ''} draft={draft} setDraft={setDraft} />}
      </main>
    </div>
  </div>
}
