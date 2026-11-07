import type { Task, TaskStatus } from '../shared/types.ts'

export type StatusFilter = 'all' | TaskStatus

const COMBINING_MARKS = /[\u0300-\u036f]/g

export function normalize(value: string) {
  return value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase()
}

export function splitWords(query: string) {
  return query.split(/\s+/).filter((word) => word.length > 0).map(normalize)
}

export function matchesQuery(task: Task, words: string[]) {
  if (words.length === 0) return true
  const haystack = normalize([task.id, task.title, task.description, task.assignee].join(' '))
  return words.every((word) => haystack.includes(word))
}

export function filterTasks(tasks: Task[], query: string, status: StatusFilter, assignee: string) {
  const words = splitWords(query)
  return tasks.filter((task) => matchesQuery(task, words)
    && (status === 'all' || task.status === status)
    && (assignee === 'all' || task.assignee === assignee))
}

export function assigneeOptions(tasks: Task[]) {
  const names = new Set<string>()
  for (const task of tasks) if (task.assignee) names.add(task.assignee)
  return ['all', ...[...names].sort((a, b) => a.localeCompare(b, 'sl'))]
}
