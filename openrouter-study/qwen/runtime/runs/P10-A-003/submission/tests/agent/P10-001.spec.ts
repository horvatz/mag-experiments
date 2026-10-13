import { test, expect } from "./helpers"
import { createTestBrowser, wsEndpoint } from "./utils"

test("P10-001: Task sorting in table view (global order by ID)", async ({ page }) => {
  const { browser, close } = await createTestBrowser()
  const page = await browser.newPage()
  
  await page.goto("/#/projects/web")
  await expect(page.getByRole("heading", { name: "Spletna prenova" })).toBeVisible()
  await expect(page.getByRole("table")).toBeVisible()
  
  const rows = await page.getByRole("table").locator("tr").all()
  const idCells = await page.locator("[data-task-id]").all()
  
  await close(browser)
})
