import type { Task } from "../shared/types"
import { REFERENCE_DATE } from "./type-defs"

function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$)/
  if (!match) return null
  const year = Number(match[1]), month = Number(match[2]) - 1, day = Number(match[3])
  return new Date(year, month, day)
}

export type DueDateGroup = "overdue" | "today" | "week" | "later" | "done"

export function getTaskDueGroup(task: Task): DueDateGroup {
  if (task.status === "done") return "done"
  const refDate = parseDate(REFERENCE_DATE)
  const taskDate = parseDate(task.dueDate)
  if (!refDate || !taskDate) return "later"
  const diffDays = Math.floor((taskDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "overdue"
  if (diffDays === 0) return "today"
  if (diffDays >= 1 && diffDays <= 7) return "week"
  return "later"
}
