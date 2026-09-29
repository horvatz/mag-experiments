import { test, expect, mount, expectIds, examples, makeTask, webIds, select, click, board, table, project, readonly } from '../development/helpers.ts'
import type { Page } from '@playwright/test'

const search = (page: Page) => page.getByRole('searchbox', { name: 'Iskanje v povezavi', exact: true })
const result = (page: Page) => page.getByRole('status', { name: 'Rezultati povezave' })
const params = (page: Page) => new URLSearchParams(new URL(page.url()).hash.split('?')[1])
const historyLength = (page: Page) => page.evaluate(() => history.length)

// Expected IDs are specified independently of the implementation.
test('A01 R01 R02: literal normalized phrase searches every field', async ({ page }) => {
  await mount(page)
  const cases: [string, string[]][] = [
    ['  C\u030Cas za PREGLED  ', ['web-01']],
    ['KONCNI ZAPIS', ['web-01']],
    ['ziva kovac', ['web-06']],
    ['WEB-05', ['web-05']],
    ['=SUM(A1)', ['web-07']],
    ['pregled cas', []],
    ['.*', []],
  ]
  for (const [q, ids] of cases) {
    await page.goto('/#/projects/web?q=' + encodeURIComponent(q))
    await expectIds(page, ids)
  }
})

test('A02 R03: AND status and stable UTF-16 ordering in both directions', async ({ page }) => {
  const records = [makeTask('z', { title: 'Žaba' }), makeTask('tie1', { title: ' Čas ' }), makeTask('tie2', { title: 'c\u030Cas' }), makeTask('n2', { title: 'Alfa 2' }), makeTask('n10', { title: 'Alfa 10' })]
  await mount(page, records, '#/projects/web?order=title-asc')
  await expectIds(page, ['n10', 'n2', 'tie1', 'tie2', 'z'])
  await select(page, 'Vrstni red v povezavi', 'title-desc'); await click(page, 'Uporabi pogled')
  await expectIds(page, ['z', 'tie1', 'tie2', 'n2', 'n10'])
  await select(page, 'Vrstni red v povezavi', 'original'); await click(page, 'Uporabi pogled')
  await expectIds(page, ['z', 'tie1', 'tie2', 'n2', 'n10'])
})

test('A03 R03 R04 R06: first parameters, fallbacks and passive URL reading', async ({ page }) => {
  const hash = '#/projects/web?q=pregled&q=alfa&status=todo&status=done&order=title-desc&order=title-asc&unknown=kept'
  await mount(page, undefined, hash)
  await expectIds(page, ['web-02'])
  expect(new URL(page.url()).hash).toBe(hash)
  await page.goto('/#/projects/web?status=INVALID&status=done&order=INVALID&order=title-desc&unknown=yes')
  await expectIds(page, webIds())
  await expect(page.getByLabel('Stanje v povezavi')).toHaveValue('all')
  await expect(page.getByLabel('Vrstni red v povezavi')).toHaveValue('original')
  const before = await historyLength(page)
  await click(page, 'Uporabi pogled')
  await expect(page).toHaveURL(/#\/projects\/web$/)
  expect(await historyLength(page)).toBe(before)
  for (const [status, ids] of [['todo', ['web-02']], ['in_progress', ['web-01']], ['done', ['web-03']]] as const) {
    await page.goto('/#/projects/web?q=pregled&status=' + status)
    await expectIds(page, [...ids])
  }
})

test('A04 R01 R06 R11: encoded phrase, arbitrary IDs and zero one many tasks', async ({ page }) => {
  const records = Array.from({ length: 13 }, (_, i) => makeTask('custom-' + i, { title: i === 12 ? 'Č + & ? # [x]' : 'Drugo ' + i }))
  await mount(page, records)
  await expect(result(page)).toHaveText('Prikazano: 13 od 13.')
  await search(page).fill('  Č + & ? # [x]  '); await click(page, 'Uporabi pogled')
  await expectIds(page, ['custom-12'])
  expect(params(page).get('q')).toBe('Č + & ? # [x]')
  await page.reload(); await expectIds(page, ['custom-12'])
  await search(page).fill('missing'); await click(page, 'Uporabi pogled')
  await expectIds(page, []); await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(result(page)).toHaveText('Prikazano: 0 od 13.')
})

test('A05 R11 R12: empty and singleton projects retain Folio views', async ({ page }) => {
  await mount(page, [makeTask('only', { projectId: 'launch' })])
  await expect(result(page)).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await project(page, 'launch'); await expectIds(page, ['only'])
  await expect(result(page)).toHaveText('Prikazano: 1 od 1.')
})

test('A06 R05 R06 R07 R11: atomic commit, history, reload and idempotent reset', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?view=board&unknown=remove')
  await expectIds(page, webIds(), false)
  const originalUrl = page.url(), initial = await historyLength(page)
  await search(page).fill('  pregled  ')
  await select(page, 'Stanje v povezavi', 'done')
  await select(page, 'Vrstni red v povezavi', 'title-desc')
  await expectIds(page, webIds(), false); expect(page.url()).toBe(originalUrl)
  await click(page, 'Uporabi pogled'); await expectIds(page, ['web-03'])
  expect(Object.fromEntries(params(page))).toEqual({ view: 'board', q: 'pregled', status: 'done', order: 'title-desc' })
  expect(await historyLength(page)).toBe(initial + 1)
  await expect(search(page)).toHaveValue('pregled')
  await click(page, 'Uporabi pogled'); expect(await historyLength(page)).toBe(initial + 1)
  await select(page, 'Stanje v povezavi', 'todo'); await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-02']); expect(await historyLength(page)).toBe(initial + 2)
  await search(page).fill('uncommitted')
  await page.goBack(); await expectIds(page, ['web-03']); await expect(search(page)).toHaveValue('pregled')
  await expect(page.getByLabel('Stanje v povezavi')).toHaveValue('done')
  await page.goForward(); await expectIds(page, ['web-02']); await expect(page.getByLabel('Stanje v povezavi')).toHaveValue('todo')
  await page.reload(); await expectIds(page, ['web-02'])
  await click(page, 'Ponastavi pogled'); await expectIds(page, webIds(), false)
  expect(Object.fromEntries(params(page))).toEqual({ view: 'board' })
  const resetLength = await historyLength(page)
  await search(page).fill('discard'); await select(page, 'Stanje v povezavi', 'done')
  await click(page, 'Ponastavi pogled'); await expect(search(page)).toHaveValue('')
  await expect(page.getByLabel('Stanje v povezavi')).toHaveValue('all')
  expect(await historyLength(page)).toBe(resetLength)
  await page.goBack(); await expectIds(page, ['web-02'])
})

