import { useReducer } from 'react'
import { ArrowUpRight, Check, Columns3, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { OrderHistoryControls, TaskMoveControls, type MoveTask } from './TaskOrderControls.tsx'
import { createTaskOrder, taskOrderReducer } from './taskOrder.ts'

// Mounted only once tasks have loaded; the parent is keyed by project ID.
// View changes and task details leave this state in place.
export function ProjectTasks({ project, tasks, view }: { project: Project; tasks: Task[]; view: TaskView }) {
  const [order, dispatch] = useReducer(taskOrderReducer, tasks.map((task) => task.id), createTaskOrder)
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const orderedTasks = order.current.map((id) => byId.get(id)!)
  const positions = new Map(order.current.map((id, index) => [id, index + 1]))
  const onMove: MoveTask = (id, direction) => dispatch({ type: 'move', id, direction })
  const done = tasks.filter((task) => task.status === 'done').length

  return <section className="task-section" aria-labelledby="tasks-title">
    <div className="section-heading">
      <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{tasks.length}</span></div>
      <div className="view-switch" role="group" aria-label="Prikaz opravil">
        <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
        <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
      </div>
    </div>
    <OrderHistoryControls state={order} dispatch={dispatch} />
    {view === 'board' ? <TaskBoard tasks={orderedTasks} positions={positions} onMove={onMove} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
      <table>
        <caption className="visually-hidden">Opravila projekta {project.name}</caption>
        <thead><tr><th scope="col">Opravilo</th><th scope="col">Mesto</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
        <tbody>{orderedTasks.map((task, index) => <tr key={task.id} data-task-id={task.id}>
          <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
          <td><TaskMoveControls id={task.id} position={index + 1} total={tasks.length} onMove={onMove} /></td>
          <td><StatusBadge status={task.status} /></td>
          <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
          <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
          <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
        </tr>)}</tbody>
      </table>
    </div>}
    {tasks.length > 0 && <div className="table-footer"><span>Pregled vseh opravil projekta</span><span>{done} / {tasks.length} končanih</span></div>}
  </section>
}
