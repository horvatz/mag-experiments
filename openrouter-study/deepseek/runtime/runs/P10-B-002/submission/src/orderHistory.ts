export const MAX_UNDO = 20

export type MoveDirection = 'up' | 'down'

export type TaskOrderState = {
  base: string[]
  order: string[]
  undo: string[][]
  redo: string[][]
}

export function initialOrder(ids: string[]): TaskOrderState {
  return { base: [...ids], order: [...ids], undo: [], redo: [] }
}

export function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function capUndo(stack: string[][]) {
  return stack.length > MAX_UNDO ? stack.slice(stack.length - MAX_UNDO) : stack
}

export function moveTask(state: TaskOrderState, id: string, direction: MoveDirection): TaskOrderState {
  const index = state.order.indexOf(id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= state.order.length) return state
  const order = [...state.order]
  ;[order[index], order[target]] = [order[target], order[index]]
  return { ...state, order, undo: capUndo([...state.undo, state.order]), redo: [] }
}

export function undoMove(state: TaskOrderState): TaskOrderState {
  if (state.undo.length === 0) return state
  const previous = state.undo[state.undo.length - 1]
  return { ...state, order: previous, undo: state.undo.slice(0, -1), redo: [...state.redo, state.order] }
}

export function redoMove(state: TaskOrderState): TaskOrderState {
  if (state.redo.length === 0) return state
  const next = state.redo[state.redo.length - 1]
  return { ...state, order: next, undo: capUndo([...state.undo, state.order]), redo: state.redo.slice(0, -1) }
}

export function resetOrder(state: TaskOrderState): TaskOrderState {
  if (sameOrder(state.order, state.base)) return state
  return { ...state, order: state.base, undo: capUndo([...state.undo, state.order]), redo: [] }
}
