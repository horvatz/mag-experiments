import { expect, test, type Page } from "@playwright/test"
import { board, makeTask, mount, project, readonly, select, type Task } from "../development/helpers.ts"

const columns = ["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const

async function downloadCsv(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Izvozi CSV", exact: true }).click(),
  ])
  const stream = await download.createReadStream()
  if (!stream) throw new Error("Download has no stream")
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Buffer))
  const bytes = Buffer.concat(chunks)
  return { name: download.suggestedFilename(), bytes, text: bytes.toString("utf8") }
}

const records: Task[] = [
  makeTask("web-01", { title: "Zapis, \"citat\"; čšž", description: "Prva vrstica\nDruga vrstica; čšž", status: "done", assignee: "Živa Kovač", dueDate: "2026-09-18" }),
  makeTask("web-02", { title: "=SUM(A1)", description: "\r\n\t-B", status: "in_progress", assignee: " @x", dueDate: "2026-09-19" }),
  makeTask("web-03", { title: "Vrednost", status: "todo", assignee: "Ana Novak", dueDate: "2026-09-20" }),
  makeTask("launch-01", { projectId: "launch", title: "Drugi projekt", status: "done", dueDate: "2026-09-24" }),
]

test("R01 in R02: default export keeps source order and fixed column order", async ({ page }) => {
  const writes = await mount(page, records)
  for (const column of [...columns].reverse()) await page.getByRole("checkbox", { name: `Stolpec ${column}`, exact: true }).uncheck()
  for (const column of [...columns].reverse()) await page.getByRole("checkbox", { name: `Stolpec ${column}`, exact: true }).check()
  const file = await downloadCsv(page)
  expect(file.name).toBe("folio-web.csv")
  expect([...file.bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  expect(file.text.startsWith("\uFEFF\"id\";\"projectId\";\"title\";\"status\";\"assignee\";\"dueDate\";\"description\"\r\n")).toBe(true)
  expect(file.text).toContain("\"web-01\";\"web\"")
  expect(file.text).toContain("\"web-02\";\"web\"")
  expect(file.text).toContain("\"web-03\";\"web\"")
  expect(file.text.indexOf("\"web-01\"")).toBeLessThan(file.text.indexOf("\"web-02\""))
  expect(file.text.indexOf("\"web-02\"")).toBeLessThan(file.text.indexOf("\"web-03\""))
  await readonly(page, writes)
})

test("R03: export is disabled without selected columns and recovers", async ({ page }) => {
  await mount(page, records)
  for (const column of columns) await page.getByRole("checkbox", { name: `Stolpec ${column}`, exact: true }).uncheck()
  const button = page.getByRole("button", { name: "Izvozi CSV", exact: true })
  await expect(button).toBeDisabled()
  await page.getByRole("checkbox", { name: "Stolpec title", exact: true }).check()
  await expect(button).toBeEnabled()
})

test("R04: filters export only while UI keeps the whole project", async ({ page }) => {
  await mount(page, records)
  await select(page, "Filter izvoza", "done")
  const file = await downloadCsv(page)
  expect(file.text).toContain("\"web-01\"")
  expect(file.text).not.toContain("\"web-02\"")
  expect(file.text).not.toContain("\"web-03\"")
  expect(await page.locator("[data-task-id]").count()).toBe(3)
})

test("R04: empty project disables export", async ({ page }) => {
  await mount(page, [])
  await expect(page.getByRole("button", { name: "Izvozi CSV", exact: true })).toBeDisabled()
})

test("R05 in R12: download is local, framed, and read-only", async ({ page }) => {
  const writes = await mount(page, records)
  const file = await downloadCsv(page)
  expect(file.name).toBe("folio-web.csv")
  expect([...file.bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  expect(file.text.endsWith("\r\n")).toBe(true)
  await readonly(page, writes)
})

test("R06 do R09: quoting, CRLF, formulas, and Unicode survive", async ({ page }) => {
  await mount(page, records)
  await select(page, "Ločilo CSV", ",")
  const file = await downloadCsv(page)
  expect(file.text).toContain("\"Zapis, \"\"citat\"\"; čšž\"")
  expect(file.text).toContain("\"Prva vrstica\nDruga vrstica; čšž\"")
  expect(file.text).toContain("\"in_progress\"")
  expect(file.text).toContain("\"2026-09-18\"")
  expect(file.text).toContain("\"\u0027=SUM(A1)\"")
  expect(file.text).toContain("\"\u0027\r\n\t-B\"")
  expect(file.text).toContain("\"\u0027 @x\"")
  expect(file.text).toContain("\"Vrednost\"")
  expect(file.text).not.toContain("\"\u0027Vrednost\"")
})

test("R10: both views create identical bytes for the same settings", async ({ page }) => {
  await mount(page, records)
  await select(page, "Filter izvoza", "done")
  await select(page, "Ločilo CSV", ",")
  const first = await downloadCsv(page)
  await board(page)
  const second = await downloadCsv(page)
  expect(second.bytes).toEqual(first.bytes)
})

test("R11: project change and refresh reset export settings", async ({ page }) => {
  await mount(page, records)
  await select(page, "Filter izvoza", "done")
  await select(page, "Ločilo CSV", ",")
  await page.getByRole("checkbox", { name: "Stolpec description", exact: true }).uncheck()
  await project(page, "launch")
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  await expect(page.getByRole("checkbox", { name: "Stolpec description", exact: true })).toBeChecked()
  await select(page, "Filter izvoza", "done")
  await page.reload()
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  await expect(page.getByRole("checkbox", { name: "Stolpec description", exact: true })).toBeChecked()
})

test("R12: existing reading contracts remain on a 390px layout", async ({ page }) => {
  const writes = await mount(page, records)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator("[aria-label=\"Pregled stanj opravil\"]")).toBeVisible()
  await expect(page.locator("[data-task-id=\"web-01\"]")).toBeVisible()
  await readonly(page, writes)
})
