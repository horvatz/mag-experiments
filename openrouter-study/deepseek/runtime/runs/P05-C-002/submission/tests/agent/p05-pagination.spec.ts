import { test, expect } from "@playwright/test"
import type { Page } from "@playwright/test"
import { board, click, columnIds, details, expectIds, ids, makeTask, mount, readonly, select, summary, table } from "../development/helpers.ts"

const status = (page: Page) => page.getByRole("status", { name: "Stanje straničenja" })
const allWebIds = ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"]

test("P01: privzetki all/all v izvornem vrstnem redu", async ({ page }) => {
  await mount(page)
  await expect(page.getByRole("combobox", { name: "Velikost strani" })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter strani" })).toHaveValue("all")
  await expectIds(page, allWebIds)
  await expect(status(page)).toHaveText("Stran 1 od 1. Prikazano 1–8 od 8.")
})

test("P02: odseki 2/5/10 so zaporedni in brez izgub", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  const collected: (string | null)[] = []
  for (let index = 0; index < 4; index += 1) {
    collected.push(...(await ids(page)))
    if (index < 3) await click(page, "Naslednja stran")
  }
  expect(collected).toEqual(allWebIds)
  await select(page, "Velikost strani", "5")
  await expectIds(page, allWebIds.slice(0, 5))
  await click(page, "Zadnja stran")
  await expectIds(page, allWebIds.slice(5))
  await select(page, "Velikost strani", "10")
  await expectIds(page, allWebIds)
})

test("P03: navigacija in onemogočeni robovi", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await expect(page.getByRole("button", { name: "Prva stran", exact: true })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Prejšnja stran", exact: true })).toBeDisabled()
  await click(page, "Zadnja stran")
  await expectIds(page, ["web-07", "web-08"])
  await expect(page.getByRole("button", { name: "Naslednja stran", exact: true })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Zadnja stran", exact: true })).toBeDisabled()
  await click(page, "Prejšnja stran")
  await expectIds(page, ["web-05", "web-06"])
  await click(page, "Prva stran")
  await expectIds(page, ["web-01", "web-02"])
  await expect(page.getByRole("button", { name: "Prva stran", exact: true })).toBeDisabled()
})

test("P04: menjava velikosti vrne na prvo stran; all je ena stran", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Zadnja stran")
  await expectIds(page, ["web-07", "web-08"])
  await select(page, "Velikost strani", "5")
  await expectIds(page, allWebIds.slice(0, 5))
  await expect(status(page)).toHaveText("Stran 1 od 2. Prikazano 1–5 od 8.")
  await select(page, "Velikost strani", "all")
  await expect(status(page)).toHaveText("Stran 1 od 1. Prikazano 1–8 od 8.")
})

test("P05: filter pred straničenjem in vrstni red", async ({ page }) => {
  await mount(page)
  await select(page, "Filter strani", "todo")
  await expectIds(page, ["web-02", "web-04", "web-07", "web-08"])
  await expect(status(page)).toHaveText("Stran 1 od 1. Prikazano 1–4 od 4.")
  await select(page, "Velikost strani", "2")
  await click(page, "Zadnja stran")
  await expectIds(page, ["web-07", "web-08"])
  await select(page, "Filter strani", "done")
  await expectIds(page, ["web-03", "web-06"])
  await select(page, "Filter strani", "all")
  await expectIds(page, ["web-01", "web-02"])
  await select(page, "Velikost strani", "all")
  await expectIds(page, allWebIds)
})

test("P06: preglednica in tabla kažeta isto stran", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  await expectIds(page, ["web-03", "web-04"])
  await board(page)
  await expectIds(page, ["web-03", "web-04"], false)
  await columnIds(page, "Končano", ["web-03"])
  await columnIds(page, "Pripravljeno", ["web-04"])
  await columnIds(page, "V delu", [])
  await table(page)
  await expectIds(page, ["web-03", "web-04"])
})

