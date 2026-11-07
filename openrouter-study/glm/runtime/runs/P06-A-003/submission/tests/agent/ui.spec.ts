import { board, downloadCSV, expect, expectIds, mount, project, select, test } from "../development/helpers.ts"
import { examples } from "../development/helpers.ts"

const webIds = examples.filter((task) => task.projectId === "web").map((task) => task.id)

test("exports current project in source order with defaults", async ({ page }) => {
  await mount(page)
  const noPopup = page.waitForEvent("popup", { timeout: 1000 }).catch(() => null)
  const file = await downloadCSV(page)
  expect(await noPopup).toBeNull()
  expect(file.name).toBe("folio-web.csv")
  expect(file.text.startsWith("\uFEFF\"id\";\"projectId\";\"title\";\"status\";\"assignee\";\"dueDate\";\"description\"\r\n")).toBe(true)
  const exportedIds = [...file.text.matchAll(/^"([^"]+)";/gm)].map((match) => match[1])
  expect(exportedIds).toEqual(webIds)
})

test("blocks export without columns and after an empty filter", async ({ page }) => {
  await mount(page, [{ ...examples[0], id: "only-todo", projectId: "web", status: "todo" }])
  await select(page, "Filter izvoza", "in_progress")
  const exportButton = page.getByRole("button", { name: "Izvozi CSV", exact: true })
  await expect(exportButton).toBeDisabled()
  await select(page, "Filter izvoza", "all")
  await expect(exportButton).toBeEnabled()
  for (const column of ["id", "projectId", "title", "status", "assignee", "dueDate", "description"]) {
    await page.getByRole("checkbox", { name: `Stolpec ${column}`, exact: true }).uncheck()
  }
  await expect(exportButton).toBeDisabled()
  const noDownload = page.waitForEvent("download", { timeout: 500 }).catch(() => null)
  await exportButton.click({ force: true })
  expect(await noDownload).toBeNull()
  await page.getByRole("checkbox", { name: "Stolpec description", exact: true }).check()
  await expect(exportButton).toBeEnabled()
})

test("preserves export settings between views and stays read-only", async ({ page }) => {
  const writes = await mount(page)
  await select(page, "Filter izvoza", "in_progress")
  await expectIds(page, webIds)
  await select(page, "Ločilo CSV", ",")
  const first = await downloadCSV(page)
  await board(page)
  expect(await downloadCSV(page)).toEqual(first)
  expect(writes).toEqual([])
  const state = await (await page.request.get("/__test/state")).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
})

test("resets export settings on project change and reload", async ({ page }) => {
  await mount(page)
  await select(page, "Filter izvoza", "done")
  await select(page, "Ločilo CSV", ",")
  await page.getByRole("checkbox", { name: "Stolpec id", exact: true }).uncheck()
  await project(page, "launch")
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  await expect(page.getByRole("checkbox", { name: "Stolpec id", exact: true })).toBeChecked()
  await select(page, "Filter izvoza", "done")
  await select(page, "Ločilo CSV", ",")
  await page.reload()
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  await expect(page.getByRole("checkbox", { name: "Stolpec id", exact: true })).toBeChecked()
})

test("keeps mobile layout within viewport", async ({ page }) => {
  await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
