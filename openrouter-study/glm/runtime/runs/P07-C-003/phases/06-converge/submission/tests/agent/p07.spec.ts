import { expect, test, mount, click, expectIds, board, readonly, project } from "../development/helpers.ts"

test("P07 favorites persist, validate, sort, and stay local", async ({ page }) => {
  const writes = await mount(page)
  await click(page, "Priljubljeno opravilo web-02")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "false")
  await expect(page.getByRole("dialog")).toHaveCount(0)

  const raw = await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))
  expect(JSON.parse(raw!)).toEqual({ version: 1, ids: ["web-02"] })

  await click(page, "Priljubljeno opravilo web-03")
  const sorted = await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))
  expect(JSON.parse(sorted!)).toEqual({ version: 1, ids: ["web-02", "web-03"] })

  await page.reload()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "true")
  await readonly(page, writes)
})

test("P07 invalid storage is ignored without rewriting the persisted value", async ({ page }) => {
  await mount(page)
  const invalid = "not-json"
  await page.evaluate((value) => localStorage.setItem("folio:favorites:v1", value), invalid)
  await page.reload()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "false")
  expect(await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(invalid)
})

test("P07 filtering, counters, views, projects, and removal stay in sync", async ({ page }) => {
  const writes = await mount(page)
  await click(page, "Priljubljeno opravilo web-03")
  await click(page, "Priljubljeno opravilo web-05")
  await page.getByRole("checkbox", { name: "Prikaži le priljubljena" }).check()
  await expectIds(page, ["web-03", "web-05"])
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 2 od 8.")

  await board(page)
  await expect(page.getByRole("region", { name: "Končano", exact: true }).locator("[data-task-id]")).toHaveCount(1)
  await expect(page.getByRole("region", { name: "V delu", exact: true }).locator("[data-task-id]")).toHaveCount(1)
  await expect(page.getByRole("region", { name: "Pripravljeno", exact: true }).locator("[data-task-id]")).toHaveCount(0)

  await project(page, "launch")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
  await expect(page.locator("[data-task-id]")).toHaveCount(2)
  await click(page, "Priljubljeno opravilo launch-01")

  await project(page, "web")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
  await click(page, "Odstrani priljubljene tega projekta")
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("folio:favorites:v1")!))
  expect(stored).toEqual({ version: 1, ids: ["launch-01"] })
  await readonly(page, writes)
})

test("P07 storage events update in memory and never write back", async ({ page }) => {
  const writes = await mount(page)
  const before = await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))
  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent("storage", {
      key: "folio:favorites:v1",
      newValue: JSON.stringify({ version: 1, ids: ["web-02", "unknown-42"] }),
    }))
  })
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  expect(await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(before)

  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent("storage", {
      key: "other:key",
      newValue: JSON.stringify({ version: 1, ids: ["web-01"] }),
    }))
  })
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-01", exact: true })).toHaveAttribute("aria-pressed", "false")

  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: "folio:favorites:v1", newValue: null }))
  })
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "false")
  expect(await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(before)
  await readonly(page, writes)
})

test("P07 narrow layout stays inside 390px and storage failures alert", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await click(page, "Priljubljeno opravilo web-02")
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 1 od 8.")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  await page.evaluate(() => {
    Object.defineProperty(window.localStorage, "setItem", {
      value: () => { throw new Error("blocked") },
    })
  })
  await click(page, "Priljubljeno opravilo web-03")
  await expect(page.getByRole("alert")).toContainText("Shramba")
  await readonly(page, writes)
})
