import type { Task, TaskStatus } from '../shared/types.ts'

export type StatusFilter = 'all' | TaskStatus

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function searchWords(query: string): string[] {
  return query.split(/\s+/).filter((word) => word.length > 0).map(normalizeText)
}

export function matchesSearch(task: Task, words: string[]): boolean {
  if (words.length === 0) return true
  const haystack = normalizeText(`${task.id} ${task.title} ${task.description} ${task.assignee}`)
  return words.every((word) => haystack.includes(word))
}

export function filterTasks(tasks: Task[], query: string, status: StatusFilter, assignee: string): Task[] {
  const words = searchWords(query)
  return tasks.filter((task) =>
    matchesSearch(task, words)
    && (status === 'all' || task.status === status)
    && (assignee === 'all' || task.assignee === assignee))
}

export function assigneeNames(tasks: Task[]): string[] {
  const names: string[] = []
  for (const task of tasks) {
    if (task.assignee !== '' && !names.includes(task.assignee)) names.push(task.assignee)
  }
  return names
}

export function statusCounts(tasks: Task[]): Record<TaskStatus, number> {
  return {
    todo: tasks.filter((task) => task.status === 'todo').length,
    in_progress: tasks.filter((task) => task.status === 'in_progress').length,
    done: tasks.filter((task) => task.status === 'done').length,
  }
}
