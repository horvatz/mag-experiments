import { useState } from 'react'

export const HISTORY_LIMIT = 20

export type MoveDirection = 'up' | 'down'

function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function pushUndo(stack: string[][], snapshot: string[]) {
  return [...stack, snapshot].slice(-HISTORY_LIMIT)
}

export function useTaskOrder(initialIds: string[]) {
  const [order, setOrder] = useState<string[]>(initialIds)
  const [undoStack, setUndoStack] = useState<string[][]>([])
  const [redoStack, setRedoStack] = useState<string[][]>([])

  const move = (id: string, direction: MoveDirection) => {
    const index = order.indexOf(id)
    const target = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || target < 0 || target >= order.length) return
    const next = order.slice()
    ;[next[index], next[target]] = [next[target], next[index]]
    setUndoStack(pushUndo(undoStack, order))
    setRedoStack([])
    setOrder(next)
  }

  const undo = () => {
    if (undoStack.length === 0) return
    setUndoStack(undoStack.slice(0, -1))
    setRedoStack([...redoStack, order])
    setOrder(undoStack[undoStack.length - 1])
  }

  const redo = () => {
    if (redoStack.length === 0) return
    setRedoStack(redoStack.slice(0, -1))
    setUndoStack(pushUndo(undoStack, order))
    setOrder(redoStack[redoStack.length - 1])
  }

  const reset = () => {
    if (sameOrder(order, initialIds)) return
    setUndoStack(pushUndo(undoStack, order))
    setRedoStack([])
    setOrder(initialIds)
  }

  return {
    order,
    undoCount: undoStack.length,
    redoCount: redoStack.length,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    canReset: !sameOrder(order, initialIds),
    move,
    undo,
    redo,
    reset,
  }
}
