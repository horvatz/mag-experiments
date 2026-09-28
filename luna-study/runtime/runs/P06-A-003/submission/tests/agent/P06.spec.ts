import { expect, test, type Page } from '@playwright/test'

type TaskRecord = {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  dueDate: string
}

const rows: TaskRecord[] = [
  { id: 'web-z', projectId: 'web', title: ' \t=2+2', description: 'opis; "prva"\r\nnadalje', status: 'todo', assignee: '\r\n+Maja', dueDate: '2026-09-21' },
  { id: 'web-y', projectId: 'web', title: 'Končni zapis', description: 'čšž — zapis', status: 'done', assignee: 'Živa Kovač', dueDate: '2026-10-03' },
  { id: 'web-x', projectId: 'web', title: 'Delo v teku', description: 'opis', status: 'in_progress', assignee: 'Ana Novak', dueDate: '2026-09-28' },
  { id: 'launch-a', projectId: 'launch', title: 'Drugi projekt', description: 'opis projekta', status: 'done', assignee: 'Luka Kovač', dueDate: '2026-10-04' },
]

async function mount(page: Page) {
  const writes: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && request.method() !== 'GET') writes.push(request.method())
  })
  await page.route('**/api/**', async (route) => {
    if (route.request().method() !== 'GET') return route.continue()
    const path = new URL(route.request().url()).pathname
    if (path === '/api/projects') return route.fulfill({ json: [
      { id: 'web', name: 'Spletna prenova' },
      { id: 'launch', name: 'Jesenska kampanja' },
      { id: 'empty', name: 'Prazen projekt' },
    ] })
    const match = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (match) {
      const id = decodeURIComponent(match[1])
      return route.fulfill({ json: rows.filter((row) => row.projectId === id) })
    }
    return route.continue()
  })
  await page.goto('/#/projects/web')
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}

async function csvDownload(page: Page) {
  const event = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Izvozi CSV', exact: true }).click()
  const download = await event
  const stream = await download.createReadStream()
  if (!stream) throw new Error('Prenos CSV nima vsebinskega toka')
  const parts: Buffer[] = []
  for await (const part of stream) parts.push(Buffer.from(part))
  return { name: download.suggestedFilename(), text: Buffer.concat(parts).toString('utf8') }
}

test('CSV ohrani polja, Unicode, izvorni vrstni red ter zaščiti formule in prelome', async ({ page }) => {
  const writes = await mount(page)
  const download = await csvDownload(page)
  expect(download.name).toBe('folio-web.csv')
  expect(download.text).toBe(
    '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    '"web-z";"web";"\' \t=2+2";"todo";"\'\r\n+Maja";"2026-09-21";"opis; ""prva""\r\nnadalje"\r\n' +
    '"web-y";"web";"Končni zapis";"done";"Živa Kovač";"2026-10-03";"čšž — zapis"\r\n' +
    '"web-x";"web";"Delo v teku";"in_progress";"Ana Novak";"2026-09-28";"opis"\r\n',
  )
  expect(writes).toEqual([])
  expect(await page.evaluate(() => location.hash)).toBe('#/projects/web')
})

test('filtri omejijo samo CSV, stolpci sledijo fiksnemu redu, nastavitve preživijo poglede', async ({ page }) => {
  const writes = await mount(page)
  for (const column of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  }
  const exportButton = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(exportButton).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('done')
  await page.getByRole('combobox', { name: 'Ločilo CSV', exact: true }).selectOption(',')
  await expect(page.locator('tr[data-task-id]')).toHaveCount(3)
  const first = await csvDownload(page)
  expect(first.text).toBe('\uFEFF"id","title"\r\n"web-y","Končni zapis"\r\n')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.locator('li[data-task-id]')).toHaveCount(3)
  const second = await csvDownload(page)
  expect(second).toEqual(first)
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).uncheck()
  await expect(exportButton).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).check()
  await expect(exportButton).toBeEnabled()
  expect(writes).toEqual([])
})

test('menjava projekta in osvežitev ponastavita nastavitve; prazen projekt ne izvozi', async ({ page }) => {
  const writes = await mount(page)
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  await page.getByRole('combobox', { name: 'Ločilo CSV', exact: true }).selectOption(',')
  await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('done')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Stolpec title', exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  expect((await csvDownload(page)).text).toContain('"launch-a";"launch";"Drugi projekt";"done"')
  await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('todo')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('all')
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Stolpec title', exact: true })).toBeChecked()
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Prazen projekt', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Prazen projekt', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  expect(writes).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
