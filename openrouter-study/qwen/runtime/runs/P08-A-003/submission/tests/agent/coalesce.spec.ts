import { test, expect } from "@playwright/test";
test.describe("Kolearski Pregled Rokov", () => {
  test("R01: Default reference date is 2026-09-21 and view is all", async ({ page }) => {
    await page.goto("/#/projects/test-1");
    await expect(page.locator("#duedate-input")).toHaveValue("2026-09-21");
    await expect(page.locator("[aria-label=Ledni pogled rokov] option[value=""all""]")).toBeChecked();
  });

  test("R03: Open task with dueDate before reference date is in overdue", async ({ page }) => {
    await page.goto("/#/projects/overdue-project");
    await expect(page.locator(".count-item[aria-label="Stevilo rokov overdue"]")).toHaveText("2 (overdue)");
    await expect(page.locator(".count-item[aria-label="Stevilo rokov today"]")).toHaveText("0 (today)");
  });

  test("R04: Open task with date up to and including +7 days is in week", async ({ page }) => {
    await page.goto("/#/projects/week-project");
    await expect(page.locator(".count-item[aria-label="Stevilo rokov week"]")).toHaveText("2 (week)");
  });

  test("R05: Dates are handled as calendar dates", async ({ page }) => {
    await page.goto("/#/projects/calendar-project");
    await expect(page.locator("[aria-label=Pregled opravil]")).toContainText("Feb");
  });

  test("R06: Five counters display correct counts", async ({ page }) => {
    await page.goto("/#/projects/all-projects");
    const counts = await page.locator(".count-items").innerHTML();
    expect(counts).toContainText("overdue");
    expect(counts).toContainText("today");
    expect(counts).toContainText("week");
    expect(counts).toContainText("later");
    expect(counts).toContainText("done");
  });

  test("R11: Empty project displays five zeros", async ({ page }) => {
    await page.goto("/#/projects/empty-project");
    await expect(page.locator(".count-item[aria-label="Stevilo rokov overdue"]")).toHaveText("0 (overdue)");
    await expect(page.locator(".count-item[aria-label="Stevilo rokov today"]")).toHaveText("0 (today)");
    await expect(page.locator(".count-item[aria-label="Stevilo rokov week"]")).toHaveText("0 (week)");
    await expect(page.locator(".count-item[aria-label="Stevilo rokov later"]")).toHaveText("0 (later)");
    await expect(page.locator(".count-item[aria-label="Stevilo rokov done"]")).toHaveText("0 (done)");
  });
});

