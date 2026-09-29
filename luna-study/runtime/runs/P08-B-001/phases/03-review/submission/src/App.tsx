import { useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { calendarDay, deadlineGroup, deadlineGroups, type DeadlineFilter, type DeadlineGroup } from './deadlines.ts'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [referenceDraft, setReferenceDraft] = useState('2026-09-21')
  const [referenceDate, setReferenceDate] = useState('2026-09-21')
  const [referenceInvalid, setReferenceInvalid] = useState(false)
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>('all')
  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }
  const referenceDay = calendarDay(referenceDate)!
  const deadlineCounts: Record<DeadlineGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  const groupedTasks: Record<DeadlineGroup, Task[]> = { overdue: [], today: [], week: [], later: [], done: [] }
  tasks?.forEach((task) => {
    const group = deadlineGroup(task.status, task.dueDate, referenceDay)
    deadlineCounts[group] += 1
    groupedTasks[group].push(task)
  })
  const visibleTasks = !tasks ? [] : deadlineFilter === 'all' ? tasks : groupedTasks[deadlineFilter]

  function changeReferenceDate(value: string) {
    setReferenceDraft(value)
    const day = calendarDay(value)
    if (day === null) {
      setReferenceInvalid(true)
      return
    }
    setReferenceDate(value)
    setReferenceInvalid(false)
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

    {tasks && <section className="deadline-panel" aria-label="Koledarski pregled rokov">
      <div className="deadline-controls">
        <label className="deadline-field">Referenčni datum<input type="date" value={referenceDraft} onChange={(event) => changeReferenceDate(event.target.value)} /></label>
        <label className="deadline-field">Pogled rokov<select value={deadlineFilter} onChange={(event) => setDeadlineFilter(event.target.value as DeadlineFilter)}>
          <option value="all">Vsi roki</option>
          {deadlineGroups.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
        </select></label>
      </div>
      {referenceInvalid && <p className="deadline-alert" role="alert">Vnesi veljaven referenčni datum.</p>}
      <div className="deadline-counts">
        {deadlineGroups.map(({ key, label }) => <div className="deadline-count" key={key}>
          <span>{label}</span><strong aria-label={`Število rokov ${key}`}>{deadlineCounts[key]}</strong>
        </div>)}
      </div>
    </section>}

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
        {tasks.length === 0 ? view === 'board' ? <TaskBoard tasks={tasks} /> : <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <>
          {visibleTasks.length === 0 && <div className="filter-empty" role="status">Ni opravil v izbrani skupini.</div>}
          {view === 'board' ? <TaskBoard tasks={visibleTasks} /> : <div className="table-scroll">
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
        </>}
        {tasks.length > 0 && <div className="table-footer"><span>{visibleTasks.length} prikazanih od {tasks.length} opravil</span><span>{counts.done} / {tasks.length} končanih</span></div>}
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
