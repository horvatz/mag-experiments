export const MAX_UNDO = 20

export interface OrderState {
  initial: string[]
  order: string[]
  undo: string[][]
  redo: string[][]
}

export type OrderAction =
  | { type: 'sync'; ids: string[] }
  | { type: 'move'; id: string; direction: 'up' | 'down' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }

export const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id, index) => id === b[index])

export const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id))

const cap = (stack: string[][]) => (stack.length <= MAX_UNDO ? stack : stack.slice(stack.length - MAX_UNDO))

const pushUndo = (state: OrderState, previous: string[]): OrderState => ({ ...state, undo: cap([...state.undo, previous]), redo: [] })

export function initialOrderState(ids: string[] = []): OrderState {
  return { initial: [...ids], order: [...ids], undo: [], redo: [] }
}

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'sync': {
      if (sameSet(state.order, action.ids) && sameSet(state.initial, action.ids)) return state
      return initialOrderState(action.ids)
    }
    case 'move': {
      const index = state.order.indexOf(action.id)
      const target = action.direction === 'up' ? index - 1 : index + 1
      if (index < 0 || target < 0 || target >= state.order.length) return state
      const order = [...state.order]
      ;[order[index], order[target]] = [order[target], order[index]]
      if (sameIds(order, state.order)) return state
      return { ...pushUndo(state, state.order), order }
    }
    case 'undo': {
      if (state.undo.length === 0) return state
      const previous = state.undo[state.undo.length - 1]
      return { ...state, order: previous, undo: state.undo.slice(0, -1), redo: [...state.redo, state.order] }
    }
    case 'redo': {
      if (state.redo.length === 0) return state
      const next = state.redo[state.redo.length - 1]
      return { ...state, order: next, undo: cap([...state.undo, state.order]), redo: state.redo.slice(0, -1) }
    }
    case 'reset': {
      if (sameIds(state.order, state.initial)) return state
      return { ...pushUndo(state, state.order), order: [...state.initial] }
    }
  }
}
