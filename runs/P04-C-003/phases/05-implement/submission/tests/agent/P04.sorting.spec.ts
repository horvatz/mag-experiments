import { expect, test } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { defaultSortSettings, sortTasks, type SortKey, type SortSettings } from '../../src/taskSorting.ts'

const task = (id: string, values: Partial<Task> = {}): Task => ({ id, projectId: 'web', title: 'Enako', description: `Opis ${id}`, status: 'todo', assignee: 'Ana', dueDate: '2026-09-23', ...values })
const ids = (tasks: readonly Task[], settings: Partial<SortSettings> = {}) => sortTasks(tasks, { ...defaultSortSettings, ...settings }).map(t => t.id)
const keys: SortKey[] = ['title', 'assignee', 'status', 'dueDate']

for (const key of ['title', 'assignee'] as const) {
  test(`A01 ${key}: NFD, UTF-16, punctuation and lexical numbers`, () => {
    const values = ['ŽAN', 'Z\u030can', 'alfa 2', 'Alfa 10', '=SUM(A1)', 'áb', 'AB', '😀', '\uE000', 'a\u1ab0']
    const records = values.map((value, index) => task(String(index), { [key]: value }))
    expect(ids(records, { primary: key })).toEqual(['4', '5', '6', '3', '2', '9', '0', '1', '7', '8'])
    expect(ids(records, { primary: key, primaryDirection: 'desc' })).toEqual(['8', '7', '0', '1', '9', '2', '3', '5', '6', '4'])
  })
}

test('A02 status ranks and dates across years, leap day and ties', () => {
  const records = [task('a', { status: 'done', dueDate: '2028-02-29' }), task('b', { status: 'todo', dueDate: '2027-12-31' }), task('c', { status: 'in_progress', dueDate: '2028-03-01' }), task('d', { status: 'todo', dueDate: '2027-12-31' })]
  expect(ids(records, { primary: 'status' })).toEqual(['b', 'd', 'c', 'a'])
  expect(ids(records, { primary: 'status', primaryDirection: 'desc' })).toEqual(['a', 'c', 'b', 'd'])
  expect(ids(records, { primary: 'dueDate' })).toEqual(['b', 'd', 'a', 'c'])
  expect(ids(records, { primary: 'dueDate', primaryDirection: 'desc' })).toEqual(['c', 'a', 'b', 'd'])
})

for (const secondary of keys) {
  test(`A03 secondary ${secondary}: only ties, independent directions`, () => {
    const primary = secondary === 'status' ? 'title' : 'status'
    const low = secondary === 'status' ? 'todo' : secondary === 'dueDate' ? '2024-02-29' : 'Ána'
    const high = secondary === 'status' ? 'done' : secondary === 'dueDate' ? '2025-01-01' : 'Živa'
    const records = [task('high', { [secondary]: high }), task('low', { [secondary]: low }), task('tied', { [secondary]: low }), task('other', { [secondary]: low, [primary]: primary === 'status' ? 'done' : 'Zadnje' })]
    expect(ids(records, { primary, secondary })).toEqual(['low', 'tied', 'high', 'other'])
    expect(ids(records, { primary, secondary, secondaryDirection: 'desc' })).toEqual(['high', 'low', 'tied', 'other'])
    expect(ids(records, { primary, secondary, primaryDirection: 'desc' })).toEqual(['other', 'low', 'tied', 'high'])
    expect(ids(records, { primary, secondary, primaryDirection: 'desc', secondaryDirection: 'desc' })).toEqual(['other', 'high', 'low', 'tied'])
    expect(ids(records, { primary, secondary: 'none' })).toEqual(['high', 'low', 'tied', 'other'])
  })
}

test('A04 identical keys do not reverse ties or primary direction', () => {
  for (const primary of keys) {
    const values = primary === 'status' ? ['done', 'todo', 'todo'] : primary === 'dueDate' ? ['2027-01-01', '2026-12-31', '2026-12-31'] : ['Žan', 'Ana', 'ÁNA']
    const records = values.map((value, index) => task(String(index), { [primary]: value }))
    expect(ids(records, { primary, secondary: primary, secondaryDirection: 'desc' })).toEqual(['1', '2', '0'])
    expect(ids(records, { primary, primaryDirection: 'desc', secondary: primary })).toEqual(['0', '1', '2'])
  }
})

test('A05 all 100 settings: empty, singleton, stable ties, original and immutable IDs', () => {
  const records = Object.freeze(Array.from({ length: 13 }, (_, i) => Object.freeze(task(`id-${12 - i}`))))
  const varying = Object.freeze([Object.freeze(task('z', { title: 'Z', status: 'done' })), Object.freeze(task('a', { title: 'A' }))])
  const snapshot = JSON.stringify(records)
  for (const primary of ['original', ...keys] as const) for (const primaryDirection of ['asc', 'desc'] as const) for (const secondary of ['none', ...keys] as const) for (const secondaryDirection of ['asc', 'desc'] as const) {
    const settings = { primary, primaryDirection, secondary, secondaryDirection }
    expect(sortTasks([], settings)).toEqual([])
    expect(sortTasks(records.slice(0, 1), settings)).toEqual([records[0]])
    const result = sortTasks(records, settings)
    expect(result).toEqual(records)
    expect(result).not.toBe(records)
    expect(new Set(result.map(t => t.id)).size).toBe(13)
    result.forEach((entry, i) => expect(entry).toBe(records[i]))
    if (primary === 'original') expect(sortTasks(varying, settings)).toEqual(varying)
    const changed = sortTasks(varying, settings)
    expect(changed.map(t => t.id).sort()).toEqual(['a', 'z'])
  }
  expect(JSON.stringify(records)).toBe(snapshot)
  expect(varying.map(t => t.id)).toEqual(['z', 'a'])
})
