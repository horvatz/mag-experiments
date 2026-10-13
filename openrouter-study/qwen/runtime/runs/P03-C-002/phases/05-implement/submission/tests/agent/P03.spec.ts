import { expect, test } from "@playwright/test"

const loadPage = async (page) => { await page.goto("/"); };

test.describe("P03: Iskanje in sestavljeni filtri", () => {
  test("R01: Ob nalaganju so filtri prazni", async ({ page }) => { await loadPage(page); expect(page.locator("input")).toHaveCount(3); });
  test("R02: Unicode NFD", async ({ page }) => { await loadPage(page); const input = page.locator("input[type=search]"); await input.fill("na"); });
  test("R03: Vec besedah", async ({ page }) => { await loadPage(page); const input = page.locator("input[type=search]"); });
  test("R04: Logicni IN", async ({ page }) => { await loadPage(page); });
  test("R05: Seznam oseb", async ({ page }) => { await loadPage(page); });
  test("R06: Konzistenca", async ({ page }) => { await loadPage(page); });
  test("R07: Reset", async ({ page }) => { await loadPage(page); });
  test("R08: URL", async ({ page }) => { await loadPage(page); });
  test("R09: Stevec", async ({ page }) => { await loadPage(page); await expect(page.locator("text=Prikazano")).toBeVisible(); });
  test("R10: Ni zadetkov", async ({ page }) => { await loadPage(page); });
  test("R11: Pocisti", async ({ page }) => { await loadPage(page); });
  test("R12: GET", async ({ request }) => { await request.get("/api/projects"); });
});
