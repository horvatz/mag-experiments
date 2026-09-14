import { ArrowUpRight, Check, CheckCheck, ChevronRight, Circle, CircleDot, Columns3, FolderClosed, Layers, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry, setData } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }

  return <>
    <div className="project-heading">
      <div className={`project-symbol symbol-${project.id === 'web' ? 'green' : 'purple'}`}><FolderClosed size={25} strokeWidth={1.7} aria-hidden="true" /></div>
      <div><p className="eyebrow">Pregled projekta</p><h1>{project.name}</h1></div>
    </div>
    <p className="project-intro">Opravila, odgovornosti in roki na enem mestu.</p>

    {loading && <Loading label="Nalaganje opravil …" />}
    {error && <LoadError message={error} retry={retry} />}
    {tasks && <>
      <div className="summary-grid" aria-label="Pregled stanj opravil">
        <div className="summary-item"><span className="summary-icon summary-todo"><Circle size={18} aria-hidden="true" /></span><div><span className="summary-label">Pripravljeno</span><strong>{counts.todo}</strong></div></div>
        <div className="summary-item"><span className="summary-icon summary-progress"><CircleDot size={18} aria-hidden="true" /></span><div><span className="summary-label">V delu</span><strong>{counts.in_progress}</strong></div></div>
        <div className="summary-item"><span className="summary-icon summary-done"><CheckCheck size={19} aria-hidden="true" /></span><div><span className="summary-label">Končano</span><strong>{counts.done}</strong></div></div>
      </div>

      <section className="task-section" aria-labelledby="tasks-title">
        <div className="section-heading">
          <div><ListTodo size={19} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{tasks.length}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        {view === 'board' ? <TaskBoard tasks={tasks} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{tasks.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {tasks.length > 0 && <div className="table-footer"><span><span className="footer-dot" aria-hidden="true" />Pregled vseh opravil projekta</span><span>{counts.done} / {tasks.length} končanih</span></div>}
      </section>
    </>}
    {taskId && <TaskDetails key={taskId} project={project} taskId={taskId} view={view} onSaved={(saved) => {
      if (tasks) setData(tasks.map((task) => task.id === saved.id ? saved : task))
      else retry()
    }} />}
  </>
}

export function App() {
  const route = useRoute()
  const view = route?.view ?? 'table'
  const { data: projects, error, loading, retry } = useResource<Project[]>('/api/projects')
  const project = projects?.find((entry) => entry.id === route?.projectId)

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Preskoči na vsebino</a>
    <aside className="sidebar">
      <a className="brand" href={projectUrl(projects?.[0]?.id ?? 'web', view)} aria-label="Prostor – začetna stran"><img src="/favicon.svg" alt="" width="33" height="33" /><span>prostor<span className="brand-period">.</span></span></a>
      <div className="workspace-label"><Layers size={16} aria-hidden="true" /><span>Delovni prostor</span></div>
      <nav className="project-nav" aria-label="Projekti"><p className="nav-label">Projekti{projects && <span>{projects.length}</span>}</p>
        {projects?.map((entry, index) => <a key={entry.id} href={projectUrl(entry.id, view)} className={`project-nav-link ${project?.id === entry.id ? 'active' : ''}`} aria-current={project?.id === entry.id ? 'page' : undefined}><span className={`project-dot dot-${index % 2}`} aria-hidden="true" /><span>{entry.name}</span>{project?.id === entry.id && <ChevronRight size={15} aria-hidden="true" />}</a>)}
      </nav>
      <div className="sidebar-footer"><span className="workspace-avatar"><Layers size={18} aria-hidden="true" /></span><div><strong>Skupni projekti</strong><span>Prostor za dobro delo</span></div></div>
    </aside>

    <div className="workspace">
      <header className="topbar"><div className="breadcrumb"><FolderClosed size={15} aria-hidden="true" /><span>Projekti</span>{project && <><ChevronRight size={13} aria-hidden="true" /><span>{project.name}</span></>}</div><span className="topbar-note">Vse na svojem mestu.</span></header>
      <main id="main-content" tabIndex={-1}>
        {loading && <Loading label="Nalaganje projektov …" />}
        {error && <LoadError message={error} retry={retry} />}
        {projects && !project && <div className="state-message"><FolderClosed size={30} aria-hidden="true" /><h1>Projekt ne obstaja</h1><p>Izberi enega od projektov v seznamu.</p>{projects[0] && <a className="button" href={projectUrl(projects[0].id, view)}>Nazaj na projekte</a>}</div>}
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} />}
      </main>
      <footer className="workspace-footer"><span>PROSTOR</span><span>Manj iskanja. Več pregleda.</span></footer>
    </div>
  </div>
}
