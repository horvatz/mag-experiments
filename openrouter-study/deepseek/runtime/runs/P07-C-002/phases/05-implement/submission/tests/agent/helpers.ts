import { expect, type Page } from "@playwright/test"
export { expect, test } from "@playwright/test"

export type Task = { id: string; projectId: string; title: string; description: string; status: "todo" | "in_progress" | "done"; assignee: string; dueDate: string }

export const makeTask = (id: string, values: Partial<Task> = {}): Task => ({ id, projectId: "web", title: `Opravilo ${id}`, description: `Opis opravila ${id}`, status: "todo", assignee: "Ana Novak", dueDate: "2026-09-21", ...values })

export const examples: Task[] = [
  makeTask("web-01", { title: "Čas za pregled", description: "Končni zapis vsebine", status: "in_progress", dueDate: "2026-09-18" }),
  makeTask("web-02", { title: "Pregled vsebine", assignee: "Luka Kovač", dueDate: "2026-09-22" }),
  makeTask("web-03", { title: "Pregled vsebine", status: "done", dueDate: "2026-09-16" }),
  makeTask("web-04", { title: "Alfa 10", assignee: "Maja Zupan", dueDate: "2026-09-28" }),
  makeTask("web-05", { title: "alfa 2", status: "in_progress", dueDate: "2026-09-29" }),
  makeTask("web-06", { title: "Zapis, citat", description: "Prva vrstica\nDruga vrstica; čšž", status: "done", assignee: "Živa Kovač", dueDate: "2026-09-21" }),
  makeTask("web-07", { title: "=SUM(A1)", assignee: "Črt", dueDate: "2026-09-20" }),
  makeTask("web-08", { title: "Dodatno opravilo", assignee: "Maja Zupan", dueDate: "2026-10-01" }),
  makeTask("launch-01", { projectId: "launch", title: "Drugi projekt", dueDate: "2026-09-24" }),
  makeTask("launch-02", { projectId: "launch", title: "Drugi projekt", status: "done", assignee: "Luka Kovač", dueDate: "2026-09-25" }),
]

export const webIds = examples.filter((task) => task.projectId === "web").map((task) => task.id)

export async function mount(page: Page, options: { records?: Task[]; hash?: string; seed?: string } = {}) {
  const { records = examples, hash = "#/projects/web", seed } = options
  await page.request.post("/__test/reset")
  if (seed !== undefined) await page.addInitScript((value: string) => { window.localStorage.setItem("folio:favorites:v1", value) }, seed)
  const writes: string[] = []
  const controlCalls: string[] = []
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith("/__test/")) controlCalls.push(request.url())
    if (path.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method())) writes.push(`${request.method()} ${request.url()}`)
  })
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== "GET") return route.continue()
    if (path === "/api/projects") return route.fulfill({ json: [{ id: "web", name: "Spletna prenova" }, { id: "launch", name: "Jesenska kampanja" }] })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: records.filter((task) => task.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = records.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: "Opravilo ne obstaja." } })
    }
    return route.continue()
  })
  await page.goto(`/${hash}`)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  return { writes, controlCalls }
}

export const ids = (page: Page) => page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-task-id")))
export async function expectIds(page: Page, values: string[]) {
  await expect.poll(() => ids(page)).toEqual(values)
}
export const favorite = (page: Page, id: string) => page.getByRole("button", { name: `Priljubljeno opravilo ${id}`, exact: true })
export const stored = (page: Page) => page.evaluate(() => window.localStorage.getItem("folio:favorites:v1"))
export const counter = (page: Page) => page.getByRole("status", { name: "Število priljubljenih" })
export const filterBox = (page: Page) => page.getByRole("checkbox", { name: "Prikaži le priljubljena" })
export const removeButton = (page: Page) => page.getByRole("button", { name: "Odstrani priljubljene tega projekta", exact: true })
export async function board(page: Page) { await page.getByRole("button", { name: "Tabla", exact: true }).click(); await expect(page.getByRole("region", { name: "Tabla opravil" })).toBeVisible() }
export async function table(page: Page) { await page.getByRole("button", { name: "Preglednica", exact: true }).click(); await expect(page.getByRole("button", { name: "Preglednica", exact: true })).toHaveAttribute("aria-pressed", "true") }
export async function project(page: Page, id: "web" | "launch") {
  const name = id === "web" ? "Spletna prenova" : "Jesenska kampanja"
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name, exact: true }).click()
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible()
}
