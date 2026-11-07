import { expect, test, type Page } from "@playwright/test"
import { filterTasks, normalizeText } from "../../src/filters.ts"
import { board, click, columnIds, details, mount, select, summary, table } from "../development/helpers.ts"

const ids = (page: Page) => page.locator("[data-task-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-task-id")))

test("A01: literal search, normalization and word order", () => {
  expect(normalizeText("ČŠŽ čšž")).toBe("csz csz")
  const tasks = [
    { id: "task-1", projectId: "web", title: "Čas za pregled", description: "Analiza vsebine", status: "todo" as const, assignee: "Žan Č", dueDate: "2026-01-01" },
    { id: "task-2", projectId: "web", title: "Zapis =SUM(A1)", description: "Druga vrstica", status: "in_progress" as const, assignee: "Ana", dueDate: "2026-01-02" },
  ]
  expect(filterTasks(tasks, "cas ŽAN", "all", "all").map((task) => task.id)).toEqual(["task-1"])
  expect(filterTasks(tasks, "vrstica Zapis", "all", "all").map((task) => task.id)).toEqual(["task-2"])
  expect(filterTasks(tasks, "=SUM(A1)", "all", "all").map((task) => task.id)).toEqual(["task-2"])
  expect(filterTasks(tasks, "  ", "all", "all")).toHaveLength(2)
})

test("A02: combined filters, views, project reset and refresh", async ({ page }) => {
  const records = [
    { id: "web-04", projectId: "web", title: "Drugi zapis", description: "Opis", status: "todo" as const, assignee: "Ana Novak", dueDate: "2026-02-04" },
    { id: "web-01", projectId: "web", title: "Čas za pregled", description: "Končni zapis vsebine", status: "in_progress" as const, assignee: "Črt", dueDate: "2026-02-01" },
    { id: "web-03", projectId: "web", title: "Pregled vsebine", description: "Opis", status: "done" as const, assignee: "Ana Novak", dueDate: "2026-02-03" },
    { id: "web-02", projectId: "web", title: "Zapis, citat", description: "Prva vrstica", status: "todo" as const, assignee: "Ana Novak", dueDate: "2026-02-02" },
    { id: "launch-01", projectId: "launch", title: "Jesenski načrt", description: "Opis", status: "done" as const, assignee: "Luka", dueDate: "2026-03-01" },
    { id: "launch-02", projectId: "launch", title: "Drugi projekt", description: "Opis", status: "todo" as const, assignee: "Živa", dueDate: "2026-03-02" },
  ]
  const writes = await mount(page, records)

  await expect.poll(() => ids(page)).toEqual(["web-04", "web-01", "web-03", "web-02"])
  await expect(page.getByRole("searchbox", { name: "Išči opravila" })).toHaveValue("")
  await expect(page.getByRole("combobox", { name: "Filter stanja", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter odgovorne osebe", exact: true })).toHaveValue("all")
  const assigneeOptions = await page.getByRole("combobox", { name: "Filter odgovorne osebe", exact: true }).locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))
  expect(assigneeOptions).toEqual(["all", "Ana Novak", "Črt"])

  await page.getByRole("searchbox", { name: "Išči opravila" }).fill("ZA PREGLED č")
  await select(page, "Filter stanja", "in_progress")
  await select(page, "Filter odgovorne osebe", "Črt")
  await expect.poll(() => ids(page)).toEqual(["web-01"])
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 1 od 4.")
  await summary(page, [0, 1, 0])

  await board(page)
  await expect.poll(() => ids(page)).toEqual(["web-01"])
  await columnIds(page, "V delu", ["web-01"])
  await columnIds(page, "Pripravljeno", [])
  await table(page)
  await expect.poll(() => ids(page)).toEqual(["web-01"])

  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Jesenska kampanja", exact: true })).toBeVisible()
  await expect.poll(() => ids(page).then((values) => values.sort())).toEqual(["launch-01", "launch-02"])
  await expect(page.getByRole("searchbox", { name: "Išči opravila" })).toHaveValue("")
  await expect(page.getByRole("combobox", { name: "Filter stanja", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter odgovorne osebe", exact: true })).toHaveValue("all")
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 2 od 2.")

  await page.getByRole("searchbox", { name: "Išči opravila" }).fill("jesenski")
  await select(page, "Filter stanja", "done")
  await select(page, "Filter odgovorne osebe", "Luka")
  await page.reload()
  await expect.poll(() => ids(page)).toEqual(["launch-01", "launch-02"])
  await expect(page.getByRole("searchbox", { name: "Išči opravila" })).toHaveValue("")
  await expect(page.getByRole("combobox", { name: "Filter stanja", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter odgovorne osebe", exact: true })).toHaveValue("all")
  const storage = await page.evaluate(() => [localStorage.length, sessionStorage.length, location.search])
  expect(storage).toEqual([0, 0, ""])
  expect(writes).toEqual([])
})

test("A03: no result, clear, details and narrow layout", async ({ page }) => {
  const writes = await mount(page)
  await page.getByRole("searchbox", { name: "Išči opravila" }).fill("neobstoječe besede")
  await expect(page.getByText("Ni zadetkov.", { exact: true })).toBeVisible()
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 0 od 8.")
  await click(page, "Počisti filtre")
  await expect.poll(() => ids(page)).toEqual(["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"])
  await details(page, "web-01")

  await page.setViewportSize({ width: 390, height: 844 })
  await select(page, "Filter stanja", "todo")
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 4 od 8.")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const state = await (await page.request.get("/__test/state")).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
  expect(writes).toEqual([])
})

test("A04: empty project keeps its normal empty state", async ({ page }) => {
  await mount(page, [{ id: "launch-01", projectId: "launch", title: "Drugi projekt", description: "Opis", status: "todo", assignee: "Luka", dueDate: "2026-04-01" }])
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 0 od 0.")
  await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil" })).toBeVisible()
  await expect(page.getByText("Ni zadetkov.", { exact: true })).toHaveCount(0)
})
