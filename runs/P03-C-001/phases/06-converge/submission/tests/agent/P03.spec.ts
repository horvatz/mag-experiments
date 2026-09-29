import type { Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, select, board, table, click, project, details, summary, columnIds, readonly } from '../development/helpers.ts'
import { filterTasks, defaultFilters } from '../../src/taskFilters.ts'

const records = [
  makeTask('Ž-9', { title: 'Čas ČŠŽ', description: 'Končni zapis .* [ + skupno', status: 'in_progress', assignee: 'Živa Kovač' }),
  makeTask('x-2', { title: 'Čas ČŠŽ', description: 'Skupno končni zapis', status: 'done', assignee: 'Ziva Kovac' }),
  makeTask('a-7', { title: 'Čas ČŠŽ', description: 'Skupno predlog', status: 'in_progress', assignee: 'Živa Kovač' }),
  makeTask('m-1', { title: 'Drugo', description: 'Skupno končni zapis', status: 'todo', assignee: 'živa kovač' }),
  ...Array.from({ length: 10 }, (_, index) => makeTask(`extra-${20 - index}`, { title: 'Podpora', description: 'Samostojno', assignee: index === 0 ? 'Oseba z zelo dolgim imenom za preverjanje širine izbirnika' : 'Ana' })),
  makeTask('other-8', { projectId: 'launch', title: 'Drug projekt', assignee: 'Miha' }),
]
const web = records.slice(0, -1)
const webIds = web.map(task => task.id)
const search = (page: Page) => page.getByRole('searchbox', { name: 'Išči opravila' })
const result = (page: Page) => page.getByRole('status', { name: 'Rezultati filtriranja' })
async function defaults(page: Page) {
  await expect(search(page)).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true })).toHaveValue('all')
}

test('S01: defaults preserve arbitrary project order and a single task', async ({ page }) => {
  const writes = await mount(page, records)
  await defaults(page)
  await expectIds(page, webIds)
  await expect(result(page)).toHaveText('Prikazano: 14 od 14.')
  await project(page, 'launch')
  await defaults(page)
  await expectIds(page, ['other-8'])
  await expect(result(page)).toHaveText('Prikazano: 1 od 1.')
  await readonly(page, writes)
})

test('S02: all fields, Unicode, whitespace, AND words and literal punctuation', async ({ page }) => {
  const writes = await mount(page, records)
  const cases: [string, string[]][] = [
    ['z-9', ['Ž-9']],
    ['cAs cSz', ['Ž-9', 'x-2', 'a-7']],
    ['C\u030cAS C\u030cS\u030cZ\u030c', ['Ž-9', 'x-2', 'a-7']],
    ['KONCNI', ['Ž-9', 'x-2', 'm-1']],
    ['ZIVA KOVAC', ['Ž-9', 'x-2', 'a-7', 'm-1']],
    ['zapis cas', ['Ž-9', 'x-2']],
    ['  CAS\t zapis  ', ['Ž-9', 'x-2']],
    ['.*', ['Ž-9']], ['[', ['Ž-9']], ['+', ['Ž-9']],
    ['cas manjkajoca', []], ['   \t ', webIds], ['', webIds],
  ]
  for (const [query, expected] of cases) {
    await search(page).fill(query)
    await expectIds(page, expected)
  }
  await readonly(page, writes)
})

test('S03: three filters intersect, exact people stay available and clear together', async ({ page }) => {
  const writes = await mount(page, records)
  const options = page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true }).locator('option')
  const expectedOptions = ['all', 'Živa Kovač', 'Ziva Kovac', 'živa kovač', records[4].assignee, 'Ana']
  await expect(options).toHaveCount(expectedOptions.length)
  expect(await options.evaluateAll(nodes => nodes.map(node => (node as HTMLOptionElement).value))).toEqual(expectedOptions)
  await search(page).fill('cas')
  await select(page, 'Filter stanja', 'in_progress')
  await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
  await expectIds(page, ['Ž-9', 'a-7'])
  await expect(result(page)).toHaveText('Prikazano: 2 od 14.')
  expect(await options.evaluateAll(nodes => nodes.map(node => (node as HTMLOptionElement).value))).toEqual(expectedOptions)
  await select(page, 'Filter odgovorne osebe', 'Ziva Kovac')
  await expectIds(page, [])
  await select(page, 'Filter stanja', 'done')
  await expectIds(page, ['x-2'])
  await click(page, 'Počisti filtre')
  await defaults(page)
  await expectIds(page, webIds)
  await readonly(page, writes)
})

