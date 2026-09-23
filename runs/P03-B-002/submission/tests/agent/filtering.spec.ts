import { type Page } from '@playwright/test'
import { test, expect, mount, makeTask, expectIds, select, board, table, click, project, summary, columnIds, readonly, examples, webIds } from '../development/helpers.ts'

const search = (page: Page) => page.getByRole('searchbox', { name: 'Išči opravila' })
const results = (page: Page) => page.getByRole('status', { name: 'Rezultati filtriranja' })
async function defaults(page: Page) {
  await expect(search(page)).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true })).toHaveValue('all')
}

test('S01/S06: more than ten duplicate titles retain source order and clear restores every field', async ({ page }) => {
  const records = ['q9', 'a7', 'z3', 'm1', 'b8', 'x4', 'f2', 'k6', 'd0', 's5', 'r11', 'c10'].map((id, index) => makeTask(id, {
    title: 'Enak naslov', description: `Izvirni opis ${index}`, assignee: index % 2 ? 'Druga oseba' : 'Prva oseba',
    status: index % 3 === 0 ? 'done' : index % 3 === 1 ? 'todo' : 'in_progress',
  }))
  const writes = await mount(page, records)
  await defaults(page)
  await expectIds(page, records.map((task) => task.id))
  await expect(results(page)).toHaveText('Prikazano: 12 od 12.')
  await search(page).fill('ENAK')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Prva oseba')
  await expectIds(page, ['q9', 'f2'])
  await board(page)
  await columnIds(page, 'Končano', ['q9', 'f2'])
  await click(page, 'Počisti filtre')
  await defaults(page)
  await columnIds(page, 'Pripravljeno', ['a7', 'b8', 'k6', 'r11'])
  await columnIds(page, 'V delu', ['z3', 'x4', 'd0', 'c10'])
  await columnIds(page, 'Končano', ['q9', 'm1', 'f2', 's5'])
  await table(page)
  await expectIds(page, records.map((task) => task.id))
  const link = page.locator('[data-task-id="f2"]').getByRole('link')
  await link.click()
  await expect(page.getByRole('dialog').getByText('Izvirni opis 6', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(link).toBeFocused()
  expect(await page.evaluate(async () => (await fetch('/api/projects/web/tasks')).json())).toEqual(records)
  await readonly(page, writes)
})

test('S02: every search field, NFD, all literal words, whitespace and punctuation', async ({ page }) => {
  const records = [
    makeTask('Ž9', { title: 'Čas za pregled', description: 'Résumé načrta', assignee: 'Luka Kovač' }),
    makeTask('literal', { title: '.* [ =SUM(A1)', description: 'Posebni znaki', assignee: 'Živa' }),
    makeTask('decomposed', { title: 'Cafe\u0301', description: 'Drug zapis', assignee: 'Nika' }),
    makeTask('control', { title: 'Navadno opravilo', description: 'Brez ujemanja', assignee: 'Miha' }),
  ]
  await mount(page, records)
  for (const query of ['z9', 'CAS', 'resume', 'KOVAC', '  KOVAC\tcas  ', 'cas kovac', 'RE\u0301SUME\u0301']) {
    await search(page).fill(query)
    await expectIds(page, ['Ž9'])
  }
  await search(page).fill('cas kovac manjkajoce')
  await expectIds(page, [])
  for (const query of ['.*', '[', '=SUM(A1)', '[ .*']) {
    await search(page).fill(query)
    await expectIds(page, ['literal'])
  }
  await search(page).fill('CAFÉ')
  await expectIds(page, ['decomposed'])
  await search(page).fill(' \t  ')
  await expectIds(page, ['Ž9', 'literal', 'decomposed', 'control'])
})

test('S03/S05: exact distinct assignees, triple AND, view persistence and all counters', async ({ page }) => {
  const records = [
    makeTask('zeta', { title: 'Čas', assignee: 'Črt' }),
    makeTask('beta', { title: 'Čas', assignee: 'Črt', status: 'done' }),
    makeTask('alfa', { title: 'Drugo', assignee: 'Črt' }),
    makeTask('delta', { title: 'Čas', assignee: 'Crt' }),
    makeTask('gamma', { title: 'Čas', assignee: 'črt' }),
    makeTask('epsilon', { title: 'Čas', assignee: 'Črt' }),
    makeTask('empty', { assignee: '' }),
  ]
  const writes = await mount(page, records)
  const people = page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true })
  await expect(people.locator('option')).toHaveText(['Vse osebe', 'Črt', 'Crt', 'črt'])
  await search(page).fill('cas')
  await select(page, 'Filter stanja', 'todo')
  await select(page, 'Filter odgovorne osebe', 'Črt')
  await expectIds(page, ['zeta', 'epsilon'])
  await summary(page, [2, 0, 0])
  await expect(results(page)).toHaveText('Prikazano: 2 od 7.')
  await board(page)
  await expectIds(page, ['zeta', 'epsilon'])
  await expect(search(page)).toHaveValue('cas')
  await expect(people).toHaveValue('Črt')
  await expect(page.getByRole('combobox', { name: 'Filter stanja', exact: true })).toHaveValue('todo')
  await expect(page.locator('.column-count')).toHaveText(['2', '0', '0'])
  await select(page, 'Filter odgovorne osebe', 'Crt')
  await expectIds(page, ['delta'])
  await select(page, 'Filter odgovorne osebe', 'črt')
  await expectIds(page, ['gamma'])
  await search(page).fill('odsotno')
  await expectIds(page, [])
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(results(page)).toHaveText('Prikazano: 0 od 7.')
  await summary(page, [0, 0, 0])
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await expect(people.locator('option')).toHaveText(['Vse osebe', 'Črt', 'Crt', 'črt'])
  await table(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.getByText('V tem projektu še ni opravil', { exact: true })).toHaveCount(0)
  await click(page, 'Počisti filtre')
  await defaults(page)
  await expectIds(page, records.map((task) => task.id))
  await readonly(page, writes)
})

