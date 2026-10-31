import { useSyncExternalStore } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'

export type TaskView = 'table' | 'board'
export type StatusFilter = TaskStatus | 'all'
export type SortOrder = 'original' | 'title-asc' | 'title-desc'

export interface ViewState {
  q: string
  status: StatusFilter
  order: SortOrder
}

export interface Route {
  projectId: string
  taskId: string | null
  view: TaskView
  state: ViewState
}

export const defaultViewState: ViewState = { q: '', status: 'all', order: 'original' }
const statuses: StatusFilter[] = ['all', 'todo', 'in_progress', 'done']
const orders: SortOrder[] = ['original', 'title-asc', 'title-desc']

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function norm(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
}

function matches(task: Task, phrase: string): boolean {
  if (!phrase) return true
  return [task.title, task.description, task.assignee, task.id].some((field) => norm(field).includes(phrase))
}

export function visibleTasks(tasks: Task[], state: ViewState): Task[] {
  const phrase = norm(state.q)
  const filtered = tasks.filter((task) => (state.status === 'all' || task.status === state.status) && matches(task, phrase))
  if (state.order === 'original') return filtered
  const direction = state.order === 'title-asc' ? 1 : -1
  return [...filtered].sort((left, right) => {
    const a = norm(left.title)
    const b = norm(right.title)
    return a < b ? -direction : a > b ? direction : 0
  })
}

export function parseViewState(query: string): { view: TaskView; state: ViewState } {
  const params = new URLSearchParams(query)
  const status = params.get('status')
  const order = params.get('order')
  return {
    view: params.get('view') === 'board' ? 'board' : 'table',
    state: {
      q: params.get('q') ?? '',
      status: statuses.includes(status as StatusFilter) ? (status as StatusFilter) : 'all',
      order: orders.includes(order as SortOrder) ? (order as SortOrder) : 'original',
    },
  }
}

export function stateQuery(state: ViewState, view: TaskView): string {
  const params = new URLSearchParams()
  if (view === 'board') params.set('view', 'board')
  if (state.q) params.set('q', state.q)
  if (state.status !== 'all') params.set('status', state.status)
  if (state.order !== 'original') params.set('order', state.order)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function stateUrl(projectId: string, state: ViewState, view: TaskView = 'table', taskId: string | null = null): string {
  const path = `#/projects/${encodeURIComponent(projectId)}${taskId ? `/tasks/${encodeURIComponent(taskId)}` : ''}`
  return path + stateQuery(state, view)
}

export function projectUrl(projectId: string, view: TaskView = 'table'): string {
  return stateUrl(projectId, defaultViewState, view)
}

export function taskUrl(projectId: string, taskId: string, state: ViewState, view: TaskView = 'table'): string {
  return stateUrl(projectId, state, view, taskId)
}

export function useRoute(): Route | null {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const queryIndex = hash.indexOf('?')
  const path = queryIndex === -1 ? hash : hash.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : hash.slice(queryIndex + 1)
  const { view, state } = parseViewState(query)
  if (!path || path === '#' || path === '#/') return { projectId: 'web', taskId: null, view, state }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, state }
  } catch {
    return null
  }
}
