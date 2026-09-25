import { expect, test } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { defaultSortSettings, sortTasks, type SortSettings, type TaskSortKey } from '../../src/taskSort.ts'

const task = (id: string, values: Partial<Task> = {}): Task => ({
  id, projectId: 'web', title: 'Naslov', description: 'Opis', status: 'todo',
  assignee: 'Ana', dueDate: '2026-09-25', ...values,
})
const ids = (tasks: readonly Task[]) => tasks.map(({ id }) => id)
const order = (tasks: readonly Task[], values: Partial<SortSettings>) => ids(sortTasks(tasks, { ...defaultSortSettings, ...values }))
const directions = ['asc', 'desc'] as const
const keys: TaskSortKey[] = ['title', 'assignee', 'status', 'dueDate']

test('A01: defaults, original override and frozen inputs preserve every record', () => {
  const records = Object.freeze(Array.from({ length: 17 }, (_, i) => Object.freeze(task(`id-${17 - i}`, {
    title: i % 2 ? 'Čas' : 'CAS', status: i % 3 ? 'todo' : 'done',
  }))))
  const before = JSON.stringify(records)
  expect(defaultSortSettings).toEqual({ primary: 'original', primaryDirection: 'asc', secondary: 'none', secondaryDirection: 'asc' })
  for (const primary of ['original', ...keys] as const) {
    for (const secondary of ['none', ...keys] as const) {
      for (const primaryDirection of directions) for (const secondaryDirection of directions) {
        const result = sortTasks(records, { primary, primaryDirection, secondary, secondaryDirection })
        expect(ids(result).sort()).toEqual(ids(records).sort())
        for (const entry of result) expect(entry).toBe(records.find(({ id }) => id === entry.id))
        if (primary === 'original') expect(ids(result)).toEqual(ids(records))
      }
    }
  }
  expect(JSON.stringify(records)).toBe(before)
})

for (const key of ['title', 'assignee'] as const) {
  test(`A02: ${key} uses exact normalization and UTF-16, with stable descending ties`, () => {
    const values = ['žan', 'Alfa 2', 'ÁLFA 10', 'Čas', 'c\u030cas', 'CAS', '=SUM(A1)', ' Å', 'a\u1ab0', '😀', '\ue000', 'ß', 'ø', '', 'A', 'İ']
    const records = values.map((value, i) => task(String(i), { [key]: value }))
    expect(order(records, { primary: key })).toEqual([13, 7, 6, 14, 2, 1, 8, 3, 4, 5, 15, 0, 11, 12, 9, 10].map(String))
    expect(order(records, { primary: key, primaryDirection: 'desc' })).toEqual([10, 9, 12, 11, 0, 15, 3, 4, 5, 8, 1, 2, 14, 6, 7, 13].map(String))
    // Opposite secondary direction on the same key must not reverse ties or groups.
    expect(order(records, { primary: key, primaryDirection: 'desc', secondary: key, secondaryDirection: 'asc' }))
      .toEqual(order(records, { primary: key, primaryDirection: 'desc' }))
  })
}

test('A03: status follows todo, in_progress, done in both directions', () => {
  const statuses = ['done', 'todo', 'in_progress', 'todo', 'done', 'in_progress'] as const
  const records = statuses.map((status, i) => task(String(i), { status }))
  expect(order(records, { primary: 'status' })).toEqual(['1', '3', '2', '5', '0', '4'])
  expect(order(records, { primary: 'status', primaryDirection: 'desc', secondary: 'status' })).toEqual(['0', '4', '2', '5', '1', '3'])
})

test('A04: valid dates span years, leap days, centuries and stable ties', () => {
  const dates = ['2026-10-01', '0001-01-01', '2024-02-29', '2024-03-01', '2023-12-31', '2000-02-29', '1900-03-01', '9999-12-31', '2026-09-30', '2024-02-29']
  const records = dates.map((dueDate, i) => task(String(i), { dueDate }))
  expect(order(records, { primary: 'dueDate' })).toEqual([1, 6, 5, 4, 2, 9, 3, 8, 0, 7].map(String))
  expect(order(records, { primary: 'dueDate', primaryDirection: 'desc', secondary: 'dueDate' })).toEqual([7, 0, 8, 3, 2, 9, 4, 5, 6, 1].map(String))
})

for (const secondary of keys) {
  test(`A05: independent directions and primary precedence with secondary ${secondary}`, () => {
    const primary = secondary === 'dueDate' ? 'status' : 'dueDate'
    const groups = [1, 0, 0, 1, 0, 1]
    const ranks = [0, 1, 0, 2, 1, 0]
    const values = {
      title: ['Alfa 10', 'alfa 2', 'Žan'], assignee: ['Črt', 'Maja', 'Živa'],
      status: ['todo', 'in_progress', 'done'], dueDate: ['2024-02-29', '2024-03-01', '2025-01-01'],
    }
    const records = groups.map((group, i) => task(String(i), {
      [primary]: primary === 'status' ? (group ? 'done' : 'todo') : (group ? '2026-01-01' : '2025-01-01'),
      [secondary]: values[secondary][ranks[i]],
    }))
    const cases = [
      ['asc', 'asc', ['2', '1', '4', '0', '5', '3']],
      ['asc', 'desc', ['1', '4', '2', '3', '0', '5']],
      ['desc', 'asc', ['0', '5', '3', '2', '1', '4']],
      ['desc', 'desc', ['3', '0', '5', '1', '4', '2']],
    ] as const
    for (const [primaryDirection, secondaryDirection, expected] of cases) {
      expect(order(records, { primary, secondary, primaryDirection, secondaryDirection })).toEqual(expected)
    }
    expect(order(records, { primary, secondary: 'none', secondaryDirection: 'desc' })).toEqual(['1', '2', '4', '0', '3', '5'])
    expect(order(records, { primary, primaryDirection: 'desc', secondary: 'none', secondaryDirection: 'desc' })).toEqual(['0', '3', '5', '1', '2', '4'])
  })
}

test('A06: empty and singleton inputs work in all 100 settings', () => {
  const one = Object.freeze([Object.freeze(task('samo-eno'))])
  for (const primary of ['original', ...keys] as const) {
    for (const secondary of ['none', ...keys] as const) {
      for (const primaryDirection of directions) for (const secondaryDirection of directions) {
        const settings = { primary, secondary, primaryDirection, secondaryDirection }
        expect(sortTasks([], settings)).toEqual([])
        expect(sortTasks(one, settings)).toEqual(one)
      }
    }
  }
})
