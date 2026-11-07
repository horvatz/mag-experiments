import { board, click, details, expect, expectIds, mount, project, readonly, test } from "../development/helpers.ts"


test("R01 and R12: favorites are independent in both views and stay local", async ({ page }) => {
  const writes = await mount(page)
  await click(page, "Priljubljeno opravilo web-02")

  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "false")
  await expect(page.getByRole("dialog")).toHaveCount(0)

  await board(page)
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.locator(".board-favorite")).toHaveCount(8)
  await readonly(page, writes)
})

test("R02 and R03: storage is normalized, sorted, and preserves unknown IDs", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("folio:favorites:v1", JSON.stringify({ version: 1, ids: ["web-03", "unknown", "web-03"] }))
  })
  const writes = await mount(page)

  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.locator("[data-task-id='unknown']")).toHaveCount(0)
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 1 od 8.")
  await expect.poll(() => page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toEqual(JSON.stringify({ version: 1, ids: ["web-03", "unknown", "web-03"] }))

  await click(page, "Priljubljeno opravilo web-03")
  await expect.poll(() => page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toEqual(JSON.stringify({ version: 1, ids: ["unknown"] }))
  await readonly(page, writes)
})

for (const invalid of [
  "not-json",
  JSON.stringify({ version: 2, ids: ["web-01"] }),
  JSON.stringify({ version: 1 }),
  JSON.stringify({ version: 1, ids: ["web-01", 2] }),
]) {
  test(`R04: invalid storage is ignored without rewrite: ${invalid}`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem("folio:favorites:v1", value)
    }, invalid)
    await mount(page)

    await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 0 od 8.")
    await expect(page.locator("[aria-pressed='true'].favorite-button")).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toEqual(invalid)
  })
}

test("R05, R06 and R10: filtering removes a favorite immediately and keeps the project count", async ({ page }) => {
  await mount(page)
  await click(page, "Priljubljeno opravilo web-02")
  const filter = page.getByRole("checkbox", { name: "Prikaži le priljubljena" })
  await expect(filter).not.toBeChecked()
  await filter.check()

  await expectIds(page, ["web-02"])
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 1 od 8.")
  await click(page, "Priljubljeno opravilo web-02")

  await expectIds(page, [])
  await expect(page.getByText("Ni priljubljenih opravil.", { exact: true })).toBeVisible()
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 0 od 8.")
  await filter.uncheck()
  await expectIds(page, ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"])
})

test("R07 and R08: views share state, project switch resets only the filter", async ({ page }) => {
  await mount(page)
  await click(page, "Priljubljeno opravilo web-02")
  await page.getByRole("checkbox", { name: "Prikaži le priljubljena" }).check()

  await board(page)
  await expectIds(page, ["web-02"])
  await page.getByRole("button", { name: "Preglednica", exact: true }).click()
  await expectIds(page, ["web-02"])
  await details(page, "web-02")

  await project(page, "launch")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 0 od 2.")
  await project(page, "web")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()

  await page.reload()
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("checkbox", { name: "Prikaži le priljubljena" })).not.toBeChecked()
})

test("R09: project removal preserves foreign and unknown IDs", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("folio:favorites:v1", JSON.stringify({ version: 1, ids: ["unknown", "web-02", "launch-01"] }))
  })
  await mount(page)

  await expect(page.getByRole("button", { name: "Odstrani priljubljene tega projekta", exact: true })).toBeEnabled()
  await click(page, "Odstrani priljubljene tega projekta")
  await expect(page.getByRole("button", { name: "Odstrani priljubljene tega projekta", exact: true })).toBeDisabled()
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 0 od 8.")
  await expect.poll(() => page.evaluate(() => localStorage.getItem("folio:favorites:v1"))).toEqual(JSON.stringify({ version: 1, ids: ["launch-01", "unknown"] }))
})

test("R10: board column counts follow visible filtered tasks", async ({ page }) => {
  await mount(page)
  await click(page, "Priljubljeno opravilo web-02")
  await click(page, "Priljubljeno opravilo web-03")
  await click(page, "Priljubljeno opravilo web-05")
  await page.getByRole("checkbox", { name: "Prikaži le priljubljena" }).check()
  await board(page)

  await expect(page.locator(".column-count")).toHaveText(["1", "1", "1"])
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 3 od 8.")
})

test("R11: storage events validate values and never write back", async ({ page }) => {
  await mount(page)
  const writes = await page.evaluate(() => {
    const original = localStorage.setItem.bind(localStorage)
    const calls: unknown[] = []
    localStorage.setItem = (...args: Parameters<typeof original>) => {
      calls.push(args)
      return original(...args)
    }
    window.dispatchEvent(new StorageEvent("storage", {
      key: "folio:favorites:v1",
      newValue: JSON.stringify({ version: 1, ids: ["web-02", "web-02", 3] }),
    }))
    return calls
  })

  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "false")
  await expect(writes).toEqual([])

  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent("storage", {
      key: "other-key",
      newValue: JSON.stringify({ version: 1, ids: ["web-02"] }),
    }))
  })
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "false")
})

test("R11: unavailable storage keeps favorites usable in memory with an alert", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.getItem = () => { throw new Error("unavailable") }
    localStorage.setItem = () => { throw new Error("unavailable") }
  })
  await mount(page)

  await expect(page.getByRole("alert")).toContainText(/shramba/i)
  await click(page, "Priljubljeno opravilo web-02")
  await expect(page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("alert")).toContainText(/shramba/i)
  await expect(page.getByRole("status", { name: "Število priljubljenih" })).toHaveText("Priljubljeno: 1 od 8.")
})
