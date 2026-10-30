import { useCallback, useMemo, useState, useRef } from 'react'
import type { Task } from '../../shared/types'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDir = 'asc' | 'desc'

const DEFAULTS = {
  primaryKey: 'original',
  primaryDir: 'asc',
  secondaryKey: 'none',
  secondaryDir: 'asc',
}

function normalizeTitle(title: string): string {
  const nfd = title.normalize('NFD')
  return nfd.replace(/[̀-ͯ]/g, '').toLowerCase()
}

function compareStatuses(a: Task, b: Task): number {
  const order: Record<Task['status'], number> = {
    todo: 0,
    in_progress: 1,
    done: 2,
  }
  return order[a.status] - order[b.status]
}

function compareDates(a: Task, b: Task): number {
  if (!a.dueDate || !b.dueDate) return 0
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
}

function primaryCompare<T extends Task>(a: T, b: T, key: SortKey, dir: SortDir): number {
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

function compareTitles(a: string, b: string): number {
  const normA = normalizeTitle(a)
  const normB = normalizeTitle(b)
  if (normA < normB) return -1
  if (normA > normB) return 1
  return 0
}

export function useTasksSorting() {
  const [state, setState] = useState(DEFAULTS)
  const orderRef = useRef<number[]>([])

  const resetSorting = useCallback(() => setState(DEFAULTS), [])
  
  const setPrimary = useCallback((key: SortKey, dir: SortDir) => {
    setState(s => ({ ...s, primaryKey: key, primaryDir: dir }))
  }, [])

  const setSecondary = useCallback((key: SortKey, dir: SortDir) => {
    setState(s => ({ ...s, secondaryKey: key, secondaryDir: dir }))
  }, [])

  const sortTasks = useCallback((tasks: Task[]): Task[] => {
    if (state.primaryKey === 'original') {
      const sorted = [...tasks]
      orderRef.current = sorted.map((t, i) => i)
      return sorted
    }

    const sorted = [...tasks]
    sorted.sort((a, b) => {
      const primary = primaryCompare(a, b, state.primaryKey, state.primaryDir)
      if (primary !== 0) return primary
      
      if (state.secondaryKey === 'none') return 0
      return secondaryCompare(a, b, state.secondaryKey, state.secondaryDir)
    })
    
    orderRef.current = sorted.map((t, i) => i)
    return sorted
  }, [state])

  return { state, resetSorting, setPrimary, setSecondary, sortTasks }
}