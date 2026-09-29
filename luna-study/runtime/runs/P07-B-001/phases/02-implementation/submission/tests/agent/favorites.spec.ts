import { test, expect, mount, click, expectIds, project } from '../development/helpers.ts'

test('obnovi veljavne ID-je, deduplicira ob naslednjem zapisu in ohrani neznane', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['future-task', 'web-02', 'web-02'] })))
  await mount(page)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(JSON.stringify({ version: 1, ids: ['future-task', 'web-02', 'web-02'] }))
  await click(page, 'Priljubljeno opravilo web-03')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('folio:favorites:v1')!))).toEqual({ version: 1, ids: ['future-task', 'web-02', 'web-03'] })
})

test('filter se ob menjavi projekta izklopi, čiščenje odstrani samo ID-je projekta', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['foreign-task', 'launch-01', 'web-02'] })))
  await mount(page)
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02'])
  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await click(page, 'Odstrani priljubljene tega projekta')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('folio:favorites:v1')!))).toEqual({ version: 1, ids: ['foreign-task', 'web-02'] })
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })).toBeDisabled()
})

test('sinhronizira storage dogodke brez povratnega zapisa in opozori na napako zapisa', async ({ page }) => {
  const writes = await mount(page)
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'druge-nastavitve', newValue: '{}' })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: JSON.stringify({ version: 1, ids: ['web-03'] }) })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new Error('blocked') } })
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('alert')).toContainText('shramba')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(writes).toEqual([])
})

test('neveljavni in manjkajoči zapisi pomenijo prazen izbor brez samodejnega zapisa', async ({ page }) => {
  await mount(page)
  for (const raw of ['{neveljaven json', '{"version":2,"ids":["web-02"]}', '{"version":1}', '{"version":1,"ids":["web-02",4]}']) {
    await page.evaluate((value) => localStorage.setItem('folio:favorites:v1', value), raw)
    await page.reload()
    await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(raw)
  }
  await page.evaluate(() => localStorage.removeItem('folio:favorites:v1'))
  await page.reload()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBeNull()
})

test('napaka branja shramba ne prepreči uporabe izbora v pomnilniku', async ({ page }) => {
  await page.addInitScript(() => {
    const read = Storage.prototype.getItem
    Storage.prototype.getItem = function (key) {
      if (key === 'folio:favorites:v1') throw new Error('blocked')
      return read.call(this, key)
    }
  })
  await mount(page)
  await expect(page.getByRole('alert')).toContainText('shramba')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
})
