import type { Task } from '../shared/types.ts'

export type DeadlineGroup = 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DeadlineCounts = Record<Exclude<DeadlineGroup, 'all'>, number>

function calendarDay(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(0, 0, 0, 0)
  return Math.floor(date.getTime() / 86_400_000)
}

export function deadlineGroup(task: Task, referenceDate: string): Exclude<DeadlineGroup, 'all'> {
  if (task.status === 'done') return 'done'
  const delta = calendarDay(task.dueDate) - calendarDay(referenceDate)
  if (delta < 0) return 'overdue'
  if (delta === 0) return 'today'
  if (delta <= 7) return 'week'
  return 'later'
}

export function deadlineCounts(tasks: Task[], referenceDate: string): DeadlineCounts {
  const counts: DeadlineCounts = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[deadlineGroup(task, referenceDate)] += 1
  return counts
}

export function filterByDeadline(tasks: Task[], referenceDate: string, group: DeadlineGroup): Task[] {
  return group === 'all' ? tasks : tasks.filter((task) => deadlineGroup(task, referenceDate) === group)
}
