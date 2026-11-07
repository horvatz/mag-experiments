import { expect, test } from "@playwright/test"

type TaskFixture = { id: string; projectId: string; title: string; description: string; status: "todo" | "in_progress" | "done"; assignee: string; dueDate: string }

function task(index: number, status: TaskFixture["status"]): TaskFixture {
  return {
    id: `p-${String(index).padStart(2, "0")}`,
    projectId: "test-project",
    title: `Opravilo ${index}`,
    description: `Opis ${index}`,
    status,
    assignee: `Oseba ${index}`,
    dueDate: "2026-10-20",
  }
}

const tasks: TaskFixture[] = [
  task(1, "in_progress"),
  task(2, "todo"),
  task(3, "done"),
  task(4, "todo"),
  task(5, "in_progress"),
  task(6, "done"),
  task(7, "todo"),
  task(8, "in_progress"),
  task(9, "done"),
  task(10, "todo"),
  task(11, "done"),
  task(12, "todo"),
]

async function mockTasks(page: import("@playwright/test").Page, entries: TaskFixture[]) {
  await page.route("**/api/projects/test-project/tasks", (route) => route.fulfill({ json: entries }))
}

async function visibleIds(page: import("@playwright/test").Page) {
  return page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-task-id") ?? ""))
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/projects", (route) => route.fulfill({ json: [{ id: "test-project", name: "Testni projekt" }, { id: "other", name: "Drugi projekt" }] }))
})

test("R01 defaults show all tasks in source order", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project")
  await expect(page.getByLabel("Velikost strani")).toHaveValue("all")
  await expect(page.getByLabel("Filter strani")).toHaveValue("all")
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 1 od 1. Prikazano 1–12 od 12.")
  expect(await visibleIds(page)).toEqual(tasks.map((entry) => entry.id))
})

test("R02 and R03 paginate numerically and disable invalid edges", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project")
  await page.getByLabel("Velikost strani").selectOption("2")
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 1 od 6. Prikazano 1–2 od 12.")
  await expect(page.getByRole("button", { name: "Prva stran" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Prejšnja stran" })).toBeDisabled()
  await page.getByRole("button", { name: "Zadnja stran" }).click()
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 6 od 6. Prikazano 11–12 od 12.")
  await expect(page.getByRole("button", { name: "Naslednja stran" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Zadnja stran" })).toBeDisabled()
  const before = await visibleIds(page)
  await page.getByRole("button", { name: "Naslednja stran" }).click({ force: true })
  await page.getByRole("button", { name: "Zadnja stran" }).click({ force: true })
  expect(await visibleIds(page)).toEqual(before)
})

test("R02 sizes 5 and 10 preserve every id exactly once", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project")
  for (const size of ["5", "10"]) {
    await page.getByLabel("Velikost strani").selectOption(size)
    const pages: string[][] = []
    pages.push(await visibleIds(page))
    while (await page.getByRole("button", { name: "Naslednja stran" }).isEnabled()) {
      await page.getByRole("button", { name: "Naslednja stran" }).click()
      pages.push(await visibleIds(page))
    }
    expect(pages.flat()).toEqual(tasks.map((entry) => entry.id))
    await page.getByLabel("Velikost strani").selectOption("all")
  }
})

test("R04 changing size always returns to the first page", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project")
  await page.getByLabel("Velikost strani").selectOption("2")
  await page.getByRole("button", { name: "Naslednja stran" }).click()
  await page.getByLabel("Velikost strani").selectOption("all")
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 1 od 1. Prikazano 1–12 od 12.")
})

test("R05 filter applies before paging and keeps source order", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project")
  await page.getByLabel("Filter strani").selectOption("done")
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 1 od 1. Prikazano 1–4 od 4.")
  expect(await visibleIds(page)).toEqual(tasks.filter((entry) => entry.status === "done").map((entry) => entry.id))
  await page.getByLabel("Velikost strani").selectOption("2")
  await page.getByRole("button", { name: "Zadnja stran" }).click()
  await page.getByLabel("Filter strani").selectOption("all")
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 1 od 6. Prikazano 1–2 od 12.")
})

test("R06 table and board show the same current ids", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project")
  await page.getByLabel("Velikost strani").selectOption("5")
  await page.getByRole("button", { name: "Naslednja stran" }).click()
  const tableIds = await visibleIds(page)
  await page.getByRole("button", { name: "Tabla" }).click()
  expect((await visibleIds(page)).sort()).toEqual([...tableIds].sort())
  await page.getByRole("button", { name: "Preglednica" }).click()
  expect((await visibleIds(page)).sort()).toEqual([...tableIds].sort())
})

test("R07 view and details preserve paging state", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project")
  await page.getByLabel("Filter strani").selectOption("todo")
  await page.getByLabel("Velikost strani").selectOption("2")
  await page.getByRole("button", { name: "Naslednja stran" }).click()
  const status = await page.getByLabel("Stanje straničenja").textContent()
  await page.getByRole("button", { name: "Tabla" }).click()
  await expect(page.getByLabel("Stanje straničenja")).toHaveText(status ?? "")
  await page.locator("[data-task-id]").first().getByRole("link").click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: "Zapri podrobnosti" }).click()
  await expect(page.getByLabel("Stanje straničenja")).toHaveText(status ?? "")
})

