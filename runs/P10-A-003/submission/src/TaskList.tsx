import { useReducer } from 'react'
import { ArrowUpRight, Check, Columns3, ListTodo, RotateCcw, Redo2, Table2, Undo2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskMoveControls } from './TaskMoveControls.tsx'
import { createTaskOrder, isInitialOrder, taskOrderReducer, type MoveDirection } from './taskOrder.ts'

export function TaskList({ project, tasks, view }: { project: Project; tasks: Task[]; view: TaskView }) {
  const [order, dispatch] = useReducer(taskOrderReducer, tasks.map((task) => task.id), createTaskOrder)
  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  const orderedTasks = order.present.map((id) => tasksById.get(id)!)
  const move = (id: string, direction: MoveDirection) => dispatch({ type: 'move', id, direction })

  return <section className="task-section" aria-labelledby="tasks-title">
    <div className="section-heading">
      <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{tasks.length}</span></div>
      <div className="view-switch" role="group" aria-label="Prikaz opravil">
        <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = projectUrl(project.id) }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
        <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = projectUrl(project.id, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
      </div>
    </div>
    <div className="order-toolbar">
      <div className="order-actions" role="group" aria-label="Vrstni red opravil">
        <button className="button" type="button" disabled={order.past.length === 0} onClick={() => dispatch({ type: 'undo' })}><Undo2 size={15} aria-hidden="true" />Razveljavi premik</button>
        <button className="button" type="button" disabled={order.future.length === 0} onClick={() => dispatch({ type: 'redo' })}><Redo2 size={15} aria-hidden="true" />Ponovi premik</button>
        <button className="button" type="button" disabled={isInitialOrder(order)} onClick={() => dispatch({ type: 'reset' })}><RotateCcw size={15} aria-hidden="true" />Začetni vrstni red</button>
      </div>
      <p className="order-history" role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {order.past.length}. Ponovitve: {order.future.length}.</p>
    </div>
    {view === 'board' ? <TaskBoard tasks={orderedTasks} onMove={move} /> : tasks.length === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div> : <div className="table-scroll">
      <table>
        <caption className="visually-hidden">Opravila projekta {project.name}</caption>
        <thead><tr><th scope="col">Opravilo</th><th scope="col">Mesto</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
        <tbody>{orderedTasks.map((task, index) => <tr key={task.id} data-task-id={task.id}>
          <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
          <td><TaskMoveControls id={task.id} position={index + 1} total={tasks.length} onMove={move} /></td>
          <td><StatusBadge status={task.status} /></td>
          <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
          <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
          <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
        </tr>)}</tbody>
      </table>
    </div>}
    {tasks.length > 0 && <div className="table-footer"><span>Pregled vseh opravil projekta</span><span>{tasks.filter((task) => task.status === 'done').length} / {tasks.length} končanih</span></div>}
  </section>
}
