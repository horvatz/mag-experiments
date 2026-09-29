export type MoveDirection = -1 | 1

export interface TaskOrder {
  initial: readonly string[]
  present: readonly string[]
  past: readonly (readonly string[])[]
  future: readonly (readonly string[])[]
}

type OrderAction =
  | { type: 'move'; id: string; direction: MoveDirection }
  | { type: 'undo' | 'redo' | 'reset' }

export function createTaskOrder(ids: readonly string[]): TaskOrder {
  return { initial: [...ids], present: [...ids], past: [], future: [] }
}

export function isInitialOrder(state: TaskOrder) {
  return state.present.every((id, index) => id === state.initial[index])
}

function remember(state: TaskOrder, present: readonly string[]): TaskOrder {
  return { ...state, present, past: [...state.past, state.present].slice(-20), future: [] }
}

export function taskOrderReducer(state: TaskOrder, action: OrderAction): TaskOrder {
  switch (action.type) {
    case 'move': {
      const index = state.present.indexOf(action.id)
      const neighbor = index + action.direction
      if (index < 0 || neighbor < 0 || neighbor >= state.present.length) return state
      const present = [...state.present]
      ;[present[index], present[neighbor]] = [present[neighbor], present[index]]
      return remember(state, present)
    }
    case 'undo': {
      const present = state.past.at(-1)
      if (!present) return state
      return { ...state, present, past: state.past.slice(0, -1), future: [...state.future, state.present] }
    }
    case 'redo': {
      const present = state.future.at(-1)
      if (!present) return state
      return { ...state, present, past: [...state.past, state.present].slice(-20), future: state.future.slice(0, -1) }
    }
    case 'reset':
      return isInitialOrder(state) ? state : remember(state, state.initial)
  }
}
