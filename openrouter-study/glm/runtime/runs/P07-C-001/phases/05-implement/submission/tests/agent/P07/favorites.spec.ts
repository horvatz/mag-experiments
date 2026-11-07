import { expect, test } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  const response = await request.post('/__test/reset')
  expect(response.ok()).toBeTruthy()
})

async function seed(page: import('@playwright/test').Page, ids: string[]) {
  await page.addInitScript((ids: string[]) => {
    window.localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids }))
  }, ids)
}

test('R01 table favorite buttons toggle one task and never open details', async ({ page }) => {
  await page.goto('/')
  const first = page.getByRole('button', { name: 'Priljubljeno opravilo web-01' })
  const second = page.getByRole('button', { name: 'Priljubljeno opravilo web-02' })
  await expect(first).toHaveAttribute('aria-pressed', 'false')
  await first.click()
  await expect(first).toHaveAttribute('aria-pressed', 'true')
  await expect(second).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('R01 board favorite buttons toggle one task and never open details', async ({ page }) => {
  await page.goto('/#/projects/web?view=board')
  const first = page.getByRole('button', { name: 'Priljubljeno opravilo web-01' })
  const second = page.getByRole('button', { name: 'Priljubljeno opravilo web-02' })
  await first.click()
  await expect(first).toHaveAttribute('aria-pressed', 'true')
  await expect(second).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('R02 favorites persist as canonical unique UTF-16 sorted JSON', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Priljubljeno opravilo web-02' }).click()
  await page.getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('folio:favorites:v1'))).toBe('{"version":1,"ids":["web-01","web-02"]}')
})

test('R03 valid saved favorites restore after refresh with duplicates and unknown IDs', async ({ page }) => {
  await seed(page, ['launch-01', 'unknown-id', 'launch-01'])
  await page.goto('/#/projects/launch')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 3.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.locator('[data-task-id]')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-01' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo unknown-id' })).toHaveCount(0)
})

for (const [name, value] of [
  ['missing key', null],
  ['invalid JSON', 'not-json'],
  ['wrong version', '{"version":2,"ids":["web-01"]}'],
  ['missing ids', '{"version":1}'],
  ['non-string id', '{"version":1,"ids":[1]}'],
] as const) {
  test(`R04 ${name} starts empty and is not overwritten`, async ({ page }) => {
    if (value !== null) {
      await page.addInitScript((value: string) => {
        window.localStorage.setItem('folio:favorites:v1', value)
      }, value)
    }
    await page.goto('/')
    await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 3.')
    await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01' })).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate(() => window.localStorage.getItem('folio:favorites:v1'))).toBe(value)
  })
}

test('R05 filter is unchecked by default and preserves source order', async ({ page }) => {
  await seed(page, ['web-03', 'web-01'])
  await page.goto('/')
  const filter = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await expect(filter).not.toBeChecked()
  await filter.check()
  await expect(page.locator('[data-task-id]')).toHaveText([/web-01/, /web-03/])
})

test('R06 removing a favorite under filter immediately hides it and keeps controls usable', async ({ page }) => {
  await seed(page, ['web-01'])
  await page.goto('/')
  const filter = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await filter.check()
  await page.getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  await expect(page.getByRole('heading', { name: 'Ni priljubljenih opravil.' })).toBeVisible()
  await expect(filter).toBeEnabled()
  await filter.uncheck()
  await expect(page.locator('[data-task-id]')).toHaveCount(3)
})

test('R07 table and board share favorites, filter and correct detail IDs', async ({ page }) => {
  await seed(page, ['web-02'])
  await page.goto('/')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.getByRole('button', { name: 'Tabla' }).click()
  await expect(page.locator('[data-task-id]')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Preglednica' }).click()
  await expect(page.locator('[data-task-id]')).toHaveCount(1)
  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Pregled vsebine' })).toBeVisible()
})

test('R08 project changes and refresh keep favorites but reset filter', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  const filter = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await expect(filter).not.toBeChecked()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 3.')
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('folio:favorites:v1'))).toBe('{"version":1,"ids":["web-01"]}')
  await page.reload()
  await expect(filter).not.toBeChecked()
})

test('R09 clearing removes only IDs of the current project', async ({ page }) => {
  await seed(page, ['unknown-id', 'launch-01', 'web-01'])
  await page.goto('/')
  const clear = page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })
  await expect(clear).toBeEnabled()
  await clear.click()
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('folio:favorites:v1'))).toBe('{"version":1,"ids":["launch-01","unknown-id"]}')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 3.')
  await expect(clear).toBeDisabled()
})

test('R10 counters show whole-project values while board counts remain visible', async ({ page }) => {
  await seed(page, ['web-01', 'web-03'])
  await page.goto('/#/projects/web?view=board')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 2 od 3.')
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await expect(page.locator('[data-task-id="web-02"]')).toHaveCount(0)
})

test('R11 storage events update without writing and other keys are ignored', async ({ page }) => {
  await page.goto('/')
  const status = page.getByRole('status', { name: 'Število priljubljenih' })
  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'other:key', newValue: '{"version":1,"ids":["web-03"]}' }))
  })
  await expect(status).toHaveText('Priljubljeno: 0 od 3.')
  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: '{"version":1,"ids":["web-02","web-02","unknown"]}' }))
  })
  await expect(status).toHaveText('Priljubljeno: 1 od 3.')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02' })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => window.localStorage.getItem('folio:favorites:v1'))).toBeNull()
  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null }))
  })
  await expect(status).toHaveText('Priljubljeno: 0 od 3.')
})

test('R11 a storage write failure keeps in-memory state and shows an alert', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    Object.defineProperty(window.localStorage, 'setItem', {
      value: () => {
        throw new Error('storage unavailable')
      },
    })
  })
  await page.getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('shramba')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 3.')
})

test('R12 favorites are local, leave task fields unchanged and keep narrow layout', async ({ page, request }) => {
  const before = await (await request.get('/__test/state')).json()
  const writeRequests: string[] = []
  page.on('request', (request) => {
    if (request.method() !== 'GET') writeRequests.push(`${request.method()} ${request.url()}`)
  })
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.locator('[data-task-id="web-01"]')).toBeVisible()
  expect(writeRequests).toEqual([])
  const after = await (await request.get('/__test/state')).json()
  expect(after.tasks).toEqual(before.tasks)
  expect(after.saveRequests).toBe(before.saveRequests)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
})
