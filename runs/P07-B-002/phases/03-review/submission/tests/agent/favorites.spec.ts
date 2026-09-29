import { type Page } from '@playwright/test'
import { test, expect, mount, makeTask, examples, expectIds, board, table, project, readonly, columnIds } from '../development/helpers.ts'

const key = 'folio:favorites:v1'
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena', exact: true })
const counter = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih' })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })

async function instrument(page: Page, raw: string | null = null, failure: 'read' | 'write' | 'getter' | null = null) {
  await page.addInitScript(({ key, raw, failure }) => {
    if (!sessionStorage.getItem('agent-seeded')) {
      if (raw === null) localStorage.removeItem(key)
      else localStorage.setItem(key, raw)
      sessionStorage.setItem('agent-seeded', 'yes')
    }
    const writes: string[] = []
    Object.assign(window, { favoriteWrites: writes })
    const originalSet = Storage.prototype.setItem
    const originalGet = Storage.prototype.getItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) {
        writes.push(value)
        if (failure === 'write') throw new DOMException('Unavailable', 'QuotaExceededError')
      }
      return originalSet.call(this, name, value)
    }
    if (failure === 'read') Storage.prototype.getItem = function (name) {
      if (name === key) throw new DOMException('Unavailable', 'SecurityError')
      return originalGet.call(this, name)
    }
    if (failure === 'getter') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Unavailable', 'SecurityError') } })
  }, { key, raw, failure })
}

const writes = (page: Page) => page.evaluate(() => (window as unknown as { favoriteWrites: string[] }).favoriteWrites)
const stored = (page: Page) => page.evaluate(key => localStorage.getItem(key), key)
async function storageEvent(page: Page, raw: string | null, eventKey: string | null = key) {
  await page.evaluate(({ raw, eventKey }) => window.dispatchEvent(new StorageEvent('storage', { key: eventKey, newValue: raw })), { raw, eventKey })
}

for (const [name, raw] of Object.entries({
  missing: null, malformed: '{', null: 'null', array: '[]', empty: '{}', version: '{"version":2,"ids":["web-02"]}',
  stringVersion: '{"version":"1","ids":["web-02"]}', missingIds: '{"version":1}', stringIds: '{"version":1,"ids":"web-02"}',
  nullMember: '{"version":1,"ids":["web-02",null]}', numberMember: '{"version":1,"ids":["web-02",1]}',
})) {
  test(`S04 rejects ${name} without rewriting storage`, async ({ page }) => {
    await instrument(page, raw)
    await mount(page)
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
    expect(await writes(page)).toEqual([])
    expect(await stored(page)).toBe(raw)
    await favorite(page, 'web-02').click()
    expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['web-02'] })
  })
}

test('S02 S03 canonical UTF-16 storage preserves unknown IDs and restores after reload', async ({ page }) => {
  const raw = JSON.stringify({ version: 1, ids: ['web-03', '😀', 'A', 'web-03', '\uE000', 'č', 'z', 'launch-01'], extra: 'ignored' })
  await instrument(page, raw)
  await mount(page)
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  expect(await writes(page)).toEqual([])
  expect(await stored(page)).toBe(raw)
  await favorite(page, 'web-02').click()
  expect(await stored(page)).toBe(JSON.stringify({ version: 1, ids: ['A', 'launch-01', 'web-02', 'web-03', 'z', 'č', '😀', '\uE000'] }))
  await filter(page).check()
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await expectIds(page, examples.filter(t => t.projectId === 'web').map(t => t.id))
  expect(await writes(page)).toEqual([])
})

