import { test, expect, mount, makeTask, select, expectIds, board, table, columnIds, details, project, readonly, summary } from '../development/helpers.ts'
import { defaultTaskSort, sortTasks, type TaskSort } from '../../src/taskSorting.ts'
import type { Page } from '@playwright/test'

const primaryKeys: TaskSort['primary'][] = ['original', 'title', 'assignee', 'status', 'dueDate']
const secondaryKeys: TaskSort['secondary'][] = ['none', 'title', 'assignee', 'status', 'dueDate']
const directions: TaskSort['primaryDirection'][] = ['asc', 'desc']
const taskIds = (tasks: ReturnType<typeof makeTask>[]) => tasks.map(task => task.id)

test('A01: Unicode normalization, lexical digits and UTF-16 ordering retain stable ties', () => {
  const tasks = [
    makeTask('q1', { title: 'Žaba', assignee: 'Črt' }),
    makeTask('q2', { title: 'alfa 2', assignee: 'Ziva' }),
    makeTask('q3', { title: 'Álfa 10', assignee: 'Éva' }),
    makeTask('q4', { title: 'ALFA 10', assignee: 'E\u0301va' }),
    makeTask('q5', { title: '😀', assignee: 'iva' }),
    makeTask('q6', { title: '\uE000', assignee: 'Äna' }),
    makeTask('q7', { title: 'alpha\u1ab0', assignee: 'Ana' }),
    makeTask('q8', { title: 'alpha', assignee: 'A\u030Ana' }),
  ]
  expect(taskIds(sortTasks(tasks, { ...defaultTaskSort, primary: 'title' }))).toEqual(['q3', 'q4', 'q2', 'q8', 'q7', 'q1', 'q5', 'q6'])
  expect(taskIds(sortTasks(tasks, { ...defaultTaskSort, primary: 'title', primaryDirection: 'desc' }))).toEqual(['q6', 'q5', 'q1', 'q7', 'q8', 'q2', 'q3', 'q4'])
  expect(taskIds(sortTasks(tasks, { ...defaultTaskSort, primary: 'assignee' }))).toEqual(['q6', 'q7', 'q8', 'q1', 'q3', 'q4', 'q5', 'q2'])
  expect(taskIds(sortTasks(tasks, { ...defaultTaskSort, primary: 'assignee', primaryDirection: 'desc' }))).toEqual(['q2', 'q5', 'q3', 'q4', 'q1', 'q6', 'q7', 'q8'])
})

const records = [
  makeTask('unique-c', { title: 'Enak naslov', status: 'done', assignee: 'Živa', dueDate: '2024-02-29' }),
  makeTask('unique-a', { title: 'Enak naslov', status: 'todo', assignee: 'Ana', dueDate: '2025-01-01' }),
  makeTask('unique-b', { title: 'Enak naslov', status: 'todo', assignee: 'Črt', dueDate: '2023-12-31' }),
  makeTask('unique-d', { title: 'Enak naslov', status: 'in_progress', assignee: 'Ana', dueDate: '2024-03-01' }),
  makeTask('unique-e', { title: 'Enak naslov', status: 'todo', assignee: 'Ana', dueDate: '2025-01-01' }),
]

test('A02: independent directions, every secondary key, dates, status and equal keys', () => {
  const cases: [TaskSort, string[]][] = [
    [{ ...defaultTaskSort, primary: 'title', secondary: 'assignee' }, ['unique-a', 'unique-d', 'unique-e', 'unique-b', 'unique-c']],
    [{ ...defaultTaskSort, primary: 'title', secondary: 'status', secondaryDirection: 'desc' }, ['unique-c', 'unique-d', 'unique-a', 'unique-b', 'unique-e']],
    [{ ...defaultTaskSort, primary: 'title', secondary: 'dueDate' }, ['unique-b', 'unique-c', 'unique-d', 'unique-a', 'unique-e']],
    [{ ...defaultTaskSort, primary: 'status', primaryDirection: 'desc', secondary: 'dueDate' }, ['unique-c', 'unique-d', 'unique-b', 'unique-a', 'unique-e']],
    [{ ...defaultTaskSort, primary: 'status', secondary: 'dueDate', secondaryDirection: 'desc' }, ['unique-a', 'unique-e', 'unique-b', 'unique-d', 'unique-c']],
    [{ ...defaultTaskSort, primary: 'dueDate', primaryDirection: 'desc', secondary: 'dueDate' }, ['unique-a', 'unique-e', 'unique-d', 'unique-c', 'unique-b']],
  ]
  for (const [settings, ids] of cases) expect(taskIds(sortTasks(records, settings))).toEqual(ids)
  const samePerson = records.map(task => ({ ...task, assignee: 'Ana', title: task.id }))
  expect(taskIds(sortTasks(samePerson, { ...defaultTaskSort, primary: 'assignee', secondary: 'title', secondaryDirection: 'desc' }))).toEqual(['unique-e', 'unique-d', 'unique-c', 'unique-b', 'unique-a'])
})

