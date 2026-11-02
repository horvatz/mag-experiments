import { type Page } from "@playwright/test"
import { board, click, expectIds, mount, readonly, select, webIds } from "../development/helpers.ts"
import { expect, test } from "../development/helpers.ts"

const params = (page: Page) => new URLSearchParams(new URL(page.url()).hash.split("?")[1] ?? "")
const historyLength = (page: Page) => page.evaluate(() => history.length)

test("R01: direct URL applies confirmed view state", async ({ page }) => {
  await mount(page, undefined, "#/projects/web?q=%C4%8Cas%20za%20pregled&status=in_progress&order=title-desc")
  await expectIds(page, ["web-01"])
  await expect(page.getByRole("searchbox", { name: "Iskanje v povezavi" })).toHaveValue("Čas za pregled")
  await expect(page.getByRole("combobox", { name: "Stanje v povezavi" })).toHaveValue("in_progress")
  await expect(page.getByRole("combobox", { name: "Vrstni red v povezavi" })).toHaveValue("title-desc")

  await mount(page, undefined, "#/projects/web/tasks/web-03?q=Pregled&status=done&order=title-asc")
  await expect(page.getByRole("dialog").getByText("web-03", { exact: true }).first()).toBeVisible()
  await expect(page.getByRole("searchbox", { name: "Iskanje v povezavi" })).toHaveValue("Pregled")
  await expect(page.getByRole("combobox", { name: "Stanje v povezavi" })).toHaveValue("done")
})

test("R02: query is one literal phrase over all four fields", async ({ page }) => {
  await mount(page, undefined, "#/projects/web?q=Zapis%2C%20%22citat%22")
  await expectIds(page, ["web-06"])

  await mount(page, undefined, "#/projects/web?q=%C5%BDiva%20Kova%C4%8D")
  await expectIds(page, ["web-06"])

  await mount(page, undefined, "#/projects/web?q=web-04")
  await expectIds(page, ["web-04"])

  await mount(page, undefined, "#/projects/web?q=%3DSUM%28A1%29")
  await expectIds(page, ["web-07"])
})

test("R03: status and order combine with query", async ({ page }) => {
  await mount(page, undefined, "#/projects/web?q=alfa&status=todo&order=title-asc")
  await expectIds(page, ["web-04"])

  await mount(page, undefined, "#/projects/web?q=alfa&status=in_progress&order=title-desc")
  await expectIds(page, ["web-05"])

  await mount(page, undefined, "#/projects/web?order=title-asc")
  await expectIds(page, ["web-07", "web-04", "web-05", "web-01", "web-08", "web-02", "web-03", "web-06"])

  await mount(page, undefined, "#/projects/web?order=title-desc")
  await expectIds(page, ["web-06", "web-02", "web-03", "web-08", "web-01", "web-05", "web-04", "web-07"])
})

test("R04: parsing tolerates duplicates and unknown parameters", async ({ page }) => {
  const hash = "#/projects/web?status=done&status=todo&order=title-desc&order=original&unknown=value"
  await mount(page, undefined, hash)
  await expectIds(page, ["web-06", "web-03"])
  await expect(page.getByRole("combobox", { name: "Stanje v povezavi" })).toHaveValue("done")
  await expect(page.getByRole("combobox", { name: "Vrstni red v povezavi" })).toHaveValue("title-desc")
  expect(new URL(page.url()).hash).toBe(hash)
})

test("R05: controls are draft-only until one confirmation", async ({ page }) => {
  await mount(page)
  const before = await historyLength(page)
  await page.getByRole("searchbox", { name: "Iskanje v povezavi" }).fill("Pregled")
  await select(page, "Stanje v povezavi", "done")
  await select(page, "Vrstni red v povezavi", "title-desc")
  await expectIds(page, webIds())
  expect(params(page).get("q")).toBeNull()

  await click(page, "Uporabi pogled")
  await expectIds(page, ["web-03"])
  expect(params(page).get("q")).toBe("Pregled")
  expect(params(page).get("status")).toBe("done")
  expect(params(page).get("order")).toBe("title-desc")
  expect(await historyLength(page)).toBe(before + 1)
})

test("R06: confirmation cleans, encodes and preserves view", async ({ page }) => {
  await mount(page, undefined, "#/projects/web?view=board&unknown=value")
  await page.getByRole("searchbox", { name: "Iskanje v povezavi" }).fill("  Čas za pregled  ")
  const before = await historyLength(page)
  await click(page, "Uporabi pogled")
  const hash = new URL(page.url()).hash
  expect(hash).toContain("view=board")
  expect(hash).toContain("q=%C4%8Cas+za+pregled")
  expect(hash).not.toContain("unknown=value")
  expect(params(page).get("q")).toBe("Čas za pregled")
  await expect(page.getByRole("region", { name: "Tabla opravil" })).toBeVisible()

  await click(page, "Uporabi pogled")
  expect(await historyLength(page)).toBe(before + 1)
})

