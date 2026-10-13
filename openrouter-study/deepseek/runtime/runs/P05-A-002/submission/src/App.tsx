import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import { useState } from 'react'
import type { Project, Task, TaskStatus } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

type PageSize = 'all' | '2' | '5' | '10'
type PageFilter = 'all' | TaskStatus

const pageSizeOptions: { value: PageSize; label: string }[] = [
  { value: 'all', label: 'Vse' },
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
]

const filterOptions: { value: PageFilter; label: string }[] = [
  { value: 'all', label: 'Vse' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

function slicePage<T>(items: T[], size: PageSize, page: number) {
  const sizeValue = size === 'all' ? Math.max(items.length, 1) : Number(size)
  const pageCount = items.length === 0 ? 0 : Math.ceil(items.length / sizeValue)
  const current = Math.min(Math.max(page, 1), Math.max(pageCount, 1))
  const start = (current - 1) * sizeValue
  return { pageTasks: items.slice(start, start + sizeValue), pageCount, current, start }
}

function Pagination({ pageSize, filter, pageCount, current, start, count, onSize, onFilter, onPage }: {
  pageSize: PageSize
  filter: PageFilter
  pageCount: number
  current: number
  start: number
  count: number
  onSize: (value: PageSize) => void
  onFilter: (value: PageFilter) => void
  onPage: (value: number) => void
}) {
  const shown = count === 0 ? 0 : Math.min(pageSize === 'all' ? count : Number(pageSize), count - start)
  const status = count === 0
    ? 'Stran 0 od 0. Prikazano 0–0 od 0.'
    : `Stran ${current} od ${pageCount}. Prikazano ${start + 1}–${start + shown} od ${count}.`
  const canGoBack = pageCount > 0 && current > 1
  const canGoForward = pageCount > 0 && current < pageCount
  return <div className="task-controls">
    <label className="control-field"><span>Velikost strani</span>
      <select aria-label="Velikost strani" value={pageSize} onChange={(event) => onSize(event.target.value as PageSize)}>
        {pageSizeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label className="control-field"><span>Filter strani</span>
      <select aria-label="Filter strani" value={filter} onChange={(event) => onFilter(event.target.value as PageFilter)}>
        {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <div className="pagination-buttons" role="group" aria-label="Premikanje po straneh">
      <button type="button" disabled={!canGoBack} onClick={() => onPage(1)}>Prva stran</button>
      <button type="button" disabled={!canGoBack} onClick={() => onPage(current - 1)}>Prejšnja stran</button>
      <button type="button" disabled={!canGoForward} onClick={() => onPage(current + 1)}>Naslednja stran</button>
      <button type="button" disabled={!canGoForward} onClick={() => onPage(pageCount)}>Zadnja stran</button>
    </div>
    <p className="pagination-status" role="status" aria-label="Stanje straničenja">{status}</p>
  </div>
}

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [pageSize, setPageSize] = useState<PageSize>('all')
  const [filter, setFilter] = useState<PageFilter>('all')
  const [page, setPage] = useState(1)
  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }
  const filtered = tasks?.filter((task) => filter === 'all' || task.status === filter) ?? []
  const { pageTasks, pageCount, current, start } = slicePage(filtered, pageSize, page)

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
        <Pagination
          pageSize={pageSize}
          filter={filter}
          pageCount={pageCount}
          current={current}
          start={start}
          count={filtered.length}
          onSize={(value) => { setPageSize(value); setPage(1) }}
          onFilter={(value) => { setFilter(value); setPage(1) }}
          onPage={setPage}
        />
        {view === 'board' ? <TaskBoard tasks={pageTasks} /> : tasks.length === 0
          ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div>
          : filtered.length === 0
            ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>Ni opravil za izbrani filter</h3><p>Izberi drug filter ali prikaži vsa opravila.</p></div>
            : <div className="table-scroll">
              <table>
                <caption className="visually-hidden">Opravila projekta {project.name}</caption>
                <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
                <tbody>{pageTasks.map((task) => <tr key={task.id} data-task-id={task.id}>
                  <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
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
