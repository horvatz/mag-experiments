export interface OrderState {
  initial: readonly string[]
  order: readonly string[]
  past: readonly (readonly string[])[]
  future: readonly (readonly string[])[]
}

export type OrderAction =
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'undo' | 'redo' | 'reset' }

export function createOrder(ids: readonly string[]): OrderState {
  return { initial: [...ids], order: [...ids], past: [], future: [] }
}

export function isInitialOrder(state: OrderState) {
  return state.order.every((id, index) => id === state.initial[index])
}

function remember(state: OrderState, order: readonly string[]): OrderState {
  return { ...state, order, past: [...state.past, state.order].slice(-20), future: [] }
}

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'move': {
      const index = state.order.indexOf(action.id)
      const neighbor = index + action.direction
      if (index < 0 || neighbor < 0 || neighbor >= state.order.length) return state
      const order = [...state.order]
      ;[order[index], order[neighbor]] = [order[neighbor], order[index]]
      return remember(state, order)
    }
    case 'undo': {
      const order = state.past.at(-1)
      if (!order) return state
      return { ...state, order, past: state.past.slice(0, -1), future: [...state.future, state.order] }
    }
    case 'redo': {
      const order = state.future.at(-1)
      if (!order) return state
      return { ...state, order, past: [...state.past, state.order].slice(-20), future: state.future.slice(0, -1) }
    }
    case 'reset':
      return isInitialOrder(state) ? state : remember(state, state.initial)
  }
}