test("P07: preklop pogleda in podrobnosti ohranita stanje", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  await board(page)
  await expectIds(page, ["web-03", "web-04"], false)
  await details(page, "web-03")
  await expectIds(page, ["web-03", "web-04"], false)
  await expect(page.getByRole("combobox", { name: "Velikost strani" })).toHaveValue("2")
  await table(page)
  await expectIds(page, ["web-03", "web-04"])
  await expect(status(page)).toHaveText("Stran 2 od 4. Prikazano 3–4 od 8.")
})

test("P08: menjava projekta in osvežitev ponastavita stanje", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "2")
  await select(page, "Filter strani", "todo")
  await click(page, "Naslednja stran")
  await expectIds(page, ["web-07", "web-08"])
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja" }).click()
  await expect(page.getByRole("heading", { name: "Jesenska kampanja", exact: true })).toBeVisible()
  await expect(page.getByRole("combobox", { name: "Velikost strani" })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Filter strani" })).toHaveValue("all")
  await expect(status(page)).toHaveText("Stran 1 od 1. Prikazano 1–2 od 2.")
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Spletna prenova" }).click()
  await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
  await expectIds(page, allWebIds)
  await page.reload()
  await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
  await expect(status(page)).toHaveText("Stran 1 od 1. Prikazano 1–8 od 8.")
})

test("P09: natančno besedilo statusa", async ({ page }) => {
  await mount(page)
  await select(page, "Velikost strani", "5")
  await expect(status(page)).toHaveText("Stran 1 od 2. Prikazano 1–5 od 8.")
  await click(page, "Zadnja stran")
  await expect(status(page)).toHaveText("Stran 2 od 2. Prikazano 6–8 od 8.")
  await select(page, "Velikost strani", "2")
  await expect(status(page)).toHaveText("Stran 1 od 4. Prikazano 1–2 od 8.")
})

test("P10: prazen projekt ima status 0 od 0 in onemogočene gumbe", async ({ page }) => {
  await mount(page, [makeTask("launch-01", { projectId: "launch" })])
  await expect(status(page)).toHaveText("Stran 0 od 0. Prikazano 0–0 od 0.")
  for (const name of ["Prva stran", "Prejšnja stran", "Naslednja stran", "Zadnja stran"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()
  }
  await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil" })).toBeVisible()
})

test("P11: prazen filter in vrnitev na prvo stran", async ({ page }) => {
  await mount(page, [makeTask("web-01", { status: "todo" })])
  await select(page, "Filter strani", "done")
  await expect(status(page)).toHaveText("Stran 0 od 0. Prikazano 0–0 od 0.")
  for (const name of ["Prva stran", "Prejšnja stran", "Naslednja stran", "Zadnja stran"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()
  }
  await select(page, "Filter strani", "all")
  await expect(status(page)).toHaveText("Stran 1 od 1. Prikazano 1–1 od 1.")
})

test("P12: povzetek celotnega projekta in števci stolpcev", async ({ page }) => {
  await mount(page)
  await summary(page, [4, 2, 2])
  await select(page, "Velikost strani", "2")
  await select(page, "Filter strani", "todo")
  await summary(page, [4, 2, 2])
  await expect(page.locator(".count-badge")).toHaveText("8")
  await board(page)
  await columnIds(page, "Pripravljeno", ["web-02", "web-04"])
  await columnIds(page, "V delu", [])
  await columnIds(page, "Končano", [])
})

test("P13: straničenje ne spreminja podatkov; povezave in podrobnosti delujejo", async ({ page }) => {
  const writes = await mount(page)
  await select(page, "Velikost strani", "2")
  await click(page, "Naslednja stran")
  await expectIds(page, ["web-03", "web-04"])
  await details(page, "web-03")
  await expectIds(page, ["web-03", "web-04"])
  await page.goto("/#/projects/web/tasks/web-01")
  await expect(page.getByRole("dialog").getByText("web-01", { exact: true }).first()).toBeVisible()
  await page.keyboard.press("Escape")
  await readonly(page, writes)
})
