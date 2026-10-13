import { expect, test, type Page } from "@playwright/test"
import { createCsvContent } from "../../src/csv.ts"

type Task = {
  id: string
  projectId: string
  title: string
  description: string
  status: "todo" | "in_progress" | "done"
  assignee: string
  dueDate: string
}

const projects = [
  { id: "web", name: "Spletna prenova" },
  { id: "launch", name: "Jesenska kampanja" },
]
const columns = ["id", "projectId", "title", "status", "assignee", "dueDate", "description"] as const
const apostrophe = String.fromCharCode(39)

async function mount(page: Page, tasks: Task[]) {
  await page.request.post("/__test/reset")
  const writes: string[] = []
  page.on("request", (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      writes.push(request.method() + " " + request.url())
    }
  })
  await page.route("**/api/**", (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== "GET") return route.continue()
    if (path === "/api/projects") return route.fulfill({ json: projects })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) {
      return route.fulfill({ json: tasks.filter((task) => task.projectId === decodeURIComponent(project[1])) })
    }
    return route.continue()
  })
  await page.goto("/#/projects/web")
  await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
  return writes
}

async function downloadCsv(page: Page) {
  const popups: Page[] = []
  page.on("popup", (popup) => popups.push(popup))
  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Izvozi CSV", exact: true }).click()
  const download = await downloadPromise
  const stream = await download.createReadStream()
  if (!stream) throw new Error("Download has no stream")
  const parts: Buffer[] = []
  for await (const part of stream) parts.push(Buffer.from(part))
  const bytes = Buffer.concat(parts)
  return { name: download.suggestedFilename(), text: bytes.toString("utf8"), bytes, popups }
}

test("P06 default export preserves order, Unicode, quoting, CRLF and BOM", async ({ page }) => {
  const tasks: Task[] = [
    { id: "web-01", projectId: "web", title: `Šumnik, "citat"`, description: "Prva vrstica\r\nDruga; čšž", status: "todo", assignee: "Ana Žć", dueDate: "2026-09-01" },
    { id: "=web-02", projectId: "web", title: "=SUM(A1)", description: "  @Opis", status: "done", assignee: "@Žan", dueDate: "2026-09-02" },
  ]
  await mount(page, tasks)
  const file = await downloadCsv(page)
  expect(file.name).toBe("folio-web.csv")
  expect(file.popups).toEqual([])
  expect(page.url()).toContain("#/projects/web")
  expect(Array.from(file.bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf])
  expect(file.text).toBe(
    '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    '"web-01";"web";"Šumnik, ""citat""";"todo";"Ana Žć";"2026-09-01";"Prva vrstica\r\nDruga; čšž"\r\n' +
    '"\u0027=web-02";"web";"\u0027=SUM(A1)";"done";"\u0027@Žan";"2026-09-02";"\u0027  @Opis"\r\n'
  )
})

test("P06 formula neutralization covers every textual data column", async ({ page }) => {
  await mount(page, [])
  const task = {
    id: " =id",
    projectId: "\t+project",
    title: "\r-title",
    status: "todo",
    assignee: "\n@person",
    dueDate: "2026-10-09",
    description: "  @desc",
  } as Task
  const content = createCsvContent([task], columns, ";")
  expect(content).toBe(
    `\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n` +
    `"${apostrophe} =id";"${apostrophe}\t+project";"${apostrophe}\r-title";"todo";"${apostrophe}\n@person";"2026-10-09";"${apostrophe}  @desc"\r\n`
  )
})

test("P06 export settings filter bytes, survive view switch, reset on project change and stay read-only", async ({ page }) => {
  const tasks: Task[] = [
    { id: "web-01", projectId: "web", title: "Priprava", description: "Opis 1", status: "todo", assignee: "Ana", dueDate: "2026-09-01" },
    { id: "web-02", projectId: "web", title: "Pregled", description: "Opis 2", status: "in_progress", assignee: "Luka", dueDate: "2026-09-02" },
    { id: "web-03", projectId: "web", title: "Zaključek", description: "Opis 3", status: "done", assignee: "Maja", dueDate: "2026-09-03" },
    { id: "launch-01", projectId: "launch", title: "Kampanja", description: "Opis 4", status: "done", assignee: "Živa", dueDate: "2026-09-04" },
  ]
  const writes = await mount(page, tasks)
  for (const column of columns) {
    await page.getByRole("checkbox", { name: "Stolpec " + column, exact: true }).uncheck()
  }
  await expect(page.getByRole("button", { name: "Izvozi CSV", exact: true })).toBeDisabled()
  for (const column of [...columns].reverse()) {
    await page.getByRole("checkbox", { name: "Stolpec " + column, exact: true }).check()
  }
  await page.getByRole("combobox", { name: "Filter izvoza", exact: true }).selectOption("done")
  await page.getByRole("combobox", { name: "Ločilo CSV", exact: true }).selectOption(",")
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(4)
  const expected =
    `\uFEFF"id","projectId","title","status","assignee","dueDate","description"\r\n` +
    `"web-03","web","Zaključek","done","Maja","2026-09-03","Opis 3"\r\n`
  const first = await downloadCsv(page)
  expect(first.text).toBe(expected)
  await page.getByRole("button", { name: "Tabla", exact: true }).click()
  await expect(page.getByRole("region", { name: "Tabla opravil", exact: true })).toBeVisible()
  const second = await downloadCsv(page)
  expect(second.text).toBe(first.text)
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja" }).click()
  await expect(page.getByRole("heading", { name: "Jesenska kampanja", exact: true })).toBeVisible()
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("all")
  for (const column of columns) {
    await expect(page.getByRole("checkbox", { name: "Stolpec " + column, exact: true })).toBeChecked()
  }
  const projectFile = await downloadCsv(page)
  expect(projectFile.name).toBe("folio-launch.csv")
  expect(projectFile.text).toContain('"launch-01";"launch";"Kampanja";"done"')
  await page.getByRole("combobox", { name: "Ločilo CSV", exact: true }).selectOption(",")
  await page.reload()
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole("button", { name: "Izvozi CSV", exact: true })).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await mount(page, [])
  await expect(page.getByRole("button", { name: "Izvozi CSV", exact: true })).toBeDisabled()
  expect(writes).toEqual([])
  const state = await (await page.request.get("/__test/state")).json()
  expect(state.saveRequests).toBe(0)
})
