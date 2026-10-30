import { expect, test, type Page } from "@playwright/test"
import type { Task } from "../../shared/types.ts"

const projectNames: Record<string, string> = { web: "Spletna prenova", launch: "Jesenska kampanja" }
const task = (id: string, title: string, status: Task["status"], assignee: string, dueDate: string): Task => ({
  id,
  projectId: "web",
  title,
  description: "Opis",
  status,
  assignee,
  dueDate,
})
const launchTask = (id: string): Task => ({ ...task(id, "Edino opravilo", "in_progress", "Maja", "2026-05-05"), projectId: "launch" })

async function mount(page: Page, records: Task[], projectId = "web") {
  await page.request.post("/__test/reset")
  const writes: string[] = []
  page.on("request", request => {
    if (new URL(request.url()).pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method())) writes.push(`${request.method()} ${request.url()}`)
  })
  await page.route("**/api/**", async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== "GET") return route.continue()
    if (path === "/api/projects") return route.fulfill({ json: [{ id: "web", name: projectNames.web }, { id: "launch", name: projectNames.launch }] })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: records.filter(item => item.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const item = records.find(entry => entry.id === decodeURIComponent(detail[1]))
      return item ? route.fulfill({ json: item }) : route.fulfill({ status: 404, json: { message: "Opravilo ne obstaja." } })
    }
    return route.continue()
  })
  await page.goto(`/#/projects/${projectId}`)
  await expect(page.getByRole("heading", { name: projectNames[projectId], exact: true })).toBeVisible()
  return writes
}

const ids = (page: Page) => page.locator("[data-task-id]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-task-id")))
async function expectIds(page: Page, values: string[]) {
  await expect.poll(async () => ids(page)).toEqual(values)
}
async function expectValues(page: Page, values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) await expect(page.getByRole("combobox", { name, exact: true })).toHaveValue(value)
}
async function switchProject(page: Page, projectId: "web" | "launch") {
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: projectNames[projectId], exact: true }).click()
  await expect(page.getByRole("heading", { name: projectNames[projectId], exact: true })).toBeVisible()
}
async function columnIds(page: Page, label: string) {
  const column = page.getByRole("region", { name: "Tabla opravil", exact: true }).locator("section").filter({ has: page.getByRole("heading", { name: label, exact: true }) })
  await expect.poll(async () => column.locator("[data-task-id]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-task-id")))).toEqual(label === "V delu" ? ["t1", "t2"] : [label === "Pripravljeno" ? "t4" : "t3"])
}

test("sorting state works in both views, details and projects", async ({ page }) => {
  const records = [
    task("t3", "Žaba", "done", "Žiga", "2026-03-03"),
    task("t1", "Čebula", "in_progress", "Bojan", "2026-03-02"),
    task("t2", "Čebula", "in_progress", "Ana", "2026-03-01"),
    task("t4", "Ananas", "todo", "Ana", "2026-03-04"),
    launchTask("l1"),
  ]
  const writes = await mount(page, records)
  const defaults = { "Primarni ključ": "original", "Primarna smer": "asc", "Sekundarni ključ": "none", "Sekundarna smer": "asc" }
  await expectValues(page, defaults)
  await expectIds(page, ["t3", "t1", "t2", "t4"])
  expect(await ids(page)).toEqual(["t3", "t1", "t2", "t4"])

  await page.getByRole("combobox", { name: "Primarni ključ" }).selectOption("title")
  await expectIds(page, ["t4", "t1", "t2", "t3"])
  await page.getByRole("combobox", { name: "Sekundarni ključ" }).selectOption("assignee")
  await page.getByRole("combobox", { name: "Sekundarna smer" }).selectOption("desc")
  await expectIds(page, ["t4", "t1", "t2", "t3"])

  await page.getByRole("button", { name: "Tabla", exact: true }).click()
  await expect(page.getByRole("region", { name: "Tabla opravil", exact: true })).toBeVisible()
  await expectValues(page, { ...defaults, "Primarni ključ": "title", "Sekundarni ključ": "assignee", "Sekundarna smer": "desc" })
  await columnIds(page, "Pripravljeno")
  await columnIds(page, "V delu")
  await columnIds(page, "Končano")
  expect(new Set(await ids(page)).size).toBe(4)

  await page.getByRole("button", { name: "Preglednica", exact: true }).click()
  await expectValues(page, { ...defaults, "Primarni ključ": "title", "Sekundarni ključ": "assignee", "Sekundarna smer": "desc" })
  await expectIds(page, ["t4", "t1", "t2", "t3"])
  for (const id of ["t1", "t2"]) {
    await page.locator(`[data-task-id="${id}"]`).getByRole("link").click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("dialog").getByText(id, { exact: true }).first()).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
  }
  await expectValues(page, { ...defaults, "Primarni ključ": "title", "Sekundarni ključ": "assignee", "Sekundarna smer": "desc" })

  await page.getByRole("combobox", { name: "Primarna smer" }).selectOption("desc")
  await page.getByRole("button", { name: "Izvorni vrstni red", exact: true }).click()
  await expectValues(page, defaults)
  await expectIds(page, ["t3", "t1", "t2", "t4"])

  await switchProject(page, "launch")
  await expectValues(page, defaults)
  await expectIds(page, ["l1"])
  await switchProject(page, "web")
  await expectValues(page, defaults)
  await expectIds(page, ["t3", "t1", "t2", "t4"])

  await page.reload()
  await expectValues(page, defaults)
  await expectIds(page, ["t3", "t1", "t2", "t4"])
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole("combobox", { name: "Primarni ključ" })).toBeVisible()
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(page.url()).not.toContain("sort=")
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))
  expect(storage).toEqual({ local: [], session: [] })
  expect(writes).toEqual([])
  const state = await (await page.request.get("/__test/state")).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
})

