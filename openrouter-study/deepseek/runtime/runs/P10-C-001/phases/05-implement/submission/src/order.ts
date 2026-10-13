export type MoveDirection = 'up' | 'down'

export type OrderState = {
  order: string[]
  undo: string[][]
  redo: string[][]
}

export const MAX_UNDO = 20

export function emptyOrderState(): OrderState {
  return { order: [], undo: [], redo: [] }
}

export function sameOrder(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

export function mergeOrder(order: string[], ids: string[]): string[] {
  if (order.length === 0) return [...ids]
  const known = order.filter((id) => ids.includes(id))
  const added = ids.filter((id) => !order.includes(id))
  return [...known, ...added]
}

function pushUndo(undo: string[][], previous: string[]): string[][] {
  return [...undo, previous].slice(-MAX_UNDO)
}

export function moveState(state: OrderState, id: string, direction: MoveDirection): OrderState {
  const index = state.order.indexOf(id)
  if (index === -1) return state
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= state.order.length) return state
  const order = [...state.order]
  ;[order[index], order[target]] = [order[target], order[index]]
  return { order, undo: pushUndo(state.undo, state.order), redo: [] }
}

export function undoState(state: OrderState): OrderState {
  if (state.undo.length === 0) return state
  const previous = state.undo[state.undo.length - 1]
  return { order: [...previous], undo: state.undo.slice(0, -1), redo: [...state.redo, state.order] }
}

export function redoState(state: OrderState): OrderState {
  if (state.redo.length === 0) return state
  const next = state.redo[state.redo.length - 1]
  return { order: [...next], undo: pushUndo(state.undo, state.order), redo: state.redo.slice(0, -1) }
}

export function resetState(state: OrderState, initial: string[]): OrderState {
  if (sameOrder(state.order, initial)) return state
  return { order: [...initial], undo: pushUndo(state.undo, state.order), redo: [] }
}
