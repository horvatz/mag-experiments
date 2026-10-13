import type { Task } from "../shared/types.ts"

export type DueGroup = "overdue" | "today" | "week" | "later" | "done"
export type DueFilter = "all" | DueGroup

const dayInMilliseconds = 24 * 60 * 60 * 1000

function toUtc(date: string): number {
  return Date.parse(`${date}T00:00:00Z`)
}

function addDays(date: string, days: number): string {
  return new Date(toUtc(date) + days * dayInMilliseconds).toISOString().slice(0, 10)
}

export function dueGroup(task: Task, referenceDate: string): DueGroup {
  if (task.status === "done") return "done"
  if (task.dueDate < referenceDate) return "overdue"
  if (task.dueDate === referenceDate) return "today"
  if (task.dueDate <= addDays(referenceDate, 7)) return "week"
  return "later"
}

export function dueCounts(tasks: Task[], referenceDate: string): Record<DueGroup, number> {
  const groups: DueGroup[] = ["overdue", "today", "week", "later", "done"]
  return Object.fromEntries(
    groups.map((group) => [group, tasks.filter((task) => dueGroup(task, referenceDate) === group).length]),
  ) as Record<DueGroup, number>
}

export function filterByDue(tasks: Task[], filter: DueFilter, referenceDate: string): Task[] {

  if (filter === "all") return tasks
  return tasks.filter((task) => dueGroup(task, referenceDate) === filter)
}
