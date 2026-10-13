import { expect, test, type Page } from "@playwright/test";
import { expectIds, mount, select } from "../development/helpers.ts";

const countValues = async (page: Page) => {
  const values = await page.locator("[aria-label=\"Pregled stanj opravil\"] strong").allInnerTexts();
  return values.map(Number);
};

test("fixed anchor, independent counters and ordered groups", async ({ page }) => {
  const writes = await mount(page);
  const date = page.getByLabel("Referenčni datum", { exact: true });
  await expect(date).toHaveValue("2026-09-21");
  await expectIds(page, ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"]);
  await expect(page.locator("[aria-label=\"Pregled stanj opravil\"] strong")).toHaveText(["2", "0", "2", "2", "2"]);
  const initialCounts = await countValues(page);
  const expected: [string, string[]][] = [
    ["overdue", ["web-01", "web-07"]],
    ["today", []],
    ["week", ["web-02", "web-04"]],
    ["later", ["web-05", "web-08"]],
    ["done", ["web-03", "web-06"]],
  ];
  for (const [view, ids] of expected) {
    await select(page, "Pogled rokov", view);
    await expectIds(page, ids);
    expect(await countValues(page)).toEqual(initialCounts);
  }
  await select(page, "Pogled rokov", "all");
  await expectIds(page, ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"]);
  expect(writes).toEqual([]);
});

test("date changes, empty draft, view sync and reset stay read-only", async ({ page }) => {
  const writes = await mount(page);
  const date = page.getByLabel("Referenčni datum", { exact: true });
  const view = page.getByLabel("Pogled rokov", { exact: true });
  await select(page, "Pogled rokov", "overdue");
  await date.fill("");
  await expect(page.getByRole("alert")).toHaveText("Vnesi veljaven referenčni datum.");
  await expectIds(page, ["web-01", "web-07"]);
  await date.fill("2026-09-20");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expectIds(page, ["web-01"]);
  await expect(view).toHaveValue("overdue");
  await expect(date).toHaveValue("2026-09-20");

  await page.getByRole("button", { name: "Tabla", exact: true }).click();
  await expect(page.getByRole("region", { name: "Tabla opravil" })).toBeVisible();
  await expectIds(page, ["web-01"]);
  await expect(date).toHaveValue("2026-09-20");
  await expect(view).toHaveValue("overdue");
  await page.getByRole("button", { name: "Preglednica", exact: true }).click();
  await expectIds(page, ["web-01"]);
  await expect(date).toHaveValue("2026-09-20");
  await expect(view).toHaveValue("overdue");

  await page.reload();
  await expect(date).toHaveValue("2026-09-21");
  await expect(view).toHaveValue("all");
  await expectIds(page, ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"]);
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0);
  expect(page.url()).not.toMatch(/reference|bucket|dueView/);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(writes).toEqual([]);
  const state = await (await page.request.get("/__test/state")).json() as { saveRequests: number };
  expect(state.saveRequests).toBe(0);
});

test("empty groups and empty projects", async ({ page }) => {
  await mount(page);
  await select(page, "Pogled rokov", "today");
  await expect(page.getByRole("heading", { name: "Ni opravil v izbrani skupini." })).toBeVisible();
  await select(page, "Pogled rokov", "all");
  await expectIds(page, ["web-01", "web-02", "web-03", "web-04", "web-05", "web-06", "web-07", "web-08"]);

  await mount(page, []);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Spletna prenova", exact: true })).toBeVisible();
  await expect(page.locator("[aria-label=\"Pregled stanj opravil\"] strong")).toHaveText(["0", "0", "0", "0", "0"]);
});
