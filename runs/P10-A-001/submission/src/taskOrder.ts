export type OrderState = {
  initial: readonly string[]
  present: readonly string[]
  past: readonly (readonly string[])[]
  future: readonly (readonly string[])[]
}

export type OrderAction =
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }

const historyLimit = 20

export function createOrder(ids: readonly string[]): OrderState {
  const initial = [...ids]
  return { initial, present: initial, past: [], future: [] }
}

export function isInitialOrder(state: OrderState) {
  return state.present.every((id, index) => id === state.initial[index])
}

function commit(state: OrderState, present: readonly string[]): OrderState {
  return { ...state, present, past: [...state.past, state.present].slice(-historyLimit), future: [] }
}

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'move': {
      const index = state.present.indexOf(action.id)
      const neighbor = index + action.direction
      if (index < 0 || neighbor < 0 || neighbor >= state.present.length) return state
      const present = [...state.present]
      ;[present[index], present[neighbor]] = [present[neighbor], present[index]]
      return commit(state, present)
    }
    case 'undo': {
      const present = state.past.at(-1)
      if (!present) return state
      return { ...state, present, past: state.past.slice(0, -1), future: [...state.future, state.present] }
    }
    case 'redo': {
      const present = state.future.at(-1)
      if (!present) return state
      return { ...state, present, past: [...state.past, state.present].slice(-historyLimit), future: state.future.slice(0, -1) }
    }
    case 'reset':
      return isInitialOrder(state) ? state : commit(state, state.initial)
  }
}
