import type { Task } from '../shared/types.ts'

const combiningMarks = /[\u0300-\u036f]/g

export function normalizeText(value: string) {
  return value.normalize('NFD').replace(combiningMarks, '').toLowerCase()
}

export function queryWords(query: string) {
  return query.split(/\s+/).filter((word) => word.length > 0).map(normalizeText)
}

export function matchesQuery(task: Task, words: string[]) {
  if (words.length === 0) return true
  const haystack = normalizeText([task.id, task.title, task.description, task.assignee].join(' '))
  return words.every((word) => haystack.includes(word))
}
