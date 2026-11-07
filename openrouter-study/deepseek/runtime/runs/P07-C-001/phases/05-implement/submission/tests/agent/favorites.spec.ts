import { expect, test, type Page } from '@playwright/test'

type Task = {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  dueDate: string
}

const makeTask = (id: string, values: Partial<Task> = {}): Task => ({
  id,
  projectId: 'web',
  title: `Opravilo ${id}`,
  description: `Opis opravila ${id}`,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-09-21',
  ...values,
})

const records: Task[] = [
  makeTask('web-01', { title: 'Čas za pregled', status: 'in_progress' }),
  makeTask('web-02', { title: 'Pregled vsebine' }),
  makeTask('web-03', { title: 'Pregled vsebine', status: 'done' }),
  makeTask('web-04', { title: 'Zapis, "citat"', description: 'Prva vrstica\nDruga vrstica; čšž' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt' }),
]

const KEY = 'folio:favorites:v1'

async function mount(page: Page, { data = records, hash = '#/projects/web', storage }: { data?: Task[]; hash?: string; storage?: string | null } = {}) {
  const writes: string[] = []
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(`${request.method()} ${path}`)
  })
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()
    if (path === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: data.filter((task) => task.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = data.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  if (storage !== undefined) {
    await page.addInitScript(([key, value]) => {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    }, [KEY, storage] as [string, string | null])
  }
  await page.goto('/' + hash)
  await expect(page.getByRole('heading', { name: hash.includes('launch') ? 'Jesenska kampanja' : 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}

const favButton = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const tableIds = (page: Page) => page.locator('tr[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
const storedValue = (page: Page) => page.evaluate((key) => localStorage.getItem(key), KEY)

test('R01: gumbi preklapljajo samo svoj id in ne odprejo podrobnosti', async ({ page }) => {
  await mount(page)
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  await favButton(page, 'web-01').click()
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(favButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await favButton(page, 'web-01').click()
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
})

test('R01: enaki naslovi ostanejo neodvisni', async ({ page }) => {
  await mount(page)
  await favButton(page, 'web-03').click()
  await expect(favButton(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(favButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
})

test('R02: zapis je {version:1, ids} z enkratnimi nizi, razvrščenimi po UTF-16', async ({ page }) => {
  await mount(page)
  await favButton(page, 'web-03').click()
  await favButton(page, 'web-01').click()
  const stored = JSON.parse((await storedValue(page)) ?? 'null')
  expect(stored).toEqual({ version: 1, ids: ['web-01', 'web-03'] })
})

test('R03: obnova ohrani neznane id-je, podvojene šteje enkrat, brez izmišljenih opravil', async ({ page }) => {
  await mount(page, { storage: JSON.stringify({ version: 1, ids: ['web-02', 'web-02', 'ghost-9'] }) })
  await expect(favButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-task-id="ghost-9"]')).toHaveCount(0)
  await favButton(page, 'web-01').click()
  const stored = JSON.parse((await storedValue(page)) ?? 'null')
  expect(stored).toEqual({ version: 1, ids: ['ghost-9', 'web-01', 'web-02'] })
})

test('R04: neveljavni zapisi pomenijo prazno množico in se ob nalaganju ne prepišejo', async ({ page }) => {
  await mount(page)
  expect(await storedValue(page)).toBeNull()
  const invalid = ['ni json', '{"version":2,"ids":["web-01"]}', '{"ids":["web-01"]}', '{"version":1}', '{"version":1,"ids":"web-01"}', '{"version":1,"ids":["web-01",2]}']
  for (const raw of invalid) {
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [KEY, raw] as [string, string])
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
    const pressed = await page.getByRole('button', { name: /^Priljubljeno opravilo/ }).evaluateAll((nodes) => nodes.some((node) => node.getAttribute('aria-pressed') === 'true'))
    expect(pressed).toBe(false)
    expect(await storedValue(page)).toBe(raw)
  }
})

test('R05: filter je privzeto izklopljen in omeji na priljubljena trenutnega projekta v izvornem vrstnem redu', async ({ page }) => {
  await mount(page)
  const checkbox = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await expect(checkbox).not.toBeChecked()
  await favButton(page, 'web-03').click()
  await favButton(page, 'web-01').click()
  await checkbox.check()
  await expect.poll(() => tableIds(page)).toEqual(['web-01', 'web-03'])
  await checkbox.uncheck()
  await expect.poll(() => tableIds(page)).toEqual(['web-01', 'web-02', 'web-03', 'web-04'])
})

test('R06: odstranitev med filtrom je takoj vidna, prazno stanje omogoča izklop', async ({ page }) => {
  await mount(page)
  await favButton(page, 'web-02').click()
  const checkbox = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await checkbox.check()
  await expect.poll(() => tableIds(page)).toEqual(['web-02'])
  await favButton(page, 'web-02').click()
  await expect.poll(() => tableIds(page)).toEqual([])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(checkbox).toBeEnabled()
  await checkbox.uncheck()
  await expect.poll(() => tableIds(page)).toEqual(['web-01', 'web-02', 'web-03', 'web-04'])
})

test('R07: preglednica in tabla si delita stanje, podrobnosti ostanejo dostopne', async ({ page }) => {
  await mount(page)
  await favButton(page, 'web-02').click()
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect(favButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('tr[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByText('web-02', { exact: true }).first()).toBeVisible()
})

test('R08: menjava projekta in osvežitev ohranita množico ter ponastavita filter', async ({ page }) => {
  await mount(page)
  await favButton(page, 'web-01').click()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
})

test('R09: odstranitev priljubljenih projekta ohrani tuje in neznane id-je', async ({ page }) => {
  await mount(page, { storage: JSON.stringify({ version: 1, ids: ['launch-01', 'web-01', 'web-02', 'ghost-7'] }) })
  const removeButton = page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
  await expect(removeButton).toBeEnabled()
  await removeButton.click()
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  await expect(favButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  expect(JSON.parse((await storedValue(page)) ?? 'null')).toEqual({ version: 1, ids: ['ghost-7', 'launch-01'] })
  await expect(removeButton).toBeDisabled()
})

test('R10: števec kaže cel projekt, stolpci table štejejo vidna opravila', async ({ page }) => {
  await mount(page)
  const status = page.getByRole('status', { name: 'Število priljubljenih' })
  await expect(status).toHaveText('Priljubljeno: 0 od 4.')
  await favButton(page, 'web-01').click()
  await expect(status).toHaveText('Priljubljeno: 1 od 4.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(status).toHaveText('Priljubljeno: 1 od 4.')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByLabel('1 opravil')).toHaveCount(1)
  await expect(page.getByLabel('0 opravil')).toHaveCount(2)
})

test('R11: dogodek storage uskladi množico brez povratnega zapisa, drugi ključ se ignorira', async ({ page }) => {
  await mount(page)
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [KEY, JSON.stringify({ version: 1, ids: ['web-01'] })] as [string, string])
  await page.evaluate(([key, value]) => window.dispatchEvent(new StorageEvent('storage', { key, newValue: value })), [KEY, JSON.stringify({ version: 1, ids: ['web-02'] })] as [string, string])
  await expect(favButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  expect(await storedValue(page)).toBe(JSON.stringify({ version: 1, ids: ['web-01'] }))
  await page.evaluate(([key, value]) => window.dispatchEvent(new StorageEvent('storage', { key, newValue: value })), ['drugi:kljuc', JSON.stringify({ version: 1, ids: ['web-01'] })] as [string, string])
  await expect(favButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate((key) => window.dispatchEvent(new StorageEvent('storage', { key, newValue: null })), KEY)
  await expect(favButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
})

test('R11: izjema zapisa shrambe pusti aplikacijo uporabno in prikaže opozorilo', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new Error('shramba ni na voljo') }
  })
  await mount(page)
  await favButton(page, 'web-01').click()
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert')).toContainText('shramba')
})

test('R11: izjema branja shrambe prikaže opozorilo in uporabno aplikacijo', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function () { throw new Error('shramba ni na voljo') }
  })
  await mount(page)
  await expect(page.getByRole('alert')).toContainText('shramba')
  await favButton(page, 'web-01').click()
  await expect(favButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
})

test('R12: priljubljena ne sprožajo API zapisov', async ({ page }) => {
  const writes = await mount(page)
  await favButton(page, 'web-01').click()
  await favButton(page, 'web-02').click()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  expect(writes).toEqual([])
})

test('R12: pri širini 390 px se stran ne razširi', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page)
  await favButton(page, 'web-01').click()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
