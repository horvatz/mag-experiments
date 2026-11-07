import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Task } from '../shared/types.ts'

const undoLimit = 20

export type TaskMoveDirection = 'up' | 'down'

type OrderState = {
  initial: string[]
  current: string[]
  undo: string[][]
  redo: string[][]
}

const emptyState: OrderState = { initial: [], current: [], undo: [], redo: [] }

function withUndo(state: OrderState): OrderState {
  const undo = [...state.undo, state.current]
  if (undo.length <= undoLimit) return { ...state, undo }
  return { ...state, undo: undo.slice(undo.length - undoLimit) }
}

function sameOrder(current: string[], initial: string[]): boolean {
  return current.length === initial.length && current.every((id, index) => id === initial[index])
}

export function useTaskOrder(tasks: Task[] | null) {
  const [state, setState] = useState<OrderState>(emptyState)

  useEffect(() => {
    const ids = tasks?.map((task) => task.id) ?? []
    setState({ initial: ids, current: ids, undo: [], redo: [] })
  }, [tasks])

  const move = useCallback((id: string, direction: TaskMoveDirection) => {
    setState((state) => {
      const index = state.current.indexOf(id)
      const target = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || target < 0 || target >= state.current.length) return state
      const current = [...state.current]
      ;[current[index], current[target]] = [current[target], current[index]]
      return { ...withUndo(state), current, redo: [] }
    })
  }, [])

  const undo = useCallback(() => {
    setState((state) => {
      if (state.undo.length === 0) return state
      const [previous, ...undo] = state.undo
      return { ...state, current: previous, undo, redo: [...state.redo, state.current] }
    })
  }, [])

  const redo = useCallback(() => {
    setState((state) => {
      if (state.redo.length === 0) return state
      const [next, ...redo] = state.redo
      return { ...withUndo(state), current: next, redo }
    })
  }, [])

  const reset = useCallback(() => {
    setState((state) => {
      if (sameOrder(state.current, state.initial)) return state
      return { ...withUndo(state), current: state.initial, redo: [] }
    })
  }, [])

  const orderedTasks = useMemo(() => {
    const byId = new Map((tasks ?? []).map((task) => [task.id, task]))
    return state.current.flatMap((id) => {
      const task = byId.get(id)
      return task ? [task] : []
    })
  }, [state, tasks])

  return {
    orderedTasks,
    move,
    undo,
    redo,
    reset,
    canUndo: state.undo.length > 0,
    canRedo: state.redo.length > 0,
    canReset: !sameOrder(state.current, state.initial),
    undoCount: state.undo.length,
    redoCount: state.redo.length,
  }
}
