import { useState } from 'react'
import { ArrowUpRight, Check, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
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
  { value: 'all', label: 'Vsa stanja' },
  { value: 'todo', label: 'Pripravljeno' },
  { value: 'in_progress', label: 'V delu' },
  { value: 'done', label: 'Končano' },
]

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [pageSize, setPageSize] = useState<PageSize>('all')
  const [statusFilter, setStatusFilter] = useState<PageFilter>('all')
  const [page, setPage] = useState(1)
  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }

  const filtered = (tasks ?? []).filter((task) => statusFilter === 'all' || task.status === statusFilter)
  const pageSizeNumber = pageSize === 'all' ? filtered.length : Number(pageSize)
  const pageCount = pageSizeNumber === 0 ? 0 : Math.ceil(filtered.length / pageSizeNumber)
  const currentPage = pageCount === 0 ? 0 : Math.min(page, pageCount)
  const start = pageCount === 0 ? 0 : (currentPage - 1) * pageSizeNumber
  const visible = pageCount === 0 ? [] : filtered.slice(start, start + pageSizeNumber)
  const pageStatus = pageCount === 0
    ? 'Stran 0 od 0. Prikazano 0–0 od 0.'
    : `Stran ${currentPage} od ${pageCount}. Prikazano ${start + 1}–${start + visible.length} od ${filtered.length}.`
  const atFirstPage = pageCount === 0 || currentPage <= 1
  const atLastPage = pageCount === 0 || currentPage >= pageCount

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
        <div className="pagination-bar">
          <div className="pagination-fields">
            <label className="select-field"><span>Velikost strani</span>
              <select value={pageSize} onChange={(event) => { setPageSize(event.target.value as PageSize); setPage(1) }}>
                {pageSizeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="select-field"><span>Filter strani</span>
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as PageFilter); setPage(1) }}>
                {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <p className="page-status" role="status" aria-label="Stanje straničenja">{pageStatus}</p>
          <div className="pagination-nav" role="group" aria-label="Premikanje po straneh">
            <button type="button" aria-label="Prva stran" title="Prva stran" disabled={atFirstPage} onClick={() => setPage(1)}><ChevronFirst size={17} aria-hidden="true" /></button>
            <button type="button" aria-label="Prejšnja stran" title="Prejšnja stran" disabled={atFirstPage} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} aria-hidden="true" /></button>
            <button type="button" aria-label="Naslednja stran" title="Naslednja stran" disabled={atLastPage} onClick={() => setPage(currentPage + 1)}><ChevronRight size={17} aria-hidden="true" /></button>
            <button type="button" aria-label="Zadnja stran" title="Zadnja stran" disabled={atLastPage} onClick={() => setPage(pageCount)}><ChevronLast size={17} aria-hidden="true" /></button>
          </div>
        </div>
        {view === 'board' ? <TaskBoard tasks={visible} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : filtered.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>Ni opravil za izbrani filter</h3><p>Izberi drugo stanje ali filter ponastavi na Vsa stanja.</p></div> : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{visible.map((task) => <tr key={task.id} data-task-id={task.id}>
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
