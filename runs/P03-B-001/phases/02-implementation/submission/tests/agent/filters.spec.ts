import { test, expect, mount, makeTask, expectIds, webIds, select, board, table, project, summary, columnIds, readonly } from '../development/helpers.ts'
import { filterTasks } from '../../src/taskFilters.ts'
import type { Page } from '@playwright/test'

const records = [
  makeTask('Ž-9', { title: 'Čas pregleda', description: 'Skupina ŽOLNA .* [ =SUM(A1)', assignee: 'Črt' }),
  makeTask('x-2', { title: 'Čas pregleda', description: 'Skupina načrt', assignee: 'Crt', status: 'done' }),
  makeTask('a-7', { title: 'Čas pregleda', description: 'Skupina nac\u030crt', assignee: 'črt', status: 'in_progress' }),
  makeTask('id-only', { title: 'Posebno', description: 'Opis', assignee: 'Maja' }),
  ...[8, 1, 6, 4, 2, 7, 3, 0, 5].map((value) => makeTask(`extra-${value}`, { title: 'Dodatno', assignee: 'Druga oseba', status: value % 2 ? 'done' : 'todo' })),
  makeTask('other-project', { projectId: 'launch', assignee: 'Nova oseba' }),
]
const search = (page: Page) => page.getByRole('searchbox', { name: 'Išči opravila' })
const results = (page: Page) => page.getByRole('status', { name: 'Rezultati filtriranja' })
const clear = (page: Page) => page.getByRole('button', { name: 'Počisti filtre' }).click()
const options = (page: Page) => page.getByRole('combobox', { name: 'Filter odgovorne osebe' }).locator('option').evaluateAll(nodes => nodes.map(node => (node as HTMLOptionElement).value))

async function defaults(page: Page) {
  await expect(search(page)).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
}

test('A01: all search fields, Unicode, word conjunction and literal punctuation', async ({ page }) => {
  const writes = await mount(page, records)
  await defaults(page)
  await expectIds(page, webIds(records))
  await expect(results(page)).toHaveText('Prikazano: 13 od 13.')
  const cases: [string, string[]][] = [
    ['z-9', ['Ž-9']], ['CAS', ['Ž-9', 'x-2', 'a-7']], ['zolna', ['Ž-9']],
    ['CRT', ['Ž-9', 'x-2', 'a-7']], ['  crt\tZOLNA   cas ', ['Ž-9']],
    ['cas zolna crt', ['Ž-9']], ['nacrt', ['x-2', 'a-7']], ['NAČRT', ['x-2', 'a-7']],
    ['.*', ['Ž-9']], ['[', ['Ž-9']], ['=sum(a1)', ['Ž-9']],
    ['cas missing', []], ['2026-09-21', []], ['in_progress', []], ['  \t ', webIds(records)],
  ]
  for (const [query, expected] of cases) {
    await search(page).fill(query)
    await expectIds(page, expected)
  }
  await readonly(page, writes)
})

test('A02: exact people, three filters, counts, views and atomic clear preserve source order and fields', async ({ page }) => {
  const writes = await mount(page, records)
  await expectIds(page, webIds(records))
  const originalRows = await page.locator('tbody').innerText()
  expect(await options(page)).toEqual(['all', 'Črt', 'Crt', 'črt', 'Maja', 'Druga oseba'])
  await search(page).fill('cas')
  await summary(page, [1, 1, 1])
  await board(page)
  await expectIds(page, ['Ž-9', 'x-2', 'a-7'], false)
  for (const [name, id] of [['Pripravljeno', 'Ž-9'], ['V delu', 'a-7'], ['Končano', 'x-2']]) {
    await columnIds(page, name, [id])
    await expect(page.getByRole('region', { name, exact: true }).locator('.column-count')).toHaveText('1')
  }
  await select(page, 'Filter odgovorne osebe', 'Črt')
  await select(page, 'Filter stanja', 'todo')
  await expectIds(page, ['Ž-9'])
  await expect(results(page)).toHaveText('Prikazano: 1 od 13.')
  await summary(page, [1, 0, 0])
  await expect(page.locator('.column-count')).toHaveText(['1', '0', '0'])
  await table(page)
  await expect(search(page)).toHaveValue('cas')
  await expect(page.getByRole('combobox', { name: 'Filter stanja', exact: true })).toHaveValue('todo')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('Črt')
  await expectIds(page, ['Ž-9'])
  for (const [person, status, id] of [['Crt', 'done', 'x-2'], ['črt', 'in_progress', 'a-7']]) {
    await select(page, 'Filter odgovorne osebe', person)
    await expectIds(page, [])
    await select(page, 'Filter stanja', status)
    await expectIds(page, [id])
  }
  expect(await options(page)).toEqual(['all', 'Črt', 'Crt', 'črt', 'Maja', 'Druga oseba'])
  await clear(page)
  await defaults(page)
  await expectIds(page, webIds(records))
  expect(await page.locator('tbody').innerText()).toBe(originalRows)
  await readonly(page, writes)
})

