
import { click, expectIds, ids, makeTask, mount, select, summary, test, expect, type Task } from "../development/helpers.ts"

const statuses = ["todo", "in_progress", "done"] as const

const elevenTasks: Task[] = Array.from({ length: 11 }, (_, index) => makeTask(`web-${String(index + 1).padStart(2, "0")}`, {
  status: statuses[index % statuses.length],
}))

test("R01-R04: pagination covers every task and resets when the page size changes", async ({ page }) => {
  await mount(page, elevenTasks)
  await expect(page.getByRole("combobox", { name: "Velikost strani" })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter strani" })).toHaveValue("all")
  await expectIds(page, elevenTasks.map((task) => task.id))
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 1 od 1. Prikazano 1–11 od 11.")

  await select(page, "Velikost strani", "2")
  await expectIds(page, ["web-01", "web-02"])
  await expect(page.getByRole("button", { name: "Prva stran" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Prejšnja stran" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Naslednja stran" })).toBeEnabled()
  await expect(page.getByRole("button", { name: "Zadnja stran" })).toBeEnabled()

  const pages: string[][] = []
  for (let pageIndex = 0; pageIndex < 6; pageIndex += 1) {
    pages.push((await ids(page)).filter((id): id is string => id !== null))
    if (pageIndex < 5) await click(page, "Naslednja stran")
  }
  expect(pages.flat()).toEqual(elevenTasks.map((task) => task.id))
  expect(new Set(pages.flat()).size).toBe(11)
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 6 od 6. Prikazano 11–11 od 11.")
  await expect(page.getByRole("button", { name: "Prva stran" })).toBeEnabled()
  await expect(page.getByRole("button", { name: "Prejšnja stran" })).toBeEnabled()
  await expect(page.getByRole("button", { name: "Naslednja stran" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Zadnja stran" })).toBeDisabled()

  await select(page, "Velikost strani", "5")
  await expectIds(page, ["web-01", "web-02", "web-03", "web-04", "web-05"])
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 1 od 3. Prikazano 1–5 od 11.")
})

test("R05 and R09: filtering preserves source order and resets the page", async ({ page }) => {
  const records = [
    makeTask("web-01", { status: "in_progress" }),
    makeTask("web-02", { status: "todo" }),
    makeTask("web-03", { status: "done" }),
    makeTask("web-04", { status: "todo", assignee: "Maja Zupan" }),
    makeTask("web-05", { status: "in_progress", assignee: "Maja Zupan" }),
    makeTask("web-06", { status: "done", assignee: "Živa Kovač" }),
  ]
  await mount(page, records)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  await select(page, "Filter strani", "done")
  await expectIds(page, ["web-03", "web-06"])
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 1 od 1. Prikazano 1–2 od 2.")

  const expectedFilters = {
    all: ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06"],
    todo: ["web-02", "web-04"],
    in_progress: ["web-01", "web-05"],
    done: ["web-03", "web-06"],
  }
  await select(page, "Velikost strani", "5")
  for (const [filter, expectedIds] of Object.entries(expectedFilters)) {
    await select(page, "Filter strani", filter)
    const firstPageIds = expectedIds.slice(0, 5)
    const pageCount = Math.ceil(expectedIds.length / 5)
    await expectIds(page, firstPageIds)
    await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText(`Stran 1 od ${pageCount}. Prikazano 1–${firstPageIds.length} od ${expectedIds.length}.`)
  }
})

test("R06 and R07: both views share the page and details preserve pagination", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  await click(page, "Naslednja stran")
  await expectIds(page, ["web-05", "web-06"])
  const status = page.getByRole("status", { name: "Stanje straničenja" })
  const expectedStatus = "Stran 3 od 4. Prikazano 5–6 od 8."
  await expect(status).toHaveText(expectedStatus)

  await click(page, "Tabla")
  expect((await ids(page)).sort()).toEqual(["web-05", "web-06"])
  await page.locator("[data-task-id=web-06]").getByRole("link").click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: "Zapri podrobnosti" }).click()
  await expect(status).toHaveText(expectedStatus)
  expect((await ids(page)).sort()).toEqual(["web-05", "web-06"])

  await click(page, "Preglednica")
  await expect(status).toHaveText(expectedStatus)
  await expectIds(page, ["web-05", "web-06"])
  await page.locator("[data-task-id=web-05]").getByRole("link").click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(status).toHaveText(expectedStatus)
  await expectIds(page, ["web-05", "web-06"])
})

test("R08: project change and refresh reset state without URL or storage persistence", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Zadnja stran")
  await select(page, "Filter strani", "todo")
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja" }).click()
  await expect(page.getByRole("combobox", { name: "Velikost strani" })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter strani" })).toHaveValue("all")
  await expectIds(page, ["launch-01", "launch-02"])
  expect(page.url()).not.toContain("size")
  expect(page.url()).not.toContain("filter")
  expect(page.url()).not.toContain("page")

  await select(page, "Velikost strani", "2")
  await select(page, "Filter strani", "done")
  await page.reload()
  await expect(page.getByRole("combobox", { name: "Velikost strani" })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter strani" })).toHaveValue("all")
  await expectIds(page, ["launch-01", "launch-02"])
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test("R10: empty projects and empty filters show page zero and disable all movement", async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 0 od 0. Prikazano 0–0 od 0.")
  for (const name of ["Prva stran", "Prejšnja stran", "Naslednja stran", "Zadnja stran"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()
  }

})

test("R10: empty filters show page zero and return to the first page", async ({ page }) => {
  await mount(page, [makeTask("web-only", { status: "todo" })])
  await select(page, "Velikost strani", "2")
  await select(page, "Filter strani", "done")
  await expect(page.locator("[data-task-id]")).toHaveCount(0)
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 0 od 0. Prikazano 0–0 od 0.")
  for (const name of ["Prva stran", "Prejšnja stran", "Naslednja stran", "Zadnja stran"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()
  }
  await select(page, "Filter strani", "all")
  await expectIds(page, ["web-only"])
  await expect(page.getByRole("status", { name: "Stanje straničenja" })).toHaveText("Stran 1 od 1. Prikazano 1–1 od 1.")
})

test("R11: project summary stays global while board columns count the page", async ({ page }) => {
  await mount(page, elevenTasks)
  await expect(page.locator(".count-badge")).toHaveText("11")
  await summary(page, [4, 4, 3])
  await select(page, "Velikost strani", "2")
  await click(page, "Tabla")
  await expect(page.locator(".board-column .column-count")).toHaveText(["1", "1", "0"])
  await click(page, "Naslednja stran")
  await expect(page.locator(".board-column .column-count")).toHaveText(["1", "0", "1"])
  await summary(page, [4, 4, 3])
  await expect(page.locator(".count-badge")).toHaveText("11")
})

test("R12: pagination keeps details, avoids writes and fits a 390 px viewport", async ({ page }) => {
  const writes = await mount(page)
  await select(page, "Velikost strani", "5")
  await click(page, "Naslednja stran")
  await page.locator("[data-task-id=web-06]").getByRole("link").click()
  await expect(page.getByRole("dialog").getByText("Živa Kovač", { exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await click(page, "Tabla")
  await expect(page.getByRole("region", { name: "Tabla opravil" })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  expect(writes).toEqual([])
  const state = await page.request.get("/__test/state")
  expect((await state.json()).saveRequests).toBe(0)
})
