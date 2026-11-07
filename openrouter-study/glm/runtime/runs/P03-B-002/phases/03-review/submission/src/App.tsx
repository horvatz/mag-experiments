import { useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task, TaskStatus } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

type StatusFilter = TaskStatus | 'all'

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Vse' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

function joined(task: Task) {
  return [task.id, task.title, task.description, task.assignee].join(' ')
}

function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

function searchTerms(search: string) {
  return normalize(search).split(/\s+/).filter((term) => term !== '')
}

function searchMatches(task: Task, terms: string[]) {
  const haystack = normalize(joined(task))
  return terms.every((term) => haystack.includes(term))
}

function taskMatches(task: Task, terms: string[], status: StatusFilter, assignee: string) {
  return searchMatches(task, terms) &&
    (status === 'all' || task.status === status) &&
    (assignee === 'all' || task.assignee === assignee)
}

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const terms = searchTerms(search)
  const visibleTasks = tasks?.filter((task) => taskMatches(task, terms, statusFilter, assigneeFilter)) ?? []
  const assignees = ['all', ...Array.from(new Set((tasks ?? []).map((task) => task.assignee).filter((name) => name !== ''))),
  ]
  const noResults = (tasks?.length ?? 0) > 0 && visibleTasks.length === 0
  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setAssigneeFilter('all')
  }
  const counts = {
    todo: visibleTasks.filter((task) => task.status === 'todo').length,
    in_progress: visibleTasks.filter((task) => task.status === 'in_progress').length,
    done: visibleTasks.filter((task) => task.status === 'done').length,
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
            <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="filter-bar">
          <div className="filter-field">
            <label htmlFor="task-search">Išči opravila</label>
            <input id="task-search" type="search" placeholder="Išči opravila" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="filter-field filter-select">
            <label htmlFor="status-filter">Filter stanja</label>
            <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
              {statusFilters.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="filter-field filter-select">
            <label htmlFor="assignee-filter">Filter odgovorne osebe</label>
            <select id="assignee-filter" value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
              {assignees.map((name) => <option key={name} value={name}>{name === 'all' ? 'Vse osebe' : name}</option>)}
            </select>
          </div>
          <button className="button clear-filters" type="button" onClick={resetFilters}>Počisti filtre</button>
          <p className="filter-status" role="status" aria-label="Rezultati filtriranja">Prikazano: {visibleTasks.length} od {tasks.length}.</p>
        </div>
        {view === 'board' ? <>
          {noResults && <div className="state-message no-results"><h3>Ni zadetkov.</h3></div>}
          <TaskBoard tasks={visibleTasks} />
        </> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : noResults ? <div className="state-message no-results"><h3>Ni zadetkov.</h3></div> : <div className="table-scroll">
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
        {visibleTasks.length > 0 && <div className="table-footer"><span>Pregled ustreznih opravil projekta</span><span>{counts.done} / {visibleTasks.length} končanih</span></div>}
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
