import { expect, test } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'
import { DUE_GROUPS, dueCounts, dueGroup, diffDays, isValidDate, visibleTasks } from '../../src/dueDates.ts'

const REF = '2026-09-21'
const task = (id: string, dueDate: string, status: TaskStatus = 'todo'): Task => ({
  id,
  projectId: 'web',
  title: `Opravilo ${id}`,
  description: `Opis ${id}`,
  status,
  assignee: 'Ana Novak',
  dueDate,
})

test('U01: koledarski datumi, tudi prestopni', () => {
  expect(isValidDate('2026-09-21')).toBe(true)
  expect(isValidDate('2028-02-29')).toBe(true)
  expect(isValidDate('2027-02-29')).toBe(false)
  expect(isValidDate('2026-13-01')).toBe(false)
  expect(isValidDate('')).toBe(false)
  expect(diffDays('2026-12-31', '2027-01-01')).toBe(1)
  expect(diffDays('2028-02-28', '2028-02-29')).toBe(1)
  expect(diffDays('2026-09-21', '2026-09-28')).toBe(7)
})

test('U02: meje skupin in prednost done', () => {
  expect(dueGroup(task('a', '2026-09-20'), REF)).toBe('overdue')
  expect(dueGroup(task('b', '2026-09-21'), REF)).toBe('today')
  expect(dueGroup(task('c', '2026-09-22'), REF)).toBe('week')
  expect(dueGroup(task('d', '2026-09-28'), REF)).toBe('week')
  expect(dueGroup(task('e', '2026-09-29'), REF)).toBe('later')
  expect(dueGroup(task('f', '2026-09-01', 'done'), REF)).toBe('done')
  expect(dueGroup(task('g', '2026-10-30', 'done'), REF)).toBe('done')
})

test('U03: skupine so disjunktne in pokrijejo vsa opravila', () => {
  const tasks = [
    task('a', '2026-09-18'),
    task('b', '2026-09-21'),
    task('c', '2026-09-22'),
    task('d', '2026-09-29'),
    task('e', '2026-09-16', 'done'),
    task('f', '2026-10-01'),
  ]
  const counts = dueCounts(tasks, REF)
  expect(counts).toEqual({ overdue: 1, today: 1, week: 1, later: 2, done: 1 })
  expect(Object.values(counts).reduce((sum, value) => sum + value, 0)).toBe(tasks.length)
  for (const group of DUE_GROUPS) {
    expect(visibleTasks(tasks, group, REF).every((entry) => dueGroup(entry, REF) === group)).toBe(true)
  }
})

test('U04: filtriranje ohrani izvorni vrstni red', () => {
  const tasks = [task('a', '2026-09-29'), task('b', '2026-09-18'), task('c', '2026-09-20')]
  expect(visibleTasks(tasks, 'overdue', REF).map((entry) => entry.id)).toEqual(['b', 'c'])
  expect(visibleTasks(tasks, 'later', REF).map((entry) => entry.id)).toEqual(['a'])
  expect(visibleTasks(tasks, 'all', REF)).toBe(tasks)
})
