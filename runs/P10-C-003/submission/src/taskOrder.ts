export interface TaskOrderState {
  initial: readonly string[]
  current: readonly string[]
  past: readonly (readonly string[])[]
  future: readonly (readonly string[])[]
}

export type TaskOrderAction =
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'undo' | 'redo' | 'reset' }

export function createTaskOrder(ids: readonly string[]): TaskOrderState {
  const initial = [...ids]
  return { initial, current: initial, past: [], future: [] }
}

export function isInitialOrder(state: TaskOrderState) {
  return state.current.every((id, index) => id === state.initial[index])
}

function remember(state: TaskOrderState) {
  return [...state.past, state.current].slice(-20)
}

export function taskOrderReducer(state: TaskOrderState, action: TaskOrderAction): TaskOrderState {
  switch (action.type) {
    case 'move': {
      const index = state.current.indexOf(action.id)
      const neighbor = index + action.direction
      if (index < 0 || neighbor < 0 || neighbor >= state.current.length) return state
      const current = [...state.current]
      ;[current[index], current[neighbor]] = [current[neighbor], current[index]]
      return { ...state, current, past: remember(state), future: [] }
    }
    case 'undo': {
      const current = state.past.at(-1)
      if (!current) return state
      return { ...state, current, past: state.past.slice(0, -1), future: [...state.future, state.current] }
    }
    case 'redo': {
      const current = state.future.at(-1)
      if (!current) return state
      return { ...state, current, past: remember(state), future: state.future.slice(0, -1) }
    }
    case 'reset':
      return isInitialOrder(state) ? state : { ...state, current: state.initial, past: remember(state), future: [] }
  }
}
