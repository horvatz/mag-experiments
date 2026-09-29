import { type Page } from '@playwright/test'
import { test, expect, mount, expectIds, examples, makeTask, webIds, select, click, board, table, project, readonly } from '../development/helpers.ts'

const search = (page: Page) => page.getByRole('searchbox', { name: 'Iskanje v povezavi' })
const status = (page: Page) => page.getByRole('combobox', { name: 'Stanje v povezavi' })
const order = (page: Page) => page.getByRole('combobox', { name: 'Vrstni red v povezavi' })
const results = (page: Page) => page.getByRole('status', { name: 'Rezultati povezave' })
const historyLength = (page: Page) => page.evaluate(() => history.length)
const hash = (page: Page) => new URL(page.url()).hash
const params = (page: Page) => new URLSearchParams(hash(page).slice(hash(page).indexOf('?') + 1))

test('A01: literal Unicode phrase searches every field without splitting words or interpreting regex', async ({ page }) => {
  const records = [
    makeTask('title', { title: 'ČAS za PREGLED' }),
    makeTask('description', { description: 'Prvi ČAS ZA PREGLED danes' }),
    makeTask('assignee', { assignee: 'Čas za pregled' }),
    makeTask('ČAS ZA PREGLED'),
    makeTask('split', { title: 'Čas vmes za pregled' }),
    makeTask('regex', { description: 'Dobesedno .* [test] in + ter ?' }),
    makeTask('spaces', { description: 'dva  presledka' }),
    makeTask('single-space', { description: 'dva presledka' }),
    makeTask('outside-range', { title: 'a\u1ab0b' }),
    ...Array.from({ length: 6 }, (_, i) => makeTask(`extra-${i}`)),
  ]
  await mount(page, records)
  for (const [q, ids] of [
    ['  C\u030cas za PREgled  ', ['title', 'description', 'assignee', 'ČAS ZA PREGLED']],
    ['.*', ['regex']], ['[test]', ['regex']], ['dva  presledka', ['spaces']],
    ['ab', []], ['a\u1ab0b', ['outside-range']], ['EXTRA-5', ['extra-5']],
  ] as [string, string[]][]) {
    await search(page).fill(q)
    await click(page, 'Uporabi pogled')
    await expectIds(page, ids)
    await expect(results(page)).toHaveText(`Prikazano: ${ids.length} od 15.`)
  }
  await search(page).fill('   ')
  await click(page, 'Uporabi pogled')
  await expectIds(page, webIds(records))
  expect(hash(page)).toBe('#/projects/web')
})

test('A02: title sorting uses UTF-16, stable normalized ties and original API order', async ({ page }) => {
  const records = [
    makeTask('z', { title: 'Žaba' }),
    makeTask('a2', { title: 'alfa 2' }),
    makeTask('tie-first', { title: '  ÁLFA 10  ' }),
    makeTask('tie-second', { title: 'alfa 10' }),
    makeTask('emoji', { title: '😀' }),
    makeTask('cjk', { title: '中' }),
    makeTask('a', { title: 'Äther' }),
    makeTask('sharp-s', { title: 'ß' }),
  ]
  await mount(page, records, '#/projects/web?order=title-asc')
  await expectIds(page, ['tie-first', 'tie-second', 'a2', 'a', 'z', 'sharp-s', 'cjk', 'emoji'])
  await order(page).selectOption('title-desc')
  await click(page, 'Uporabi pogled')
  const descending = ['emoji', 'cjk', 'sharp-s', 'z', 'a', 'a2', 'tie-first', 'tie-second']
  await expectIds(page, descending)
  await board(page)
  await expectIds(page, descending)
  await table(page)
  await order(page).selectOption('original')
  await click(page, 'Uporabi pogled')
  await expectIds(page, webIds(records))
})

