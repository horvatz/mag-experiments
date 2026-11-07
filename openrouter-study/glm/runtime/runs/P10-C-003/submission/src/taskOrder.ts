import type { Task } from '../shared/types.ts'

export const undoLimit = 20

export type MoveDirection = 'up' | 'down'

export interface TaskOrderState {
  initial: Task[]
  order: Task[]
  undo: Task[][]
  redo: Task[][]
}

export type TaskOrderAction =
  | { type: 'initialize'; tasks: Task[] }
  | { type: 'move'; id: string; direction: MoveDirection }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }

function withUndo(state: TaskOrderState, order: Task[]): TaskOrderState {
  return {
    ...state,
    order,
    undo: [...state.undo, state.order].slice(-undoLimit),
    redo: [],
  }
}

export function createTaskOrderState(tasks: Task[]): TaskOrderState {
  return { initial: tasks, order: tasks, undo: [], redo: [] }
}

export function isInitialOrder({ initial, order }: TaskOrderState): boolean {
  return order.length === initial.length && order.every((task, index) => task.id === initial[index]?.id)
}

export function taskOrderReducer(state: TaskOrderState | null, action: TaskOrderAction): TaskOrderState | null {
  if (action.type === 'initialize') {
    return state?.initial === action.tasks ? state : createTaskOrderState(action.tasks)
  }
  if (!state) return null

  switch (action.type) {
    case 'move': {
      const index = state.order.findIndex((task) => task.id === action.id)
      const target = action.direction === 'up' ? index - 1 : index + 1
      if (index < 0 || target < 0 || target >= state.order.length) return state
      const order = [...state.order]
      const [task] = order.splice(index, 1)
      order.splice(target, 0, task)
      return withUndo(state, order)
    }
    case 'undo': {
      const previous = state.undo.at(-1)
      if (!previous) return state
      return { ...state, order: previous, undo: state.undo.slice(0, -1), redo: [...state.redo, state.order] }
    }
    case 'redo': {
      const next = state.redo.at(-1)
      if (!next) return state
      return { ...state, order: next, undo: [...state.undo, state.order], redo: state.redo.slice(0, -1) }
    }
    case 'reset': {
      if (isInitialOrder(state)) return state
      return withUndo(state, state.initial)
    }
  }
}
