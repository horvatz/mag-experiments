import { test, expect } from '@playwright/test'
import { createOrder, orderReducer, type OrderState } from '../../src/taskOrder.ts'

function freeze(state: OrderState): OrderState {
  for (const order of [state.initial, state.order, ...state.undo, ...state.redo]) Object.freeze(order)
  Object.freeze(state.undo)
  Object.freeze(state.redo)
  return Object.freeze(state)
}

test('M01: full permutations, immutable moves, undo and redo', () => {
  const initial = freeze(createOrder(['č-9', 'z', 'a']))
  const first = freeze(orderReducer(initial, { type: 'move', id: 'z', direction: -1 }))
  const second = freeze(orderReducer(first, { type: 'move', id: 'a', direction: -1 }))
  expect(first.order).toEqual(['z', 'č-9', 'a'])
  expect(second.order).toEqual(['z', 'a', 'č-9'])
  expect(second.undo).toEqual([['č-9', 'z', 'a'], ['z', 'č-9', 'a']])
  let state = orderReducer(second, { type: 'undo' })
  expect(state.order).toEqual(first.order)
  state = orderReducer(state, { type: 'undo' })
  expect(state.order).toEqual(initial.order)
  expect(state.redo).toEqual([second.order, first.order])
  state = orderReducer(state, { type: 'redo' })
  expect(state.order).toEqual(first.order)
  state = orderReducer(state, { type: 'redo' })
  expect(state.order).toEqual(second.order)
  expect(orderReducer(state, { type: 'redo' })).toBe(state)
  expect(initial.order).toEqual(['č-9', 'z', 'a'])
})

test('M02: invalid edges preserve redo; valid branch clears it', () => {
  const initial = createOrder(['a', 'b', 'c'])
  const moved = orderReducer(initial, { type: 'move', id: 'b', direction: -1 })
  const state = freeze(orderReducer(moved, { type: 'undo' }))
  for (let repeat = 0; repeat < 2; repeat++) {
    expect(orderReducer(state, { type: 'move', id: 'a', direction: -1 })).toBe(state)
    expect(orderReducer(state, { type: 'move', id: 'c', direction: 1 })).toBe(state)
    expect(orderReducer(state, { type: 'move', id: 'missing', direction: 1 })).toBe(state)
    expect(orderReducer(state, { type: 'reset' })).toBe(state)
  }
  const branch = orderReducer(state, { type: 'move', id: 'b', direction: 1 })
  expect(branch.order).toEqual(['a', 'c', 'b'])
  expect(branch.redo).toEqual([])
  expect(branch.undo).toEqual([initial.order])
})

test('M03: 21 moves retain exactly 20 complete undo and redo steps', () => {
  const ids = Array.from({ length: 24 }, (_, i) => `id-${i}`)
  let state = createOrder(ids)
  const positions: string[][] = [[...ids]]
  for (let step = 1; step <= 21; step++) {
    state = orderReducer(freeze(state), { type: 'move', id: 'id-0', direction: 1 })
    positions.push([...ids.slice(1, step + 1), 'id-0', ...ids.slice(step + 1)])
    expect(state.order).toEqual(positions[step])
    expect(state.undo.length).toBe(Math.min(step, 20))
  }
  for (let step = 20; step >= 1; step--) {
    state = orderReducer(freeze(state), { type: 'undo' })
    expect(state.order).toEqual(positions[step])
  }
  expect(state.undo).toHaveLength(0)
  expect(state.redo).toHaveLength(20)
  expect(orderReducer(state, { type: 'undo' })).toBe(state)
  for (let step = 2; step <= 21; step++) {
    state = orderReducer(freeze(state), { type: 'redo' })
    expect(state.order).toEqual(positions[step])
    expect(new Set(state.order).size).toBe(ids.length)
  }
  expect(state.redo).toHaveLength(0)
  expect(state.undo).toHaveLength(20)
})

test('M04: reset is one undoable action and clears existing redo', () => {
  let state = createOrder(['a', 'b', 'c'])
  state = orderReducer(state, { type: 'move', id: 'b', direction: -1 })
  state = orderReducer(state, { type: 'move', id: 'c', direction: -1 })
  state = orderReducer(state, { type: 'undo' })
  const before = freeze(state)
  state = orderReducer(before, { type: 'reset' })
  expect(state.order).toEqual(['a', 'b', 'c'])
  expect(state.undo).toHaveLength(2)
  expect(state.redo).toEqual([])
  expect(orderReducer(state, { type: 'reset' })).toBe(state)
  state = orderReducer(state, { type: 'undo' })
  expect(state.order).toEqual(before.order)
  state = orderReducer(state, { type: 'redo' })
  expect(state.order).toEqual(['a', 'b', 'c'])
})

test('M05: empty and singleton have no valid action', () => {
  for (const ids of [[], ['only']]) {
    const state = freeze(createOrder(ids))
    for (const type of ['undo', 'redo', 'reset'] as const) expect(orderReducer(state, { type })).toBe(state)
    for (const direction of [-1, 1] as const) expect(orderReducer(state, { type: 'move', id: 'only', direction })).toBe(state)
  }
})
