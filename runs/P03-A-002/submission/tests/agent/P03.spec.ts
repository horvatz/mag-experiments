import { expect, test, type Page } from '@playwright/test'
import {
  mount, makeTask, expectIds, board, table, select, project, summary, columnIds, readonly,
} from '../development/helpers.ts'

const records = [
  makeTask('Č-ID.9', { title: 'ČAS [a+b] (pregled)?', description: 'Z\u030cETEV; odločitev.*', assignee: 'Živa Kovač' }),
  makeTask('delta-2', { title: 'Enak naslov', description: 'Podrobni zapis žetve', status: 'in_progress', assignee: 'Ziva Kovac' }),
  makeTask('omega', { title: 'Enak naslov', description: 'Časovni načrt', status: 'done', assignee: 'Živa Kovač' }),
  makeTask('compose', { title: 'C\u030cas sestanka', description: 'Opis čšž straße x\u1ab0y', assignee: 'Z\u030civa Kovac' }),
  ...Array.from({ length: 9 }, (_, index) => makeTask(`extra-${20 - index}`, {
    title: `Dodatno ${index}`, description: 'Mirno delo',
    assignee: index % 2 ? 'Ana Novak' : 'ANA Novak',
    status: (['done', 'todo', 'in_progress'] as const)[index % 3],
  })),
  makeTask('other-77', { projectId: 'launch', title: 'Enak naslov', assignee: 'Druga oseba' }),
]
const webRecords = records.filter((task) => task.projectId === 'web')
const allIds = webRecords.map((task) => task.id)
const search = (page: Page) => page.getByRole('searchbox', { name: 'Išči opravila', exact: true })
const status = (page: Page) => page.getByRole('combobox', { name: 'Filter stanja', exact: true })
const assignee = (page: Page) => page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true })
const results = (page: Page) => page.getByRole('status', { name: 'Rezultati filtriranja', exact: true })
const clear = (page: Page) => page.getByRole('button', { name: 'Počisti filtre', exact: true }).click()
const optionValues = (page: Page) => assignee(page).locator('option').evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))

async function defaults(page: Page) {
  await expect(search(page)).toHaveValue('')
  await expect(status(page)).toHaveValue('all')
  await expect(assignee(page)).toHaveValue('all')
}

test('A01: ordered defaults and literal Unicode search across every field', async ({ page }) => {
  await mount(page, records)
  await defaults(page)
  await expectIds(page, allIds)
  await expect(results(page)).toHaveText('Prikazano: 13 od 13.')
  const cases: [string, string[]][] = [
    ['c-id.9', ['Č-ID.9']],
    ['  Z\u030cETEV \t [A+B]\n KOVAC ', ['Č-ID.9']],
    ['kovac [a+b] zetev', ['Č-ID.9']],
    ['PODROBNI zapis', ['delta-2']],
    ['ŽIVA', ['Č-ID.9', 'delta-2', 'omega', 'compose']],
    ['c\u030cAS', ['Č-ID.9', 'omega', 'compose']],
    ['[a+b]', ['Č-ID.9']],
    ['.*', ['Č-ID.9']],
    ['(pregled)?', ['Č-ID.9']],
    ['čas.*', []],
    ['čas neobstoječe', []],
    ['STRASSE', []],
    ['straße', ['compose']],
    ['xy', []],
    ['x\u1ab0y', ['compose']],
    ['\t\r\n\u00a0', allIds],
    ['', allIds],
  ]
  for (const [query, expected] of cases) {
    await search(page).fill(query)
    await expectIds(page, expected)
    await expect(results(page)).toHaveText(`Prikazano: ${expected.length} od 13.`)
  }
})

test('A02: AND filters, exact assignees, stable options and atomic clear', async ({ page }) => {
  await mount(page, records)
  const options = ['all', 'Živa Kovač', 'Ziva Kovac', 'Z\u030civa Kovac', 'ANA Novak', 'Ana Novak']
  await expect.poll(() => optionValues(page)).toEqual(options)
  await search(page).fill('kovac')
  await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
  await expectIds(page, ['Č-ID.9', 'omega'])
  await select(page, 'Filter stanja', 'done')
  await expectIds(page, ['omega'])
  await select(page, 'Filter stanja', 'todo')
  await expectIds(page, ['Č-ID.9'])
  await select(page, 'Filter stanja', 'in_progress')
  await expectIds(page, [])
  await expect.poll(() => optionValues(page)).toEqual(options)
  await select(page, 'Filter odgovorne osebe', 'Ziva Kovac')
  await expectIds(page, ['delta-2'])
  await select(page, 'Filter stanja', 'all')
  await select(page, 'Filter odgovorne osebe', 'Z\u030civa Kovac')
  await expectIds(page, ['compose'])
  await search(page).fill('novak')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await expectIds(page, ['extra-19', 'extra-17', 'extra-15', 'extra-13'])
  await clear(page)
  await defaults(page)
  await expectIds(page, allIds)
  await expect.poll(() => optionValues(page)).toEqual(options)
})

