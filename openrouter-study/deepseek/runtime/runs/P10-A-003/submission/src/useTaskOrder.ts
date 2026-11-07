import { useState } from 'react'
import type { Task } from '../shared/types.ts'

export type MoveDirection = 'up' | 'down'

export interface OrderHistory {
  current: string[]
  undo: string[][]
  redo: string[][]
}

export const HISTORY_LIMIT = 20

export function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function pushUndo(undo: string[][], permutation: string[]) {
  return [...undo, permutation].slice(-HISTORY_LIMIT)
}

export function moveInOrder(history: OrderHistory, id: string, direction: MoveDirection): OrderHistory {
  const index = history.current.indexOf(id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= history.current.length) return history
  const current = [...history.current]
  current[index] = history.current[target]
  current[target] = history.current[index]
  return { current, undo: pushUndo(history.undo, history.current), redo: [] }
}

export function undoOrder(history: OrderHistory): OrderHistory {
  if (history.undo.length === 0) return history
  return {
    current: history.undo[history.undo.length - 1],
    undo: history.undo.slice(0, -1),
    redo: [...history.redo, history.current],
  }
}

export function redoOrder(history: OrderHistory): OrderHistory {
  if (history.redo.length === 0) return history
  return {
    current: history.redo[history.redo.length - 1],
    undo: pushUndo(history.undo, history.current),
    redo: history.redo.slice(0, -1),
  }
}

export function resetOrder(history: OrderHistory, initial: string[]): OrderHistory {
  if (sameOrder(history.current, initial)) return history
  return { current: [...initial], undo: pushUndo(history.undo, history.current), redo: [] }
}

export function useTaskOrder(tasks: Task[] | null) {
  const ids = tasks ? tasks.map((task) => task.id) : null
  const key = ids ? ids.join('\u0000') : null
  const [stored, setStored] = useState<{ key: string; history: OrderHistory } | null>(null)
  const initial = ids ?? []
  const history: OrderHistory | null = ids ? (stored?.key === key ? stored.history : { current: initial, undo: [], redo: [] }) : null

  const update = (change: (history: OrderHistory) => OrderHistory) => {
    if (key === null) return
    setStored((previous) => ({
      key,
      history: change(previous?.key === key ? previous.history : { current: initial, undo: [], redo: [] }),
    }))
  }

  const byId = new Map((tasks ?? []).map((task) => [task.id, task]))
  const orderedTasks = history ? history.current.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])) : tasks ?? []
  const places = new Map(history ? history.current.map((id, index) => [id, index + 1]) : [])
  const canMove = (id: string, direction: MoveDirection) => {
    if (!history) return false
    const index = history.current.indexOf(id)
    return direction === 'up' ? index > 0 : index >= 0 && index < history.current.length - 1
  }

  return {
    tasks: orderedTasks,
    places,
    undoCount: history?.undo.length ?? 0,
    redoCount: history?.redo.length ?? 0,
    canUndo: !!history && history.undo.length > 0,
    canRedo: !!history && history.redo.length > 0,
    canReset: !!history && !sameOrder(history.current, initial),
    canMove,
    move: (id: string, direction: MoveDirection) => update((current) => moveInOrder(current, id, direction)),
    undo: () => update(undoOrder),
    redo: () => update(redoOrder),
    reset: () => update((current) => resetOrder(current, initial)),
  }
}