test('A03: first query values win, invalid enums default and parsing never rewrites the URL', async ({ page }) => {
  const raw = '#/projects/web?q=pregled&q=alfa&status=invalid&status=done&order=invalid&order=title-desc&view=unknown&view=board&extra=1'
  await mount(page, undefined, raw)
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
  await expect(status(page)).toHaveValue('all')
  await expect(order(page)).toHaveValue('original')
  await expect(page.getByRole('table')).toBeVisible()
  expect(hash(page)).toBe(raw)
  await page.reload()
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
  expect(hash(page)).toBe(raw)
  const before = await historyLength(page)
  await click(page, 'Uporabi pogled')
  expect(hash(page)).toBe('#/projects/web?q=pregled')
  expect(await historyLength(page)).toBe(before)
  await page.goto('/#/projects/web?q=&q=pregled&status=todo&status=done&order=title-desc&order=original')
  await expectIds(page, ['web-02', 'web-08', 'web-04', 'web-07'])
  await expect(search(page)).toHaveValue('')
})

test('A04: atomic confirmation, no-op confirmation, back, forward, refresh and reset history', async ({ page }) => {
  await mount(page)
  await expectIds(page, webIds())
  const before = await historyLength(page)
  await search(page).fill('  pregled  ')
  await status(page).selectOption('done')
  await order(page).selectOption('title-desc')
  await expectIds(page, webIds())
  expect(hash(page)).toBe('#/projects/web')
  expect(await historyLength(page)).toBe(before)
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-03'])
  await expect(search(page)).toHaveValue('pregled')
  expect(await historyLength(page)).toBe(before + 1)
  const confirmed = hash(page)
  await click(page, 'Uporabi pogled')
  expect(await historyLength(page)).toBe(before + 1)
  await search(page).fill('unsaved')
  await page.goBack()
  await expectIds(page, webIds())
  await expect(search(page)).toHaveValue('')
  await expect(status(page)).toHaveValue('all')
  await expect(order(page)).toHaveValue('original')
  await page.goForward()
  await expectIds(page, ['web-03'])
  await expect(search(page)).toHaveValue('pregled')
  await expect(status(page)).toHaveValue('done')
  await expect(order(page)).toHaveValue('title-desc')
  expect(hash(page)).toBe(confirmed)
  await page.reload()
  await expectIds(page, ['web-03'])
  await expect(search(page)).toHaveValue('pregled')
  await click(page, 'Ponastavi pogled')
  await expectIds(page, webIds())
  expect(await historyLength(page)).toBe(before + 2)
  await search(page).fill('discard me')
  await click(page, 'Ponastavi pogled')
  await expect(search(page)).toHaveValue('')
  expect(await historyLength(page)).toBe(before + 2)
  await page.goBack()
  await expectIds(page, ['web-03'])
})

test('A05: encoded query survives confirmation, links and reload, including a literal question mark', async ({ page }) => {
  const phrase = 'Čas & + /? # = %'
  const task = makeTask('encoded/id ?#+', { title: phrase })
  await mount(page, [task], '#/projects/web?view=board&tracking=remove')
  const before = await historyLength(page)
  await search(page).fill(`  ${phrase}  `)
  await order(page).selectOption('title-desc')
  await click(page, 'Uporabi pogled')
  await expectIds(page, [task.id])
  expect(params(page).get('q')).toBe(phrase)
  expect(params(page).get('view')).toBe('board')
  expect(params(page).has('status')).toBe(false)
  expect(params(page).has('tracking')).toBe(false)
  expect(await historyLength(page)).toBe(before + 1)
  await page.locator('[data-task-id]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: phrase, exact: true })).toBeVisible()
  expect(params(page).get('q')).toBe(phrase)
  await page.reload()
  await expect(page.getByRole('dialog')).toBeVisible()
  await click(page, 'Zapri podrobnosti')
  await expectIds(page, [task.id])
  await click(page, 'Ponastavi pogled')
  expect(hash(page)).toBe('#/projects/web?view=board')
  // An unencoded question mark is part of the query value, not another separator.
  await page.goto('/#/projects/web?q=?')
  await expectIds(page, [task.id])
  await expect(search(page)).toHaveValue('?')
})

test('A06: view and detail navigation discard drafts while preserving committed filters and IDs', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=pregled&order=title-desc')
  await expectIds(page, ['web-02', 'web-03', 'web-01'])
  await search(page).fill('discard')
  await status(page).selectOption('done')
  await order(page).selectOption('original')
  await board(page)
  await expectIds(page, ['web-01', 'web-02', 'web-03'], false)
  await expect(search(page)).toHaveValue('pregled')
  await expect(status(page)).toHaveValue('all')
  await expect(order(page)).toHaveValue('title-desc')
  await search(page).fill('discard same-view draft')
  const before = await historyLength(page)
  await board(page)
  await expect(search(page)).toHaveValue('pregled')
  expect(await historyLength(page)).toBe(before)
  for (const [id, close] of [['web-02', 'button'], ['web-03', 'escape']]) {
    await search(page).fill('discard detail draft')
    await page.locator(`[data-task-id="${id}"]`).getByRole('link').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText(id, { exact: true }).first()).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Pregled vsebine', exact: true })).toBeVisible()
    expect(params(page).get('view')).toBe('board')
    expect(params(page).get('q')).toBe('pregled')
    expect(params(page).get('order')).toBe('title-desc')
    if (close === 'button') await click(page, 'Zapri podrobnosti')
    else await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(search(page)).toHaveValue('pregled')
  }
  await table(page)
  await expectIds(page, ['web-02', 'web-03', 'web-01'])
})

