export type TaskOrderState = {
  initial: string[]
  current: string[]
  undo: string[][]
  redo: string[][]
}

export type TaskOrderAction =
  | { type: 'load'; ids: string[] }
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }

const bounded = (items: string[][]) => items.slice(-20)

export function createTaskOrder(ids: string[]): TaskOrderState {
  return { initial: [...ids], current: [...ids], undo: [], redo: [] }
}

export function taskOrderReducer(state: TaskOrderState, action: TaskOrderAction): TaskOrderState {
  if (action.type === 'load') return createTaskOrder(action.ids)
  if (action.type === 'undo') {
    if (!state.undo.length) return state
    return { ...state, current: [...state.undo.at(-1)!], undo: state.undo.slice(0, -1), redo: [...state.redo, state.current] }
  }
  if (action.type === 'redo') {
    if (!state.redo.length) return state
    return { ...state, current: [...state.redo.at(-1)!], undo: bounded([...state.undo, state.current]), redo: state.redo.slice(0, -1) }
  }
  if (action.type === 'reset') {
    if (state.current.length === state.initial.length && state.current.every((id, i) => id === state.initial[i])) return state
    return { ...state, current: [...state.initial], undo: bounded([...state.undo, state.current]), redo: [] }
  }

  const index = state.current.indexOf(action.id)
  const neighbor = index + action.direction
  if (index < 0 || neighbor < 0 || neighbor >= state.current.length) return state
  const current = [...state.current]
  ;[current[index], current[neighbor]] = [current[neighbor], current[index]]
  return { ...state, current, undo: bounded([...state.undo, state.current]), redo: [] }
}
