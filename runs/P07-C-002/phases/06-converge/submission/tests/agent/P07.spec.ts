import type { Page } from '@playwright/test'
import { test, expect, mount, click, expectIds, board, table, project, details, readonly, makeTask, examples, webIds, columnIds } from '../development/helpers.ts'

const key = 'folio:favorites:v1'
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
const counter = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih' })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })
const stored = (page: Page) => page.evaluate((key) => localStorage.getItem(key), key)

async function seed(page: Page, raw: string | null) {
  await page.addInitScript(({ key, raw }) => {
    if (!sessionStorage.getItem('agent-seeded')) {
      if (raw === null) localStorage.removeItem(key)
      else localStorage.setItem(key, raw)
      sessionStorage.setItem('agent-seeded', 'true')
    }
  }, { key, raw })
}

test('S02 S03: canonical UTF-16 storage, duplicates, unknown IDs and refresh', async ({ page }) => {
  const records = ['ž', 'Z', 'a', '😀', '\uE000', ...Array.from({ length: 8 }, (_, i) => `x-${i}`)].map(id => makeTask(id))
  const initial = JSON.stringify({ version: 1, ids: ['ghost', 'ž', 'ž', ''] })
  await seed(page, initial)
  await mount(page, records)
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 13.')
  expect(await stored(page)).toBe(initial)
  for (const id of ['\uE000', '😀', 'a', 'Z']) await favorite(page, id).click()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['', 'Z', 'a', 'ghost', 'ž', '😀', '\uE000'] })
  await filter(page).check()
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 5 od 13.')
  await expectIds(page, records.map(t => t.id))
  await favorite(page, 'ž').click()
  expect(JSON.parse((await stored(page))!).ids).toContain('ghost')
})

const invalidRecords = [null, '{', 'null', '[]', '{}', '{"version":2,"ids":["web-02"]}', '{"version":"1","ids":["web-02"]}', '{"version":1}', '{"version":1,"ids":null}', '{"version":1,"ids":"web-02"}', '{"version":1,"ids":["web-02",7]}', '{"version":1,"ids":["web-02",null]}']
for (const [index, raw] of invalidRecords.entries()) {
  test(`S04: invalid or missing storage ${index} stays untouched on load`, async ({ page }) => {
    await seed(page, raw)
    await mount(page)
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    expect(await stored(page)).toBe(raw)
    await favorite(page, 'web-02').click()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['web-02'] })
  })
}

test('S08 S09: project reset, global IDs and removal of entire project', async ({ page }) => {
  await seed(page, JSON.stringify({ version: 1, ids: ['web-01', 'web-03', 'launch-01', 'ghost'] }))
  await mount(page)
  await filter(page).check()
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 2.')
  await favorite(page, 'launch-02').click()
  await filter(page).check()
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await filter(page).check()
  await clear(page).click()
  await expectIds(page, [])
  await expect(clear(page)).toBeDisabled()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['ghost', 'launch-01', 'launch-02'] })
  await project(page, 'launch')
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 2.')
})

test('S11: storage events validate, replace, ignore other keys and never echo', async ({ page }) => {
  await mount(page)
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      document.documentElement.dataset.storageWrites = String(Number(document.documentElement.dataset.storageWrites ?? 0) + 1)
      return original.call(this, key, value)
    }
  })
  const send = (raw: string | null, eventKey = key) => page.evaluate(({ raw, eventKey }) => window.dispatchEvent(new StorageEvent('storage', { key: eventKey, newValue: raw })), { raw, eventKey })
  await filter(page).check()
  await send(JSON.stringify({ version: 1, ids: ['web-03', 'web-03', 'ghost'] }))
  await expectIds(page, ['web-03'])
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  await send(null, 'unrelated')
  await expectIds(page, ['web-03'])
  for (const raw of invalidRecords) {
    await send(raw)
    await expectIds(page, [])
    await send('{"version":1,"ids":["web-03"]}')
    await expectIds(page, ['web-03'])
  }
  await send(null)
  await expectIds(page, [])
  expect(await page.evaluate(() => Number(document.documentElement.dataset.storageWrites ?? 0))).toBe(0)
  expect(await stored(page)).toBeNull()
  await expect(filter(page)).toBeChecked()
})

