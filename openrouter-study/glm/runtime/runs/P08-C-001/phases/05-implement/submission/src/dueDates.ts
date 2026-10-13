import type { Task } from "../shared/types.ts"

export const DEFAULT_DUE_DATE = "2026-09-21" as const

export type DueDateGroup = "overdue" | "today" | "week" | "later" | "done"
export type DueDateFilter = "all" | DueDateGroup

export function addCalendarDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number)
  const value = new Date(Date.UTC(year, month - 1, day + days))
  const paddedYear = String(value.getUTCFullYear()).padStart(4, "0")
  const paddedMonth = String(value.getUTCMonth() + 1).padStart(2, "0")
  const paddedDay = String(value.getUTCDate()).padStart(2, "0")
  return paddedYear + "-" + paddedMonth + "-" + paddedDay
}

export function getDueDateGroup(task: Task, referenceDate: string): DueDateGroup {
  if (task.status === "done") return "done"
  if (task.dueDate < referenceDate) return "overdue"
  if (task.dueDate === referenceDate) return "today"
  if (task.dueDate <= addCalendarDays(referenceDate, 7)) return "week"
  return "later"
}

export function filterTasksByDueDate(tasks: Task[], filter: DueDateFilter, referenceDate: string): Task[] {
  if (filter === "all") return tasks
  return tasks.filter((task) => getDueDateGroup(task, referenceDate) === filter)
}

export function getDueDateCounts(tasks: Task[], referenceDate: string): Record<DueDateGroup, number> {
  return tasks.reduce<Record<DueDateGroup, number>>(
    (counts, task) => {
      counts[getDueDateGroup(task, referenceDate)] += 1
      return counts
    },
    { overdue: 0, today: 0, week: 0, later: 0, done: 0 },
  )
}
