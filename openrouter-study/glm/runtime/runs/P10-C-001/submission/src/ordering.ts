export type MoveDirection = 'up' | 'down'

export interface OrderState {
  initial: string[]
  current: string[]
  undo: string[][]
  redo: string[][]
}

const undoLimit = 20

const addToUndo = (undo: string[][], permutation: string[]) => [...undo, permutation].slice(-undoLimit)
const sameOrder = (left: string[], right: string[]) =>
  left.length === right.length && left.every((id, index) => id === right[index])

export function createOrderState(ids: string[]): OrderState {
  return { initial: [...ids], current: [...ids], undo: [], redo: [] }
}

export function moveTask(state: OrderState, id: string, direction: MoveDirection): OrderState {
  const index = state.current.indexOf(id)
  const nextIndex = index + (direction === 'up' ? -1 : 1)

  if (index < 0 || nextIndex < 0 || nextIndex >= state.current.length) return state

  const current = [...state.current]
  ;[current[index], current[nextIndex]] = [current[nextIndex], current[index]]

  return { ...state, current, undo: addToUndo(state.undo, state.current), redo: [] }
}

export function undoMove(state: OrderState): OrderState {
  if (state.undo.length === 0) return state

  const undo = state.undo.slice(0, -1)
  return { ...state, current: state.undo[state.undo.length - 1], undo, redo: [...state.redo, state.current] }
}

export function redoMove(state: OrderState): OrderState {
  if (state.redo.length === 0) return state

  const redo = state.redo.slice(0, -1)
  return { ...state, current: state.redo[redo.length], undo: addToUndo(state.undo, state.current), redo }
}

export function resetToInitial(state: OrderState): OrderState {
  if (sameOrder(state.current, state.initial)) return state

  return { ...state, current: [...state.initial], undo: addToUndo(state.undo, state.current), redo: [] }
}

export function taskPosition(state: OrderState, id: string): number {
  return state.current.indexOf(id) + 1
}

export function canMove(state: OrderState, id: string, direction: MoveDirection): boolean {
  const index = state.current.indexOf(id)
  const nextIndex = index + (direction === 'up' ? -1 : 1)
  return index >= 0 && nextIndex >= 0 && nextIndex < state.current.length
}

export const historyText = (state: OrderState) =>
  `Razveljavitve: ${state.undo.length}. Ponovitve: ${state.redo.length}.`
