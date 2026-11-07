import { board, click, details, expectIds, expect, ids, mount, readonly, select, summary, table, test } from "../development/helpers.ts"

const webIds = ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"]
const navigationButtons = ["Prva stran", "Prejšnja stran", "Naslednja stran", "Zadnja stran"] as const

test("R01, R03 and R09: defaults, status and navigation bounds", async ({ page }) => {
  await mount(page)
  await expectIds(page, webIds)
  const status = page.getByRole("status", { name: "Stanje straničenja" })
  await expect(status).toHaveText("Stran 1 od 1. Prikazano 1–8 od 8.")
  for (const name of navigationButtons) await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()

  await select(page, "Velikost strani", "2")
  await expect(status).toHaveText("Stran 1 od 4. Prikazano 1–2 od 8.")
  await expect(page.getByRole("button", { name: "Prva stran" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Prejšnja stran" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Naslednja stran" })).toBeEnabled()
  await expect(page.getByRole("button", { name: "Zadnja stran" })).toBeEnabled()
  await click(page, "Naslednja stran")
  await click(page, "Zadnja stran")
  await expect(status).toHaveText("Stran 4 od 4. Prikazano 7–8 od 8.")
  await expect(page.getByRole("button", { name: "Naslednja stran" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Zadnja stran" })).toBeDisabled()
  await click(page, "Prva stran")
  await expect(status).toHaveText("Stran 1 od 4. Prikazano 1–2 od 8.")
})

test("R02 and R04: every page size covers all records once and resets page", async ({ page }) => {
  await mount(page)
  for (const size of ["2", "5", "10"] as const) {
    await select(page, "Velikost strani", size)
    const numericSize = Number(size)
    const collected: string[] = []
    for (let pageNumber = 0; pageNumber < Math.ceil(webIds.length / numericSize); pageNumber += 1) {
      const expected = webIds.slice(pageNumber * numericSize, (pageNumber + 1) * numericSize)
      await expectIds(page, expected)
      collected.push(...expected)
      if (pageNumber < Math.ceil(webIds.length / numericSize) - 1) await click(page, "Naslednja stran")
    }
    expect(collected).toEqual(webIds)
  }
  await select(page, "Velikost strani", "2")
  await click(page, "Zadnja stran")
  await select(page, "Velikost strani", "10")
  await expectIds(page, webIds)
})

test("R05: filter preserves order and resets to the first page", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  await select(page, "Filter strani", "in_progress")
  await expectIds(page, ["web-01", "web-05"])
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 1 od 1. Prikazano 1–2 od 2.")
  await select(page, "Filter strani", "all")
  await expectIds(page, ["web-01", "web-02"])
})

test("R06 and R11: both views share page IDs and counters use the right scopes", async ({ page }) => {
  const writes = await mount(page)
  await select(page, "Velikost strani", "2")
  await summary(page, [4, 2, 2])
  const tableIds = (await ids(page)).slice().sort()
  await board(page)
  await expect(page.locator(".board-todo .column-count")).toHaveText("1")
  await expect(page.locator(".board-in_progress .column-count")).toHaveText("1")
  await expect(page.locator(".board-done .column-count")).toHaveText("0")
  const boardIds = (await ids(page)).slice().sort()
  expect(boardIds).toEqual(tableIds)
  await table(page)
  await readonly(page, writes)
})

test("R07: view switch and details keep pagination state", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  await board(page)
  await expectIds(page, ["web-03", "web-04"], false)
  await details(page, "web-03")
  await expectIds(page, ["web-03", "web-04"], false)
  await table(page)
  await expectIds(page, ["web-03", "web-04"])
})

test("R08 and R12: project switch and refresh reset transient state", async ({ page }) => {
  const writes = await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  expect(page.url()).not.toMatch(/(page|size|filter)=/)
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja" }).click()
  await expectIds(page, ["launch-01", "launch-02"])
  await expect(page.getByRole("combobox", { name: "Velikost strani" })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter strani" })).toHaveValue("all")
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Spletna prenova" }).click()
  await expectIds(page, webIds)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  await page.reload()
  await expectIds(page, webIds)
  await expect(page.getByRole("combobox", { name: "Velikost strani" })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter strani" })).toHaveValue("all")
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
  await readonly(page, writes)
})

test("R10: empty project and empty filter show page zero and disable navigation", async ({ page }) => {
  await mount(page, [
    { id: "web-01", projectId: "web", title: "Edino opravilo", description: "Opis", status: "todo", assignee: "Ana Novak", dueDate: "2026-09-21" }
  ])
  await select(page, "Filter strani", "done")
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 0 od 0. Prikazano 0–0 od 0.")
  for (const name of navigationButtons) await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()
  await select(page, "Filter strani", "all")
  await expectIds(page, ["web-01"])

})

test("R10: an empty project shows page zero and disables navigation", async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 0 od 0. Prikazano 0–0 od 0.")
  for (const name of navigationButtons) await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()
})

test("R12: pagination stays within viewport on a 390 px phone", async ({ page }) => {
  await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
