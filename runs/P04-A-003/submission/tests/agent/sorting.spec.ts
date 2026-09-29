import { expect, test } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { DEFAULT_SORT, sortTasks, type SortSettings } from '../../src/taskSorting.ts'

const task = (id: string, values: Partial<Task> = {}): Task => ({
  id, projectId: 'web', title: 'Čas', description: `Opis ${id}`,
  assignee: 'Ana', status: 'todo', dueDate: '2028-02-29', ...values,
})
const frozen = (tasks: Task[]) => Object.freeze(tasks.map(entry => Object.freeze(entry)))
const ids = (tasks: readonly Task[]) => tasks.map(entry => entry.id)
const settings = (values: Partial<SortSettings>): SortSettings => ({ ...DEFAULT_SORT, ...values })
const directions = ['asc', 'desc'] as const
const primaryKeys = ['original', 'title', 'assignee', 'status', 'dueDate'] as const
const secondaryKeys = ['none', 'title', 'assignee', 'status', 'dueDate'] as const

test('A01: normalized text uses UTF-16, stable ties and lexical numbers for both text keys', () => {
  const strings = [
    ['z', 'Žaba'], ['two', 'alfa 2'], ['composed', 'čAS'], ['ten', 'Alfa 10'],
    ['decomposed', 'c\u030cas'], ['upper', 'CAS'], ['punctuation', '!Z'],
    ['dash', '—'], ['emoji', '😀'], ['bmp', '\ue000'],
    ['outside', 'c\u1ab0as'], ['last-mark', 'c\u036fas'],
  ]
  const ascending = ['punctuation', 'ten', 'two', 'composed', 'decomposed', 'upper', 'last-mark', 'outside', 'z', 'dash', 'emoji', 'bmp']
  const descending = ['bmp', 'emoji', 'dash', 'z', 'outside', 'composed', 'decomposed', 'upper', 'last-mark', 'two', 'ten', 'punctuation']
  for (const key of ['title', 'assignee'] as const) {
    const tasks = frozen(strings.map(([id, value]) => task(id, { [key]: value })))
    const snapshot = structuredClone(tasks)
    for (const direction of directions) {
      const result = sortTasks(tasks, settings({ primaryKey: key, primaryDirection: direction }))
      expect(ids(result)).toEqual(direction === 'asc' ? ascending : descending)
      for (const entry of result) expect(entry).toBe(tasks.find(source => source.id === entry.id))
    }
    expect(tasks).toEqual(snapshot)
  }
})

test('A02: all secondary keys and independent directions only break primary ties', () => {
  const tasks = frozen([
    task('r1', { title: 'Čas', assignee: 'Živa', status: 'done', dueDate: '2028-02-29' }),
    task('last', { title: 'Ž', assignee: '!Prva', dueDate: '1900-01-01' }),
    task('r2', { title: 'cas', assignee: 'Ana', dueDate: '2027-12-31' }),
    task('r3', { title: 'C\u030cas', assignee: 'ana', status: 'in_progress', dueDate: '2027-12-31' }),
    task('first', { title: 'A', assignee: 'Živa', status: 'done', dueDate: '2099-12-31' }),
    task('r4', { title: 'CAS', assignee: 'Črt', dueDate: '2028-03-01' }),
    task('r5', { title: 'čas', assignee: 'ANA', dueDate: '2027-12-31' }),
  ])
  const orders = {
    none: { asc: ['r1', 'r2', 'r3', 'r4', 'r5'], desc: ['r1', 'r2', 'r3', 'r4', 'r5'] },
    title: { asc: ['r1', 'r2', 'r3', 'r4', 'r5'], desc: ['r1', 'r2', 'r3', 'r4', 'r5'] },
    assignee: { asc: ['r2', 'r3', 'r5', 'r4', 'r1'], desc: ['r1', 'r4', 'r2', 'r3', 'r5'] },
    status: { asc: ['r2', 'r4', 'r5', 'r3', 'r1'], desc: ['r1', 'r3', 'r2', 'r4', 'r5'] },
    dueDate: { asc: ['r2', 'r3', 'r5', 'r1', 'r4'], desc: ['r4', 'r1', 'r2', 'r3', 'r5'] },
  }
  for (const primaryDirection of directions) {
    for (const secondaryKey of secondaryKeys) {
      for (const secondaryDirection of directions) {
        const result = sortTasks(tasks, settings({ primaryKey: 'title', primaryDirection, secondaryKey, secondaryDirection }))
        const ends = primaryDirection === 'asc' ? ['first', 'last'] : ['last', 'first']
        expect(ids(result)).toEqual([ends[0], ...orders[secondaryKey][secondaryDirection], ends[1]])
      }
    }
  }
  // Repeating any primary key as secondary must not introduce an extra reversal.
  for (const primaryKey of ['title', 'assignee', 'status', 'dueDate'] as const) {
    for (const primaryDirection of directions) {
      const primaryOnly = sortTasks(tasks, settings({ primaryKey, primaryDirection }))
      for (const secondaryDirection of directions) {
        expect(sortTasks(tasks, settings({ primaryKey, primaryDirection, secondaryKey: primaryKey, secondaryDirection }))).toEqual(primaryOnly)
      }
    }
  }
})

test('A03: statuses and calendar dates have stable ascending and descending orders', () => {
  const tasks = frozen([
    task('march', { dueDate: '2028-03-01', status: 'done' }),
    task('leap', { dueDate: '2028-02-29', status: 'in_progress' }),
    task('december', { dueDate: '2027-12-31' }),
    task('leap-copy', { dueDate: '2028-02-29' }),
    task('millennium', { dueDate: '2000-01-01', status: 'done' }),
    task('century', { dueDate: '1900-03-01', status: 'in_progress' }),
    task('early', { dueDate: '0099-12-31' }),
    task('year-start', { dueDate: '0100-01-01', status: 'done' }),
  ])
  const expected = {
    dueDate: {
      asc: ['early', 'year-start', 'century', 'millennium', 'december', 'leap', 'leap-copy', 'march'],
      desc: ['march', 'leap', 'leap-copy', 'december', 'millennium', 'century', 'year-start', 'early'],
    },
    status: {
      asc: ['december', 'leap-copy', 'early', 'leap', 'century', 'march', 'millennium', 'year-start'],
      desc: ['march', 'millennium', 'year-start', 'leap', 'century', 'december', 'leap-copy', 'early'],
    },
  }
  for (const primaryKey of ['status', 'dueDate'] as const) {
    for (const primaryDirection of directions) {
      expect(ids(sortTasks(tasks, settings({ primaryKey, primaryDirection })))).toEqual(expected[primaryKey][primaryDirection])
    }
  }
})

test('A04: empty and singleton inputs support all 100 settings; original overrides all controls', () => {
  const empty = frozen([])
  const single = frozen([task('only')])
  const many = frozen([task('z', { title: 'Ž' }), task('a', { title: 'A' }), task('b', { title: 'B' })])
  let checked = 0
  for (const primaryKey of primaryKeys) {
    for (const primaryDirection of directions) {
      for (const secondaryKey of secondaryKeys) {
        for (const secondaryDirection of directions) {
          const selection = { primaryKey, primaryDirection, secondaryKey, secondaryDirection }
          expect(sortTasks(empty, selection)).toEqual([])
          expect(sortTasks(single, selection)).toEqual(single)
          if (primaryKey === 'original') expect(ids(sortTasks(many, selection))).toEqual(['z', 'a', 'b'])
          checked++
        }
      }
    }
  }
  expect(checked).toBe(100)
  expect(sortTasks(many, DEFAULT_SORT)).toEqual(many)
})
