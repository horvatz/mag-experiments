import { test, expect } from '@playwright/test'
import { defaultTaskSort, sortTasks, type SortKey, type TaskSort } from '../../src/sortTasks.ts'
import { makeTask } from '../development/helpers.ts'

const ids = (tasks: ReturnType<typeof makeTask>[]) => tasks.map(task => task.id)

for (const key of ['title', 'assignee'] as const) {
  test(`S01: ${key} uses NFD, exact combining range and UTF-16 lexicography`, () => {
    const values = ['Živa', 'Alfa 2', 'alfa 10', 'ČAS', 'c\u030cas', '!Start', 'a\u1ab0', 'a', '\u{1f600}', '\uffff', 'İ', 'i']
    const tasks = values.map((value, index) => makeTask(String(index), { [key]: value }))
    const ascending = ['5', '7', '2', '1', '6', '3', '4', '10', '11', '0', '8', '9']
    expect(ids(sortTasks(tasks, { ...defaultTaskSort, primary: key }))).toEqual(ascending)
    expect(ids(sortTasks(tasks, { ...defaultTaskSort, primary: key, primaryDirection: 'desc' }))).toEqual(['9', '8', '0', '10', '11', '3', '4', '6', '1', '2', '7', '5'])
  })
}

test('S01: statuses and calendar dates across years and leap day', () => {
  const tasks = [
    makeTask('late', { status: 'done', dueDate: '2025-01-01' }),
    makeTask('leap', { status: 'todo', dueDate: '2024-02-29' }),
    makeTask('early', { status: 'in_progress', dueDate: '2023-12-31' }),
    makeTask('march', { status: 'todo', dueDate: '2024-03-01' }),
  ]
  expect(ids(sortTasks(tasks, { ...defaultTaskSort, primary: 'status' }))).toEqual(['leap', 'march', 'early', 'late'])
  expect(ids(sortTasks(tasks, { ...defaultTaskSort, primary: 'status', primaryDirection: 'desc' }))).toEqual(['late', 'early', 'leap', 'march'])
  expect(ids(sortTasks(tasks, { ...defaultTaskSort, primary: 'dueDate' }))).toEqual(['early', 'leap', 'march', 'late'])
  expect(ids(sortTasks(tasks, { ...defaultTaskSort, primary: 'dueDate', primaryDirection: 'desc' }))).toEqual(['late', 'march', 'leap', 'early'])
})

for (const secondary of ['title', 'assignee', 'status', 'dueDate', 'none'] as const) {
  test(`S02: independent directions, ties and primary groups with secondary ${secondary}`, () => {
    const values = {
      title: ['z', 'Á', 'a'],
      assignee: ['Zora', 'Črt', 'c\u030crt'],
      status: ['done', 'todo', 'todo'],
      dueDate: ['2025-01-01', '2024-02-29', '2024-02-29'],
      none: ['', '', ''],
    }
    const primary: SortKey = secondary === 'title' ? 'assignee' : 'title'
    const tasks = ['B', 'A'].flatMap(group => values[secondary].map((value, index) => makeTask(`${group}${index}`, { [primary]: group, ...(secondary === 'none' ? {} : { [secondary]: value }) })))
    for (const primaryDirection of ['asc', 'desc'] as const) {
      for (const secondaryDirection of ['asc', 'desc'] as const) {
        const groups = primaryDirection === 'asc' ? ['A', 'B'] : ['B', 'A']
        const order = secondary === 'none' || secondaryDirection === 'desc' ? [0, 1, 2] : [1, 2, 0]
        expect(ids(sortTasks(tasks, { primary, primaryDirection, secondary, secondaryDirection }))).toEqual(groups.flatMap(group => order.map(index => `${group}${index}`)))
      }
    }
  })
}

test('S02: identical keys do not reverse ties; original overrides all other settings', () => {
  const tasks = [makeTask('first', { title: 'Čas' }), makeTask('second', { title: 'c\u030cas' }), makeTask('third', { title: 'Zapis' })]
  expect(ids(sortTasks(tasks, { primary: 'title', primaryDirection: 'desc', secondary: 'title', secondaryDirection: 'asc' }))).toEqual(['third', 'first', 'second'])
  expect(ids(sortTasks(tasks, { primary: 'title', primaryDirection: 'asc', secondary: 'title', secondaryDirection: 'desc' }))).toEqual(['first', 'second', 'third'])
  expect(ids(sortTasks(tasks, { primary: 'original', primaryDirection: 'desc', secondary: 'title', secondaryDirection: 'desc' }))).toEqual(['first', 'second', 'third'])
})

test('S05/S06: all 100 combinations preserve frozen inputs, empty and single task', () => {
  const inputs = [[], [makeTask('single')], Array.from({ length: 17 }, (_, index) => makeTask(`id-${index}`, { title: index % 2 ? 'Égal' : 'e\u0301gal', assignee: index % 3 ? 'Črt' : 'Ana', status: index % 2 ? 'done' : 'todo' }))]
  for (const input of inputs) {
    const original = structuredClone(input)
    input.forEach(Object.freeze)
    Object.freeze(input)
    for (const primary of ['original', 'title', 'assignee', 'status', 'dueDate'] as const) {
      for (const secondary of ['none', 'title', 'assignee', 'status', 'dueDate'] as const) {
        for (const primaryDirection of ['asc', 'desc'] as const) {
          for (const secondaryDirection of ['asc', 'desc'] as const) {
            const settings: TaskSort = { primary, secondary, primaryDirection, secondaryDirection }
            const result = sortTasks(input, settings)
            expect(input).toEqual(original)
            expect(ids(result).sort()).toEqual(ids([...input]).sort())
            result.forEach(task => expect(task).toBe(input.find(entry => entry.id === task.id)))
            if (primary === 'original' || input.length < 2) expect(result).toEqual(original)
          }
        }
      }
    }
  }
})
