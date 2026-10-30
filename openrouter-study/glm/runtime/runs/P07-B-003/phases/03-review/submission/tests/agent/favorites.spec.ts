import { expect, test, mount, click, board, table, project, details, expectIds, webIds } from "../development/helpers.ts"

test("R01 to R04: toggling writes valid sorted storage and invalid storage reads empty", async ({ page }) => {
  await mount(page)
  await click(page, "Priljubljeno opravilo web-03")
  await click(page, "Priljubljeno opravilo web-02")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-04", exact: true })).toHaveAttribute("aria-pressed", "false")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(JSON.stringify({ version: 1, ids: ["web-02", "web-03"] }))
  await page.reload()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "true")
})

const invalidStorageValues = [
  "not-json",
  JSON.stringify({ version: 2, ids: ["web-02"] }),
  JSON.stringify({ version: 1 }),
  JSON.stringify({ version: 1, ids: ["web-02", 3] }),
]

for (const value of invalidStorageValues) {
  test(`R04: invalid storage is ignored without rewriting ${invalidStorageValues.indexOf(value) + 1}`, async ({ page }) => {
    await mount(page)
    await page.evaluate((stored) => localStorage.setItem("folio:favorites:v1", stored), value)
    await page.reload()
    await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
    for (const id of webIds()) {
      await expect(page.getByRole("button", { name: `Priljubljeno opravilo ${id}`, exact: true })).toHaveAttribute("aria-pressed", "false")
    }
    expect(await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(value)
  })
}

test("R04: missing storage key starts empty", async ({ page }) => {
  await mount(page)
  await page.evaluate(() => localStorage.removeItem("folio:favorites:v1"))
  await page.reload()
  await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-01", exact: true })).toHaveAttribute("aria-pressed", "false")
  expect(await page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBeNull()
})

test("R03: duplicate and unknown IDs are normalized but unknown IDs remain stored", async ({ page }) => {
  await mount(page)
  const stored = JSON.stringify({ version: 1, ids: ["web-02", "web-02", "unknown-01"] })
  await page.evaluate((value) => localStorage.setItem("folio:favorites:v1", value), stored)
  await page.reload()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await click(page, "Priljubljeno opravilo web-02")
  await expect.poll(() => page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(JSON.stringify({ version: 1, ids: ["unknown-01"] }))
  await expect(page.locator("[data-task-id=unknown-01]")).toHaveCount(0)
})

test("R05 to R07: filter, empty state, view parity, counters and details", async ({ page }) => {
  await mount(page)
  const allIds = await page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-task-id") ?? ""))
  const checkbox = page.getByRole("checkbox", { name: "Prikaži le priljubljena" })
  await expect(checkbox).not.toBeChecked()
  await click(page, "Priljubljeno opravilo web-02")
  await checkbox.check()
  await expectIds(page, ["web-02"])
  await expect(page.locator(`[role="status"][aria-label="Število priljubljenih"]`)).toHaveText("Priljubljeno: 1 od 8.")
  await click(page, "Priljubljeno opravilo web-02")
  await expect(page.getByText("Ni priljubljenih opravil.", { exact: true })).toBeVisible()
  await checkbox.uncheck()
  await expectIds(page, allIds)
  await click(page, "Priljubljeno opravilo web-02")
  await checkbox.check()
  await board(page)
  await expectIds(page, ["web-02"])
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await details(page, "web-02")
  await table(page)
  await details(page, "web-02")
})

test("R08: project switch and refresh keep global favorites and reset filter", async ({ page }) => {
  await mount(page, undefined, "#/projects/web")
  await click(page, "Priljubljeno opravilo web-02")
  await project(page, "launch")
  await click(page, "Priljubljeno opravilo launch-01")
  await page.getByRole("checkbox", { name: "Prikaži le priljubljena" }).check()
  await project(page, "web")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await project(page, "launch")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo launch-01", exact: true })).toHaveAttribute("aria-pressed", "true")
  await page.reload()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo launch-01", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
  await expect.poll(() => page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(JSON.stringify({ version: 1, ids: ["launch-01", "web-02"] }))
})

test("R09: project removal keeps other and unknown IDs", async ({ page }) => {
  await mount(page)
  await page.evaluate(() => localStorage.setItem("folio:favorites:v1", JSON.stringify({ version: 1, ids: ["launch-01", "unknown-01", "web-02", "web-03"] })))
  await page.reload()
  const remove = page.getByRole("button", { name: "Odstrani priljubljene tega projekta", exact: true })
  await expect(remove).toBeEnabled()
  await remove.click()
  await expect.poll(() => page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toBe(JSON.stringify({ version: 1, ids: ["launch-01", "unknown-01"] }))
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "false")
})

test("R10: status and column counters follow visible tasks", async ({ page }) => {
  await mount(page)
  await click(page, "Priljubljeno opravilo web-02")
  await click(page, "Priljubljeno opravilo web-03")
  await page.getByRole("checkbox", { name: "Prikaži le priljubljena" }).check()
  await expect(page.locator(`[aria-label="Pregled stanj opravil"] strong`)).toHaveText(["1", "0", "1"])
  await expect(page.locator(".count-badge")).toHaveText("2")
  await board(page)
  await expect(page.locator(".column-count").filter({ hasText: "1" })).toHaveCount(2)
  await expect(page.locator(".column-count").filter({ hasText: "0" })).toHaveCount(1)
  await table(page)
  await expect(page.locator(".table-footer")).toContainText("1 / 2 končanih")
})

test("R11: storage events sync only the favorite key without writing", async ({ page }) => {
  const writes = await mount(page)
  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: "other-key", newValue: JSON.stringify({ version: 1, ids: ["web-01"] }) }))
    window.dispatchEvent(new StorageEvent("storage", { key: "folio:favorites:v1", newValue: JSON.stringify({ version: 1, ids: ["web-02", "web-04"] }) }))
  })
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-01", exact: true })).toHaveAttribute("aria-pressed", "false")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-04", exact: true })).toHaveAttribute("aria-pressed", "true")
  expect(writes).toEqual([])
  await page.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "folio:favorites:v1", newValue: null })))
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-04", exact: true })).toHaveAttribute("aria-pressed", "false")
  expect(writes).toEqual([])
})

test("R11: storage failure keeps in-memory state usable and shows an alert", async ({ page }) => {
  await mount(page)
  await page.evaluate(() => {
    Object.defineProperty(window.localStorage, "setItem", {
      configurable: true,
      value: () => { throw new Error("quota") },
    })
  })
  await click(page, "Priljubljeno opravilo web-02")
  await expect(page.getByRole("alert").filter({ hasText: /shramba/i })).toBeVisible()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await click(page, "Priljubljeno opravilo web-03")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "true")
})

test("R12: favorite actions send no API writes and narrow layout does not overflow", async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await click(page, "Priljubljeno opravilo web-02")
  await page.getByRole("checkbox", { name: "Prikaži le priljubljena" }).check()
  await board(page)
  await click(page, "Priljubljeno opravilo web-02")
  await table(page)
  expect(writes).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
