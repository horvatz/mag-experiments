import { test, expect, mount, click, type Page } from "../development/helpers.ts"
import { parseFavorites } from "../src/useFavorites.ts"

test("T01: Basic favorite toggle works", async ({ page }) => {
  await mount(page)
  await click(page, /Priljubljeno opravilo/)
  const button = page.getByRole("button", { name: /Priljubljeno opravilo/ })
  await expect(button).toBeVisible()
})

test("T02: Checkbox appears in table", async ({ page }) => {
  await mount(page)
  const checkbox = page.locator("input[type=checkbox]")
  await expect(checkbox).toBeVisible()
})
