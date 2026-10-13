import { test, expect, mount, select, downloadCSV, board, table, readonly, makeTask, examples, webIds } from '../development/helpers.ts'

const DEFAULT_HEADER = '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n'
const column = (page: import('@playwright/test').Page, key: string) => page.getByRole('checkbox', { name: 'Stolpec ' + key, exact: true })
const csvLines = (text: string) => text.replace(/^\uFEFF/, '').split('\r\n')

test('A01: privzete nastavitve, BOM, vrstni red in končni CRLF', async ({ page }) => {
  const writes = await mount(page)
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await expect(column(page, key)).toBeChecked()
  }
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  const url = page.url()
  const pages = page.context().pages().length
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-web.csv')
  expect(file.text.startsWith(DEFAULT_HEADER)).toBe(true)
  const lines = csvLines(file.text)
  expect(lines[0]).toBe('"id";"projectId";"title";"status";"assignee";"dueDate";"description"')
  expect(lines.slice(1, -1).map((line) => line.split(';')[0])).toEqual(webIds().map((id) => `"${id}"`))
  expect(file.text.endsWith('\r\n')).toBe(true)
  expect(page.url()).toBe(url)
  expect(page.context().pages().length).toBe(pages)
  expect(writes).toEqual([])
})

test('A02: vrstni red stolpcev je nespremenljiv ne glede na vrstni red klikov', async ({ page }) => {
  await mount(page)
  await column(page, 'title').uncheck()
  await column(page, 'title').check()
  await column(page, 'id').uncheck()
  await column(page, 'id').check()
  await expect(column(page, 'title')).toBeChecked()
  const file = await downloadCSV(page)
  expect(file.text.startsWith(DEFAULT_HEADER)).toBe(true)
})

test('A03: brez izbranih stolpcev izvoz onemogočen, ponovni izbor ga omogoči', async ({ page }) => {
  await mount(page)
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) await column(page, key).uncheck()
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  let downloads = 0
  page.on('download', () => { downloads += 1 })
  await button.click({ force: true })
  await page.waitForTimeout(150)
  expect(downloads).toBe(0)
  await column(page, 'title').check()
  await expect(button).toBeEnabled()
  const file = await downloadCSV(page)
  expect(file.text.startsWith('\uFEFF"title"\r\n')).toBe(true)
})

test('A04: filter omeji samo izvoz, prikaz ostane cel; prazen rezultat onemogoči izvoz', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(9)
  await select(page, 'Filter izvoza', 'done')
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(9)
  const file = await downloadCSV(page)
  expect(csvLines(file.text).slice(1, -1).map((line) => line.split(';')[0])).toEqual(['"web-03"', '"web-06"'])

  await mount(page, [makeTask('web-01')])
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await select(page, 'Filter izvoza', 'done')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await select(page, 'Filter izvoza', 'all')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeEnabled()

  await mount(page, [])
  await page.reload()
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
})

test('A05: BOM, ime datoteke in brez navigacije ali zapisov', async ({ page }) => {
  const writes = await mount(page, examples, '#/projects/launch')
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-launch.csv')
  expect(file.text.charCodeAt(0)).toBe(0xfeff)
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
})

test('A06: ločilo je nastavljivo, vse vrednosti so navedene', async ({ page }) => {
  await mount(page)
  for (const key of ['projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) await column(page, key).uncheck()
  await select(page, 'Ločilo CSV', ',')
  const file = await downloadCSV(page)
  expect(file.text).toBe('\uFEFF"id"\r\n"web-01"\r\n"web-02"\r\n"web-03"\r\n"web-04"\r\n"web-05"\r\n"web-06"\r\n"web-07"\r\n"web-08"\r\n')
})

test('A07: CRLF po vsaki vrstici, večvrstične vrednosti ostanejo navedene', async ({ page }) => {
  await mount(page)
  const file = await downloadCSV(page)
  expect(file.text.endsWith('\r\n')).toBe(true)
  expect(file.text.replace(/\r\n$/, '').includes('\r\n')).toBe(true)
  expect(file.text).toContain('"Prva vrstica\nDruga vrstica; čšž"')
  expect(file.text.match(/\r\n/g)!.length).toBe(9)
})

test('A08: nevtralizacija formul za vse predznake, glava ostane brez', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: '=SUM(A1)' }),
    makeTask('web-02', { title: ' +SUM(A1)' }),
    makeTask('web-03', { title: '\t-SUM(A1)' }),
    makeTask('web-04', { title: '\r@SUM(A1)' }),
    makeTask('web-05', { title: '\n=SUM(A1)', description: '=1+1' }),
    makeTask('web-06', { title: '  Navaden naslov' }),
  ]
  await mount(page, records)
  const file = await downloadCSV(page)
  expect(file.text).toContain('"\'=SUM(A1)"')
  expect(file.text).toContain('"\' +SUM(A1)"')
  expect(file.text).toContain('"\'\t-SUM(A1)"')
  expect(file.text).toContain('"\'\r@SUM(A1)"')
  expect(file.text).toContain('"\'\n=SUM(A1)"')
  expect(file.text).toContain('"\'=1+1"')
  expect(file.text).toContain('"  Navaden naslov"')
  expect(file.text.startsWith(DEFAULT_HEADER)).toBe(true)
})

test('A09: Unicode, presledki, opis, status in datum ostanejo izvirni', async ({ page }) => {
  const records = [makeTask('web-01', { title: 'Čšž – Δοκιμή 😀', description: 'Prva vrstica\nDruga vrstica; čšž = 1', status: 'in_progress', assignee: 'Živa Kovač', dueDate: '2026-09-18' })]
  await mount(page, records)
  const file = await downloadCSV(page)
  expect(file.text).toContain('"Čšž – Δοκιμή 😀"')
  expect(file.text).toContain('"Prva vrstica\nDruga vrstica; čšž = 1"')
  expect(file.text).toContain('"in_progress"')
  expect(file.text).toContain('"2026-09-18"')
  expect(file.text).toContain('"Živa Kovač"')
})

test('A10: preklop pogleda ohrani nastavitve in da iste bajte', async ({ page }) => {
  await mount(page)
  for (const key of ['projectId', 'assignee', 'description']) await column(page, key).uncheck()
  await select(page, 'Filter izvoza', 'in_progress')
  await select(page, 'Ločilo CSV', ',')
  const first = await downloadCSV(page)
  await board(page)
  await expect(column(page, 'projectId')).not.toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('in_progress')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(',')
  expect(await downloadCSV(page)).toEqual(first)
  await table(page)
  expect(await downloadCSV(page)).toEqual(first)
})

test('A11: osvežitev in menjava projekta ponastavita nastavitve', async ({ page }) => {
  await mount(page)
  for (const key of ['projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) await column(page, key).uncheck()
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  for (const key of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) await expect(column(page, key)).toBeChecked()
  expect((await downloadCSV(page)).text.startsWith(DEFAULT_HEADER)).toBe(true)

  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await column(page, 'title').uncheck()
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(column(page, 'title')).toBeChecked()
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-launch.csv')
  expect(csvLines(file.text).slice(1, -1).map((line) => line.split(';')[0])).toEqual(['"launch-01"', '"launch-02"'])
})

test('A12: mobilna širina brez prelivanja in brez zapisov', async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  const file = await downloadCSV(page)
  expect(file.text.startsWith(DEFAULT_HEADER)).toBe(true)
  await board(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await readonly(page, writes)
})