test("R07: browser history and reload restore confirmed state", async ({ page }) => {
  await mount(page)
  await select(page, "Stanje v povezavi", "done")
  await click(page, "Uporabi pogled")
  await expect(page.getByRole("searchbox", { name: "Iskanje v povezavi" })).toHaveValue("")
  await page.waitForTimeout(100)
  await page.getByRole("searchbox", { name: "Iskanje v povezavi" }).fill("Zapis")
  await expect(page.getByRole("searchbox", { name: "Iskanje v povezavi" })).toHaveValue("Zapis")
  await click(page, "Uporabi pogled")
  await expectIds(page, ["web-06"])

  await page.goBack()
  await expectIds(page, ["web-03", "web-06"])
  await expect(page.getByRole("combobox", { name: "Stanje v povezavi" })).toHaveValue("done")
  await expect(page.getByRole("searchbox", { name: "Iskanje v povezavi" })).toHaveValue("")

  await page.goForward()
  await expectIds(page, ["web-06"])
  await expect(page.getByRole("searchbox", { name: "Iskanje v povezavi" })).toHaveValue("Zapis")

  await page.reload()
  await expectIds(page, ["web-06"])
  await expect(page.getByRole("searchbox", { name: "Iskanje v povezavi" })).toHaveValue("Zapis")
})

test("R08: view switch preserves confirmed filters and discards draft", async ({ page }) => {
  await mount(page, undefined, "#/projects/web?status=done")
  await select(page, "Stanje v povezavi", "todo")
  await board(page)
  await expectIds(page, ["web-03", "web-06"])
  await expect(page.getByRole("combobox", { name: "Stanje v povezavi" })).toHaveValue("done")
  expect(params(page).get("status")).toBe("done")

  await select(page, "Stanje v povezavi", "in_progress")
  await click(page, "Preglednica")
  await expectIds(page, ["web-03", "web-06"])
  await expect(page.getByRole("combobox", { name: "Stanje v povezavi" })).toHaveValue("done")
})

test("R09: details preserve confirmed parameters and view", async ({ page }) => {
  await mount(page, undefined, "#/projects/web?view=board&q=Pregled&status=done")
  await page.locator(`[data-task-id="web-03"]`).getByRole("link").click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("region", { name: "Tabla opravil" })).toBeVisible()
  await expectIds(page, ["web-03"])
  expect(params(page).get("q")).toBe("Pregled")
  expect(params(page).get("status")).toBe("done")
  expect(params(page).get("view")).toBe("board")
})

test("R10: project navigation starts default but direct parameters apply", async ({ page }) => {
  await mount(page, undefined, "#/projects/web?view=board&q=Pregled&status=done")
  await page.getByRole("navigation", { name: "Projekti" }).getByRole("link", { name: "Jesenska kampanja" }).click()
  await expect(page.getByRole("heading", { name: "Jesenska kampanja", exact: true })).toBeVisible()
  await expect(page.getByRole("region", { name: "Tabla opravil" })).toBeVisible()
  expect(params(page).get("view")).toBe("board")
  expect(params(page).get("q")).toBeNull()
  expect(params(page).get("status")).toBeNull()

  await mount(page, undefined, "#/projects/launch?view=board&q=Drugi&status=done")
  await expectIds(page, ["launch-02"])
  await expect(page.getByRole("combobox", { name: "Stanje v povezavi" })).toHaveValue("done")
})

test("R11: reset, empty result and result counter work", async ({ page }) => {
  const writes = await mount(page, undefined, "#/projects/web?view=board&q=neobstaja")
  await expectIds(page, [])
  await expect(page.getByRole("heading", { name: "Ni zadetkov." })).toBeVisible()
  await expect(page.getByRole("status", { name: "Rezultati povezave" })).toHaveText("Prikazano: 0 od 8.")

  await click(page, "Ponastavi pogled")
  await expectIds(page, webIds(), false)
  await expect(page.getByRole("status", { name: "Rezultati povezave" })).toHaveText("Prikazano: 8 od 8.")
  expect(params(page).get("view")).toBe("board")
  expect(params(page).get("q")).toBeNull()
  await readonly(page, writes)
})

test("R12: actions stay read-only, responsive and preserve existing behavior", async ({ page }) => {
  const writes = await mount(page, undefined, "#/projects/web?view=board&q=Pregled&status=done")
  await page.locator(`[data-task-id="web-03"]`).getByRole("link").click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: "Zapri podrobnosti" }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await readonly(page, writes)

  await page.goto("/#/neznana-pot")
  await expect(page.getByRole("heading", { name: "Projekt ne obstaja" })).toBeVisible()

  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto("/#/projects/web?q=Pregled&status=done")
  await expectIds(page, ["web-03"])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})
