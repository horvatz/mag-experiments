import { test } from "@playwright/test"
import { board, expect, expectIds, makeTask, mount, readonly, select, summary, table, type Task } from "../development/helpers.ts"

const edgeTasks: Task[] = [
  makeTask("done-old", { status: "done", dueDate: "2026-09-20" }),
  makeTask("open-old", { status: "in_progress", dueDate: "2026-09-20" }),
  makeTask("open-today", { dueDate: "2026-09-21" }),
  makeTask("open-day-one", { dueDate: "2026-09-22" }),
  makeTask("open-day-seven", { status: "in_progress", dueDate: "2026-09-28" }),
  makeTask("open-later", { dueDate: "2026-10-01" }),
  makeTask("done-today", { status: "done", dueDate: "2026-09-21" }),
  makeTask("done-later", { status: "done", dueDate: "2026-10-01" }),
  makeTask("open-leap-one", { dueDate: "2024-02-28" }),
  makeTask("open-leap-three", { status: "in_progress", dueDate: "2024-03-01" }),
  makeTask("open-year-one", { dueDate: "2026-01-01" }),
  makeTask("open-year-seven", { status: "in_progress", dueDate: "2026-01-07" }),
]

test("P08 classification, counters and calendar boundaries", async ({ page }) => {
  await mount(page, edgeTasks)
  const date = page.getByLabel("Referenčni datum", { exact: true })
  const group = page.getByLabel("Pogled rokov", { exact: true })
  await expect(date).toHaveValue("2026-09-21")
  await expect(group).toHaveValue("all")
  await expectIds(page, edgeTasks.map((task) => task.id))
  await summary(page, [5, 1, 2, 1, 3])

  const groups: [string, string[]][] = [
    ["overdue", ["open-old", "open-leap-one", "open-leap-three", "open-year-one", "open-year-seven"]],
    ["today", ["open-today"]],
    ["week", ["open-day-one", "open-day-seven"]],
    ["later", ["open-later"]],
    ["done", ["done-old", "done-today", "done-later"]],
  ]
  for (const [value, ids] of groups) {
    await select(page, "Pogled rokov", value)
    await expectIds(page, ids)
    await summary(page, [5, 1, 2, 1, 3])
  }

  await date.fill("2024-02-27")
  await select(page, "Pogled rokov", "week")
  await expectIds(page, ["open-leap-one", "open-leap-three"])
  await summary(page, [0, 0, 2, 7, 3])
  await date.fill("2025-12-31")
  await expectIds(page, ["open-year-one", "open-year-seven"])
  await summary(page, [2, 0, 2, 5, 3])
})

test("P08 invalid draft preserves last valid state", async ({ page }) => {
  await mount(page)
  const date = page.getByLabel("Referenčni datum", { exact: true })
  await select(page, "Pogled rokov", "overdue")
  await expectIds(page, ["web-01", "web-07"])
  await date.fill("")
  await expect(page.getByRole("alert")).toHaveText("Vnesi veljaven referenčni datum.")
  await expectIds(page, ["web-01", "web-07"])
  await board(page)
  await expectIds(page, ["web-01", "web-07"], false)
  await date.fill("2026-09-20")
  await expect(page.getByRole("alert")).toHaveCount(0)
  await expectIds(page, ["web-01"])
  await table(page)
  await select(page, "Pogled rokov", "later")
  await expectIds(page, ["web-04", "web-05", "web-08"])
})

test("P08 view switch preserves date and selected group", async ({ page }) => {
  await mount(page)
  const date = page.getByLabel("Referenčni datum", { exact: true })
  const group = page.getByLabel("Pogled rokov", { exact: true })
  await date.fill("2026-09-22")
  await select(page, "Pogled rokov", "overdue")
  await board(page)
  await expectIds(page, ["web-01", "web-07"], false)
  await expect(date).toHaveValue("2026-09-22")
  await expect(group).toHaveValue("overdue")
  await table(page)
  await expectIds(page, ["web-01", "web-07"])
  await expect(date).toHaveValue("2026-09-22")
  await expect(group).toHaveValue("overdue")
})

test("P08 project change and refresh reset local state", async ({ page }) => {
  const records = [makeTask("web-only"), makeTask("launch-only", { projectId: "launch", dueDate: "2026-09-25" })]
  await mount(page, records)
  await page.getByLabel("Referenčni datum", { exact: true }).fill("2026-10-01")
  await select(page, "Pogled rokov", "later")
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja" }).click()
  await expect(page.getByLabel("Referenčni datum", { exact: true })).toHaveValue("2026-09-21")
  await expect(page.getByLabel("Pogled rokov", { exact: true })).toHaveValue("all")
  await page.reload()
  await expect(page.getByLabel("Referenčni datum", { exact: true })).toHaveValue("2026-09-21")
  await expect(page.getByLabel("Pogled rokov", { exact: true })).toHaveValue("all")
  const storage = await page.evaluate(() => Object.entries(window.localStorage))
  expect(storage.filter(([key]) => /date|group|filter|rok/i.test(key))).toEqual([])
  expect(await page.evaluate(() => window.location.search)).toBe("")
})

test("P08 empty project", async ({ page }) => {
  await mount(page, [])
  await summary(page, [0, 0, 0, 0, 0])
  await select(page, "Pogled rokov", "today")
  await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil" })).toBeVisible()
  await select(page, "Pogled rokov", "all")
  await expect(page.getByRole("heading", { name: "Ni opravil v izbrani skupini." })).toHaveCount(0)
})

test("P08 selected empty group in non-empty project", async ({ page }) => {
  await mount(page)
  await select(page, "Pogled rokov", "today")
  await expect(page.getByRole("heading", { name: "Ni opravil v izbrani skupini." })).toBeVisible()
  await select(page, "Pogled rokov", "all")
  await expectIds(page, ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"])
})

test("P08 readonly behavior, details and 390 px layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await select(page, "Pogled rokov", "done")
  await board(page)
  await expectIds(page, ["web-03", "web-06"])
  await page.locator("[data-task-id=\"web-06\"]").getByRole("link").click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: "Zapri podrobnosti" }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  expect(writes).toEqual([])
  await readonly(page, writes)
})
