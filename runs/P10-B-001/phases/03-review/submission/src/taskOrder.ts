export type OrderState = {
  original: readonly string[]
  present: readonly string[]
  undo: readonly (readonly string[])[]
  redo: readonly (readonly string[])[]
}

export type OrderAction =
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'undo' | 'redo' | 'reset' }

export function initialOrder(ids: readonly string[]): OrderState {
  const original = [...ids]
  return { original, present: original, undo: [], redo: [] }
}

export function isOriginalOrder(state: OrderState) {
  return state.present.every((id, index) => id === state.original[index])
}

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  const remember = () => [...state.undo, state.present].slice(-20)
  switch (action.type) {
    case 'move': {
      const index = state.present.indexOf(action.id)
      const neighbor = index + action.direction
      if (index < 0 || neighbor < 0 || neighbor >= state.present.length) return state
      const present = [...state.present]
      ;[present[index], present[neighbor]] = [present[neighbor], present[index]]
      return { ...state, present, undo: remember(), redo: [] }
    }
    case 'undo': {
      const present = state.undo.at(-1)
      if (!present) return state
      return { ...state, present, undo: state.undo.slice(0, -1), redo: [...state.redo, state.present] }
    }
    case 'redo': {
      const present = state.redo.at(-1)
      if (!present) return state
      return { ...state, present, undo: remember(), redo: state.redo.slice(0, -1) }
    }
    case 'reset':
      if (isOriginalOrder(state)) return state
      return { ...state, present: state.original, undo: remember(), redo: [] }
  }
}
