export interface OrderState {
  initial: string[]
  order: string[]
  undo: string[][]
  redo: string[][]
}

export type OrderAction =
  | { type: 'initialize'; ids: string[] }
  | { type: 'move'; id: string; direction: 'up' | 'down' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }

const keepLast20 = (items: string[][]) => items.slice(-20)

export function orderReducer(state: OrderState | null, action: OrderAction): OrderState | null {
  if (action.type === 'initialize') {
    return { initial: [...action.ids], order: [...action.ids], undo: [], redo: [] }
  }
  if (!state) return state

  if (action.type === 'move') {
    const from = state.order.indexOf(action.id)
    const to = from + (action.direction === 'up' ? -1 : 1)
    if (from < 0 || to < 0 || to >= state.order.length) return state
    const order = [...state.order]
    ;[order[from], order[to]] = [order[to], order[from]]
    return { ...state, order, undo: keepLast20([...state.undo, state.order]), redo: [] }
  }

  if (action.type === 'undo') {
    if (!state.undo.length) return state
    return {
      ...state,
      order: state.undo.at(-1)!,
      undo: state.undo.slice(0, -1),
      redo: [...state.redo, state.order],
    }
  }

  if (action.type === 'redo') {
    if (!state.redo.length) return state
    return {
      ...state,
      order: state.redo.at(-1)!,
      undo: keepLast20([...state.undo, state.order]),
      redo: state.redo.slice(0, -1),
    }
  }

  if (state.order.every((id, index) => id === state.initial[index])) return state
  return { ...state, order: state.initial, undo: keepLast20([...state.undo, state.order]), redo: [] }
}