test('A03: same IDs in both views, source order within columns and filtered counts', async ({ page }) => {
  await mount(page, records)
  await search(page).fill('ziva')
  await expectIds(page, ['Č-ID.9', 'delta-2', 'omega', 'compose'])
  await summary(page, [2, 1, 1])
  await expect(results(page)).toHaveText('Prikazano: 4 od 13.')
  await board(page)
  await expectIds(page, ['Č-ID.9', 'delta-2', 'omega', 'compose'], false)
  await columnIds(page, 'Pripravljeno', ['Č-ID.9', 'compose'])
  await columnIds(page, 'V delu', ['delta-2'])
  await columnIds(page, 'Končano', ['omega'])
  await expect(page.locator('.column-count')).toHaveText(['2', '1', '1'])
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
  await expectIds(page, ['omega'])
  await summary(page, [0, 0, 1])
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '1'])
  await table(page)
  await expectIds(page, ['omega'])
  await expect(search(page)).toHaveValue('ziva')
  await expect(status(page)).toHaveValue('done')
  await expect(assignee(page)).toHaveValue('Živa Kovač')
  await expect(results(page)).toHaveText('Prikazano: 1 od 13.')
})

test('A04: project changes and reload reset filters without URL or browser storage', async ({ page }) => {
  await mount(page, records)
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    const url = page.url()
    await search(page).fill('kovac')
    await select(page, 'Filter stanja', 'done')
    await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
    await expectIds(page, ['omega'])
    expect(page.url()).toBe(url)
    expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(initialStorage)
    await page.reload()
    await defaults(page)
    await expectIds(page, allIds, view === 'table')
    await search(page).fill('kovac')
    await select(page, 'Filter stanja', 'done')
    await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
    await project(page, 'launch')
    await defaults(page)
    await expectIds(page, ['other-77'])
    await expect.poll(() => optionValues(page)).toEqual(['all', 'Druga oseba'])
    await search(page).fill('nic')
    await select(page, 'Filter stanja', 'in_progress')
    await select(page, 'Filter odgovorne osebe', 'Druga oseba')
    await page.goBack()
    await defaults(page)
    await expectIds(page, allIds, view === 'table')
    await expect(results(page)).toHaveText('Prikazano: 13 od 13.')
  }
})

test('A05: zero matches, single task and both projects empty keep usable views', async ({ page }) => {
  await mount(page, [makeTask('unique', { assignee: 'Edina oseba' })])
  await expectIds(page, ['unique'])
  await search(page).fill('missing')
  await expectIds(page, [])
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(results(page)).toHaveText('Prikazano: 0 od 1.')
  await summary(page, [0, 0, 0])
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await clear(page)
  await expectIds(page, ['unique'])
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
  await table(page)
  await expectIds(page, ['unique'])
  await page.route('**/api/projects/*/tasks', (route) => route.fulfill({ json: [] }))
  await page.reload()
  for (const id of ['web', 'launch'] as const) {
    if (id === 'launch') await project(page, id)
    await expect(results(page)).toHaveText('Prikazano: 0 od 0.')
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
    await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
    await expect.poll(() => optionValues(page)).toEqual(['all'])
    await search(page).fill('missing')
    await select(page, 'Filter stanja', 'done')
    await board(page)
    await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
    await expect(page.getByText('Ni opravil v tem stanju.')).toHaveCount(3)
    await expect(results(page)).toHaveText('Prikazano: 0 od 0.')
    await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
    await clear(page)
    await defaults(page)
    await table(page)
  }
})

test('A06: filtering preserves source fields, ID details, focus and read-only API', async ({ page }) => {
  const writes = await mount(page, records)
  const before = await (await page.request.get('/__test/state')).json()
  const requests: string[] = []
  page.on('request', (request) => requests.push(new URL(request.url()).pathname))
  await search(page).fill('enak naslov')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    const link = page.locator('[data-task-id="omega"]').getByRole('link')
    await link.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Enak naslov', exact: true })).toBeVisible()
    await expect(dialog.getByText('Časovni načrt', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Živa Kovač', { exact: true })).toBeVisible()
    await expect(dialog.getByText('omega', { exact: true }).first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(link).toBeFocused()
    await expect(search(page)).toHaveValue('enak naslov')
    await expectIds(page, ['omega'])
  }
  await clear(page)
  await table(page)
  await expectIds(page, allIds)
  for (const task of webRecords) {
    const row = page.locator('[data-task-id]').filter({ has: page.getByRole('link', { name: `${task.title} ${task.id}`, exact: true }) })
    await expect(row.getByRole('link')).toContainText(task.title)
    await expect(row.locator('.person > span:last-child')).toHaveText(task.assignee)
    await expect(row.locator('time')).toHaveAttribute('datetime', task.dueDate)
  }
  expect(requests.filter((path) => path.startsWith('/__test/'))).toEqual([])
  // StrictMode may repeat GET requests when mounting details in development.
  expect([...new Set(requests.filter((path) => path.startsWith('/api/')))]).toEqual(['/api/tasks/omega'])
  await readonly(page, writes)
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
})

test('A07: controls, keyboard and both views fit 390 pixels with long text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const name = 'Živa ' + 'DolgoIme'.repeat(25)
  const writes = await mount(page, [makeTask('narrow-id', {
    title: 'Dolg naslov '.repeat(30), description: 'Opis '.repeat(100), assignee: name,
  })])
  await expectIds(page, ['narrow-id'])
  await search(page).focus()
  await page.keyboard.type('naslov')
  await page.keyboard.press('Tab')
  await expect(status(page)).toBeFocused()
  expect(await status(page).evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Tab')
  await expect(assignee(page)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Počisti filtre' })).toBeFocused()
  await page.keyboard.press('Enter')
  await defaults(page)
  for (const control of [search(page), status(page), assignee(page), page.getByRole('button', { name: 'Počisti filtre' })]) {
    const bounds = await control.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
  }
  await readonly(page, writes)
  await board(page)
  await expectIds(page, ['narrow-id'])
  await readonly(page, writes)
  await search(page).fill('brez zadetkov')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await readonly(page, writes)
})
