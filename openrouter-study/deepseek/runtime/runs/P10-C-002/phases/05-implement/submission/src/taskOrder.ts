import { useMemo, useState } from 'react'
import type { Task } from '../shared/types.ts'

export const HISTORY_LIMIT = 20

export interface OrderState {
  order: string[]
  undo: string[][]
  redo: string[][]
}

export function initOrder(ids: string[]): OrderState {
  return { order: [...ids], undo: [], redo: [] }
}

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function pushLimited(stack: string[][], entry: string[]) {
  const next = [...stack, entry]
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next
}

function swap(state: OrderState, index: number): OrderState {
  const order = [...state.order]
  ;[order[index - 1], order[index]] = [order[index], order[index - 1]]
  return { order, undo: pushLimited(state.undo, state.order), redo: [] }
}

export function moveUp(state: OrderState, id: string): OrderState {
  const index = state.order.indexOf(id)
  return index > 0 ? swap(state, index) : state
}

export function moveDown(state: OrderState, id: string): OrderState {
  const index = state.order.indexOf(id)
  return index >= 0 && index < state.order.length - 1 ? swap(state, index + 1) : state
}

export function undo(state: OrderState): OrderState {
  if (state.undo.length === 0) return state
  return {
    order: state.undo[state.undo.length - 1],
    undo: state.undo.slice(0, -1),
    redo: [...state.redo, state.order],
  }
}

export function redo(state: OrderState): OrderState {
  if (state.redo.length === 0) return state
  return {
    order: state.redo[state.redo.length - 1],
    undo: pushLimited(state.undo, state.order),
    redo: state.redo.slice(0, -1),
  }
}

export function resetOrder(state: OrderState, initial: string[]): OrderState {
  if (sameOrder(state.order, initial)) return state
  return { order: [...initial], undo: pushLimited(state.undo, state.order), redo: [] }
}

export function canMoveUp(state: OrderState, id: string) {
  return state.order.indexOf(id) > 0
}

export function canMoveDown(state: OrderState, id: string) {
  const index = state.order.indexOf(id)
  return index >= 0 && index < state.order.length - 1
}

export function canUndo(state: OrderState) {
  return state.undo.length > 0
}

export function canRedo(state: OrderState) {
  return state.redo.length > 0
}

export function canReset(state: OrderState, initial: string[]) {
  return !sameOrder(state.order, initial)
}

export function useTaskOrder(tasks: Task[]) {
  const ids = useMemo(() => tasks.map((task) => task.id), [tasks])
  const [initial] = useState(ids)
  const [state, setState] = useState<OrderState>(() => initOrder(ids))

  return {
    orderedIds: state.order,
    undoCount: state.undo.length,
    redoCount: state.redo.length,
    moveUp: (id: string) => setState((current) => moveUp(current, id)),
    moveDown: (id: string) => setState((current) => moveDown(current, id)),
    undo: () => setState(undo),
    redo: () => setState(redo),
    reset: () => setState((current) => resetOrder(current, initial)),
    canMoveUp: (id: string) => canMoveUp(state, id),
    canMoveDown: (id: string) => canMoveDown(state, id),
    canUndo: canUndo(state),
    canRedo: canRedo(state),
    canReset: canReset(state, initial),
  }
}