test('A03: details preserve filters, project changes and reload reset them without persistence', async ({ page }) => {
  const writes = await mount(page, records)
  await search(page).fill('cas')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Crt')
  const link = page.locator('[data-task-id="x-2"]').getByRole('link')
  await link.click()
  await expect(page.getByRole('dialog').getByText('Crt', { exact: true })).toBeVisible()
  await expect(page.getByRole('dialog').locator('time')).toHaveAttribute('datetime', '2026-09-21')
  await page.keyboard.press('Escape')
  await expect(link).toBeFocused()
  await expectIds(page, ['x-2'])
  await board(page)
  await project(page, 'launch')
  await defaults(page)
  await expectIds(page, ['other-project'])
  expect(await options(page)).toEqual(['all', 'Nova oseba'])
  await project(page, 'web')
  await defaults(page)
  await expectIds(page, webIds(records), false)
  await search(page).fill('zolna')
  await select(page, 'Filter odgovorne osebe', 'Črt')
  expect(new URL(page.url()).hash).toBe('#/projects/web?view=board')
  expect(await page.evaluate(() => [Object.keys(localStorage), Object.keys(sessionStorage)])).toEqual([[], []])
  await page.reload()
  await defaults(page)
  await expectIds(page, webIds(records), false)
  await table(page)
  await search(page).fill('missing')
  await page.reload()
  await defaults(page)
  await expectIds(page, webIds(records))
  await readonly(page, writes)
})

test('A04: no matches keeps both views and all options usable', async ({ page }) => {
  await mount(page, records)
  await search(page).fill('missing')
  await expect(results(page)).toHaveText('Prikazano: 0 od 13.')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await summary(page, [0, 0, 0])
  const allOptions = ['all', 'Črt', 'Crt', 'črt', 'Maja', 'Druga oseba']
  expect(await options(page)).toEqual(allOptions)
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await expectIds(page, [])
  await clear(page)
  await expectIds(page, webIds(records), false)
  await table(page)
  await expectIds(page, webIds(records))
})

test('A05: two empty projects retain their normal empty states and zero totals', async ({ page }) => {
  await mount(page, [])
  await expect(results(page)).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)
  await search(page).fill('anything')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
  expect(await options(page)).toEqual(['all'])
  await board(page)
  await expect(page.getByText('Ni opravil v tem stanju.')).toHaveCount(3)
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await project(page, 'launch')
  await defaults(page)
  await expect(results(page)).toHaveText('Prikazano: 0 od 0.')
  await table(page)
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
})

test('A06: single task and long names remain usable at 390px without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const person = 'Živa'.repeat(60)
  const writes = await mount(page, [makeTask('single', { assignee: person, title: 'Čas'.repeat(80) })])
  await expectIds(page, ['single'])
  await expect(results(page)).toHaveText('Prikazano: 1 od 1.')
  await search(page).fill('cas')
  await select(page, 'Filter stanja', 'todo')
  await select(page, 'Filter odgovorne osebe', person)
  await readonly(page, writes)
  await page.screenshot({ path: 'test-results/agent-mobile-table.png', fullPage: true })
  await board(page)
  await expectIds(page, ['single'])
  await readonly(page, writes)
  await page.screenshot({ path: 'test-results/agent-mobile-board.png', fullPage: true })
  await clear(page)
  await defaults(page)
})

test('A07: multiline whitespace and frozen source data remain unchanged', () => {
  const source = records.map(task => Object.freeze({ ...task }))
  const before = JSON.stringify(source)
  Object.freeze(source)
  expect(filterTasks(source, { query: 'ŽOLNA\n\t C\u030cAS\r CRT', status: 'all', assignee: 'all' }).map(task => task.id)).toEqual(['Ž-9'])
  expect(filterTasks(source, { query: '\n\t\r ', status: 'all', assignee: 'all' })).toEqual(source)
  expect(JSON.stringify(source)).toBe(before)
})
