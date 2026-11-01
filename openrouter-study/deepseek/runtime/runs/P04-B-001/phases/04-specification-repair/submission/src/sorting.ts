import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'
export type SecondaryKey = 'none' | SortKey

export type SortSettings = {
  primaryKey: SortKey
  primaryDirection: SortDirection
  secondaryKey: SecondaryKey
  secondaryDirection: SortDirection
}

export const DEFAULT_SORT: SortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

const COMBINING_MARKS = /[\u0300-\u036f]/g

// R02: NFD, odstranitev zdruzevalnih znakov U+0300-U+036F, male crke.
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase()
}

// R02: leksikografska primerjava po UTF-16 (operatorja < in >), brez Intl.
export function compareText(left: string, right: string): number {
  const a = normalizeText(left)
  const b = normalizeText(right)
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

const STATUS_RANK: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

function compareDueDate(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

export function compareKey(key: SortKey, left: Task, right: Task): number {
  switch (key) {
    case 'original': return 0
    case 'title': return compareText(left.title, right.title)
    case 'assignee': return compareText(left.assignee, right.assignee)
    case 'status': {
      const difference = STATUS_RANK[left.status] - STATUS_RANK[right.status]
      return difference < 0 ? -1 : difference > 0 ? 1 : 0
    }
    case 'dueDate': return compareDueDate(left.dueDate, right.dueDate)
  }
}

const directionSign = (direction: SortDirection) => (direction === 'desc' ? -1 : 1)

// R01-R06, R11: projekcija T v novo polje; T, objekti in polja ostanejo nespremenjeni.
export function sortTasks(tasks: Task[], settings: SortSettings): Task[] {
  const primaryKey = settings.primaryKey
  // R06: original na primarnem klucu vedno vrne natanko izvorni vrstni red.
  if (primaryKey === 'original') return tasks.slice()

  const sourceIndex = new Map(tasks.map((task, index) => [task.id, index]))
  const secondaryKey = settings.secondaryKey
  const primarySign = directionSign(settings.primaryDirection)
  const secondarySign = directionSign(settings.secondaryDirection)

  return tasks.slice().sort((left, right) => {
    const primary = primarySign * compareKey(primaryKey, left, right)
    if (primary !== 0) return primary
    if (secondaryKey !== 'none') {
      const secondary = secondarySign * compareKey(secondaryKey, left, right)
      if (secondary !== 0) return secondary
    }
    // R04, R06: izenaceni ohranijo izvorni vrstni red ne glede na smeri.
    return (sourceIndex.get(left.id) ?? 0) - (sourceIndex.get(right.id) ?? 0)
  })
}