test("empty and single-task projects support every key and direction", async ({ page }) => {
  const writes = await mount(page, [launchTask("l1")])
  const primaryKeys = ["original", "title", "assignee", "status", "dueDate"]
  const secondaryKeys = ["none", "title", "assignee", "status", "dueDate"]
  const directions = ["asc", "desc"]
  await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil", exact: true })).toBeVisible()
  for (const key of primaryKeys) {
    await page.getByRole("combobox", { name: "Primarni ključ" }).selectOption(key)
    await expect(page.getByRole("combobox", { name: "Primarni ključ" })).toHaveValue(key)
    for (const direction of directions) {
      await page.getByRole("combobox", { name: "Primarna smer" }).selectOption(direction)
      await expect(page.getByRole("combobox", { name: "Primarna smer" })).toHaveValue(direction)
      await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil", exact: true })).toBeVisible()
    }
  }
  for (const key of secondaryKeys) {
    await page.getByRole("combobox", { name: "Sekundarni ključ" }).selectOption(key)
    await expect(page.getByRole("combobox", { name: "Sekundarni ključ" })).toHaveValue(key)
    for (const direction of directions) {
      await page.getByRole("combobox", { name: "Sekundarna smer" }).selectOption(direction)
      await expect(page.getByRole("combobox", { name: "Sekundarna smer" })).toHaveValue(direction)
      await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil", exact: true })).toBeVisible()
    }
  }

  await switchProject(page, "launch")
  for (const key of primaryKeys) {
    await page.getByRole("combobox", { name: "Primarni ključ" }).selectOption(key)
    await expect(page.getByRole("combobox", { name: "Primarni ključ" })).toHaveValue(key)
    for (const direction of directions) {
      await page.getByRole("combobox", { name: "Primarna smer" }).selectOption(direction)
      await expect(page.getByRole("combobox", { name: "Primarna smer" })).toHaveValue(direction)
      await expectIds(page, ["l1"])
    }
  }
  for (const key of secondaryKeys) {
    await page.getByRole("combobox", { name: "Sekundarni ključ" }).selectOption(key)
    await expect(page.getByRole("combobox", { name: "Sekundarni ključ" })).toHaveValue(key)
    for (const direction of directions) {
      await page.getByRole("combobox", { name: "Sekundarna smer" }).selectOption(direction)
      await expect(page.getByRole("combobox", { name: "Sekundarna smer" })).toHaveValue(direction)
      await expectIds(page, ["l1"])
    }
  }
  expect(writes).toEqual([])
})
