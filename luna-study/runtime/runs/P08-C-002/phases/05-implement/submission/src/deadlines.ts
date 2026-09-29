import type { Task } from '../shared/types.ts'

export const DEADLINE_GROUPS = ['overdue', 'today', 'week', 'later', 'done'] as const
export type DeadlineGroup = typeof DEADLINE_GROUPS[number]
export type DeadlineFilter = DeadlineGroup | 'all'

function addCalendarDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const result = new Date(0)
  result.setUTCHours(0, 0, 0, 0)
  result.setUTCFullYear(year, month - 1, day + days)
  return `${String(result.getUTCFullYear()).padStart(4, '0')}-${String(result.getUTCMonth() + 1).padStart(2, '0')}-${String(result.getUTCDate()).padStart(2, '0')}`
}

export function deadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  return task.dueDate <= addCalendarDays(referenceDate, 7) ? 'week' : 'later'
}

export function countDeadlines(tasks: Task[], referenceDate: string): Record<DeadlineGroup, number> {
  const counts: Record<DeadlineGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[deadlineGroup(task, referenceDate)] += 1
  return counts
}

