
import { useState, useMemo } from 'react'
import type { Task, TaskStatus } from '../../shared/types'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDir = 'asc' | 'desc'

export type SortingState = {
  primaryKey: SortKey
  primaryDir: SortDir
  secondaryKey: SortKey
  secondaryDir: SortDir
}

const DEFAULT_STATE: SortingState = {
  primaryKey: 'original',
  primaryDir: 'asc',
  secondaryKey: 'none',
  secondaryDir: 'asc',
}

export function useTaskListState() {
  const [state, setState] = useState<SortingState>(DEFAULT_STATE)

  const resetSorting = () => setState({ ...DEFAULT_STATE })

  const setPrimaryKey = (key: SortKey, dir: SortDir) => {
    setState(s => ({ ...s, primaryKey: key, primaryDir: dir, secondaryKey: 'none' }))
  }

  const setSecondaryKey = (key: SortKey, dir: SortDir) => {
    setState(s => ({ ...s, secondaryKey: key, secondaryDir: dir }))
  }

  const sortTasks = (tasks: Task[]): Task[] => {
    if (state.primaryKey === 'original') {
      const sorted = [...tasks]
      return sorted
    }

    const sorted = [...tasks]
    
    sorted.sort((a, b) => {
      const primary = primaryCompare(a, b, state.primaryKey, state.primaryDir)
      if (primary !== 0) return primary
      
      if (state.secondaryKey === 'none') return 0
      return secondaryCompare(a, b, state.secondaryKey, state.secondaryDir)
    })
    
    return sorted
  }

  return {
    state,
    resetSorting,
    setPrimaryKey,
    setSecondaryKey,
    sortTasks,
  }
}

function normalizeTitle(title: string, options?: Intl.NFCNormOptions | Intl.NFDNormOptions): string {
  const normalized = title.normalize(options.mode as 'NFC' | 'NFD')
  const withoutDiacritics = normalized.replace(/[̀-ͯ]/g, '')
  return withoutDiacritics.toLowerCase()
}

function compareTitles(a: string, b: string): number {
  const normA = normalizeTitle(a, { mode: 'NFD' })
  const normB = normalizeTitle(b, { mode: 'NFD' })
  if (normA < normB) return -1
  if (normA > normB) return 1
  return 0
}

function compareStatuses(a: Task, b: Task): number {
  const order: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }
  return order[a.status] - order[b.status]
}

function compareDates(a: Task, b: Task): number {
  if (!a.dueDate || !b.dueDate) return 0
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
}

function primaryCompare(a: Task, b: Task, key: SortKey, dir: SortDir): number {
  let result = 0
  switch (key) {
    case 'original':
      return 0
    case 'title':
      result = compareTitles(a.title, b.title)
      break
    case 'assignee':
      result = a.assignee.localeCompare(b.assignee, 'sl', { sensitivity: 'base' })
      break
    case 'status':
      result = compareStatuses(a, b)
      break
    case 'dueDate':
      result = compareDates(a, b)
      break
  }
  return dir === 'asc' ? result : -result
}

function secondaryCompare(a: Task, b: Task, key: SortKey, dir: SortDir): number {
  if (key === 'none') return 0
  let result = 0
  switch (key) {
    case 'title':
      result = compareTitles(a.title, b.title)
      break
    case 'assignee':
      result = a.assignee.localeCompare(b.assignee, 'sl', { sensitivity: 'base' })
      break
    case 'status':
      result = compareStatuses(a, b)
      break
    case 'dueDate':
      result = compareDates(a, b)
      break
  }
  return dir === 'asc' ? result : -result
}
