import { useCallback, useMemo, useState } from 'react'

export const HISTORY_LIMIT = 20

export type MoveDirection = 'up' | 'down'

type OrderState = {
  key: string
  order: string[]
  undo: string[][]
  redo: string[][]
}

export function moveOrder(order: string[], id: string, direction: MoveDirection): string[] | null {
  const index = order.indexOf(id)
  if (index < 0) return null
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= order.length) return null
  const next = [...order]
  next[index] = order[target]
  next[target] = order[index]
  return next
}

function pushHistory(stack: string[][], permutation: string[]) {
  return [...stack.slice(-(HISTORY_LIMIT - 1)), permutation]
}

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

export function useTaskOrder(received: string[] | null) {
  const [state, setState] = useState<OrderState | null>(null)
  const key = received === null ? null : received.join('\u0000')
  const active = state && state.key === key ? state : null
  const order = useMemo(() => active?.order ?? received ?? [], [active, received])
  const undo = useMemo(() => active?.undo ?? [], [active])
  const redo = useMemo(() => active?.redo ?? [], [active])

  const move = useCallback((id: string, direction: MoveDirection) => {
    setState((current) => {
      const base = current && current.key === key ? current : null
      const currentOrder = base?.order ?? received ?? []
      const next = moveOrder(currentOrder, id, direction)
      if (!key || !next) return current
      return { key, order: next, undo: pushHistory(base?.undo ?? [], currentOrder), redo: [] }
    })
  }, [key, received])

  const undoMove = useCallback(() => {
    setState((current) => {
      const base = current && current.key === key ? current : null
      const stack = base?.undo ?? []
      if (!key || stack.length === 0) return current
      const currentOrder = base?.order ?? received ?? []
      return { key, order: stack[stack.length - 1], undo: stack.slice(0, -1), redo: [...(base?.redo ?? []), currentOrder] }
    })
  }, [key, received])

  const redoMove = useCallback(() => {
    setState((current) => {
      const base = current && current.key === key ? current : null
      const stack = base?.redo ?? []
      if (!key || stack.length === 0) return current
      const currentOrder = base?.order ?? received ?? []
      return { key, order: stack[stack.length - 1], undo: pushHistory(base?.undo ?? [], currentOrder), redo: stack.slice(0, -1) }
    })
  }, [key, received])

  const resetOrder = useCallback(() => {
    setState((current) => {
      const base = current && current.key === key ? current : null
      const currentOrder = base?.order ?? received ?? []
      if (!key || received === null || sameOrder(currentOrder, received)) return current
      return { key, order: [...received], undo: pushHistory(base?.undo ?? [], currentOrder), redo: [] }
    })
  }, [key, received])

  const canMove = useCallback((id: string, direction: MoveDirection) => moveOrder(order, id, direction) !== null, [order])

  return useMemo(() => ({
    order,
    undoCount: undo.length,
    redoCount: redo.length,
    canUndo: undo.length > 0,
    canRedo: redo.length > 0,
    canReset: received !== null && !sameOrder(order, received),
    canMove,
    move,
    undo: undoMove,
    redo: redoMove,
    reset: resetOrder,
  }), [order, undo.length, redo.length, received, canMove, move, undoMove, redoMove, resetOrder])
}