test('S04: project changes and refresh reset all filters without URL or storage persistence', async ({ page }) => {
  const writes = await mount(page)
  const originalUrl = page.url()
  const storage = () => page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))
  const originalStorage = await storage()
  await search(page).fill('pregled')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await expectIds(page, ['web-03'])
  expect(page.url()).toBe(originalUrl)
  expect(await storage()).toEqual(originalStorage)
  await project(page, 'launch')
  await defaults(page)
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true }).locator('option')).toHaveText(['Vse osebe', 'Ana Novak', 'Luka Kovač'])
  await project(page, 'web')
  await defaults(page)
  await expectIds(page, webIds())
  await search(page).fill('pregled')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await board(page)
  await page.reload()
  await defaults(page)
  await expectIds(page, webIds(), false)
  await expect(page.getByRole('button', { name: 'Tabla', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await readonly(page, writes)
})

for (const size of [0, 1]) {
  test(`S01/S05: project size ${size}, direct board entry and ordinary empty state`, async ({ page }) => {
    const records = size ? [makeTask('unique-42', { status: 'done' })] : []
    await mount(page, records, '#/projects/web?view=board')
    await defaults(page)
    await expectIds(page, records.map((task) => task.id))
    await expect(results(page)).toHaveText(`Prikazano: ${size} od ${size}.`)
    await expect(page.locator('.column-count')).toHaveText(['0', '0', String(size)])
    if (size === 0) {
      await search(page).fill('nekaj')
      await expect(page.getByText('Ni zadetkov.', { exact: true })).toHaveCount(0)
      await expect(page.getByText('Ni opravil v tem stanju.', { exact: true })).toHaveCount(3)
      await table(page)
      await expect(page.getByText('V tem projektu še ni opravil', { exact: true })).toBeVisible()
      await project(page, 'launch')
      await defaults(page)
      await expect(results(page)).toHaveText('Prikazano: 0 od 0.')
    } else {
      await search(page).fill('odsotno')
      await expect(results(page)).toHaveText('Prikazano: 0 od 1.')
      await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
      await click(page, 'Počisti filtre')
      await expectIds(page, ['unique-42'])
    }
  })
}

test('S07: 390px controls, long names, keyboard focus, details and no writes', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const longName = 'DolgoIme'.repeat(20)
  const records = [makeTask('long-01', { title: 'DolgNaslov'.repeat(30), assignee: longName }), ...examples]
  const writes = await mount(page, records)
  await defaults(page)
  await page.keyboard.press('Tab')
  await search(page).focus()
  await expect(search(page)).toBeFocused()
  expect(await search(page).evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await search(page).fill('long-01')
  await select(page, 'Filter stanja', 'todo')
  await select(page, 'Filter odgovorne osebe', longName)
  await expectIds(page, ['long-01'])
  for (const control of [search(page), page.getByRole('combobox', { name: 'Filter stanja', exact: true }), page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true }), page.getByRole('button', { name: 'Počisti filtre' })]) {
    const box = await control.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
  }
  await readonly(page, writes)
  await board(page)
  await expectIds(page, ['long-01'])
  await readonly(page, writes)
  await page.screenshot({ path: testInfo.outputPath('mobile-board.png'), fullPage: true })
  await page.locator('[data-task-id="long-01"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: records[0].title, exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await click(page, 'Počisti filtre')
  await table(page)
  await readonly(page, writes)
})
