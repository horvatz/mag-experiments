import { ArrowRight, CalendarDays, Clock, ListTodo, Check, Table2, Columns3 } from "lucide-react"
import { formatDate } from "./formatDate"
import { getTaskDueGroup } from "./calculateDueGroup"
import type { Task } from "../shared/types"
import { useState, useRef } from "react"
import { useRef, useMemo } from "react"
import { projectUrl, taskUrl } from "./navigation"
export type DueDateFilter = "all" | "overdue" | "today" | "week" | "later" | "done"


function getFilteredTasks(tasks: Task[], filter: DueDateFilter): Task[] {
  if (filter === "done") {
    return tasks.filter((t) => t.status === "done")
  }
  return tasks.filter((t) => t.status !== "done" && getTaskDueGroup(t) === filter)
}

function getGroupedCounts(tasks: Task[]) {
  const counts = { overdue: 0, today: 0, week: 0, later: 0, done: 0, total: 0 }
  tasks.forEach((task) => {
    counts.total++
    if (task.status === "done") {
      counts.done++
    } else {
      const group = getTaskDueGroup(task)
      counts[group]++
    }
  })
  return counts
}

export function TaskBoard({ tasks }: { tasks: Task[]; referenceDate?: string; filter?: DueDateFilter }) {
  const [refDate, setRefDate] = useState(referenceDate || "2026-09-21")
  const [filter, setFilter] = useState<DueDateFilter>(filter || "all")
  const filtered = getFilteredTasks(tasks, filter)
  const counts = getGroupedCounts(tasks)

  export const getCountText = (count: number, label: string) => 
    count > 0 ? (
      <div className="count-item" aria-label={\"Število rokov \" + label}>
        <span className="count-value">{count}</span>
        <span className="count-label">({label})</span>
      </div>
    ) : 0
  <select className="duedate-dropdown" value={filter} onChange={(e) => setFilter(e.target.value as DueDateFilter)} aria-label="Pogled rokov">
    <option value="all">all</option>
    <option value="overdue">overdue</option>
    <option value="today">today</option>
    <option value="week">week</option>
    <option value="later">later</option>
    <option value="done">done</option>
  </select>
  <div className="date-input">
    <label htmlFor="ref-date">Referenčni datum</label>
    <input type="date" id="ref-date" value={refDate} onChange={(e) => { const v = e.target.value; if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) setRefDate(v) }} />
    {counts.overdue > 0 && filter !== "done" && <p>Aria: Število rokov overdue: {counts.overdue}</p>}
    {filter === "done" && counts.done === 0 && <p>Ni opravil v izbrani skupini</p>}
  </div>
  {filter !== "all" && counts.total > 0 && filtered.length > 0 && <div className="table-scroll">
    <table><caption>Opravila</caption><thead><tr><th>Opravilo</th><th>Stanje</th><th>Odgovorna oseba</th><th>Rok</th></tr></thead>
    <tbody>{filtered.map(t => <tr data-task-id={t.id}><td><div className="task-cell"><span className={`task-state-icon ${t.status === "done" ? "completed" : ""}`}>{t.status === "done" ? <Check size={13}/>: t.status === "in_progress" ? <span/>: null}</span><a href={taskUrl(project.id, t.id)}>{t.title}</a></div></td><td><StatusBadge status={t.status}/></td><td><span className="person"><Avatar name={t.assignee}/><span>{t.assignee}</span></span></td><td><time dateTime={t.dueDate}>{formatDate(t.dueDate)}</time></td></tr>)}</tbody></table></div>
    </div>
  );
}
