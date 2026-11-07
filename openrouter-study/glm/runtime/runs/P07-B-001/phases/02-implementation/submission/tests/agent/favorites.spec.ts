import { click, expectIds, mount, project, webIds } from '../development/helpers.ts'
import { expect, test } from '../development/helpers.ts'

test('agent: invalid storage is ignored and filtering stays usable', async ({ page }) => {
  await mount(page)
  await page.evaluate(() => window.localStorage.setItem('folio:favorites:v1', '{bad'))
  await page.reload()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  const invalid = await page.evaluate(() => window.localStorage.getItem('folio:favorites:v1'))
  expect(invalid).toBe('{bad')

  await click(page, 'Priljubljeno opravilo web-02')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02'])
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).uncheck()
  await expectIds(page, webIds())
})

test('agent: favorites are global and cleanup is project scoped', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['unknown', 'web-02', 'launch-01'] })))
  await mount(page)
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' }).click()
  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('folio:favorites:v1')!))
  expect(stored).toEqual({ version: 1, ids: ['launch-01', 'unknown'] })

  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['launch-01'])
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 2.')
})

test('agent: storage events sync and write failures remain usable', async ({ page }) => {
  await mount(page)
  await page.evaluate(() => {
    window.localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['unknown', 'web-01'] }))
    window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: JSON.stringify({ version: 1, ids: ['unknown', 'web-01'] }) }))
  })
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'other:key', newValue: JSON.stringify({ version: 1, ids: [] }) })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'true')

  await page.evaluate(() => {
    window.localStorage.setItem('folio:favorites:v1', 'null')
    window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null }))
  })
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.evaluate(() => {
    Object.defineProperty(window.localStorage, 'setItem', { value: () => { throw Error('Storage is full') } })
  })
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('alert')).toContainText('Shramba')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
}
)
