import { expect, test, mount, click, expectIds, board, project, readonly, summary } from "../development/helpers.ts"


test("favorites are independent, sorted, persisted, counted and local-only", async ({ page }) => {
  const writes = await mount(page)
  const count = page.locator("[aria-label=\"Število priljubljenih\"]")
  expect(await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBeNull()
  await expect(count).toHaveText("Priljubljeno: 0 od 8.")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
  await click(page, "Priljubljeno opravilo web-03")
  await click(page, "Priljubljeno opravilo web-02")

  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-01", exact: true })).toHaveAttribute("aria-pressed", "false")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(count).toHaveText("Priljubljeno: 2 od 8.")

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("folio:favorites:v1") ?? "null"))
  expect(stored).toEqual({ version: 1, ids: ["web-02", "web-03"] })
  expect(JSON.stringify(stored)).not.toContain("title")

  await page.reload()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(count).toHaveText("Priljubljeno: 2 od 8.")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
  await readonly(page, writes)
})

test("invalid favorite storage starts empty without a rewrite", async ({ page }) => {
  await mount(page)
  const invalidValues = ["not-json", JSON.stringify({ version: 2, ids: ["web-02"] }), JSON.stringify({ version: 1 }), JSON.stringify({ version: 1, ids: [2] })]
  const count = page.locator("[aria-label=\"Število priljubljenih\"]")

  for (const value of invalidValues) {
    await page.evaluate((nextValue: string) => localStorage.setItem("folio:favorites:v1", nextValue), value)
    await page.reload()
    await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
    await expect(count).toHaveText("Priljubljeno: 0 od 8.")
    await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "false")
    await expect(page.getByRole("alert")).toHaveCount(0)
    expect(await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(value)
  }
})

test("filter, empty state, project counters and project-specific removal work", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("folio:favorites:v1", JSON.stringify({ version: 1, ids: ["launch-01", "unknown-x", "web-02", "web-02"] })))
  const writes = await mount(page)
  const filter = page.getByRole("checkbox", { name: "Prikaži le priljubljena" })
  const count = page.locator("[aria-label=\"Število priljubljenih\"]")

  await expect(count).toHaveText("Priljubljeno: 1 od 8.")
  await expect(page.getByRole("button", { name: "Odstrani priljubljene tega projekta", exact: true })).toBeEnabled()
  await filter.check()
  await expectIds(page, ["web-02"])
  await summary(page, [1, 0, 0])
  await expect(count).toHaveText("Priljubljeno: 1 od 8.")

  await click(page, "Priljubljeno opravilo web-02")
  await expectIds(page, [])
  await expect(page.getByText("Ni priljubljenih opravil.", { exact: true })).toBeVisible()
  await expect(filter).toBeEnabled()
  await expect(count).toHaveText("Priljubljeno: 0 od 8.")
  await expect(page.getByRole("button", { name: "Odstrani priljubljene tega projekta", exact: true })).toBeDisabled()

  await filter.uncheck()
  await expectIds(page, ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"])
  await click(page, "Priljubljeno opravilo web-02")
  await page.getByRole("button", { name: "Odstrani priljubljene tega projekta", exact: true }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("folio:favorites:v1") ?? "null"))).toEqual({ version: 1, ids: ["launch-01", "unknown-x"] })

  await project(page, "launch")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
  await expect(count).toHaveText("Priljubljeno: 1 od 2.")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo launch-01", exact: true })).toHaveAttribute("aria-pressed", "true")
  await readonly(page, writes)
})

test("both views share favorites, filter and ID-based details", async ({ page }) => {
  const writes = await mount(page)
  await click(page, "Priljubljeno opravilo web-02")
  await board(page)
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("checkbox", { name: "Prikaži le priljubljena" }).check()
  await expectIds(page, ["web-02"])
  await page.getByRole("button", { name: "Preglednica", exact: true }).click()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expectIds(page, ["web-02"])
  await page.locator("[data-task-id=\"web-02\"]").getByRole("link").click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByRole("dialog").getByText("web-02", { exact: true }).first()).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await readonly(page, writes)
})

test("storage events validate the exact key and do not write back", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("folio:favorites:v1", JSON.stringify({ version: 1, ids: ["web-03"] })))
  await mount(page)
  const count = page.locator("[aria-label=\"Število priljubljenih\"]")

  await page.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "other-key", newValue: JSON.stringify({ version: 1, ids: ["web-02"] }) })))
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "true")

  await page.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "folio:favorites:v1", newValue: JSON.stringify({ version: 1, ids: ["web-02", "web-02"] }) })))
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(count).toHaveText("Priljubljeno: 1 od 8.")
  expect(await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(JSON.stringify({ version: 1, ids: ["web-03"] }))

  await page.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "folio:favorites:v1", newValue: "not-json" })))
  await expect(count).toHaveText("Priljubljeno: 0 od 8.")

  await page.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "folio:favorites:v1", newValue: null })))
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "false")
})

test("unreadable storage leaves an alert and keeps favorites in memory", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() { throw new Error("unavailable") },
    })
  })
  const writes = await mount(page)
  await expect(page.getByRole("alert")).toContainText(/shramba/i)
  await click(page, "Priljubljeno opravilo web-02")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.locator("[aria-label=\"Število priljubljenih\"]")).toHaveText("Priljubljeno: 1 od 8.")
  await readonly(page, writes)
})

test("new controls stay within the narrow layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.setItem("folio:favorites:v1", JSON.stringify({ version: 1, ids: ["web-02"] })))
  await mount(page)
  await page.getByRole("checkbox", { name: "Prikaži le priljubljena" }).check()
  await expectIds(page, ["web-02"])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  await board(page)
  await expectIds(page, ["web-02"])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
