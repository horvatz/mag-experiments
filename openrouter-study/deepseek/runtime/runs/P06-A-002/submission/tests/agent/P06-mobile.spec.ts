import { test, expect, mount, downloadCSV, board, readonly } from '../development/helpers.ts'

test.use({ viewport: { width: 390, height: 844 } })

test('T12: ozek zaslon ne preliva strani, izvoz deluje v obeh pogledih', async ({ page }) => {
  const writes = await mount(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const file = await downloadCSV(page)
  expect(file.name).toBe('folio-web.csv')
  expect(file.text.startsWith('\uFEFF"id";')).toBe(true)
  await board(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await readonly(page, writes)
})
