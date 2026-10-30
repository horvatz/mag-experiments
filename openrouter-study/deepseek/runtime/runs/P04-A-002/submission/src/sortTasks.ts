import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = Exclude<SortKey, 'original'> | 'none'
export type SortDirection = 'asc' | 'desc'

export interface SortSettings {
  primaryKey: SortKey
  primaryDirection: SortDirection
  secondaryKey: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultSortSettings: SortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

const statusRank: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

// NFD, odstranitev združenih znakov U+0300–U+036F, male črke (zahteva R02).
export function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Leksikografska primerjava po UTF-16 (<, >); brez jezikovnega ali številskega prilagajanja.
export function compareText(left: string, right: string) {
  const a = normalizeText(left)
  const b = normalizeText(right)
  return a < b ? -1 : a > b ? 1 : 0
}

function compareKey(left: Task, right: Task, key: Exclude<SortKey, 'original'>) {
  switch (key) {
    case 'title':
      return compareText(left.title, right.title)
    case 'assignee':
      return compareText(left.assignee, right.assignee)
    case 'status':
      return statusRank[left.status] - statusRank[right.status]
    case 'dueDate':
      return left.dueDate < right.dueDate ? -1 : left.dueDate > right.dueDate ? 1 : 0
  }
}

// Smer obrne samo izid primerjave ključa (R04); izenačeni ohranijo izvorni vrstni red (R06).
export function sortTasks(tasks: Task[], settings: SortSettings): Task[] {
  const primaryKey = settings.primaryKey
  if (primaryKey === 'original') return [...tasks]
  const secondaryKey = settings.secondaryKey
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      let result = compareKey(left.task, right.task, primaryKey)
      if (settings.primaryDirection === 'desc') result = -result
      if (result === 0 && secondaryKey !== 'none') {
        result = compareKey(left.task, right.task, secondaryKey)
        if (settings.secondaryDirection === 'desc') result = -result
      }
      return result !== 0 ? result : left.index - right.index
    })
    .map((entry) => entry.task)
}
