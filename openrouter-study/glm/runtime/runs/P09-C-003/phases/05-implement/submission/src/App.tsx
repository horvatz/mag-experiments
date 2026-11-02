import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, RotateCcw, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { canonicalFilters, defaultFilters, normalizeText, projectUrl, taskUrl, useRoute, type TaskView, type ViewFilters } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function ProjectView({ project, taskId, view, filters }: { project: Project; taskId: string | null; view: TaskView; filters: ViewFilters }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [draft, setDraft] = useState<ViewFilters>(filters)

  const syncKey = [filters.q, filters.status, filters.order, view, taskId ?? ''].join('\u0000')
  useEffect(() => {
    const [q, status, order] = syncKey.split('\u0000')
    setDraft({ q, status: status as ViewFilters['status'], order: order as ViewFilters['order'] })
  }, [syncKey])


  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }

  const visibleTasks = useMemo(() => {
    if (!tasks) return []
    const query = normalizeText(filters.q)
    const matched = tasks.filter((task) => {
      const statusMatches = filters.status === 'all' || task.status === filters.status
      const textMatches = !query || [task.title, task.description, task.assignee, task.id].some((value) => normalizeText(value).includes(query))
      return statusMatches && textMatches
    })
    if (filters.order === 'original') return matched
    return matched
      .map((task, index) => ({ task, index, title: normalizeText(task.title) }))
      .sort((left, right) => {
        const result = left.title < right.title ? -1 : left.title > right.title ? 1 : 0
        return filters.order === 'title-asc' ? result || left.index - right.index : -result || left.index - right.index
      })
      .map((entry) => entry.task)
  }, [tasks, filters])

  const confirmFilters = (values: ViewFilters) => {
    const next = canonicalFilters(values)
    setDraft(next)
    const target = taskId ? taskUrl(project.id, taskId, view, next) : projectUrl(project.id, view, next)
    window.location.hash = target
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
        <div className="view-controls" aria-label="Pogled opravil">
          <div>
            <label htmlFor="filter-query">Iskanje v povezavi</label>
            <input id="filter-query" type="search" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} />
          </div>
          <div>
            <label htmlFor="filter-status">Stanje v povezavi</label>
            <select id="filter-status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ViewFilters['status'] })}>
              <option value="all">all</option>
              <option value="todo">todo</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-order">Vrstni red v povezavi</label>
            <select id="filter-order" value={draft.order} onChange={(event) => setDraft({ ...draft, order: event.target.value as ViewFilters['order'] })}>
              <option value="original">original</option>
              <option value="title-asc">title-asc</option>
              <option value="title-desc">title-desc</option>
            </select>
          </div>
          <button className="button" type="button" onClick={() => confirmFilters(draft)}>Uporabi pogled</button>
          <button className="button" type="button" onClick={() => { setDraft(defaultFilters); confirmFilters(defaultFilters) }}><RotateCcw size={15} aria-hidden="true" />Ponastavi pogled</button>
        </div>
        <p className="result-count" role="status" aria-label="Rezultati povezave">Prikazano: {visibleTasks.length} od {tasks.length}.</p>
        {view === 'board' ? <TaskBoard tasks={visibleTasks} view={view} filters={filters} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : visibleTasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>Ni zadetkov.</h3><p>Spremeni iskanje ali ponastavi pogled.</p></div> : <div className="table-scroll">
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
        {tasks.length > 0 && <div className="table-footer"><span>Pogled opravil po nastavitvah</span><span>{counts.done} / {tasks.length} končanih</span></div>}
      </section>
    </>}
    {taskId && <TaskDetails key={taskId} project={project} taskId={taskId} view={view} filters={filters} />}
  </>
}

export function App() {
  const route = useRoute()
  const view = route?.view ?? 'table'
  const filters = route?.filters ?? defaultFilters
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
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} filters={filters} />}
      </main>
    </div>
  </div>
}
