import { useEffect, useState } from 'react'
import type { Task } from '../shared/types.ts'

const undoLimit = 20

interface TaskOrderState {
  original: string[]
  current: string[]
  undo: string[][]
  redo: string[][]
}

const sameOrder = (left: string[], right: string[]) =>
  left.length === right.length && left.every((id, index) => id === right[index])

function initialState(tasks: Task[]): TaskOrderState {
  const ids = tasks.map((task) => task.id)
  return { original: ids, current: [...ids], undo: [], redo: [] }
}

export function useTaskOrder(tasks: Task[] | null) {
  const [state, setState] = useState<TaskOrderState | null>(null)

  useEffect(() => {
    setState(tasks ? initialState(tasks) : null)
  }, [tasks])

  const orderedTasks = state?.current
    .map((id) => tasks?.find((task) => task.id === id))
    .filter((task): task is Task => Boolean(task)) ?? []

  const move = (id: string, direction: 'up' | 'down') => {
    setState((value) => {
      if (!value) return value
      const index = value.current.indexOf(id)
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || nextIndex < 0 || nextIndex >= value.current.length) return value
      const current = [...value.current]
      ;[current[index], current[nextIndex]] = [current[nextIndex], current[index]]
      return { ...value, current, undo: [...value.undo, value.current].slice(-undoLimit), redo: [] }
    })
  }

  const undo = () => {
    setState((value) => {
      if (!value || value.undo.length === 0) return value
      const previous = value.undo.at(-1)!
      return {
        ...value,
        current: previous,
        undo: value.undo.slice(0, -1),
        redo: [...value.redo, value.current],
      }
    })
  }

  const redo = () => {
    setState((value) => {
      if (!value || value.redo.length === 0) return value
      const next = value.redo.at(-1)!
      return {
        ...value,
        current: next,
        undo: [...value.undo, value.current],
        redo: value.redo.slice(0, -1),
      }
    })
  }

  const reset = () => {
    setState((value) => {
      if (!value || sameOrder(value.current, value.original)) return value
      return {
        ...value,
        current: [...value.original],
        undo: [...value.undo, value.current].slice(-undoLimit),
        redo: [],
      }
    })
  }

  return {
    orderedTasks,
    undoCount: state?.undo.length ?? 0,
    redoCount: state?.redo.length ?? 0,
    canUndo: (state?.undo.length ?? 0) > 0,
    canRedo: (state?.redo.length ?? 0) > 0,
    isOriginal: state ? sameOrder(state.current, state.original) : true,
    move,
    undo,
    redo,
    reset,
  }
}
