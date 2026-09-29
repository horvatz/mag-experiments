import type { Task } from '../shared/types.ts'

export type DeadlineGroup = 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done'
export type CountedDeadlineGroup = Exclude<DeadlineGroup, 'all'>

export const deadlineGroups: { key: CountedDeadlineGroup; label: string }[] = [
  { key: 'overdue', label: 'Zapadlo' },
  { key: 'today', label: 'Danes' },
  { key: 'week', label: 'Naslednjih 7 dni' },
  { key: 'later', label: 'Pozneje' },
  { key: 'done', label: 'Končano' },
]

const DAY_MS = 24 * 60 * 60 * 1000

function calendarDay(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const instant = new Date(0)
  instant.setUTCFullYear(year, month - 1, day)
  return Math.floor(instant.getTime() / DAY_MS)
}

export function deadlineGroup(task: Task, referenceDate: string): CountedDeadlineGroup {
  if (task.status === 'done') return 'done'

  const days = calendarDay(task.dueDate) - calendarDay(referenceDate)
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  if (days <= 7) return 'week'
  return 'later'
}

export function deadlineCounts(tasks: Task[], referenceDate: string) {
  const counts: Record<CountedDeadlineGroup, number> = {
    overdue: 0,
    today: 0,
    week: 0,
    later: 0,
    done: 0,
  }
  for (const task of tasks) counts[deadlineGroup(task, referenceDate)] += 1
  return counts
}

export function filterByDeadline(tasks: Task[], referenceDate: string, group: DeadlineGroup) {
  return group === 'all' ? tasks : tasks.filter((task) => deadlineGroup(task, referenceDate) === group)
}
