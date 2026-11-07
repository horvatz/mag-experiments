import { useEffect, useMemo, useReducer } from 'react'
import type { Task } from '../shared/types.ts'
import { createTaskOrderState, isInitialOrder, taskOrderReducer, type MoveDirection } from './taskOrder.ts'

export function useTaskOrder(tasks: Task[] | null) {
  const [state, dispatch] = useReducer(taskOrderReducer, tasks ?? [], createTaskOrderState)

  useEffect(() => {
    if (tasks) dispatch({ type: 'initialize', tasks })
  }, [tasks])

  return useMemo(() => ({
    order: state?.order ?? [],
    undoCount: state?.undo.length ?? 0,
    redoCount: state?.redo.length ?? 0,
    isInitial: state ? isInitialOrder(state) : true,
    move: (id: string, direction: MoveDirection) => dispatch({ type: 'move', id, direction }),
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
    reset: () => dispatch({ type: 'reset' }),
  }), [state])
}
