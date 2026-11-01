import type { Task, TaskStatus } from '../shared/types.ts'

export const ALL = 'all'

export type StatusFilter = TaskStatus | typeof ALL
export type AssigneeFilter = string

export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function words(query: string): string[] {
  return query.split(/\s+/).filter((word) => word.length > 0)
}

export function matchesQuery(task: Task, query: string): boolean {
  const tokens = words(query)
  if (tokens.length === 0) return true
  const haystack = normalize(`${task.id} ${task.title} ${task.description} ${task.assignee}`)
  return tokens.every((token) => haystack.includes(normalize(token)))
}

export function filterTasks(tasks: Task[], query: string, status: StatusFilter, assignee: AssigneeFilter): Task[] {
  return tasks.filter((task) => matchesQuery(task, query)
    && (status === ALL || task.status === status)
    && (assignee === ALL || task.assignee === assignee))
}

export function assigneeNames(tasks: Task[]): string[] {
  const names: string[] = []
  for (const task of tasks) {
    if (task.assignee && !names.includes(task.assignee)) names.push(task.assignee)
  }
  return names
}
