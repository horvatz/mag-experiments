export type TaskOrder = readonly string[]

export interface TaskOrderState {
  initial: TaskOrder
  current: TaskOrder
  undo: TaskOrder[]
  redo: TaskOrder[]
}

export type TaskOrderAction =
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'undo' | 'redo' | 'reset' }

export function createTaskOrder(ids: TaskOrder): TaskOrderState {
  const initial = [...ids]
  return { initial, current: initial, undo: [], redo: [] }
}

export function isInitialOrder(state: TaskOrderState) {
  return state.current.every((id, index) => id === state.initial[index])
}

// Every stored entry is a complete, immutable permutation of the original IDs.
function commit(state: TaskOrderState, current: TaskOrder): TaskOrderState {
  return { ...state, current, undo: [...state.undo, state.current].slice(-20), redo: [] }
}

export function taskOrderReducer(state: TaskOrderState, action: TaskOrderAction): TaskOrderState {
  switch (action.type) {
    case 'move': {
      const index = state.current.indexOf(action.id)
      const neighbor = index + action.direction
      if (index < 0 || neighbor < 0 || neighbor >= state.current.length) return state
      const current = [...state.current]
      ;[current[index], current[neighbor]] = [current[neighbor], current[index]]
      return commit(state, current)
    }
    case 'undo': {
      const current = state.undo.at(-1)
      if (!current) return state
      return { ...state, current, undo: state.undo.slice(0, -1), redo: [...state.redo, state.current] }
    }
    case 'redo': {
      const current = state.redo.at(-1)
      if (!current) return state
      return { ...state, current, undo: [...state.undo, state.current].slice(-20), redo: state.redo.slice(0, -1) }
    }
    case 'reset':
      return isInitialOrder(state) ? state : commit(state, state.initial)
  }
}
