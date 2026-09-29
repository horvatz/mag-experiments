import { useState } from 'react'
import type { Task } from '../shared/types.ts'

type OrderState = {
  source: Task[] | null
  initial: string[]
  order: string[]
  undo: string[][]
  redo: string[][]
}

function initialState(source: Task[] | null): OrderState {
  const initial = source?.map((task) => task.id) ?? []
  return { source, initial, order: initial, undo: [], redo: [] }
}

function remember(undo: string[][], order: string[]) {
  return [...undo, order].slice(-20)
}

function commit(state: OrderState, order: string[]): OrderState {
  return { ...state, order, undo: remember(state.undo, state.order), redo: [] }
}

function isInitial(state: OrderState) {
  return state.order.every((id, index) => id === state.initial[index])
}

export function useTaskOrder(tasks: Task[] | null) {
  const [stored, setState] = useState(() => initialState(tasks))
  // Initialize when the GET result arrives, before rendering its controls.
  // ProjectView's project key discards this state when the project changes.
  const state = stored.source === tasks ? stored : initialState(tasks)
  if (state !== stored) setState(state)

  const byId = new Map(tasks?.map((task) => [task.id, task]))
  const orderedTasks = state.order.map((id) => byId.get(id)!)

  const move = (id: string, direction: -1 | 1) => setState((current) => {
    const index = current.order.indexOf(id)
    const neighbor = index + direction
    if (index < 0 || neighbor < 0 || neighbor >= current.order.length) return current
    const order = [...current.order]
    ;[order[index], order[neighbor]] = [order[neighbor], order[index]]
    return commit(current, order)
  })

  const undo = () => setState((current) => {
    const order = current.undo.at(-1)
    if (!order) return current
    return { ...current, order, undo: current.undo.slice(0, -1), redo: [...current.redo, current.order] }
  })

  const redo = () => setState((current) => {
    const order = current.redo.at(-1)
    if (!order) return current
    return { ...current, order, undo: remember(current.undo, current.order), redo: current.redo.slice(0, -1) }
  })

  const reset = () => setState((current) => isInitial(current) ? current : commit(current, current.initial))

  return { orderedTasks, move, undo, redo, reset, undoCount: state.undo.length, redoCount: state.redo.length, atInitial: isInitial(state) }
}