test('A03: every combination preserves input and identity, original wins, empty/singleton work', () => {
  const frozen = Object.freeze(records.map(task => Object.freeze({ ...task })))
  const before = JSON.stringify(frozen)
  for (const primary of primaryKeys) for (const secondary of secondaryKeys) for (const primaryDirection of directions) for (const secondaryDirection of directions) {
    const settings = { primary, secondary, primaryDirection, secondaryDirection }
    const result = sortTasks(frozen, settings)
    expect(result).not.toBe(frozen)
    expect(new Set(result).size).toBe(frozen.length)
    expect(result.every(task => frozen.includes(task))).toBe(true)
    expect(JSON.stringify(frozen)).toBe(before)
    if (primary === 'original') expect(result).toEqual(frozen)
    expect(sortTasks([], settings)).toEqual([])
    expect(sortTasks([frozen[0]], settings)).toEqual([frozen[0]])
  }
})

async function expectSettings(page: Page, settings: TaskSort) {
  for (const [name, value] of [
    ['Primarni ključ', settings.primary], ['Primarna smer', settings.primaryDirection],
    ['Sekundarni ključ', settings.secondary], ['Sekundarna smer', settings.secondaryDirection],
  ]) await expect(page.getByRole('combobox', { name, exact: true })).toHaveValue(value)
}

test('A04: shared table/board order, duplicate-title details, counts, resets and no writes', async ({ page }) => {
  const writes = await mount(page, records)
  await expectSettings(page, defaultTaskSort)
  await expectIds(page, taskIds(records))
  const settings: TaskSort = { primary: 'status', primaryDirection: 'desc', secondary: 'dueDate', secondaryDirection: 'desc' }
  await select(page, 'Primarni ključ', settings.primary)
  await select(page, 'Primarna smer', settings.primaryDirection)
  await select(page, 'Sekundarni ključ', settings.secondary)
  await select(page, 'Sekundarna smer', settings.secondaryDirection)
  const ordered = ['unique-c', 'unique-d', 'unique-a', 'unique-e', 'unique-b']
  await expectIds(page, ordered)
  await summary(page, [3, 1, 1])
  for (const id of ordered) await details(page, id)
  await expectSettings(page, settings)
  await expectIds(page, ordered)
  await board(page)
  await expect(page.locator('.board-column h3')).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
  await columnIds(page, 'Pripravljeno', ['unique-a', 'unique-e', 'unique-b'])
  await columnIds(page, 'V delu', ['unique-d'])
  await columnIds(page, 'Končano', ['unique-c'])
  await details(page, 'unique-e')
  await expectSettings(page, settings)
  await table(page)
  await expectIds(page, ordered)
  await expect(page).toHaveURL(/#\/projects\/web$/)
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectSettings(page, defaultTaskSort)
  await expectIds(page, taskIds(records))
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await project(page, 'launch')
  await expectSettings(page, defaultTaskSort)
  await project(page, 'web')
  await expectSettings(page, defaultTaskSort)
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await page.reload()
  await expectSettings(page, defaultTaskSort)
  await expectIds(page, taskIds(records))
  await readonly(page, writes)
})

test('A05: 390px layout with more than ten tasks, controls and duplicate titles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const many = Array.from({ length: 14 }, (_, i) => makeTask(`custom-${i}`, { title: 'Čisto enak naslov', dueDate: `2026-09-${String(14 - i).padStart(2, '0')}` }))
  const writes = await mount(page, many)
  await select(page, 'Primarni ključ', 'dueDate')
  const ordered = [...many].reverse().map(task => task.id)
  await expectIds(page, ordered)
  await details(page, 'custom-12')
  await expectIds(page, ordered)
  await readonly(page, writes)
  await board(page)
  await columnIds(page, 'Pripravljeno', ordered)
  await readonly(page, writes)
  await page.screenshot({ path: 'test-results/p04-mobile-board.png', fullPage: true })
})

test('A06: empty and single-task project expose every key and direction', async ({ page }) => {
  await mount(page, [makeTask('only-task', { projectId: 'launch' })])
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    for (let i = 0; i < primaryKeys.length; i++) for (const direction of directions) {
      await select(page, 'Primarni ključ', primaryKeys[i])
      await select(page, 'Primarna smer', direction)
      await select(page, 'Sekundarni ključ', secondaryKeys[i])
      await select(page, 'Sekundarna smer', direction)
      await expectIds(page, id === 'web' ? [] : ['only-task'])
    }
    await board(page)
    await expectIds(page, id === 'web' ? [] : ['only-task'])
    await table(page)
  }
})
