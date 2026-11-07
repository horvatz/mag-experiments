import { test, board, click, columnIds, details, expect, expectIds, mount, project, readonly, summary, table, webIds, makeTask, type Task } from "../development/helpers.ts"
import type { Page } from "@playwright/test"

const history = (page: Page) => page.getByRole("status", { name: "Zgodovina vrstnega reda" })

test("R01/R02/R03: initial order, global moves, and boundaries", async ({ page }) => {
  await mount(page)
  await expectIds(page, webIds())
  await expect(page.locator("[data-task-id] .task-rank")).toHaveText(["1", "2", "3", "4", "5", "6", "7", "8"])
  await expect(page.locator("[data-task-id=web-02]").getByRole("link")).toHaveAccessibleName("Pregled vsebine web-02")

  await click(page, "Premakni web-02 gor")
  await expectIds(page, ["web-02", "web-01", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"])
  await expect(page.getByLabel("Mesto opravila web-02", { exact: true })).toHaveText("1")
  await expect(page.locator("[data-task-id=web-02] .status-badge")).toHaveText("Pripravljeno")
  await expect(page.locator("[data-task-id=web-01] .status-badge")).toHaveText("V delu")
  await summary(page, [4, 2, 2])

  await expect(page.getByRole("button", { name: "Premakni web-02 gor", exact: true })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Premakni web-08 dol", exact: true })).toBeDisabled()
  await expect(history(page)).toHaveText("Razveljavitve: 1. Ponovitve: 0.")
})

test("R04/R05/R06/R08: undo, redo, redo invalidation, and reset", async ({ page }) => {
  await mount(page)
  await click(page, "Premakni web-02 gor")
  await click(page, "Premakni web-03 gor")
  await click(page, "Premakni web-04 gor")
  await expect(history(page)).toHaveText("Razveljavitve: 3. Ponovitve: 0.")

  await click(page, "Razveljavi premik")
  await click(page, "Razveljavi premik")
  await expectIds(page, ["web-02", "web-01", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"])
  await expect(history(page)).toHaveText("Razveljavitve: 1. Ponovitve: 2.")

  await click(page, "Ponovi premik")
  await expectIds(page, ["web-02", "web-03", "web-01", "web-04", "web-05", "web-06", "web-07", "web-08"])
  await click(page, "Ponovi premik")
  await expect(history(page)).toHaveText("Razveljavitve: 3. Ponovitve: 0.")

  await click(page, "Razveljavi premik")
  await click(page, "Premakni web-02 dol")
  await expect(page.getByRole("button", { name: "Ponovi premik", exact: true })).toBeDisabled()
  await expect(history(page)).toHaveText("Razveljavitve: 3. Ponovitve: 0.")

  await click(page, "Začetni vrstni red")
  await expectIds(page, webIds())
  await click(page, "Razveljavi premik")
  await expectIds(page, ["web-03", "web-02", "web-01", "web-04", "web-05", "web-06", "web-07", "web-08"])
  await click(page, "Začetni vrstni red")
  await expectIds(page, webIds())
  await expect(page.getByRole("button", { name: "Začetni vrstni red", exact: true })).toBeDisabled()
})

test("R07: undo history is capped at 20 and redo remains complete", async ({ page }) => {
  const records = Array.from({ length: 22 }, (_, index) => makeTask(`web-${String(index + 1).padStart(2, "0")}`))
  await mount(page, records)
  for (let move = 0; move < 21; move += 1) await click(page, "Premakni web-01 dol")
  await expect(history(page)).toHaveText("Razveljavitve: 20. Ponovitve: 0.")
  for (let undo = 0; undo < 20; undo += 1) await click(page, "Razveljavi premik")
  await expect(history(page)).toHaveText("Razveljavitve: 0. Ponovitve: 20.")
  for (let redo = 0; redo < 20; redo += 1) await click(page, "Ponovi premik")
  await expect(history(page)).toHaveText("Razveljavitve: 20. Ponovitve: 0.")
  await expectIds(page, [...records.slice(1).map((task) => task.id), "web-01"])
})

test("R11: empty project remains usable", async ({ page }) => {
  await mount(page, [])
  await expect(page.getByText("V tem projektu še ni opravil")).toBeVisible()
  await expect(history(page)).toHaveText("Razveljavitve: 0. Ponovitve: 0.")
  await expect(page.getByRole("button", { name: "Razveljavi premik", exact: true })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Ponovi premik", exact: true })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Začetni vrstni red", exact: true })).toBeDisabled()
})

test("R11: a single-task project has no valid move", async ({ page }) => {
  const single: Task[] = [makeTask("solo-01", { status: "in_progress" })]
  await mount(page, single, "#/projects/web?view=board")
  await expectIds(page, ["solo-01"])
  await expect(page.getByRole("button", { name: "Premakni solo-01 gor", exact: true })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Premakni solo-01 dol", exact: true })).toBeDisabled()
  await summary(page, [0, 1, 0])
  await expect(page.getByRole("button", { name: "Začetni vrstni red", exact: true })).toBeDisabled()
})

test("R09/R10: board uses global neighbors and state survives views and details", async ({ page }) => {
  const writes = await mount(page)
  await click(page, "Premakni web-02 gor")
  await board(page)
  await columnIds(page, "Pripravljeno", ["web-02", "web-04", "web-07", "web-08"])
  await columnIds(page, "V delu", ["web-01", "web-05"])
  await columnIds(page, "Končano", ["web-03", "web-06"])
  await click(page, "Premakni web-02 dol")
  await expect(page.getByLabel("Mesto opravila web-02", { exact: true })).toHaveText("2")
  await columnIds(page, "Pripravljeno", ["web-02", "web-04", "web-07", "web-08"])
  await table(page)
  await expectIds(page, webIds())
  await expect(history(page)).toHaveText("Razveljavitve: 2. Ponovitve: 0.")
  await details(page, "web-02")
  await expect(history(page)).toHaveText("Razveljavitve: 2. Ponovitve: 0.")
  await project(page, "launch")
  await expectIds(page, ["launch-01", "launch-02"])
  await expect(history(page)).toHaveText("Razveljavitve: 0. Ponovitve: 0.")
  await project(page, "web")
  await expectIds(page, webIds())
  await expect(history(page)).toHaveText("Razveljavitve: 0. Ponovitve: 0.")
  await readonly(page, writes)
  await page.reload()
  await expectIds(page, webIds())
  await expect(history(page)).toHaveText("Razveljavitve: 0. Ponovitve: 0.")
})

test("R12: local order is read-only and remains a permutation on mobile", async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await click(page, "Premakni web-01 dol")
  await click(page, "Premakni web-05 gor")
  const ordered = await page.locator("[data-task-id]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-task-id")))
  expect([...ordered].sort()).toEqual([...webIds()].sort())
  await readonly(page, writes)
  await summary(page, [4, 2, 2])
})
