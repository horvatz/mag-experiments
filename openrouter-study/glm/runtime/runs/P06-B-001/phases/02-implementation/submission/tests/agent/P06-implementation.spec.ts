import { board, downloadCSV, ids, makeTask, mount, project, select, table, test } from "../development/helpers.ts"
import { expect } from "@playwright/test"
import { csvColumns, neutralizeFormula } from "../../src/csvExport.ts"

const apostrophe = String.fromCharCode(39)
const quote = String.fromCharCode(34)
const csvQuote = (value: string, neutralize = false) => quote + (neutralize ? neutralizeFormula(value) : value).replaceAll(quote, quote + quote) + quote
const csvText = (rows: string[][], separator = ";") => "\uFEFF" + rows.map((row) => row.join(separator)).join("\r\n") + "\r\n"

test("A01: fixed column order, disabled empty selection and exact CSV framing", async ({ page }) => {
  const records = [
    makeTask("web-01", { title: "=SUM(A1)", status: "in_progress", assignee: "Živa Črt", dueDate: "2026-10-01", description: "Prva vrstica\r\nDruga vrstica; čšž" }),
    makeTask("web-02", { title: "Alfa 10", assignee: "Maja Zupan", dueDate: "2026-09-28" }),
  ]
  await mount(page, records)
  const exportButton = page.getByRole("button", { name: "Izvozi CSV", exact: true })

  for (const column of csvColumns) await page.getByRole("checkbox", { name: "Stolpec " + column, exact: true }).uncheck()
  await expect(exportButton).toBeDisabled()
  const attemptedDownloads: string[] = []
  const downloadListener = () => attemptedDownloads.push("download")
  page.once("download", downloadListener)
  await exportButton.evaluate((node) => node.dispatchEventEvent("click"))
  await expect(attemptedDownloads).toEqual([])
  page.off("download", downloadListener)

  for (const column of [...csvColumns].reverse()) await page.getByRole("checkbox", { name: "Stolpec " + column, exact: true }).check()
  const file = await downloadCSV(page)
  const header = [...csvColumns].map((column) => csvQuote(column))
  const dataRows = records.map((record) => csvColumns.map((column) => csvQuote(record[column], true)))
  expect(file.name).toBe("folio-web.csv")
  expect(file.text).toBe(csvText([header, ...dataRows]))
  expect(file.text.startsWith("\uFEFF" + quote + "id" + quote + ";")).toBe(true)
  expect(file.text.endsWith("\r\n")).toBe(true)
  expect(neutralizeFormula("=A")).toBe(apostrophe + "=A")
  expect(neutralizeFormula("\t+A")).toBe(apostrophe + "\t+A")
  expect(neutralizeFormula(" \r\n-A")).toBe(apostrophe + " \r\n-A")
  expect(neutralizeFormula(" @Q")).toBe(apostrophe + " @Q")
  expect(neutralizeFormula("Navadno besedilo")).toBe("Navadno besedilo")
})

test("A02: filters, empty result and settings reset on project change", async ({ page }) => {
  const records = [
    makeTask("web-01", { title: "Pripravljeno", status: "todo" }),
    makeTask("web-02", { title: "Končano", status: "done" }),
  ]
  await mount(page, records)
  const exportButton = page.getByRole("button", { name: "Izvozi CSV", exact: true })

  for (const column of csvColumns) if (column !== "id") await page.getByRole("checkbox", { name: "Stolpec " + column, exact: true }).uncheck()
  await select(page, "Ločilo CSV", ",")
  await select(page, "Filter izvoza", "done")
  const doneFile = await downloadCSV(page)
  expect(doneFile.text).toBe(csvText([["id"], ["web-02"]], ","))

  await select(page, "Filter izvoza", "in_progress")
  await expect(exportButton).toBeDisabled()

  await project(page, "launch")
  await expect(exportButton).toBeDisabled()
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  for (const column of csvColumns) await expect(page.getByRole("checkbox", { name: "Stolpec " + column, exact: true })).toBeChecked()

  await project(page, "web")
  const defaultFile = await downloadCSV(page)
  expect(defaultFile.text).toBe(csvText([csvColumns.map((column) => csvQuote(column)), ...records.map((record) => csvColumns.map((column) => csvQuote(record[column], true)))]))
})

test("A03: view parity, no writes, no popups and refresh reset", async ({ page }) => {
  const writes = await mount(page)
  const taskIds = await ids(page)
  const popups: string[] = []
  page.on("popup", () => popups.push("popup"))

  await select(page, "Filter izvoza", "in_progress")
  await select(page, "Ločilo CSV", ",")
  for (const column of csvColumns) if (column !== "id") await page.getByRole("checkbox", { name: "Stolpec " + column, exact: true }).uncheck()
  const tableFile = await downloadCSV(page)

  await board(page)
  expect(await downloadCSV(page)).toEqual(tableFile)
  await table(page)
  expect(await downloadCSV(page)).toEqual(tableFile)
  expect(await ids(page)).toEqual(taskIds)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible()
  await expect(page.getByRole("combobox", { name: "Filter izvoza", exact: true })).toHaveValue("all")
  await expect(page.getByRole("combobox", { name: "Ločilo CSV", exact: true })).toHaveValue(";")
  for (const column of csvColumns) await expect(page.getByRole("checkbox", { name: "Stolpec " + column, exact: true })).toBeChecked()
  expect(popups).toEqual([])
  await expect(page.getByRole("button", { name: "Izvozi CSV", exact: true })).toBeEnabled()
  expect(await ids(page)).toEqual(taskIds)
  expect(writes).toEqual([])
})
