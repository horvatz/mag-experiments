import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Redo2, RotateCcw, Table2, Undo2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [order, setOrder] = useState<string[] | null>(null)
  const [undoStack, setUndoStack] = useState<string[][]>([])
  const [redoStack, setRedoStack] = useState<string[][]>([])

  useEffect(() => {
    if (!tasks) return
    setOrder(tasks.map((task) => task.id))
    setUndoStack([])
    setRedoStack([])
  }, [tasks])

  const taskById = useMemo(() => new Map((tasks ?? []).map((task) => [task.id, task])), [tasks])
  const orderedTasks = useMemo(() => order?.flatMap((id) => {
    const task = taskById.get(id)
    return task ? [task] : []
  }) ?? [], [order, taskById])
  const initialOrder = useMemo(() => (tasks ?? []).map((task) => task.id), [tasks])
  const isInitialOrder = order !== null && order.length === initialOrder.length && order.every((id, index) => id === initialOrder[index])

  const moveTask = (id: string, direction: -1 | 1) => {
    if (!order) return
    const currentIndex = order.indexOf(id)
    const nextIndex = currentIndex + direction
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= order.length) return
    const nextOrder = [...order]
    nextOrder[currentIndex] = order[nextIndex]
    nextOrder[nextIndex] = order[currentIndex]
    setUndoStack((stack) => [...stack, order].slice(-20))
    setRedoStack([])
    setOrder(nextOrder)
  }

  const undoMove = () => {
    if (!order || undoStack.length === 0) return
    const previous = undoStack[undoStack.length - 1]
    setUndoStack((stack) => stack.slice(0, -1))
    setRedoStack((stack) => [...stack, order])
    setOrder(previous)
  }

  const redoMove = () => {
    if (!order || redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setRedoStack((stack) => stack.slice(0, -1))
    setUndoStack((stack) => [...stack, order])
    setOrder(next)
  }

  const resetOrder = () => {
    if (!order || isInitialOrder) return
    setUndoStack((stack) => [...stack, order].slice(-20))
    setRedoStack([])
    setOrder(initialOrder)
  }

  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
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
        <div className="order-history" role="group" aria-label="Upravljanje vrstnega reda">
          <div className="history-buttons">
            <button type="button" className="button" onClick={undoMove} disabled={undoStack.length === 0}><Undo2 size={15} aria-hidden="true" />Razveljavi premik</button>
            <button type="button" className="button" onClick={redoMove} disabled={redoStack.length === 0}><Redo2 size={15} aria-hidden="true" />Ponovi premik</button>
            <button type="button" className="button" onClick={resetOrder} disabled={isInitialOrder}><RotateCcw size={15} aria-hidden="true" />Začetni vrstni red</button>
          </div>
          <p className="history-status" role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {undoStack.length}. Ponovitve: {redoStack.length}.</p>
        </div>
        {view === 'board' ? <TaskBoard tasks={orderedTasks} onMove={moveTask} /> : orderedTasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Vrstni red</span></th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{orderedTasks.map((task, index) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td><div className="task-order-cell"><span className="task-position" aria-label={`Mesto opravila ${task.id}`}>{index + 1}</span><div className="move-controls"><button type="button" className="move-button" aria-label={`Premakni ${task.id} gor`} disabled={index === 0} onClick={() => moveTask(task.id, -1)}><ArrowUp size={13} aria-hidden="true" /><span aria-hidden="true">Gor</span></button><button type="button" className="move-button" aria-label={`Premakni ${task.id} dol`} disabled={index === orderedTasks.length - 1} onClick={() => moveTask(task.id, 1)}><ArrowDown size={13} aria-hidden="true" /><span aria-hidden="true">Dol</span></button></div></div></td>
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
