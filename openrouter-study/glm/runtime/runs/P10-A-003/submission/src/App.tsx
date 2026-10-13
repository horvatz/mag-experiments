import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

type MoveDirection = 'up' | 'down'

function sameTaskOrder(first: Task[] | null, second: Task[] | null) {
  if (!first || !second || first.length !== second.length) return false
  return first.every((task, index) => task.id === second[index]?.id)
}

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const [orderedTasks, setOrderedTasks] = useState<Task[] | null>(null)
  const [undoStack, setUndoStack] = useState<Task[][]>([])
  const [redoStack, setRedoStack] = useState<Task[][]>([])

  useEffect(() => {
    if (tasks) setOrderedTasks(tasks)
  }, [tasks])

  const currentTasks = orderedTasks ?? tasks
  const counts = {
    todo: currentTasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: currentTasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: currentTasks?.filter((task) => task.status === 'done').length ?? 0,
  }

  const moveTask = (taskId: string, direction: MoveDirection) => {
    if (!currentTasks) return
    const index = currentTasks.findIndex((task) => task.id === taskId)
    if (index < 0) return
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === currentTasks.length - 1)) return
    const nextTasks = [...currentTasks]
    const target = direction === 'up' ? index - 1 : index + 1
    ;[nextTasks[index], nextTasks[target]] = [nextTasks[target], nextTasks[index]]
    setUndoStack((stack) => [...stack.slice(-19), currentTasks])
    setRedoStack([])
    setOrderedTasks(nextTasks)
  }

  const undoMove = () => {
    const previousTasks = undoStack.at(-1)
    if (!currentTasks || !previousTasks) return
    setUndoStack((stack) => stack.slice(0, -1))
    setRedoStack((stack) => [...stack, currentTasks])
    setOrderedTasks(previousTasks)
  }

  const redoMove = () => {
    const nextTasks = redoStack.at(-1)
    if (!currentTasks || !nextTasks) return
    setRedoStack((stack) => stack.slice(0, -1))
    setUndoStack((stack) => [...stack.slice(-19), currentTasks])
    setOrderedTasks(nextTasks)
  }

  const resetOrder = () => {
    if (!currentTasks || !tasks || sameTaskOrder(currentTasks, tasks)) return
    setUndoStack((stack) => [...stack.slice(-19), currentTasks])
    setRedoStack([])
    setOrderedTasks(tasks)
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
        <div className="order-history" role="group" aria-label="Zgodovina vrstnega reda">
          <div className="order-history-controls">
            <button type="button" disabled={undoStack.length === 0} onClick={undoMove}>Razveljavi premik</button>
            <button type="button" disabled={redoStack.length === 0} onClick={redoMove}>Ponovi premik</button>
            <button type="button" disabled={sameTaskOrder(currentTasks, tasks)} onClick={resetOrder}>Začetni vrstni red</button>
          </div>
          <span className="order-history-status" role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {undoStack.length}. Ponovitve: {redoStack.length}.</span>
        </div>
        {view === 'board' ? <TaskBoard tasks={currentTasks ?? []} onMove={moveTask} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Vrstni red</th><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col">Premiki</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{(currentTasks ?? []).map((task, index) => <tr key={task.id} data-task-id={task.id}>
              <td className="order-cell"><span className="task-rank" aria-label={`Mesto opravila ${task.id}`}>{index + 1}</span></td>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td><div className="move-controls">
                <button type="button" disabled={index === 0} onClick={() => moveTask(task.id, 'up')}>Premakni {task.id} gor</button>
                <button type="button" disabled={index === (currentTasks?.length ?? 0) - 1} onClick={() => moveTask(task.id, 'down')}>Premakni {task.id} dol</button>
              </div></td>
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
