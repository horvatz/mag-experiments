import { expect, test, type Page } from "@playwright/test"
import type { Task } from "../../shared/types.ts"

const projects = [
  { id: "web", name: "Spletna prenova" },
  { id: "launch", name: "Jesenska kampanja" },
  { id: "empty", name: "Prazni projekt" },
]

const tasks: Task[] = [
  { id: "web-01", projectId: "web", title: "Priprava oblikovnih smernic", description: "Črne, sive in modre barve", status: "todo", assignee: "Črt Možina", dueDate: "2026-09-18" },
  { id: "web-02", projectId: "web", title: "Pregled vsebine", description: "A.B preveri povezave", status: "in_progress", assignee: "Ana Novak", dueDate: "2026-09-20" },
  { id: "web-03", projectId: "web", title: "Uskladitev časovnice", description: "Rok je 21. september", status: "done", assignee: "Ana Novak", dueDate: "2026-09-21" },
  { id: "web-04", projectId: "web", title: "Priprava sestanka", description: "Dnevni red", status: "todo", assignee: "ana novak", dueDate: "2026-09-22" },
  { id: "web-05", projectId: "web", title: "Testiranje", description: "Preveri iskanje", status: "done", assignee: "Maja Zupan", dueDate: "2026-09-23" },
  { id: "web-06", projectId: "web", title: "Slike", description: "Izberi motiv", status: "in_progress", assignee: "Črt Možina", dueDate: "2026-09-24" },
  { id: "launch-01", projectId: "launch", title: "Drugi projekt", description: "Kampanja", status: "todo", assignee: "Luka Kovač", dueDate: "2026-09-25" },
  { id: "launch-02", projectId: "launch", title: "Zaključek", description: "Povzetek", status: "done", assignee: "Luka Kovač", dueDate: "2026-09-26" },
]

const webIds = tasks.filter((task) => task.projectId === "web").map((task) => task.id)

async function mount(page: Page, projectId = "web") {
  const writes: string[] = []
  page.on("request", (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      writes.push(`${request.method()} ${url.pathname}`)
    }
  })
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== "GET") return route.continue()
    if (path === "/api/projects") return route.fulfill({ json: projects })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) {
      return route.fulfill({ json: tasks.filter((task) => task.projectId === decodeURIComponent(project[1])) })
    }
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = tasks.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: "Opravilo ne obstaja." } })
    }
    return route.continue()
  })
  await page.goto(`/#/projects/${projectId}`)
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toBeVisible()
  return writes
}

const ids = (page: Page) => page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-task-id")))
async function expectIds(page: Page, values: string[]) {
  await expect.poll(async () => ids(page)).toEqual(values)
}
const search = (page: Page) => page.getByRole("searchbox", { name: "Išči opravila" })
const statusFilter = (page: Page) => page.getByRole("combobox", { name: "Filter stanja" })
const assigneeFilter = (page: Page) => page.getByRole("combobox", { name: "Filter odgovorne osebe" })
const result = (page: Page) => page.getByRole("status", { name: "Rezultati filtriranja" })
async function showBoard(page: Page) {
  await page.getByRole("button", { name: "Tabla", exact: true }).click()
  await expect(page.getByRole("region", { name: "Tabla opravil" })).toBeVisible()
}
async function showTable(page: Page) {
  await page.getByRole("button", { name: "Preglednica", exact: true }).click()
  await expect(page.getByRole("button", { name: "Preglednica", exact: true })).toHaveAttribute("aria-pressed", "true")
}

test("R01: default controls show all tasks in source order", async ({ page }) => {
  const writes = await mount(page)
  await expect(search(page)).toHaveValue("")
  await expect(statusFilter(page)).toHaveValue("all")
  await expect(assigneeFilter(page)).toHaveValue("all")
  await expectIds(page, webIds)
  await expect(result(page)).toHaveText("Prikazano: 6 od 6.")
  expect(writes).toEqual([])
})

test("R02: normalized search covers all fields", async ({ page }) => {
  await mount(page)
  const cases = [
    ["CRNE", ["web-01"]],
    ["WEB-03", ["web-03"]],
    ["september", ["web-03"]],
    ["zupan", ["web-05"]],
  ] as const
  for (const [term, expected] of cases) {
    await search(page).fill(term)
    await expectIds(page, [...expected])
  }
})

test("R03: every literal term matches in any order", async ({ page }) => {
  await mount(page)
  await search(page).fill("smernic Črt")
  await expectIds(page, ["web-01"])
  await search(page).fill("črt smernic")
  await expectIds(page, ["web-01"])
  await search(page).fill("A.B")
  await expectIds(page, ["web-02"])
  await search(page).fill("P.*vsebine")
  await expectIds(page, [])
})

