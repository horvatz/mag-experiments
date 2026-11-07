import { useCallback, useEffect, useState } from 'react'
import type { Task } from '../shared/types.ts'

export const UNDO_LIMIT = 20

export interface OrderState {
  order: string[]
  initial: string[]
  undo: string[][]
  redo: string[][]
}

export function createOrderState(order: string[]): OrderState {
  return { order: [...order], initial: [...order], undo: [], redo: [] }
}

export const sameOrder = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index])

const trim = (stack: string[][]) =>
  stack.length > UNDO_LIMIT ? stack.slice(stack.length - UNDO_LIMIT) : stack

function move(state: OrderState, id: string, delta: number): OrderState {
  const index = state.order.indexOf(id)
  const target = index + delta
  if (index < 0 || target < 0 || target >= state.order.length) return state
  const order = [...state.order]
  ;[order[index], order[target]] = [order[target], order[index]]
  return { order, initial: state.initial, undo: trim([...state.undo, state.order]), redo: [] }
}

export const moveUp = (state: OrderState, id: string) => move(state, id, -1)
export const moveDown = (state: OrderState, id: string) => move(state, id, 1)

export function undo(state: OrderState): OrderState {
  const previous = state.undo[state.undo.length - 1]
  if (!previous) return state
  return { order: previous, initial: state.initial, undo: state.undo.slice(0, -1), redo: [...state.redo, state.order] }
}

export function redo(state: OrderState): OrderState {
  const next = state.redo[state.redo.length - 1]
  if (!next) return state
  return { order: next, initial: state.initial, undo: trim([...state.undo, state.order]), redo: state.redo.slice(0, -1) }
}

export function reset(state: OrderState): OrderState {
  if (sameOrder(state.order, state.initial)) return state
  return { order: [...state.initial], initial: state.initial, undo: trim([...state.undo, state.order]), redo: [] }
}

export function useTaskOrder(tasks: Task[] | null) {
  const [state, setState] = useState<OrderState | null>(null)

  useEffect(() => {
    if (tasks) setState(createOrderState(tasks.map((task) => task.id)))
  }, [tasks])

  const apply = useCallback((update: (current: OrderState) => OrderState) => {
    setState((current) => (current ? update(current) : current))
  }, [])

  return {
    state,
    moveUp: useCallback((id: string) => apply((current) => moveUp(current, id)), [apply]),
    moveDown: useCallback((id: string) => apply((current) => moveDown(current, id)), [apply]),
    undo: useCallback(() => apply(undo), [apply]),
    redo: useCallback(() => apply(redo), [apply]),
    reset: useCallback(() => apply(reset), [apply]),
  }
}
