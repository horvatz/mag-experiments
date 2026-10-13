import { expect, test } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'
import { defaultSortState, normalizeText, sortTasks, type SortState } from '../../src/sorting.ts'

function task(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    projectId: 'web',
    title: id,
    description: id,
    status: 'todo',
    assignee: id,
    dueDate: '2026-01-01',
    ...overrides,
  }
}

const state = (overrides: Partial<SortState> = {}): SortState => ({
  ...defaultSortState,
  ...overrides,
})

test('default and original sorting ignore every other control', () => {
  const tasks = [task('third'), task('first'), task('second')]
  const chaoticState = state({
    primary: 'original',
    primaryDirection: 'desc',
    secondary: 'title',
    secondaryDirection: 'desc',
  })

  expect(sortTasks(tasks, defaultSortState).map((entry) => entry.id)).toEqual(['third', 'first', 'second'])
  expect(sortTasks(tasks, chaoticState).map((entry) => entry.id)).toEqual(['third', 'first', 'second'])
})

test('text sorting uses normalization and UTF-16 comparison without numeric rules', () => {
  expect(normalizeText('Črt')).toBe('crt')
  const tasks = [
    task('a', { title: 'Édition 10', assignee: 'Ana' }),
    task('b', { title: 'edition 9', assignee: 'Žana' }),
    task('c', { title: 'Edition 10', assignee: 'ana' }),
    task('d', { title: 'Članek 2', assignee: 'ana' }),
  ]

  const titles = sortTasks(tasks, state({ primary: 'title' })).map((entry) => entry.id)
  expect(titles).toEqual(['d', 'a', 'c', 'b'])
  expect(sortTasks(tasks, state({ primary: 'assignee' })).map((entry) => entry.id)).toEqual(['a', 'c', 'd', 'b'])
})

test('status and date sorting follow their declared orders', () => {
  const statuses: TaskStatus[] = ['done', 'in_progress', 'todo', 'todo']
  const tasks = statuses.map((status, index) => task(`task-${index + 1}`, { status }))
  expect(sortTasks(tasks, state({ primary: 'status' })).map((entry) => entry.status)).toEqual([
    'todo',
    'todo',
    'in_progress',
    'done',
  ])

  const dates = ['2027-02-01', '2026-03-01', '2026-02-28', '2026-02-27']
  const dateTasks = dates.map((dueDate, index) => task(`date-${index + 1}`, { dueDate }))
  expect(sortTasks(dateTasks, state({ primary: 'dueDate' })).map((entry) => entry.dueDate)).toEqual([
    '2026-02-27',
    '2026-02-28',
    '2026-03-01',
    '2027-02-01',
  ])
})

test('directions are independent and sorting is stable', () => {
  const tasks = [
    task('one', { title: 'Beta', status: 'todo', dueDate: '2026-01-02', assignee: 'Ana' }),
    task('two', { title: 'Alpha', status: 'todo', dueDate: '2026-01-03', assignee: 'Bo' }),
    task('three', { title: 'Beta', status: 'done', dueDate: '2026-01-01', assignee: 'Cilka' }),
    task('four', { title: 'Alpha', status: 'done', dueDate: '2026-01-01', assignee: 'Dan' }),
  ]

  expect(sortTasks(tasks, state({ primary: 'status', primaryDirection: 'desc', secondary: 'title' })).map((entry) => entry.id)).toEqual([
    'four',
    'three',
    'two',
    'one',
  ])
  expect(sortTasks(tasks, state({ primary: 'dueDate', primaryDirection: 'desc', secondary: 'title', secondaryDirection: 'desc' })).map((entry) => entry.id)).toEqual([
    'two',
    'one',
    'three',
    'four',
  ])
  expect(sortTasks(tasks, state({ primary: 'title', primaryDirection: 'desc', secondary: 'title', secondaryDirection: 'desc' })).map((entry) => entry.id)).toEqual([
    'one',
    'three',
    'two',
    'four',
  ])
})

test('sorting is a pure projection', () => {
  const tasks = [task('second', { title: 'z' }), task('first', { title: 'a' }), task('third')]
  const original = structuredClone(tasks)
  const sorted = sortTasks(tasks, state({ primary: 'title', secondary: 'dueDate', secondaryDirection: 'desc' }))

  expect(sorted.map((entry) => entry.id)).toEqual(['first', 'third', 'second'])
  expect(tasks).toEqual(original)
})
