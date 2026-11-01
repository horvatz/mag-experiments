import { test, expect } from "@playwright/test"
import { mount, ids, webIds, select, board, table, click, project, details, readonly, columnIds, summary } from "../development/helpers.ts"


test("R01-R03: default, normalized, and multi-word search", async ({ page }) => {
  const writes = await mount(page)
  await expect.poll(async () => (await ids(page)).sort()).toEqual([...webIds()].sort())
  const search = page.getByRole("searchbox", { name: "Išči opravila" })
  await search.fill("cas ZA pregled")
  await expect.poll(() => ids(page)).toEqual(["web-01"])
  await search.fill("c  vsebine")
  await expect.poll(() => ids(page)).toEqual(["web-01", "web-02"])
  await readonly(page, writes)
})


test("R04-R07: combined filters and project reset", async ({ page }) => {
  const writes = await mount(page)
  await page.getByRole("searchbox", { name: "Išči opravila" }).fill("pregled")
  await select(page, "Filter stanja", "todo")
  await select(page, "Filter odgovorne osebe", "Luka Kovač")
  await expect.poll(() => ids(page)).toEqual(["web-02"])
  await board(page)
  await expect.poll(() => ids(page)).toEqual(["web-02"])
  await table(page)
  await expect.poll(() => ids(page)).toEqual(["web-02"])
  const status = page.getByRole("combobox", { name: "Filter stanja", exact: true })
  await select(page, "Filter odgovorne osebe", "Maja Zupan")
  await status.selectOption("done")
  const options = await page.getByRole("combobox", { name: "Filter odgovorne osebe", exact: true }).locator("option").evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value))
  expect(options).toEqual(["all", "Ana Novak", "Luka Kovač", "Maja Zupan", "Živa Kovač", "Črt"])
  await project(page, "launch")
  await expect(page.getByRole("searchbox", { name: "Išči opravila" })).toHaveValue("")
  await expect(status).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter odgovorne osebe", exact: true })).toHaveValue("all")
  await expect.poll(() => ids(page)).toEqual(["launch-01", "launch-02"])
  await readonly(page, writes)
})


test("R08-R11: reload, no match, clear, and empty project", async ({ page }) => {
  const single = [
    { id: "web-empty", projectId: "web", title: "Prazen", description: "Ni opravil", status: "todo" as const, assignee: "Ana", dueDate: "2026-01-01" },
  ]
  await mount(page, single, "#/projects/web")
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 1 od 1.")
  await select(page, "Filter stanja", "done")
  await page.getByRole("searchbox", { name: "Išči opravila" }).fill("želeno")
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 0 od 1.")
  await expect(page.getByText("Ni zadetkov.", { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole("searchbox", { name: "Išči opravila" })).toHaveValue("")
  await expect(page.getByRole("combobox", { name: "Filter stanja", exact: true })).toHaveValue("all")
  await expect(page.locator("[data-task-id=\"web-empty\"]")).toBeVisible()

})

test("R10: empty project keeps ordinary empty state", async ({ page }) => {
  await mount(page, [], "#/projects/web")
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 0 od 0.")
  await expect(page.getByText("V tem projektu še ni opravil")).toBeVisible()
  await expect(page.getByText("Ni zadetkov.", { exact: true })).toHaveCount(0)
})


test("R09-R12: counts, columns, details, and clear", async ({ page }) => {
  const writes = await mount(page)
  await page.getByRole("searchbox", { name: "Išči opravila" }).fill("p")
  await select(page, "Filter stanja", "in_progress")
  await expect(page.getByRole("status", { name: "Rezultati filtriranja" })).toHaveText("Prikazano: 2 od 8.")
  await summary(page, [0, 2, 0])
  await board(page)
  await columnIds(page, "Pripravljeno", [])
  await columnIds(page, "V delu", ["web-01", "web-05"])
  await columnIds(page, "Končano", [])
  await details(page, "web-01")
  await click(page, "Počisti filtre")
  await expect(page.getByRole("searchbox", { name: "Išči opravila" })).toHaveValue("")
  await expect(page.getByRole("combobox", { name: "Filter stanja", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter odgovorne osebe", exact: true })).toHaveValue("all")
  await expect.poll(async () => (await ids(page)).sort()).toEqual([...webIds()].sort())
  await readonly(page, writes)
})