test('S05 S07 S10 ordered large project shares filter and counts across views', async ({ page }) => {
  const records = Array.from({ length: 14 }, (_, index) => makeTask(`id-${20 - index}`, { title: 'Enak naslov čšž', status: index % 2 ? 'done' : 'todo' }))
  await instrument(page)
  const networkWrites = await mount(page, records)
  const chosen = [records[1].id, records[4].id, records[12].id]
  for (const id of chosen) await favorite(page, id).click()
  await filter(page).check()
  await expectIds(page, chosen)
  await expect(counter(page)).toHaveText('Priljubljeno: 3 od 14.')
  await board(page)
  await expect(filter(page)).toBeChecked()
  await columnIds(page, 'Pripravljeno', [chosen[1], chosen[2]])
  await columnIds(page, 'Končano', [chosen[0]])
  await expect(page.locator('.column-count')).toHaveText(['2', '0', '1'])
  await favorite(page, chosen[1]).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 14.')
  await page.locator(`[data-task-id="${chosen[0]}"]`).getByRole('link').click()
  await expect(page.getByRole('dialog').getByText(chosen[0], { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await table(page)
  await expectIds(page, [chosen[0], chosen[2]])
  await readonly(page, networkWrites)
})

test('S08 S09 project reset and clear preserve other projects and unknown IDs', async ({ page }) => {
  await instrument(page, JSON.stringify({ version: 1, ids: ['web-02', 'web-03', 'launch-01', 'unknown'] }))
  const networkWrites = await mount(page)
  const before = await (await page.request.get('/__test/state')).json()
  await filter(page).check()
  await clear(page).click()
  await expectIds(page, [])
  await expect(clear(page)).toBeDisabled()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['launch-01', 'unknown'] })
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 2.')
  await favorite(page, 'launch-02').click()
  await filter(page).check()
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
  await readonly(page, networkWrites)
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
})

test('S11 storage replaces state immediately and never writes back', async ({ page }) => {
  await instrument(page)
  await mount(page)
  await filter(page).check()
  await storageEvent(page, JSON.stringify({ version: 1, ids: ['web-03', 'web-03', 'unknown'] }))
  await expectIds(page, ['web-03'])
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  await storageEvent(page, null, 'unrelated')
  await storageEvent(page, null, null)
  await expectIds(page, ['web-03'])
  await storageEvent(page, '{"version":1,"ids":["web-02",false]}')
  await expectIds(page, [])
  await storageEvent(page, '{"version":1,"ids":["web-02"]}')
  await expectIds(page, ['web-02'])
  await storageEvent(page, null)
  await expectIds(page, [])
  await expect(filter(page)).toBeChecked()
  expect(await writes(page)).toEqual([])
  expect(await stored(page)).toBeNull()
})

for (const failure of ['read', 'write', 'getter'] as const) {
  test(`S11 ${failure} failure keeps in-memory actions and navigation usable`, async ({ page }) => {
    await instrument(page, null, failure)
    const networkWrites = await mount(page)
    await favorite(page, 'web-02').click()
    await expect(page.getByRole('alert')).toContainText('shramba')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await filter(page).check()
    await board(page)
    await expectIds(page, ['web-02'])
    await favorite(page, 'web-02').click()
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await project(page, 'launch')
    await expect(filter(page)).not.toBeChecked()
    await favorite(page, 'launch-01').click()
    await expect(counter(page)).toHaveText('Priljubljeno: 1 od 2.')
    await readonly(page, networkWrites)
  })
}

for (const size of [0, 1]) {
  test(`S06 S10 S12 ${size} task mobile project retains controls and empty columns`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await instrument(page)
    const id = 'ID / čšž ? # " 😀 ' + 'long'.repeat(30)
    const networkWrites = await mount(page, size ? [makeTask(id)] : [])
    await expect(counter(page)).toHaveText(`Priljubljeno: 0 od ${size}.`)
    await expect(clear(page)).toBeDisabled()
    if (size) {
      await favorite(page, id).focus()
      await page.keyboard.press('Space')
      await expect(favorite(page, id)).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByRole('dialog')).toHaveCount(0)
    }
    await filter(page).check()
    await board(page)
    if (size) {
      await page.locator('[data-task-id]').getByRole('link').click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.keyboard.press('Escape')
      await favorite(page, id).click()
    }
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
    await table(page)
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await filter(page).uncheck()
    await expectIds(page, size ? [id] : [])
    await readonly(page, networkWrites)
  })
}
