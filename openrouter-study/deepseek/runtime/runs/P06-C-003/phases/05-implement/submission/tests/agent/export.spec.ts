import { test, expect, mount, select, downloadCSV, readonly, board, table, project, makeTask } from "../development/helpers.ts"

test("R01 defaults: all tasks, all columns, semicolon, source order", async ({ page }) => {
  await mount(page)
  const file = await downloadCSV(page)
  expect(file.name).toBe("folio-web.csv")
  expect(file.text.startsWith("\uFEFF\"id\";\"projectId\";\"title\";\"status\";\"assignee\";\"dueDate\";\"description\"\r\n")).toBe(true)
  const lines = file.text.replace("\uFEFF", "").split("\r\n")
  const ids = lines.slice(1, -1).map((line) => line.slice(1, line.indexOf("\";", 1)))
  expect(ids).toEqual(["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"])
})

test("R02 fixed column order regardless of click order", async ({ page }) => {
  await mount(page)
  await page.getByRole("checkbox", { name: "Stolpec description", exact: true }).uncheck()
  await page.getByRole("checkbox", { name: "Stolpec title", exact: true }).uncheck()
  await page.getByRole("checkbox", { name: "Stolpec title", exact: true }).check()
  await page.getByRole("checkbox", { name: "Stolpec description", exact: true }).check()
  const file = await downloadCSV(page)
  expect(file.text.startsWith("\uFEFF\"id\";\"projectId\";\"title\";\"status\";\"assignee\";\"dueDate\";\"description\"\r\n")).toBe(true)
})

test("R03 no columns disables export and reselect enables it", async ({ page }) => {
  await mount(page)
  for (const key of ["id", "projectId", "title", "status", "assignee", "dueDate", "description"]) await page.getByRole("checkbox", { name: "Stolpec " + key, exact: true }).uncheck()
  const button = page.getByRole("button", { name: "Izvozi CSV", exact: true })
  await expect(button).toBeDisabled()
  await page.getByRole("checkbox", { name: "Stolpec title", exact: true }).check()
  await expect(button).toBeEnabled()
  const file = await downloadCSV(page)
  expect(file.text.startsWith("\uFEFF\"title\"\r\n")).toBe(true)
})

test("R04 filter limits only exported rows; empty results disable", async ({ page }) => {
  await mount(page)
  await select(page, "Filter izvoza", "done")
  const file = await downloadCSV(page)
  expect(file.text).toContain("\"web-03\"")
  expect(file.text).toContain("\"web-06\"")
  expect(file.text).not.toContain("\"web-01\"")
  await expect(page.locator("[data-task-id]")).toHaveCount(8)
  await mount(page, [])
  await expect(page.getByRole("button", { name: "Izvozi CSV", exact: true })).toBeDisabled()
  await mount(page, [makeTask("web-01", { status: "todo" })])
  await select(page, "Filter izvoza", "done")
  await expect(page.getByRole("button", { name: "Izvozi CSV", exact: true })).toBeDisabled()
})

test("R05 download uses BOM, keeps page and does not post", async ({ page }) => {
  await mount(page)
  const url = page.url()
  const file = await downloadCSV(page)
  expect(file.name).toBe("folio-web.csv")
  expect(file.text.charCodeAt(0)).toBe(0xfeff)
  expect(page.url()).toBe(url)
})

test("R06 comma separator and doubled quotes", async ({ page }) => {
  await mount(page)
  for (const key of ["projectId", "title", "status", "assignee", "dueDate", "description"]) await page.getByRole("checkbox", { name: "Stolpec " + key, exact: true }).uncheck()
  await select(page, "Filter izvoza", "done")
  await select(page, "Ločilo CSV", ",")
  expect((await downloadCSV(page)).text).toBe("\uFEFF\"id\"\r\n\"web-03\"\r\n\"web-06\"\r\n")
  await page.getByRole("checkbox", { name: "Stolpec title", exact: true }).check()
  expect((await downloadCSV(page)).text).toContain("\"Zapis, \"\"citat\"\"\"")
})

test("R07 CRLF endings and embedded newlines preserved", async ({ page }) => {
  await mount(page)
  const file = await downloadCSV(page)
  expect(file.text.endsWith("\r\n")).toBe(true)
  expect(file.text).toContain("Prva vrstica\nDruga vrstica; čšž")
  expect(file.text.split("\r\n").length).toBe(10)
})

test("R08 formula neutralization for all data columns", async ({ page }) => {
  const records = [
    makeTask("web-01", { title: "=1+1" }),
    makeTask("web-02", { title: "  +SUM(A1)", description: "\t-2+2" }),
    makeTask("web-03", { title: "\r@x", description: "\n=cmd" }),
    makeTask("web-04", { title: " -minus" }),
    makeTask("web-05", { title: " navadno" }),
  ]
  await mount(page, records)
  const file = await downloadCSV(page)
  expect(file.text).toContain("\"\u0027=1+1\"")
  expect(file.text).toContain("\"\u0027  +SUM(A1)\"")
  expect(file.text).toContain("\"\u0027\t-2+2\"")
  expect(file.text).toContain("\"\u0027\r@x\"")
  expect(file.text).toContain("\"\u0027\n=cmd\"")
  expect(file.text).toContain("\"\u0027 -minus\"")
  expect(file.text).toContain("\" navadno\"")
})

test("R09 unicode, internal status and raw date preserved", async ({ page }) => {
  await mount(page)
  await select(page, "Filter izvoza", "done")
  const file = await downloadCSV(page)
  expect(file.text).toContain("Živa Kovač")
  expect(file.text).toContain("čšž")
  expect(file.text).toContain("\"done\"")
  expect(file.text).toContain("\"2026-09-16\"")
})

test("R10 view switch preserves settings and bytes", async ({ page }) => {
  await mount(page)
  await page.getByRole("checkbox", { name: "Stolpec description", exact: true }).uncheck()
  await select(page, "Filter izvoza", "in_progress")
  await select(page, "Ločilo CSV", ",")
  const first = await downloadCSV(page)
  await board(page)
  const second = await downloadCSV(page)
  expect(second).toEqual(first)
  await table(page)
  await expect(page.getByRole("checkbox", { name: "Stolpec description", exact: true })).not.toBeChecked()
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(",")
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("in_progress")
})

test("R11 project switch and refresh reset settings", async ({ page }) => {
  await mount(page)
  await page.getByRole("checkbox", { name: "Stolpec id", exact: true }).uncheck()
  await select(page, "Ločilo CSV", ",")
  await select(page, "Filter izvoza", "done")
  await project(page, "launch")
  await expect(page.getByRole("checkbox", { name: "Stolpec id", exact: true })).toBeChecked()
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("all")
  await project(page, "web")
  await page.getByRole("checkbox", { name: "Stolpec description", exact: true }).uncheck()
  await page.reload()
  await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
  await expect(page.getByRole("checkbox", { name: "Stolpec description", exact: true })).toBeChecked()
})

test("R12 export is read-only and keeps layout", async ({ page }) => {
  const writes = await mount(page)
  const before = await page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-task-id")))
  await downloadCSV(page)
  const after = await page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-task-id")))
  expect(after).toEqual(before)
  await readonly(page, writes)
})
