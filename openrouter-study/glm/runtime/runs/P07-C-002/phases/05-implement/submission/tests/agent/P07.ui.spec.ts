import { expect, test } from '@playwright/test'
import {
  favoriteButton,
  favoriteStatus,
  filterCheckbox,
  mount,
  removeButton,
  seedFavorites,
  switchProject,
  switchView,
  visibleIds,
} from './helpers'

test('P07 UI: favorite toggles are independent and do not open details', async ({ page }) => {
  const writes = await mount(page)
  await favoriteButton(page, 'web-02').click()
  await favoriteButton(page, 'web-03').click()

  await expect(favoriteButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  await expect(favoriteButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(favoriteButton(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await favoriteButton(page, 'web-02').click()
  await expect(favoriteButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  expect(writes).toEqual([])
})

test('P07 UI: filter preserves source order and supports empty result', async ({ page }) => {
  await mount(page)
  await favoriteButton(page, 'web-03').click()
  await favoriteButton(page, 'web-01').click()
  await filterCheckbox(page).check()

  await expect.poll(() => visibleIds(page)).toEqual(['web-01', 'web-03'])
  await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 2 od 3.')

  await favoriteButton(page, 'web-01').click()
  await expect.poll(() => visibleIds(page)).toEqual(['web-03'])
  await favoriteButton(page, 'web-03').click()
  await expect.poll(() => visibleIds(page)).toEqual([])
  await expect(page.getByRole('heading', { name: 'Ni priljubljenih opravil.', exact: true })).toBeVisible()
  await expect(filterCheckbox(page)).toBeEnabled()
  await expect(removeButton(page)).toBeDisabled()

  await filterCheckbox(page).uncheck()
  await expect.poll(() => visibleIds(page)).toEqual(['web-01', 'web-02', 'web-03'])
})

test('P07 UI: views share state and details remain reachable', async ({ page }) => {
  await mount(page)
  await favoriteButton(page, 'web-02').click()
  await filterCheckbox(page).check()
  await switchView(page, 'board')
  await expect.poll(() => visibleIds(page)).toEqual(['web-02'])
  await expect(favoriteButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')

  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog').locator('.eyebrow')).toHaveText('web-02')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await switchView(page, 'table')
  await expect.poll(() => visibleIds(page)).toEqual(['web-02'])
  await expect(favoriteButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
})

test('P07 UI: project change preserves favorites and resets filter', async ({ page }) => {
  await mount(page)
  await favoriteButton(page, 'web-01').click()
  await switchProject(page, 'launch')
  await favoriteButton(page, 'launch-01').click()
  await filterCheckbox(page).check()
  await expect.poll(() => visibleIds(page)).toEqual(['launch-01'])

  await switchProject(page, 'web')
  await expect(filterCheckbox(page)).not.toBeChecked()
  await expect(favoriteButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 1 od 3.')
})

test('P07 UI: project removal keeps other and unknown IDs', async ({ page }) => {
  await seedFavorites(page, '{"version":1,"ids":["launch-01","unknown","web-01"]}')
  await mount(page)
  await expect(removeButton(page)).toBeEnabled()
  await removeButton(page).click()

  await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 0 od 3.')
  await expect(favoriteButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  await expect(removeButton(page)).toBeDisabled()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('folio:favorites:v1')!))).toEqual({
    version: 1,
    ids: ['launch-01', 'unknown'],
  })
})

test('P07 UI: mobile layout does not expand the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page)
  await favoriteButton(page, 'web-01').click()
  await filterCheckbox(page).check()
  await switchView(page, 'board')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
