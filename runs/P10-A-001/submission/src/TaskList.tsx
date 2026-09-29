import { useReducer } from 'react'
import { Check, Columns3, ListTodo, Redo2, RotateCcw, Table2, Undo2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskOrderControls, type MoveTask } from './TaskOrderControls.tsx'
import { createOrder, isInitialOrder, orderReducer } from './taskOrder.ts'

export function TaskList({ project, tasks, view }: { project: Project; tasks: Task[]; view: TaskView }) {
  // This component stays mounted across view/detail changes; ProjectView is keyed by project ID.
  const [order, dispatch] = useReducer(orderReducer, tasks, (entries) => createOrder(entries.map((task) => task.id)))
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const orderedTasks = order.present.map((id) => byId.get(id)!)
  const completed = tasks.filter((task) => task.status === 'done').length
  const move: MoveTask = (id, direction) => dispatch({ type: 'move', id, direction })

  return <section className="task-section" aria-labelledby="tasks-title">
    <div className="section-heading">
      <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{tasks.length}</span></div>
      <div className="view-switch" role="group" aria-label="Prikaz opravil">
        <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
        <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
      </div>
    </div>
    <div className="order-toolbar">
      <div className="order-actions" role="group" aria-label="Urejanje vrstnega reda">
        <button type="button" className="button" disabled={order.past.length === 0} onClick={() => dispatch({ type: 'undo' })}><Undo2 size={15} aria-hidden="true" />Razveljavi premik</button>
        <button type="button" className="button" disabled={order.future.length === 0} onClick={() => dispatch({ type: 'redo' })}><Redo2 size={15} aria-hidden="true" />Ponovi premik</button>
        <button type="button" className="button" disabled={isInitialOrder(order)} onClick={() => dispatch({ type: 'reset' })}><RotateCcw size={15} aria-hidden="true" />Začetni vrstni red</button>
      </div>
      <p role="status" aria-label="Zgodovina vrstnega reda" aria-atomic="true">Razveljavitve: {order.past.length}. Ponovitve: {order.future.length}.</p>
      <p className="order-hint">Mesto velja za vsa opravila, tudi med stanji na tabli. Vrstni red velja do menjave projekta ali osvežitve.</p>
    </div>
    {view === 'board' ? <TaskBoard tasks={orderedTasks} onMove={move} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
      <table>
        <caption className="visually-hidden">Opravila projekta {project.name}</caption>
        <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col">Vrstni red</th></tr></thead>
        <tbody>{orderedTasks.map((task, index) => <tr key={task.id} data-task-id={task.id}>
          <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
          <td><StatusBadge status={task.status} /></td>
          <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
          <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
          <td><TaskOrderControls id={task.id} position={index + 1} total={tasks.length} onMove={move} /></td>
        </tr>)}</tbody>
      </table>
    </div>}
    {tasks.length > 0 && <div className="table-footer"><span>Pregled vseh opravil projekta</span><span>{completed} / {tasks.length} končanih</span></div>}
  </section>
}