test("R04: search, status and assignee combine with exact assignee matching", async ({ page }) => {
  await mount(page)
  await search(page).fill("pregled")
  await statusFilter(page).selectOption("in_progress")
  await assigneeFilter(page).selectOption("Ana Novak")
  await expectIds(page, ["web-02"])
  await assigneeFilter(page).selectOption("ana novak")
  await expectIds(page, [])
})

test("R05: assignee options come from the whole project and reset on project change", async ({ page }) => {
  await mount(page)
  await search(page).fill("pregled")
  const options = assigneeFilter(page).getByRole("option")
  await expect(options).toHaveText(["Vse osebe", "Črt Možina", "Ana Novak", "ana novak", "Maja Zupan"])
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja" }).click()
  await expect(search(page)).toHaveValue("")
  await expect(assigneeFilter(page)).toHaveValue("all")
  await expect(assigneeFilter(page).getByRole("option")).toHaveText(["Vse osebe", "Luka Kovač"])
})

test("R06: table and board show the same filtered IDs", async ({ page }) => {
  await mount(page)
  await search(page).fill("priprava")
  await statusFilter(page).selectOption("todo")
  const expected = ["web-01", "web-04"]
  await expectIds(page, expected)
  await showBoard(page)
  await expectIds(page, expected)
  await showTable(page)
  await expectIds(page, expected)
})

test("R07: changing project resets all filters and never filters another project", async ({ page }) => {
  await mount(page)
  await search(page).fill("priprava")
  await statusFilter(page).selectOption("todo")
  await assigneeFilter(page).selectOption("Ana Novak")
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja" }).click()
  await expect(search(page)).toHaveValue("")
  await expect(statusFilter(page)).toHaveValue("all")
  await expect(assigneeFilter(page)).toHaveValue("all")
  await expectIds(page, ["launch-01", "launch-02"])
})

test("R08: refresh resets filters without URL or browser storage", async ({ page }) => {
  await mount(page)
  await search(page).fill("priprava")
  await statusFilter(page).selectOption("todo")
  await assigneeFilter(page).selectOption("Ana Novak")
  await page.reload()
  await expect(search(page)).toHaveValue("")
  await expect(statusFilter(page)).toHaveValue("all")
  await expect(assigneeFilter(page)).toHaveValue("all")
  await expectIds(page, webIds)
  expect(page.url()).not.toContain("?")
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: [] })
})

test("R09: counts reflect displayed results", async ({ page }) => {
  await mount(page)
  await expect(page.locator("[aria-label=\"Pregled stanj opravil\"] strong")).toHaveText(["2", "2", "2"])
  await showBoard(page)
  for (const label of ["Pripravljeno", "V delu", "Končano"]) {
    await expect(page.getByRole("region", { name: label, exact: true }).locator(".column-count")).toHaveText("2")
  }
  await showTable(page)
  await assigneeFilter(page).selectOption("Ana Novak")
  await expect(result(page)).toHaveText("Prikazano: 2 od 6.")
  await expect(page.locator("[aria-label=\"Pregled stanj opravil\"] strong")).toHaveText(["0", "1", "1"])
})

test("R10: no matches and empty project states remain usable", async ({ page }) => {
  await mount(page)
  await search(page).fill("neobstoječe")
  await expect(page.getByText("Ni zadetkov.", { exact: true })).toBeVisible()
  await expectIds(page, [])
  await showBoard(page)
  await expect(page.getByText("Ni zadetkov.", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Počisti filtre" }).click()
  await expectIds(page, ["web-01", "web-04", "web-02", "web-06", "web-03", "web-05"])
  await mount(page, "empty")
  await expect(result(page)).toHaveText("Prikazano: 0 od 0.")
  await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil" })).toBeVisible()
})

test("R11: clearing filters resets all controls and order", async ({ page }) => {
  await mount(page)
  await search(page).fill("priprava")
  await statusFilter(page).selectOption("todo")
  await assigneeFilter(page).selectOption("Črt Možina")
  await page.getByRole("button", { name: "Počisti filtre" }).click()
  await expect(search(page)).toHaveValue("")
  await expect(statusFilter(page)).toHaveValue("all")
  await expect(assigneeFilter(page)).toHaveValue("all")
  await expectIds(page, webIds)
})

test("R12: navigation and details work without writes at 390 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  const writes = await mount(page)
  await search(page).fill("pregled")
  await statusFilter(page).selectOption("in_progress")
  await page.locator("[data-task-id=\"web-02\"]").getByRole("link").click()
  await expect(page.getByRole("dialog").getByText("Pregled vsebine")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await showBoard(page)
  await expectIds(page, ["web-02"])
  expect(writes).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