test('S04: project changes and reload reset filters without URL or storage persistence', async ({ page }) => {
  const writes = await mount(page, records)
  const originalUrl = page.url()
  const storage = () => page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  const originalStorage = await storage()
  await search(page).fill('cas')
  await select(page, 'Filter stanja', 'in_progress')
  await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
  expect(page.url()).toBe(originalUrl)
  expect(await storage()).toEqual(originalStorage)
  await project(page, 'launch')
  await defaults(page)
  await expectIds(page, ['other-8'])
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true }).locator('option')).toHaveText(['Vse osebe', 'Miha'])
  await project(page, 'web')
  await defaults(page)
  await expectIds(page, webIds)
  await search(page).fill('cas')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Ziva Kovac')
  await expectIds(page, ['x-2'])
  await page.reload()
  await defaults(page)
  await expectIds(page, webIds)
  expect(await storage()).toEqual(originalStorage)
  await readonly(page, writes)
})

test('S05: both views share IDs, state counts and persistent controls', async ({ page }) => {
  const writes = await mount(page, records)
  await search(page).fill('skupno')
  await expectIds(page, ['Ž-9', 'x-2', 'a-7', 'm-1'])
  await expect(result(page)).toHaveText('Prikazano: 4 od 14.')
  await summary(page, [1, 2, 1])
  await board(page)
  await expectIds(page, ['Ž-9', 'x-2', 'a-7', 'm-1'], false)
  await columnIds(page, 'Pripravljeno', ['m-1'])
  await columnIds(page, 'V delu', ['Ž-9', 'a-7'])
  await columnIds(page, 'Končano', ['x-2'])
  await expect(page.locator('.column-count')).toHaveText(['1', '2', '1'])
  await select(page, 'Filter stanja', 'in_progress')
  await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
  await table(page)
  await expectIds(page, ['Ž-9', 'a-7'])
  await expect(search(page)).toHaveValue('skupno')
  await expect(page.getByRole('combobox', { name: 'Filter stanja', exact: true })).toHaveValue('in_progress')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true })).toHaveValue('Živa Kovač')
  await board(page)
  await expectIds(page, ['Ž-9', 'a-7'])
  await summary(page, [0, 2, 0])
  await expect(page.locator('.column-count')).toHaveText(['0', '2', '0'])
  await readonly(page, writes)
})

for (const empty of [false, true]) {
  test(`S06: ${empty ? 'empty projects' : 'no matches'} remain usable in both views`, async ({ page }) => {
    const writes = await mount(page, empty ? [] : records)
    await expect(result(page)).toHaveText(empty ? 'Prikazano: 0 od 0.' : 'Prikazano: 14 od 14.')
    await search(page).fill('ni-nobenega-zadetka')
    await expectIds(page, [])
    await expect(result(page)).toHaveText(`Prikazano: 0 od ${empty ? 0 : 14}.`)
    await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(empty ? 0 : 1)
    if (empty) await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
    await summary(page, [0, 0, 0])
    await board(page)
    await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(empty ? 0 : 1)
    await table(page)
    await click(page, 'Počisti filtre')
    await defaults(page)
    await expectIds(page, empty ? [] : webIds)
    if (empty) {
      await project(page, 'launch')
      await expect(result(page)).toHaveText('Prikazano: 0 od 0.')
    }
    await readonly(page, writes)
  })
}

test('S07: filtering preserves frozen input fields, references and relative order', () => {
  const before = JSON.stringify(web)
  const frozen = Object.freeze(web.map(task => Object.freeze({ ...task })))
  const selected = filterTasks(frozen, { query: 'cas', status: 'in_progress', assignee: 'Živa Kovač' })
  expect(selected.map(task => task.id)).toEqual(['Ž-9', 'a-7'])
  expect(selected[0]).toBe(frozen[0])
  expect(selected[1]).toBe(frozen[2])
  expect(filterTasks(frozen, defaultFilters)).toEqual(web)
  expect(JSON.stringify(frozen)).toBe(before)
  // Marks outside U+0300–U+036F must not be removed.
  expect(filterTasks([makeTask('boundary', { title: 'a\u1ab0b', description: '', assignee: 'X' })], { ...defaultFilters, query: 'ab' })).toEqual([])
})

for (const width of [1440, 390]) {
  test(`S08: Folio, details, read-only actions and controls at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 })
    const browserTestControls: string[] = []
    page.on('request', request => {
      if (new URL(request.url()).pathname.startsWith('/__test/')) browserTestControls.push(request.url())
    })
    const writes = await mount(page, records)
    await expectIds(page, webIds)
    await search(page).fill('cas')
    await select(page, 'Filter stanja', 'in_progress')
    await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
    await expectIds(page, ['Ž-9', 'a-7'])
    await details(page, 'Ž-9')
    await expect(search(page)).toHaveValue('cas')
    await readonly(page, writes)
    await page.screenshot({ path: `docs/agent/P03/evidence/folio-${width}-table.png`, fullPage: true })
    await board(page)
    await details(page, 'a-7')
    await readonly(page, writes)
    await page.screenshot({ path: `docs/agent/P03/evidence/folio-${width}-board.png`, fullPage: true })
    await click(page, 'Počisti filtre')
    await select(page, 'Filter odgovorne osebe', records[4].assignee)
    await expectIds(page, ['extra-20'])
    await readonly(page, writes)
    expect(browserTestControls).toEqual([])
  })
}