test('A07 R08 R09 R10 R12: navigation preserves committed state and discards drafts without writes', async ({ page }) => {
  const writes = await mount(page, undefined, '#/projects/web?q=pregled&order=title-desc')
  const storage = await page.evaluate(() => JSON.stringify(localStorage))
  const forbidden: string[] = []
  page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/__test/')) forbidden.push(r.url()) })
  await expectIds(page, ['web-02', 'web-03', 'web-01'])
  await search(page).fill('discard'); await board(page)
  await expectIds(page, ['web-02', 'web-03', 'web-01'], false); await expect(search(page)).toHaveValue('pregled')
  await search(page).fill('discard again')
  const link = page.locator('[data-task-id="web-03"]').getByRole('link')
  await link.click()
  await expect(page.getByRole('dialog').getByText('web-03', { exact: true }).first()).toBeVisible()
  await click(page, 'Zapri podrobnosti'); await expect(link).toBeFocused()
  await expect(search(page)).toHaveValue('pregled')
  expect(params(page).get('order')).toBe('title-desc'); expect(params(page).get('view')).toBe('board')
  await link.click(); await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(link).toBeFocused()
  await table(page); await expectIds(page, ['web-02', 'web-03', 'web-01'])
  await board(page); await search(page).fill('discard at project')
  await project(page, 'launch'); await expectIds(page, ['launch-01', 'launch-02'])
  expect(Object.fromEntries(params(page))).toEqual({ view: 'board' }); await expect(search(page)).toHaveValue('')
  await page.goto('/#/projects/launch?view=board&q=drugi&status=done')
  await expectIds(page, ['launch-02'])
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(storage)
  expect(forbidden).toEqual([])
  await readonly(page, writes)
})

test('A08 R01 R09: direct task URL and encoded ID survive refresh and dismissal', async ({ page }) => {
  const records = [...examples, makeTask('id / č?+#', { title: 'Pregled vsebine', status: 'done' })]
  const hash = '#/projects/web/tasks/' + encodeURIComponent('id / č?+#') + '?view=board&q=pregled&status=done'
  await mount(page, records, hash)
  await expect(page.getByRole('dialog').getByText('id / č?+#', { exact: true }).first()).toBeVisible()
  await page.reload(); await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape'); await expectIds(page, ['web-03', 'id / č?+#'])
  await expect(search(page)).toHaveValue('pregled')
  expect(Object.fromEntries(params(page))).toEqual({ view: 'board', q: 'pregled', status: 'done' })
})

test('A09 R12: controls and both views fit 390 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await expect(search(page)).toBeVisible()
  await select(page, 'Stanje v povezavi', 'done'); await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-03', 'web-06']); await readonly(page, writes)
  await board(page); await expectIds(page, ['web-03', 'web-06']); await readonly(page, writes)
  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toBeVisible()
  await page.screenshot({ path: 'docs/agent/P09/mobile.png', fullPage: true })
})