for (const method of ['getItem', 'setItem'] as const) {
  test(`S11: ${method} failure warns and keeps in-memory interactions usable`, async ({ page }) => {
    await page.addInitScript(({ method, key }) => {
      const original = Storage.prototype[method]
      Object.defineProperty(Storage.prototype, method, { configurable: true, value: function (this: Storage, name: string, value?: string) {
        if (name === key) throw new DOMException('Unavailable', 'SecurityError')
        return Reflect.apply(original, this, [name, value ?? ''])
      } })
    }, { method, key })
    const writes = await mount(page)
    await favorite(page, 'web-02').click()
    await expect(page.getByRole('alert')).toContainText('shramba')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await filter(page).check()
    await expectIds(page, ['web-02'])
    await board(page)
    await favorite(page, 'web-02').click()
    await expectIds(page, [])
    await filter(page).uncheck()
    await favorite(page, 'web-03').click()
    await project(page, 'launch')
    await project(page, 'web')
    await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
    await readonly(page, writes)
  })
}

for (const width of [1440, 390]) {
  for (const view of ['table', 'board']) {
    test(`S01 S05 S06 S07 S10 S12: ${view} at ${width}px preserves Folio and task data`, async ({ page }) => {
      await page.setViewportSize({ width, height: 960 })
      const records = [...examples].reverse()
      const writes = await mount(page, records)
      if (view === 'board') await board(page)
      const before = await page.evaluate(async () => (await fetch('/api/projects/web/tasks')).json())
      await expect(filter(page)).not.toBeChecked()
      await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
      await favorite(page, 'web-02').click()
      await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'false')
      await expect(page.getByRole('dialog')).toHaveCount(0)
      expect(await favorite(page, 'web-02').evaluate(el => el.closest('a') === null)).toBe(true)
      await favorite(page, 'web-03').focus()
      await page.keyboard.press('Enter')
      await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        window.scrollTo(0, 0)
        document.querySelectorAll('.board-scroll, .table-scroll').forEach(element => { element.scrollLeft = 0 })
      })
      await page.screenshot({ path: `docs/agent/P07/${view}-${width}.png`, fullPage: true })
      await filter(page).check()
      if (view === 'table') await expectIds(page, ['web-03', 'web-02'])
      else {
        await columnIds(page, 'Pripravljeno', ['web-02'])
        await columnIds(page, 'Končano', ['web-03'])
      }
      await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
      await board(page)
      await expect(filter(page)).toBeChecked()
      await expect(page.locator('.column-count')).toHaveText(['1', '0', '1'])
      await details(page, 'web-03')
      await expect(filter(page)).toBeChecked()
      if (view === 'table') await table(page)
      await favorite(page, 'web-02').click()
      await expectIds(page, ['web-03'])
      await favorite(page, 'web-03').click()
      await expectIds(page, [])
      await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
      await expect(clear(page)).toBeDisabled()
      await filter(page).uncheck()
      await table(page)
      await expectIds(page, webIds(records))
      const after = await page.evaluate(async () => (await fetch('/api/projects/web/tasks')).json())
      expect(after).toEqual(before)
      await readonly(page, writes)
    })
  }
}

for (const count of [0, 1]) {
  test(`S05 S06 S09 S10: ${count} tasks and an empty second project`, async ({ page }) => {
    await mount(page, count ? [makeTask('single')] : [])
    await expect(counter(page)).toHaveText(`Priljubljeno: 0 od ${count}.`)
    await expect(clear(page)).toBeDisabled()
    await filter(page).check()
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await board(page)
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await filter(page).uncheck()
    if (count) {
      await favorite(page, 'single').click()
      await expect(counter(page)).toHaveText('Priljubljeno: 1 od 1.')
      await clear(page).click()
      await expect(counter(page)).toHaveText('Priljubljeno: 0 od 1.')
    }
    await project(page, 'launch')
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 0.')
    await expect(clear(page)).toBeDisabled()
    await expect(filter(page)).not.toBeChecked()
    await click(page, 'Preglednica')
    await expect(page.getByText('V tem projektu še ni opravil', { exact: true })).toBeVisible()
  })
}
