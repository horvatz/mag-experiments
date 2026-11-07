import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Project, Task, TaskStatus } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

type StatusFilter = 'all' | TaskStatus

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036F]/gu, '').toLowerCase()
}

function taskHaystack(task: Task) {
  return normalizeSearch([task.id, task.title, task.description, task.assignee].join(' '))
}

function matchesSearch(task: Task, query: string) {
  const terms = query.trim().split(/\s+/).filter(Boolean)
  const haystack = taskHaystack(task)
  return terms.every((term) => haystack.includes(normalizeSearch(term)))
}

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [personFilter, setPersonFilter] = useState('all')
  const assignees = useMemo(
    () => Array.from(new Set((tasks ?? []).map((task) => task.assignee).filter(Boolean))),
    [tasks],
  )
  const visibleTasks = useMemo(() => (tasks ?? []).filter((task) =>
    matchesSearch(task, query)
    && (statusFilter === 'all' || task.status === statusFilter)
    && (personFilter === 'all' || task.assignee === personFilter),
  ), [personFilter, query, statusFilter, tasks])
  const counts = useMemo(() => ({
    todo: visibleTasks.filter((task) => task.status === 'todo').length,
    in_progress: visibleTasks.filter((task) => task.status === 'in_progress').length,
    done: visibleTasks.filter((task) => task.status === 'done').length,
  }), [visibleTasks])
  const clearFilters = () => {
    setQuery('')
    setStatusFilter('all')
    setPersonFilter('all')
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
            <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="task-filters" role="group" aria-label="Filtri opravil">
          <div className="filter-field search-field">
            <label htmlFor="task-search">Išči opravila</label>
            <input id="task-search" type="search" value={query} placeholder="Išči opravila" onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="filter-field">
            <label htmlFor="task-status-filter">Filter stanja</label>
            <select id="task-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
              <option value="all">Vsa stanja</option>
              <option value="todo">Pripravljeno</option>
              <option value="in_progress">V delu</option>
              <option value="done">Končano</option>
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="task-person-filter">Filter odgovorne osebe</label>
            <select id="task-person-filter" value={personFilter} onChange={(event) => setPersonFilter(event.target.value)}>
              <option value="all">Vse osebe</option>
              {assignees.map((assignee) => <option key={assignee} value={assignee}>{assignee}</option>)}
            </select>
          </div>
          <button type="button" className="button clear-filters" onClick={clearFilters}>Počisti filtre</button>
        </div>
        <p className="filter-status" role="status" aria-label="Rezultati filtriranja">Prikazano: {visibleTasks.length} od {tasks.length}.</p>
        {view === 'board' && <TaskBoard tasks={visibleTasks} />}
        {view === 'board' && tasks.length > 0 && visibleTasks.length === 0 && <div className="state-message compact-state"><h3>Ni zadetkov.</h3><p>Poskusi z drugimi besedami ali filtri.</p></div>}
        {view === 'table' && tasks.length === 0 && <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div>}
        {view === 'table' && tasks.length > 0 && visibleTasks.length === 0 && <div className="state-message compact-state"><h3>Ni zadetkov.</h3><p>Poskusi z drugimi besedami ali filtri.</p></div>}
        {view === 'table' && visibleTasks.length > 0 && <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{visibleTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {visibleTasks.length > 0 && <div className="table-footer"><span>Prikazanih opravil projekta</span><span>{counts.done} / {visibleTasks.length} končanih</span></div>}
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
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} />}
      </main>
    </div>
  </div>
}