test('A07: direct details may be excluded by filters and preserve state on both close methods', async ({ page }) => {
  await mount(page, undefined, '#/projects/web/tasks/web-02?view=board&q=missing&status=done&order=title-asc')
  await expect(page.getByRole('dialog').getByText('web-02', { exact: true }).first()).toBeVisible()
  await expectIds(page, [])
  await page.keyboard.press('Escape')
  await expect(results(page)).toHaveText('Prikazano: 0 od 8.')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  expect(hash(page)).toBe('#/projects/web?view=board&q=missing&status=done&order=title-asc')
  await page.goBack()
  await expect(page.getByRole('dialog')).toBeVisible()
  await click(page, 'Zapri podrobnosti')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(search(page)).toHaveValue('missing')
})

test('A08: project click resets filters, direct project URL applies them and history restores them', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?view=board&q=pregled&status=done&order=title-desc')
  await expectIds(page, ['web-03'])
  await search(page).fill('discard')
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  expect(hash(page)).toBe('#/projects/launch?view=board')
  await expect(search(page)).toHaveValue('')
  await expect(status(page)).toHaveValue('all')
  await expect(order(page)).toHaveValue('original')
  await page.goBack()
  await expectIds(page, ['web-03'])
  await expect(search(page)).toHaveValue('pregled')
  await page.goto('/#/projects/launch?view=board&q=DRUGI&status=done&order=title-asc')
  await expectIds(page, ['launch-02'])
  await expect(search(page)).toHaveValue('DRUGI')
  await expect(results(page)).toHaveText('Prikazano: 1 od 2.')
})

test('A09: empty projects keep controls, result status, board columns and reset behavior', async ({ page }) => {
  await mount(page, [], '#/projects/web?view=board&q=anything&status=in_progress')
  await expect(results(page)).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
  await click(page, 'Ponastavi pogled')
  expect(hash(page)).toBe('#/projects/web?view=board')
  await table(page)
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await project(page, 'launch')
  await expect(results(page)).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
})

test('A10: filters combine by AND for all statuses without changing project summary', async ({ page }) => {
  await mount(page)
  await search(page).fill('pregled')
  for (const [value, ids] of [
    ['todo', ['web-02']], ['in_progress', ['web-01']], ['done', ['web-03']],
    ['all', ['web-01', 'web-02', 'web-03']],
  ] as [string, string[]][]) {
    await select(page, 'Stanje v povezavi', value)
    await click(page, 'Uporabi pogled')
    await expectIds(page, ids)
    await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['4', '2', '2'])
  }
})

test('A11: mobile controls, details, long text and navigation stay read-only and fit 390 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    // Any UI use of persistent storage fails this scenario, including reads.
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('P09 must not use localStorage') } })
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const writes = await mount(page, [...examples, makeTask('long', { title: 'DolgNaslov'.repeat(25), assignee: 'DolgoIme'.repeat(15) })])
  await expectIds(page, [...webIds(), 'long'])
  await search(page).fill('Dolgo')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['long'])
  await readonly(page, writes)
  await board(page)
  await readonly(page, writes)
  await page.locator('[data-task-id="long"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await readonly(page, writes)
  await page.keyboard.press('Escape')
  await click(page, 'Ponastavi pogled')
  await project(page, 'launch')
  await page.goBack()
  await expectIds(page, [...webIds(), 'long'], false)
  await readonly(page, writes)
  expect(errors).toEqual([])
})
