import { expect, type Page } from "@playwright/test"
export { expect, test } from "@playwright/test"

export type Task = { id: string; projectId: string; title: string; description: string; status: "todo" | "in_progress" | "done"; assignee: string; dueDate: string }

export const makeTask = (id: string, values: Partial<Task> = {}): Task => ({ id, projectId: "web", title: "Opravilo " + id, description: "Opis opravila " + id, status: "todo", assignee: "Ana Novak", dueDate: "2026-09-21", ...values })

export const examples: Task[] = [
  makeTask("web-01", { title: "Čas za pregled", status: "in_progress", dueDate: "2026-09-18" }),
  makeTask("web-02", { title: "Pregled vsebine", assignee: "Luka Kovač", dueDate: "2026-09-22" }),
  makeTask("web-03", { title: "Pregled vsebine", status: "done", dueDate: "2026-09-16" }),
  makeTask("web-04", { title: "Alfa 10", assignee: "Maja Zupan", dueDate: "2026-09-28" }),
  makeTask("web-05", { title: "alfa 2", status: "in_progress", dueDate: "2026-09-29" }),
  makeTask("web-06", { title: "Zapis, \"citat\"", status: "done", assignee: "Živa Kovač", dueDate: "2026-09-21" }),
  makeTask("web-07", { title: "=SUM(A1)", assignee: "Črt", dueDate: "2026-09-20" }),
  makeTask("web-08", { title: "Dodatno opravilo", assignee: "Maja Zupan", dueDate: "2026-10-01" }),
  makeTask("launch-01", { projectId: "launch", title: "Drugi projekt", dueDate: "2026-09-24" }),
  makeTask("launch-02", { projectId: "launch", title: "Drugi projekt", status: "done", assignee: "Luka Kovač", dueDate: "2026-09-25" }),
]

export const KEY = "folio:favorites:v1"

export async function mount(page: Page, records: Task[] = examples, hash = "#/projects/web") {
  await page.request.post("/__test/reset")
  const writes: string[] = []
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method())) writes.push(request.method() + " " + request.url()) })
  await page.route("**/api/**", async (route) => {
    const request = route.request(), path = new URL(request.url()).pathname
    if (request.method() !== "GET") return route.continue()
    if (path === "/api/projects") return route.fulfill({ json: [{ id: "web", name: "Spletna prenova" }, { id: "launch", name: "Jesenska kampanja" }] })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: records.filter((t) => t.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = records.find((t) => t.id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: "Opravilo ne obstaja." } })
    }
    return route.continue()
  })
  await page.goto("about:blank")
  await page.goto("/" + hash)
  await expect(page.getByRole("heading", { name: hash.includes("/launch") ? "Jesenska kampanja" : "Spletna prenova", exact: true })).toBeVisible()
  return writes
}

export const ids = (page: Page) => page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-task-id")))
export const expectIds = async (page: Page, values: string[]) => { await expect.poll(() => ids(page)).toEqual(values) }
export const click = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).click()
export const favoriteButton = (page: Page, id: string) => page.getByRole("button", { name: `Priljubljeno opravilo ${id}`, exact: true })
export const filterBox = (page: Page) => page.getByRole("checkbox", { name: "Prikaži le priljubljena" })
export const counter = (page: Page) => page.getByRole("status", { name: "Število priljubljenih" })

export async function board(page: Page) { await click(page, "Tabla"); await expect(page.getByRole("region", { name: "Tabla opravil" })).toBeVisible() }
export async function table(page: Page) { await click(page, "Preglednica"); await expect(page.getByRole("button", { name: "Preglednica", exact: true })).toHaveAttribute("aria-pressed", "true") }

export async function openProject(page: Page, id: "web" | "launch") {
  const name = id === "web" ? "Spletna prenova" : "Jesenska kampanja"
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name, exact: true }).click()
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible()
}

export async function seed(page: Page, raw: string | null) {
  await page.addInitScript(([key, value]) => {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch { /* ignore */ }
  }, [KEY, raw] as [string, string | null])
}

export const stored = (page: Page) => page.evaluate((key) => localStorage.getItem(key), KEY)
export const dispatchStorage = (page: Page, key: string | null, newValue: string | null) =>
  page.evaluate(([k, v]) => { window.dispatchEvent(new StorageEvent("storage", { key: k, newValue: v })) }, [key, newValue] as [string | null, string | null])
