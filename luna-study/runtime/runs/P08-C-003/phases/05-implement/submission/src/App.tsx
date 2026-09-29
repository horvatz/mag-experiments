import { useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { deadlineCounts, filterByDeadline, type DeadlineGroup } from './deadlineGroups.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [referenceDate, setReferenceDate] = useState('2026-09-21')
  const [dateText, setDateText] = useState('2026-09-21')
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineGroup>('all')
  const [dateError, setDateError] = useState(false)
  const counts = tasks ? deadlineCounts(tasks, referenceDate) : null
  const visibleTasks = tasks ? filterByDeadline(tasks, referenceDate, deadlineFilter) : []
  const labels = { overdue: 'Zapadlo', today: 'Danes', week: 'Naslednjih 7 dni', later: 'Pozneje', done: 'Končano' } as const

  function changeDate(value: string) {
    setDateText(value)
    if (!value) { setDateError(true); return }
    const parsed = new Date(`${value}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      setDateError(true)
      return
    }
    setReferenceDate(value)
    setDateError(false)
  }

  return <>
    <div className="project-overview">
      <div className="project-heading">
        <h1>{project.name}</h1>
        <p className="project-intro">Opravila, odgovornosti in roki na enem mestu.</p>
      </div>
      {tasks && counts && <div className="deadline-panel">
        <div className="deadline-controls">
          <label>Referenčni datum<input type="date" value={dateText} onChange={(event) => changeDate(event.currentTarget.value)} /></label>
          <label>Pogled rokov<select value={deadlineFilter} onChange={(event) => setDeadlineFilter(event.currentTarget.value as DeadlineGroup)}>
            <option value="all">Vsi</option>
            <option value="overdue">Zapadlo</option>
            <option value="today">Danes</option>
            <option value="week">Naslednjih 7 dni</option>
            <option value="later">Pozneje</option>
            <option value="done">Končano</option>
          </select></label>
        </div>
        {dateError && <p role="alert" className="date-alert">Vnesi veljaven referenčni datum.</p>}
        <div className="deadline-counts" aria-label="Pregled stanj opravil">
          {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => <div className="deadline-count" key={key}>
            <span className="summary-label">{labels[key]}</span>
            <strong aria-label={`Število rokov ${key}`}>{counts[key]}</strong>
          </div>)}
        </div>
      </div>}
    </div>

    {loading && <Loading label="Nalaganje opravil …" />}
    {error && <LoadError message={error} retry={retry} />}
    {tasks && <section className="task-section" aria-labelledby="tasks-title">
      <div className="section-heading">
        <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{visibleTasks.length}</span></div>
        <div className="view-switch" role="group" aria-label="Prikaz opravil">
          <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
          <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
        </div>
      </div>
      {tasks.length > 0 && visibleTasks.length === 0 ? <div className="state-message"><h3>Ni opravil v izbrani skupini.</h3></div> : view === 'board' ? <TaskBoard tasks={visibleTasks} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
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
      {tasks.length > 0 && <div className="table-footer"><span>Pregled rokov projekta</span><span>{visibleTasks.length} / {tasks.length} opravil</span></div>}
    </section>}
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
