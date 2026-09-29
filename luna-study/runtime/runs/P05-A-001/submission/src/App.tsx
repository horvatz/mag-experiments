import { ArrowUpRight, Check, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import { useState } from 'react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

type PageSize = 'all' | '2' | '5' | '10'
type TaskFilter = 'all' | Task['status']

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [pageSize, setPageSize] = useState<PageSize>('all')
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [page, setPage] = useState(1)
  const allTasks = tasks ?? []
  const filteredTasks = filter === 'all' ? allTasks : allTasks.filter((task) => task.status === filter)
  const pageCount = filteredTasks.length === 0 ? 0 : pageSize === 'all' ? 1 : Math.ceil(filteredTasks.length / Number(pageSize))
  const currentPage = pageCount === 0 ? 0 : Math.min(page, pageCount)
  const pageTasks = pageSize === 'all'
    ? filteredTasks
    : filteredTasks.slice((Math.max(currentPage, 1) - 1) * Number(pageSize), Math.max(currentPage, 1) * Number(pageSize))
  const rangeStart = pageTasks.length === 0 ? 0 : (Math.max(currentPage, 1) - 1) * (pageSize === 'all' ? filteredTasks.length : Number(pageSize)) + 1
  const rangeEnd = pageTasks.length === 0 ? 0 : rangeStart + pageTasks.length - 1
  const counts = {
    todo: allTasks.filter((task) => task.status === 'todo').length,
    in_progress: allTasks.filter((task) => task.status === 'in_progress').length,
    done: allTasks.filter((task) => task.status === 'done').length,
  }

  const changePageSize = (value: PageSize) => { setPageSize(value); setPage(1) }
  const changeFilter = (value: TaskFilter) => { setFilter(value); setPage(1) }
  const goToPage = (target: number) => {
    if (target >= 1 && target <= pageCount) setPage(target)
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
        <div className="pagination-controls">
          <label className="pagination-select">Velikost strani
            <select value={pageSize} onChange={(event) => changePageSize(event.target.value as PageSize)}>
              <option value="all">Vsa opravila</option><option value="2">2</option><option value="5">5</option><option value="10">10</option>
            </select>
          </label>
          <label className="pagination-select">Filter strani
            <select value={filter} onChange={(event) => changeFilter(event.target.value as TaskFilter)}>
              <option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option>
            </select>
          </label>
          <div className="pagination-buttons" aria-label="Krmarjenje po straneh">
            <button type="button" aria-label="Prva stran" onClick={() => goToPage(1)} disabled={currentPage <= 1}><ChevronFirst size={16} aria-hidden="true" /><span>Prva stran</span></button>
            <button type="button" aria-label="Prejšnja stran" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}><ChevronLeft size={16} aria-hidden="true" /><span>Prejšnja stran</span></button>
            <button type="button" aria-label="Naslednja stran" onClick={() => goToPage(currentPage + 1)} disabled={pageCount === 0 || currentPage >= pageCount}><span>Naslednja stran</span><ChevronRight size={16} aria-hidden="true" /></button>
            <button type="button" aria-label="Zadnja stran" onClick={() => goToPage(pageCount)} disabled={pageCount === 0 || currentPage >= pageCount}><span>Zadnja stran</span><ChevronLast size={16} aria-hidden="true" /></button>
          </div>
        </div>
        <p className="pagination-status" role="status" aria-label="Stanje straničenja">Stran {currentPage} od {pageCount}. Prikazano {rangeStart}–{rangeEnd} od {filteredTasks.length}.</p>
        {view === 'board' ? <TaskBoard tasks={pageTasks} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : pageTasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>Ni opravil v izbranem stanju</h3><p>Izberi drugo stanje za prikaz opravil.</p></div> : <div className="table-scroll">
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
