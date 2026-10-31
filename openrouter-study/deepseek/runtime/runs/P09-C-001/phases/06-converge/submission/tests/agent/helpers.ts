import { expect, type Page } from "@playwright/test"
export { expect, test } from "@playwright/test"

export type Task = { id: string; projectId: string; title: string; description: string; status: "todo" | "in_progress" | "done"; assignee: string; dueDate: string }
export const makeTask = (id: string, values: Partial<Task> = {}): Task => ({ id, projectId: "web", title: "Opravilo " + id, description: "Opis " + id, status: "todo", assignee: "Ana Novak", dueDate: "2026-10-05", ...values })

export const examples: Task[] = [
  makeTask("t-01", { title: "Pregled vsebine", description: "Prvi opis" }),
  makeTask("t-02", { title: "Pregled vsebine", status: "done", assignee: "Luka Kovač" }),
  makeTask("t-03", { title: "Čas za pregled", status: "in_progress", assignee: "Živa Kovač" }),
  makeTask("t-04", { title: "Alfa 10", assignee: "Maja Zupan" }),
  makeTask("t-05", { title: "alfa 2", assignee: "Črt" }),
  makeTask("t-06", { title: "Zapis, citat v narekovajih", description: "Prva vrstica; čšž" }),
  makeTask("t-07", { title: "=SUM(A1)" }),
  makeTask("t-08", { title: "Dodatno opravilo" }),
  makeTask("u-01", { projectId: "launch", title: "Drugi projekt" }),
  makeTask("u-02", { projectId: "launch", title: "Drugi projekt", status: "done" }),
]

export const webIds = examples.filter((task) => task.projectId === "web").map((task) => task.id)

export async function mount(page: Page, records: Task[] = examples, hash = "#/projects/web", heading?: string) {
  const writes: string[] = []
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method())) writes.push(request.method() + " " + request.url())
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
  await page.goto("/" + hash)
  await expect(page.getByRole("heading", { name: heading ?? (hash.includes("/launch") ? "Jesenska kampanja" : "Spletna prenova"), exact: true })).toBeVisible()
  return writes
}

export const ids = (page: Page) => page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-task-id")))
export async function expectIds(page: Page, values: string[], ordered = true) {
  await expect.poll(async () => {
    const result = await ids(page)
    return ordered ? result : [...result].sort()
  }).toEqual(ordered ? values : [...values].sort())
}
export const currentHash = (page: Page) => page.evaluate(() => window.location.hash)
export const historyLength = (page: Page) => page.evaluate(() => history.length)
export const counter = (page: Page) => page.getByRole("status", { name: "Rezultati povezave" })
export const searchBox = (page: Page) => page.getByRole("searchbox", { name: "Iskanje v povezavi" })
export const select = (page: Page, name: string, value: string) => page.getByRole("combobox", { name, exact: true }).selectOption(value)
export const click = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).click()
