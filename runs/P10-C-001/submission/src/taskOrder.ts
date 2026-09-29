export type MoveDirection = -1 | 1
export type OrderState = {
  initial: readonly string[]
  order: readonly string[]
  undo: readonly (readonly string[])[]
  redo: readonly (readonly string[])[]
}
export type OrderAction =
  | { type: 'move'; id: string; direction: MoveDirection }
  | { type: 'undo' | 'redo' | 'reset' }

export function createOrder(ids: readonly string[]): OrderState {
  const initial = [...ids]
  return { initial, order: initial, undo: [], redo: [] }
}

export function isInitialOrder(state: OrderState): boolean {
  return state.order.every((id, index) => id === state.initial[index])
}

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  const remember = (order: readonly string[]): OrderState => ({
    ...state, order, undo: [...state.undo, state.order].slice(-20), redo: [],
  })
  switch (action.type) {
    case 'move': {
      const index = state.order.indexOf(action.id)
      const neighbor = index + action.direction
      if (index < 0 || neighbor < 0 || neighbor >= state.order.length) return state
      const order = [...state.order]
      ;[order[index], order[neighbor]] = [order[neighbor], order[index]]
      return remember(order)
    }
    case 'undo': {
      const order = state.undo.at(-1)
      return order ? { ...state, order, undo: state.undo.slice(0, -1), redo: [...state.redo, state.order] } : state
    }
    case 'redo': {
      const order = state.redo.at(-1)
      return order ? { ...state, order, undo: [...state.undo, state.order].slice(-20), redo: state.redo.slice(0, -1) } : state
    }
    case 'reset':
      return isInitialOrder(state) ? state : remember(state.initial)
  }
}
