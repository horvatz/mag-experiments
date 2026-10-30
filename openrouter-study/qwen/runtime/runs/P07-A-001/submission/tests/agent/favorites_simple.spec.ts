import { test, expect, mount, click, getRoleByText, getByText } from "../development/helpers.ts"

test("T01: Independent favorites by ID", async ({ page }) => {
  await mount(page);
  await click(page, /Priljubljeno opravilo web-02/);
  const btn1 = page.getByRole("button", { name: "Priljubljeno opravilo web-02", exact: true });
  const btn2 = page.getByRole("button", { name: "Priljubljeno opravilo web-03", exact: true });
  await expect(btn1).toHaveAttribute("aria-pressed", "true");
  await expect(btn2).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
