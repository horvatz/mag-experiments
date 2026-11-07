import { board, downloadCSV, expect, mount, project, readonly, select, test } from "../../development/helpers.ts"
import { makeTask } from "../../development/helpers.ts"

const bom = "\uFEFF"

test("A01: default export uses source order, BOM and CRLF", async ({ page }) => {
  const writes = await mount(page)
  const file = await downloadCSV(page)
  expect(file.name).toBe("folio-web.csv")
  expect(file.text.startsWith(bom + `"id";"projectId";"title";"status";"assignee";"dueDate";"description"` + "\r\n")).toBe(true)
  expect(file.text).toContain(`"web-01";"web";"Čas za pregled";"in_progress";"Ana Novak";"2026-09-18";"Končni zapis vsebine"`)
  expect(file.text.indexOf(`"web-02"`)).toBeGreaterThan(file.text.indexOf(`"web-01"`))
  expect(file.text.endsWith("\r\n")).toBe(true)
  await readonly(page, writes)
})

test("A02: column order is fixed and empty selection disables export", async ({ page }) => {
  await mount(page)
  for (const key of ["description", "dueDate", "assignee", "status", "title", "projectId"]) {
    await page.getByRole("checkbox", { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  expect((await downloadCSV(page)).text).toBe(bom + `"id"\r\n"web-01"\r\n"web-02"\r\n"web-03"\r\n"web-04"\r\n"web-05"\r\n"web-06"\r\n"web-07"\r\n"web-08"\r\n`)
  for (const key of ["id", "projectId", "title", "status", "assignee", "dueDate", "description"]) {
    await page.getByRole("checkbox", { name: `Stolpec ${key}`, exact: true }).uncheck()
  }
  const exportButton = page.getByRole("button", { name: "Izvozi CSV", exact: true })
  await expect(exportButton).toBeDisabled()
  await page.getByRole("checkbox", { name: "Stolpec title", exact: true }).check()
  await expect(exportButton).toBeEnabled()
})

test("A03: filters limit rows while the full project stays visible", async ({ page }) => {
  const writes = await mount(page)
  await select(page, "Filter izvoza", "in_progress")
  const file = await downloadCSV(page)
  expect(file.text).toContain(`"web-01";"web";"Čas za pregled";"in_progress"`)
  expect(file.text).toContain(`"web-05";"web";"alfa 2";"in_progress"`)
  expect(file.text).not.toContain(`"web-02";`)
  await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
  await expect(page.locator(`[aria-label="Pregled stanj opravil"] strong`)).toHaveText(["4", "2", "2"])
  await readonly(page, writes)
})

test("A03b: an empty filtered result disables export", async ({ page }) => {
  const writes = await mount(page, [makeTask("web-01")])
  await select(page, "Filter izvoza", "done")
  await expect(page.getByRole("button", { name: "Izvozi CSV", exact: true })).toBeDisabled()
  await readonly(page, writes)
})

test("A04: separators, quotes, formulas and Unicode are encoded", async ({ page }) => {
  await mount(page)
  await select(page, "Ločilo CSV", ",")
  const commaFile = await downloadCSV(page)
  expect(commaFile.text).toContain(`"web-06","web","Zapis, ""citat""","done","Živa Kovač","2026-09-21","Prva vrstica\nDruga vrstica; čšž"`)
  expect(commaFile.text).toContain(`"web-07","web","\u0027=SUM(A1)","todo","Črt","2026-09-20","Opis opravila web-07"`)
  await select(page, "Ločilo CSV", ";")
  const semicolonFile = await downloadCSV(page)
  expect(semicolonFile.text).toContain(`"Zapis, ""citat""";"done"`)
  expect(semicolonFile.text).toContain(`"\u0027=SUM(A1)"`)
})

test("A05: view switch preserves settings and produces identical bytes", async ({ page }) => {
  const writes = await mount(page)
  await select(page, "Filter izvoza", "in_progress")
  const tableFile = await downloadCSV(page)
  await board(page)
  const boardFile = await downloadCSV(page)
  expect(boardFile.name).toBe(tableFile.name)
  expect(boardFile.text).toBe(tableFile.text)
  await readonly(page, writes)
})

test("A06: project change resets defaults and later exports reflect settings", async ({ page }) => {
  await mount(page)
  await select(page, "Filter izvoza", "done")
  await select(page, "Ločilo CSV", ",")
  await project(page, "launch")
  const launchFile = await downloadCSV(page)
  expect(launchFile.name).toBe("folio-launch.csv")
  expect(launchFile.text.startsWith(bom + `"id";"projectId";"title";"status";"assignee";"dueDate";"description"` + "\r\n")).toBe(true)
  await select(page, "Ločilo CSV", ",")
  expect((await downloadCSV(page)).text.startsWith(bom + `"id","projectId","title","status","assignee","dueDate","description"` + "\r\n")).toBe(true)
  await page.reload()
  expect((await downloadCSV(page)).text.startsWith(bom + `"id";"projectId";"title";"status";"assignee";"dueDate";"description"` + "\r\n")).toBe(true)
})

test("A07: export remains read-only and preserves interface hooks", async ({ page }) => {
  const writes = await mount(page)
  await downloadCSV(page)
  await expect(page.locator(`[data-task-id="web-01"]`)).toHaveCount(1)
  await expect(page.locator(`[aria-label="Pregled stanj opravil"]`)).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await readonly(page, writes)
})
