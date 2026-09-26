import { useReducer } from 'react'
import type { Task } from '../shared/types.ts'

type OrderState = {
  initial: string[]
  current: string[]
  undo: string[][]
  redo: string[][]
}

type OrderAction = { type: 'move'; id: string; direction: -1 | 1 } | { type: 'undo' } | { type: 'redo' } | { type: 'reset' }

const remember = (history: string[][], order: string[]) => [...history, order].slice(-20)
const isInitial = (state: OrderState) => state.current.every((id, index) => id === state.initial[index])

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  if (action.type === 'undo') {
    const previous = state.undo.at(-1)
    return previous ? { ...state, current: previous, undo: state.undo.slice(0, -1), redo: [...state.redo, state.current] } : state
  }
  if (action.type === 'redo') {
    const next = state.redo.at(-1)
    return next ? { ...state, current: next, undo: remember(state.undo, state.current), redo: state.redo.slice(0, -1) } : state
  }
  if (action.type === 'reset') {
    return isInitial(state) ? state : { ...state, current: state.initial, undo: remember(state.undo, state.current), redo: [] }
  }
  const index = state.current.indexOf(action.id)
  const neighbor = index + action.direction
  if (index < 0 || neighbor < 0 || neighbor >= state.current.length) return state
  const current = [...state.current]
  ;[current[index], current[neighbor]] = [current[neighbor], current[index]]
  return { ...state, current, undo: remember(state.undo, state.current), redo: [] }
}

// The owning section mounts after loading and is scoped to ProjectView's project key.
export function useTaskOrder(tasks: Task[]) {
  const [state, dispatch] = useReducer(orderReducer, tasks, (entries): OrderState => {
    const initial = entries.map((task) => task.id)
    return { initial, current: initial, undo: [], redo: [] }
  })
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const orderedTasks = state.current.map((id) => byId.get(id)!)
  return {
    tasks: orderedTasks,
    undoCount: state.undo.length,
    redoCount: state.redo.length,
    initial: isInitial(state),
    move: (id: string, direction: -1 | 1) => dispatch({ type: 'move', id, direction }),
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
    reset: () => dispatch({ type: 'reset' }),
  }
}
