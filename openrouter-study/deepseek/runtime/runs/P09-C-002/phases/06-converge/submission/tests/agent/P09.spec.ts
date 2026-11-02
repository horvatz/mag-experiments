import type { Page } from '@playwright/test'
import { test, expect, mount, expectIds, select, click, board, table, project, details, readonly, webIds, makeTask } from '../development/helpers.ts'

const query = (page: Page) => new URLSearchParams(new URL(page.url()).hash.split('?')[1])
const historyLength = (page: Page) => page.evaluate(() => history.length)

test('R01/R04: privzete vrednosti, prva pojava in neznani parametri', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?status=bogus&status=done&order=title-desc&order=original&foo=bar')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('title-desc')
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
  expect(query(page).get('status')).toBe('bogus')
  expect(query(page).has('foo')).toBe(true)
  await select(page, 'Stanje v povezavi', 'todo')
  await click(page, 'Uporabi pogled')
  await expect(page.locator('[data-task-id="web-07"] a')).toHaveAttribute('href', /status=todo/)
  expect(query(page).has('foo')).toBe(false)
  expect(query(page).get('order')).toBe('title-desc')
})

test('R02: fraza po normalizaciji prek polj, brez delitve in regularnih izrazov', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=%C4%8Das')
  await expectIds(page, ['web-01'])
  await mount(page, undefined, '#/projects/web?q=PREGLED%20VSEBINE')
  await expectIds(page, ['web-02', 'web-03'])
  await mount(page, undefined, '#/projects/web?q=%C5%BEiva')
  await expectIds(page, ['web-06'])
  await mount(page, undefined, '#/projects/web?q=web-0')
  await expectIds(page, webIds())
  await mount(page, undefined, '#/projects/web?q=sum%28a1%29')
  await expectIds(page, ['web-07'])
})

test('R03: status IN fraza ter stabilen vrstni red', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=pregled&status=done')
  await expectIds(page, ['web-03'])
  await mount(page, undefined, '#/projects/web?status=done&order=title-asc')
  await expectIds(page, ['web-03', 'web-06'])
  await mount(page, undefined, '#/projects/web?order=title-asc')
  await expectIds(page, ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06'])
})

test('R05/R06: potrditev obreže frazo, ohrani pogled in ne ponovi zgodovine', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?view=board&q=zapis')
  await board(page)
  await select(page, 'Stanje v povezavi', 'done')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-06'])
  expect(query(page).get('q')).toBe('zapis')
  expect(query(page).get('status')).toBe('done')
  expect(query(page).get('view')).toBe('board')
  const before = await historyLength(page)
  await click(page, 'Uporabi pogled')
  expect(await historyLength(page)).toBe(before)
})

test('R07: Nazaj, Naprej in osvežitev obnovijo potrjeno stanje', async ({ page }) => {
  await mount(page)
  await select(page, 'Stanje v povezavi', 'done')
  await click(page, 'Uporabi pogled')
  await expect(page.locator('[data-task-id="web-03"] a')).toHaveAttribute('href', /status=done/)
  await select(page, 'Vrstni red v povezavi', 'title-desc')
  await click(page, 'Uporabi pogled')
  await expect(page.locator('[data-task-id="web-06"] a')).toHaveAttribute('href', /order=title-desc/)
  await expectIds(page, ['web-06', 'web-03'])
  await page.goBack()
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')
  await expectIds(page, ['web-03', 'web-06'])
  await page.goForward()
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('title-desc')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await expectIds(page, ['web-06', 'web-03'])
})

test('R08: preklop pogleda ohrani parametre in zavrže osnutek', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?status=done')
  await select(page, 'Vrstni red v povezavi', 'title-asc')
  await board(page)
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi' })).toHaveValue('original')
  await expectIds(page, ['web-03', 'web-06'])
  expect(query(page).get('status')).toBe('done')
  expect(query(page).get('view')).toBe('board')
  await table(page)
  await expectIds(page, ['web-03', 'web-06'])
  expect(query(page).get('status')).toBe('done')
})

test('R09: podrobnosti ohranijo parametre in ciljajo pravi ID', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=pregled&status=done')
  await details(page, 'web-03')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  await expectIds(page, ['web-03'])
  expect(query(page).get('q')).toBe('pregled')
})

test('R10: preklop projekta začne privzeto, neposredna povezava upošteva parametre', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=pregled&status=done&view=board')
  await project(page, 'launch')
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('all')
  await expectIds(page, ['launch-01', 'launch-02'])
  await mount(page, undefined, '#/projects/launch?status=done')
  await expectIds(page, ['launch-02'])
})

test('R11: ponastavitev, števec in prazno sporočilo', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=neobstojece')
  await expectIds(page, [])
  await expect(page.getByRole('heading', { name: 'Ni zadetkov.' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 8.')
  await click(page, 'Ponastavi pogled')
  await expectIds(page, webIds())
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 8 od 8.')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  await mount(page, undefined, '#/projects/web?view=board&q=pregled')
  await click(page, 'Ponastavi pogled')
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expectIds(page, webIds(), false)
})

test('R12: brez pisanja, brez localStorage in brez vodoravnega širjenja', async ({ page }) => {
  const writes = await mount(page, undefined, '#/projects/web?q=pregled')
  await select(page, 'Stanje v povezavi', 'done')
  await click(page, 'Uporabi pogled')
  await details(page, 'web-03')
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await readonly(page, writes)
})

test('R12: enaka naslova ločita ID-ja v povezavah', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=pregled%20vsebine&order=title-asc')
  await expectIds(page, ['web-02', 'web-03'])
  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('web-02', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(query(page).get('order')).toBe('title-asc')
})

test.describe('ozek zaslon 390 pik', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('R12: stran se ne širi vodoravno', async ({ page }) => {
    const writes = await mount(page, undefined, '#/projects/web?q=pregled&status=done&order=title-desc')
    await expectIds(page, ['web-03'])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await readonly(page, writes)
  })
})

test('R02/R03: prazen projekt', async ({ page }) => {
  await mount(page, [], '#/projects/web')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 0.')
})

test('R02/R03: eno opravilo', async ({ page }) => {
  await mount(page, [makeTask('solo', { title: 'Samo eno' })], '#/projects/web?q=samo')
  await expectIds(page, ['solo'])
})

test('R02/R03: enajst opravil z vrstnim redom', async ({ page }) => {
  const many = Array.from({ length: 11 }, (_, index) => makeTask(`web-${index + 1}`, { title: index % 2 === 0 ? `Alfa ${index + 1}` : `Beta ${index + 1}` }))
  await mount(page, many, '#/projects/web?order=title-asc&status=todo')
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 11 od 11.')
  await expectIds(page, ['web-1', 'web-11', 'web-3', 'web-5', 'web-7', 'web-9', 'web-10', 'web-2', 'web-4', 'web-6', 'web-8'])
})
