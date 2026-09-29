export type OrderDirection = 'up' | 'down'

export interface TaskOrderState {
  order: string[]
  undo: string[][]
  redo: string[][]
}

export type TaskOrderAction =
  | { type: 'initialize'; ids: string[] }
  | { type: 'move'; id: string; direction: OrderDirection; initialIds: string[] }
  | { type: 'undo'; initialIds: string[] }
  | { type: 'redo'; initialIds: string[] }
  | { type: 'reset'; initialIds: string[] }

const HISTORY_LIMIT = 20

function appendHistory(history: string[][], order: string[]) {
  return [...history, [...order]].slice(-HISTORY_LIMIT)
}

function initialState(ids: string[]): TaskOrderState {
  return { order: [...ids], undo: [], redo: [] }
}

export function taskOrderReducer(state: TaskOrderState | null, action: TaskOrderAction): TaskOrderState {
  if (action.type === 'initialize') return state ?? initialState(action.ids)

  const current = state ?? initialState(action.initialIds)
  if (action.type === 'move') {
    const index = current.order.indexOf(action.id)
    const neighbor = action.direction === 'up' ? index - 1 : index + 1
    if (index < 0 || neighbor < 0 || neighbor >= current.order.length) return current

    const order = [...current.order]
    ;[order[index], order[neighbor]] = [order[neighbor], order[index]]
    return { order, undo: appendHistory(current.undo, current.order), redo: [] }
  }

  if (action.type === 'undo') {
    if (current.undo.length === 0) return current
    const order = current.undo[current.undo.length - 1]
    return { order: [...order], undo: current.undo.slice(0, -1), redo: [...current.redo, [...current.order]] }
  }

  if (action.type === 'redo') {
    if (current.redo.length === 0) return current
    const order = current.redo[current.redo.length - 1]
    return { order: [...order], undo: appendHistory(current.undo, current.order), redo: current.redo.slice(0, -1) }
  }

  if (current.order.length === action.initialIds.length && current.order.every((id, index) => id === action.initialIds[index])) return current
  return {
    order: [...action.initialIds],
    undo: appendHistory(current.undo, current.order),
    redo: [],
  }
}
