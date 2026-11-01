import type { Task, TaskStatus } from '../shared/types.ts'

export type StatusFilter = TaskStatus | 'all'

export const ALL = 'all'

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function searchTerms(query: string): string[] {
  return query.split(/\s+/).filter((term) => term.length > 0).map(normalizeText)
}

export function matchesSearch(task: Task, terms: string[]): boolean {
  if (terms.length === 0) return true
  const haystack = normalizeText([task.id, task.title, task.description, task.assignee].join(' '))
  return terms.every((term) => haystack.includes(term))
}

export function filterTasks(tasks: Task[], query: string, status: StatusFilter, assignee: string): Task[] {
  const terms = searchTerms(query)
  return tasks.filter((task) => matchesSearch(task, terms)
    && (status === ALL || task.status === status)
    && (assignee === ALL || task.assignee === assignee))
}

export function assigneeOptions(tasks: Task[]): string[] {
  const names: string[] = []
  for (const task of tasks) {
    if (task.assignee && task.assignee !== ALL && !names.includes(task.assignee)) names.push(task.assignee)
  }
  return names
}
