import type { Task } from '../shared/types.ts'

export const DEADLINE_GROUPS = ['overdue', 'today', 'week', 'later', 'done'] as const
export type DeadlineGroup = typeof DEADLINE_GROUPS[number]
export type DeadlineFilter = 'all' | DeadlineGroup

export const DEADLINE_LABELS: Record<DeadlineGroup, string> = {
  overdue: 'Zapadlo',
  today: 'Danes',
  week: 'Naslednjih 7 dni',
  later: 'Pozneje',
  done: 'Končano',
}

function calendarDay(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(0)
  value.setUTCHours(0, 0, 0, 0)
  value.setUTCFullYear(year, month - 1, day)
  return Math.floor(value.getTime() / 86_400_000)
}

export function groupTasksByDeadline(tasks: Task[], referenceDate: string): Record<DeadlineGroup, Task[]> {
  const groups: Record<DeadlineGroup, Task[]> = {
    overdue: [],
    today: [],
    week: [],
    later: [],
    done: [],
  }

  const referenceDay = calendarDay(referenceDate)
  for (const task of tasks) {
    if (task.status === 'done') {
      groups.done.push(task)
      continue
    }

    const difference = calendarDay(task.dueDate) - referenceDay
    if (difference < 0) groups.overdue.push(task)
    else if (difference === 0) groups.today.push(task)
    else if (difference <= 7) groups.week.push(task)
    else groups.later.push(task)
  }

  return groups
}
