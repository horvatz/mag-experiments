import { useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { TaskOrderControls } from './TaskOrderControls.tsx'
import { useResource } from './useResource.ts'

type OrderHistory = { source: string; order: string[]; undo: string[][]; redo: string[][] }

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [savedHistory, setSavedHistory] = useState<OrderHistory | null>(null)
  const taskIds = tasks?.map((task) => task.id) ?? []
  const source = JSON.stringify(taskIds)
  const initialHistory: OrderHistory = { source, order: taskIds, undo: [], redo: [] }
  const history = savedHistory?.source === source ? savedHistory : initialHistory
  const taskById = new Map(tasks?.map((task) => [task.id, task]) ?? [])
  const visibleTasks = tasks ? history.order.map((id) => taskById.get(id)).filter((task): task is Task => task !== undefined) : null

  function moveTask(taskId: string, direction: -1 | 1) {
    setSavedHistory((saved) => {
      const current = saved?.source === source ? saved : initialHistory
      const index = current.order.indexOf(taskId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.order.length) return current
      const nextOrder = [...current.order]
      ;[nextOrder[index], nextOrder[target]] = [nextOrder[target], nextOrder[index]]
      return { ...current, order: nextOrder, undo: [...current.undo, current.order].slice(-20), redo: [] }
    })
  }

  function undoMove() {
    setSavedHistory((saved) => {
      const current = saved?.source === source ? saved : initialHistory
      if (current.undo.length === 0) return current
      return { ...current, order: current.undo[current.undo.length - 1], undo: current.undo.slice(0, -1), redo: [...current.redo, current.order] }
    })
  }

  function redoMove() {
    setSavedHistory((saved) => {
      const current = saved?.source === source ? saved : initialHistory
      if (current.redo.length === 0) return current
      return { ...current, order: current.redo[current.redo.length - 1], undo: [...current.undo, current.order].slice(-20), redo: current.redo.slice(0, -1) }
    })
  }

  function restoreInitialOrder() {
    setSavedHistory((saved) => {
      const current = saved?.source === source ? saved : initialHistory
      if (current.order.length === taskIds.length && current.order.every((id, index) => id === taskIds[index])) return current
      return { ...current, order: taskIds, undo: [...current.undo, current.order].slice(-20), redo: [] }
    })
  }

  const counts = {
    todo: visibleTasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: visibleTasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: visibleTasks?.filter((task) => task.status === 'done').length ?? 0,
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
    {visibleTasks && <>
      <section className="task-section" aria-labelledby="tasks-title">
        <div className="section-heading">
          <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{visibleTasks.length}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="order-toolbar">
          <button type="button" className="button" aria-label="Razveljavi premik" onClick={undoMove} disabled={history.undo.length === 0}>Razveljavi premik</button>
          <button type="button" className="button" aria-label="Ponovi premik" onClick={redoMove} disabled={history.redo.length === 0}>Ponovi premik</button>
          <button type="button" className="button" aria-label="Začetni vrstni red" onClick={restoreInitialOrder} disabled={history.order.length === taskIds.length && history.order.every((id, index) => id === taskIds[index])}>Začetni vrstni red</button>
          <span className="order-history" role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {history.undo.length}. Ponovitve: {history.redo.length}.</span>
        </div>
        {view === 'board' ? <TaskBoard tasks={visibleTasks} onMove={moveTask} /> : visibleTasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{visibleTasks.map((task, index) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><TaskOrderControls taskId={task.id} position={index + 1} total={visibleTasks.length} onMove={moveTask} /><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {visibleTasks.length > 0 && <div className="table-footer"><span>Pregled vseh opravil projekta</span><span>{counts.done} / {visibleTasks.length} končanih</span></div>}
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
