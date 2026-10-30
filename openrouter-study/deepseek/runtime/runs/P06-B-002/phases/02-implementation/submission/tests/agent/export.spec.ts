import { test, expect, mount, select, downloadCSV, board, readonly, makeTask, examples } from '../development/helpers.ts'
import { EXPORT_COLUMNS, buildCsv, filterTasks, neutralize, quote } from '../../src/exportCsv.ts'

const defaults = 'id;projectId;title;status;assignee;dueDate;description'

test('R06–R09: čiste funkcije navedbe, nevtralizacije in sestave', () => {
  expect(neutralize('=SUM(A1)')).toBe("'=SUM(A1)")
  expect(neutralize('+1')).toBe("'+1")
  expect(neutralize('-1')).toBe("'-1")
  expect(neutralize('@x')).toBe("'@x")
  expect(neutralize(' =1')).toBe("' =1")
  expect(neutralize('\t+1')).toBe("'\t+1")
  expect(neutralize('\r@x')).toBe("'\r@x")
  expect(neutralize('\n-x')).toBe("'\n-x")
  expect(neutralize('x-y')).toBe('x-y')
  expect(neutralize('a@b')).toBe('a@b')
  expect(neutralize('')).toBe('')
  expect(quote('a"b')).toBe('"a""b"')

  const task = makeTask('t-1', { title: '=1+1', assignee: '  +x', description: ' a, "b"\nčšž', status: 'in_progress', dueDate: '2026-02-03' })
  const csv = buildCsv(EXPORT_COLUMNS, [task], ';')
  expect(csv.startsWith('\uFEFF')).toBe(true)
  expect(csv.endsWith('\r\n')).toBe(true)
  const lines = csv.slice(1).split('\r\n')
  expect(lines[0]).toBe(defaults.split(';').map((column) => `"${column}"`).join(';'))
  expect(lines[1]).toBe('"t-1";"web";"\'=1+1";"in_progress";"\'  +x";"2026-02-03";" a, ""b""\nčšž"')
  expect(filterTasks([task], 'all')).toEqual([task])
  expect(filterTasks([task], 'done')).toEqual([])
})

test('R01/R05/R07: privzeti izvoz zajame vsa opravila v izvornem vrstnem redu', async ({ page }) => {
  await mount(page)
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-web.csv')
  expect(file.text.startsWith(`\uFEFF${defaults.split(';').map((column) => `"${column}"`).join(';')}\r\n`)).toBe(true)
  expect(file.text.endsWith('\r\n')).toBe(true)
  const rows = file.text.slice(1).split('\r\n').filter((line) => line.length > 0)
  const ids = rows.slice(1).map((line) => /^"([^"]*)"/.exec(line)?.[1])
  expect(ids).toEqual(examples.filter((task) => task.projectId === 'web').map((task) => task.id))
})

test('R02: vrstni red kolon sledi C ne glede na vrstni red klikov', async ({ page }) => {
  await mount(page)
  for (const column of EXPORT_COLUMNS) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  for (const column of ['description', 'id', 'assignee']) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).check()
  await select(page, 'Ločilo CSV', ',')
  const file = await downloadCSV(page)
  expect(file.text.split('\r\n')[0]).toBe('\uFEFF"id","assignee","description"')
  expect(file.text.split('\r\n')[1]).toBe('"web-01","Ana Novak","Končni zapis vsebine"')
})

test('R03: brez izbranih kolon izvoz onemogočen, ponovni izbor ga omogoči', async ({ page }) => {
  await mount(page)
  for (const column of EXPORT_COLUMNS) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  const download = page.waitForEvent('download', { timeout: 700 }).catch(() => null)
  await button.evaluate((node) => (node as HTMLButtonElement).click())
  expect(await download).toBeNull()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await expect(button).toBeEnabled()
  expect((await downloadCSV(page)).text.split('\r\n')[0]).toBe('\uFEFF"title"')
})

test('R04: filter omeji le izvožene vrstice, UI prikaže celoten projekt', async ({ page }) => {
  await mount(page)
  await select(page, 'Filter izvoza', 'done')
  const text = (await downloadCSV(page)).text
  expect(text).toContain('"web-03"')
  expect(text).toContain('"web-06"')
  expect(text).not.toContain('"web-01"')
  await expect(page.locator('tbody tr')).toHaveCount(8)
})

test('R04: prazen projekt in prazen filtrirani nabor onemogočita izvoz', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
})

test('R04: prazen filtrirani nabor onemogoči izvoz', async ({ page }) => {
  await mount(page, [makeTask('web-01', { status: 'done' })])
  await select(page, 'Filter izvoza', 'todo')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
})

test('R09: status in datum se izvozita izvirno, Unicode ostane', async ({ page }) => {
  await mount(page)
  const text = (await downloadCSV(page)).text
  expect(text).toContain('"web-01";"web";"Čas za pregled";"in_progress";"Ana Novak";"2026-09-18";"Končni zapis vsebine"')
  expect(text).toContain('"web-06";"web";"Zapis, ""citat""";"done";"Živa Kovač";"2026-09-21";"Prva vrstica\nDruga vrstica; čšž"')
  expect(text).toContain('"\'=SUM(A1)"')
})

test('R10: preklop pogleda ohrani nastavitve in vrne iste bajte', async ({ page }) => {
  await mount(page)
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  await select(page, 'Filter izvoza', 'in_progress')
  await select(page, 'Ločilo CSV', ',')
  const first = await downloadCSV(page)
  await board(page)
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).not.toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('in_progress')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(',')
  expect(await downloadCSV(page)).toEqual(first)
})

test('R11: menjava projekta in osvežitev ponastavita nastavitve; zaporedna izvoza sta aktualna', async ({ page }) => {
  await mount(page)
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(';')
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).uncheck()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Stolpec id', exact: true })).toBeChecked()
  const first = await downloadCSV(page)
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  const second = await downloadCSV(page)
  expect(second.text).not.toBe(first.text)
  expect(second.text.split('\r\n')[0]).not.toContain('"description"')
})

test('R05/R12: izvoz ne piše, ne odpira strani in ne razširi strani pri 390 pikah', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeVisible()
  const pages = page.context().pages().length
  await downloadCSV(page)
  expect(page.context().pages().length).toBe(pages)
  await readonly(page, writes)
})
