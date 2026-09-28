export const MAX_UNDO_STEPS = 20

export type MoveDirection = 'up' | 'down'

export type TaskOrderState = {
  order: string[]
  undo: string[][]
  redo: string[][]
  initial: string[]
}

export type TaskOrderAction =
  | { type: 'move'; id: string; direction: MoveDirection }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }

export function createTaskOrderState(ids: string[]): TaskOrderState {
  return { order: [...ids], undo: [], redo: [], initial: [...ids] }
}

function remember(stack: string[][], order: string[]) {
  return [...stack, order].slice(-MAX_UNDO_STEPS)
}

export function taskOrderReducer(state: TaskOrderState, action: TaskOrderAction): TaskOrderState {
  if (action.type === 'move') {
    const index = state.order.indexOf(action.id)
    const next = index + (action.direction === 'up' ? -1 : 1)
    if (index < 0 || next < 0 || next >= state.order.length) return state
    const order = [...state.order]
    ;[order[index], order[next]] = [order[next], order[index]]
    return { ...state, order, undo: remember(state.undo, state.order), redo: [] }
  }

  if (action.type === 'undo') {
    if (!state.undo.length) return state
    return {
      ...state,
      order: state.undo[state.undo.length - 1],
      undo: state.undo.slice(0, -1),
      redo: [...state.redo, state.order],
    }
  }

  if (action.type === 'redo') {
    if (!state.redo.length) return state
    return {
      ...state,
      order: state.redo[state.redo.length - 1],
      undo: remember(state.undo, state.order),
      redo: state.redo.slice(0, -1),
    }
  }

  if (state.order.every((id, index) => id === state.initial[index])) return state
  return { ...state, order: [...state.initial], undo: remember(state.undo, state.order), redo: [] }
}