test("R08 project switch and refresh reset pagination state", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.route("**/api/projects/other/tasks", (route) => route.fulfill({ json: [task(1, "todo"), task(2, "done")] }))
  await page.goto("/#/projects/test-project")
  await page.getByLabel("Filter strani").selectOption("done")
  await page.getByLabel("Velikost strani").selectOption("2")
  await page.getByRole("button", { name: "Zadnja stran" }).click()
  await page.goto("/#/projects/other")
  await expect(page.getByLabel("Filter strani")).toHaveValue("all")
  await expect(page.getByLabel("Velikost strani")).toHaveValue("all")
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 1 od 1. Prikazano 1–2 od 2.")
})

test("R09 status text uses exact first and last indexes", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project")
  await page.getByLabel("Velikost strani").selectOption("5")
  await page.getByRole("button", { name: "Zadnja stran" }).click()
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 3 od 3. Prikazano 11–12 od 12.")
})

test("R10 empty result shows zero status and disables all navigation", async ({ page }) => {
  await mockTasks(page, [])
  await page.goto("/#/projects/test-project")
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 0 od 0. Prikazano 0–0 od 0.")
  for (const name of ["Prva stran", "Prejšnja stran", "Naslednja stran", "Zadnja stran"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()
  }
})

test("R11 overview counts all tasks while board columns count current page", async ({ page }) => {
  await mockTasks(page, tasks)
  await page.goto("/#/projects/test-project?view=board")
  await page.getByLabel("Velikost strani").selectOption("2")
  await expect(page.locator(".summary-grid")).toContainText("4")
  const counts = await page.locator(".column-count").evaluateAll((nodes) => nodes.map((node) => node.textContent))
  expect(counts).toEqual(["1", "1", "0"])
})

test("R12 paging performs no writes and keeps narrow layout usable", async ({ page }) => {
  const saveRequests: string[] = []
  page.on("request", (requested) => {
    if (requested.method() !== "GET") saveRequests.push(`${requested.method()} ${requested.url()}`)
  })
  await mockTasks(page, tasks)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/#/projects/test-project")
  await page.getByLabel("Filter strani").selectOption("in_progress")
  await page.getByLabel("Velikost strani").selectOption("2")
  await page.getByRole("button", { name: "Zadnja stran" }).click()
  await expect(page.getByLabel("Stanje straničenja")).toHaveText("Stran 2 od 2. Prikazano 3–3 od 3.")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
  expect(saveRequests).toEqual([])
})
