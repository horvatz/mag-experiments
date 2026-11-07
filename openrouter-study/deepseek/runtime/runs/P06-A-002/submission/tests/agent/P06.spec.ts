import { test, expect, mount, select, downloadCSV, board, readonly, project, examples, makeTask, type Task } from '../development/helpers.ts'

const ALL_COLUMNS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']
const HEADER = '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"'
const exportButton = (page: Parameters<typeof mount>[0]) => page.getByRole('button', { name: 'Izvozi CSV', exact: true })
const checkboxes = (page: Parameters<typeof mount>[0]) => page.getByRole('checkbox', { name: /^Stolpec / })

test('T01: privzeti izvoz ima vse kolone, BOM, CRLF in vrstni red projekta', async ({ page }) => {
  await mount(page)
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-web.csv')
  expect(file.text.startsWith(HEADER + '\r\n')).toBe(true)
  expect(file.text.endsWith('\r\n')).toBe(true)
  const rows = file.text.slice(1).split('\r\n').slice(1, -1)
  expect(rows).toHaveLength(8)
  expect(rows[0]).toBe('"web-01";"web";"Čas za pregled";"in_progress";"Ana Novak";"2026-09-18";"Končni zapis vsebine"')
  expect(rows.map((row) => row.match(/^"([^"]*)"/)?.[1])).toEqual(['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
})

test('T02: izvoz zajame samo opravila trenutnega projekta', async ({ page }) => {
  await mount(page, examples, '#/projects/launch')
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-launch.csv')
  expect(file.text).toContain('"launch-01"')
  expect(file.text).not.toContain('"web-01"')
})

test('T03: vrstni red kolon je neodvisen od klikov, prazna izbira onemogoči izvoz', async ({ page }) => {
  await mount(page)
  for (const key of ALL_COLUMNS) await page.getByRole('checkbox', { name: 'Stolpec ' + key, exact: true }).uncheck()
  await expect(checkboxes(page)).toHaveCount(7)
  await expect(exportButton(page)).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await expect(exportButton(page)).toBeEnabled()
  const file = await downloadCSV(page)
  const lines = file.text.slice(1).split('\r\n')
  expect(lines[0]).toBe('"id";"title"')
  expect(lines[1]).toBe('"web-01";"Čas za pregled"')
  expect(lines[2]).toBe('"web-02";"Pregled vsebine"')
})

test('T04: onemogočen gumb ne ustvari prenosa', async ({ page }) => {
  await mount(page)
  for (const key of ALL_COLUMNS) await page.getByRole('checkbox', { name: 'Stolpec ' + key, exact: true }).uncheck()
  const button = exportButton(page)
  await expect(button).toBeDisabled()
  const download = page.waitForEvent('download', { timeout: 600 }).then(() => 'download').catch(() => 'none')
  await button.dispatchEvent('click').catch(() => undefined)
  expect(await download).toBe('none')
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
})

test('T05: filter omeji samo izvožene vrstice, prikaz ostane celoten', async ({ page }) => {
  await mount(page)
  await select(page, 'Filter izvoza', 'done')
  await expect(page.locator('table tbody tr[data-task-id]')).toHaveCount(8)
  const file = await downloadCSV(page)
  expect(file.text.startsWith(HEADER)).toBe(true)
  expect(file.text).toContain('"web-03"')
  expect(file.text).toContain('"web-06"')
  expect(file.text).not.toContain('"web-01"')
})

test('T06: prazen projekt onemogoči izvoz', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(exportButton(page)).toBeDisabled()
})

test('T07: prazen filtrirani rezultat onemogoči izvoz, ponovni izbor ga omogoči', async ({ page }) => {
  await mount(page, [makeTask('web-01')])
  await select(page, 'Filter izvoza', 'done')
  await expect(exportButton(page)).toBeDisabled()
  await select(page, 'Filter izvoza', 'all')
  await expect(exportButton(page)).toBeEnabled()
})

test('T08: ločilo, narekovaji, CRLF in zaporedna izvoza', async ({ page }) => {
  await mount(page)
  const first = await downloadCSV(page)
  await select(page, 'Ločilo CSV', ',')
  const second = await downloadCSV(page)
  expect(second.text).not.toBe(first.text)
  expect(second.text.startsWith('\uFEFF"id","projectId","title","status","assignee","dueDate","description"\r\n')).toBe(true)
  expect(second.text).toContain('"Zapis, ""citat"""')
  expect(second.text).toContain('"Prva vrstica\nDruga vrstica; čšž"')
  expect(second.text.endsWith('\r\n')).toBe(true)
  await select(page, 'Ločilo CSV', ';')
  const third = await downloadCSV(page)
  expect(third.text).toBe(first.text)
})

test('T09: nevtralizacija formul velja za vse podatkovne kolone', async ({ page }) => {
  const records: Task[] = [
    makeTask('web-01', { title: '=SUM(A1)', description: '+opis' }),
    makeTask('web-02', { title: '  =z amik' }),
    makeTask('web-03', { title: '\t+tab' }),
    makeTask('web-04', { title: '\r\n-lf' }),
    makeTask('web-05', { title: '@at' }),
    makeTask('web-06', { title: 'normal =x', description: ' a=b' }),
    makeTask('web-07', { title: '-minus' }),
    makeTask('web-08', { title: '   ' }),
  ]
  await mount(page, records)
  const file = await downloadCSV(page)
  expect(file.text.startsWith('\uFEFF"id";')).toBe(true)
  expect(file.text).toContain('"\'=SUM(A1)"')
  expect(file.text).toContain('"\'+opis"')
  expect(file.text).toContain('"\'  =z amik"')
  expect(file.text).toContain('"\'\t+tab"')
  expect(file.text).toContain('"\'\r\n-lf"')
  expect(file.text).toContain('"\'@at"')
  expect(file.text).toContain('"\'-minus"')
  expect(file.text).toContain('"normal =x"')
  expect(file.text).toContain('" a=b"')
  expect(file.text).toContain('"   "')
})

test('T10: preklop pogleda ohrani nastavitve in ustvari iste bajte', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Filter izvoza', 'in_progress')
  await page.getByRole('checkbox', { name: 'Stolpec projectId', exact: true }).uncheck()
  await select(page, 'Ločilo CSV', ',')
  const first = await downloadCSV(page)
  const pagesBefore = page.context().pages().length
  await board(page)
  await expect(page.getByRole('checkbox', { name: 'Stolpec projectId', exact: true })).not.toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(',')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('in_progress')
  expect(await downloadCSV(page)).toEqual(first)
  expect(page.context().pages().length).toBe(pagesBefore)
  await readonly(page, writes)
})

test('T11: menjava projekta in osvežitev ponastavita nastavitve', async ({ page }) => {
  await mount(page)
  await select(page, 'Filter izvoza', 'done')
  await select(page, 'Ločilo CSV', ',')
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).uncheck()
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('checkbox', { name: 'Stolpec description', exact: true })).toBeChecked()
  await project(page, 'web')
  await select(page, 'Filter izvoza', 'todo')
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('checkbox', { name: 'Stolpec title', exact: true })).toBeChecked()
  await select(page, 'Filter izvoza', 'done')
  const file = await downloadCSV(page)
  expect(file.text).toContain('"web-03"')
  expect(file.text).not.toContain('"web-01"')
})
