import { expect, test, type Page } from "@playwright/test";
import { createTaskOrderState, taskOrderReducer } from "../../src/taskOrder.ts";
import type { Task } from "../../shared/types.ts";

const tasks: Task[] = [
  { id: "task-01", projectId: "p10", title: "Prvi", description: "Prvi opis", status: "todo", assignee: "Ana", dueDate: "2026-10-01" },
  { id: "task-02", projectId: "p10", title: "Drugi", description: "Drugi opis", status: "in_progress", assignee: "Bine", dueDate: "2026-10-02" },
  { id: "task-03", projectId: "p10", title: "Tretji", description: "Tretji opis", status: "done", assignee: "Cvetka", dueDate: "2026-10-03" },
];

function routeProjects(page: Page, ids: string[]) {
  return page.route("**/api/projects", (route) => route.fulfill({ json: ids.map((id) => ({ id, name: id })) }));
}

function routeTasks(page: Page, projectId: string, records: Task[]) {
  return page.route("**/api/projects/" + projectId + "/tasks", (route) => route.fulfill({ json: records }));
}

test("the reducer preserves permutation fields, edge actions, histories, and reset", () => {
  let state = createTaskOrderState(tasks);
  const unchanged = taskOrderReducer(state, { type: "move", id: "task-01", direction: "up" });
  expect(unchanged).toBe(state);
  state = taskOrderReducer(state, { type: "move", id: "task-02", direction: "down" })!;
  expect(state.order.map((task) => task.id)).toEqual(["task-01", "task-03", "task-02"]);
  expect(state.undo).toHaveLength(1);
  state = taskOrderReducer(state, { type: "undo" })!;
  expect(state.order.map((task) => task.id)).toEqual(["task-01", "task-02", "task-03"]);
  expect(state.redo).toHaveLength(1);
  state = taskOrderReducer(state, { type: "redo" })!;
  expect(state.order.map((task) => task.id)).toEqual(["task-01", "task-03", "task-02"]);
  state = taskOrderReducer(state, { type: "reset" })!;
  expect(state.order.map((task) => task.id)).toEqual(["task-01", "task-02", "task-03"]);
});

test("table moves, undo, redo, reset, details, and counters preserve global order", async ({ page }) => {
  await routeProjects(page, ["p10"]);
  await routeTasks(page, "p10", tasks);
  await page.goto("/#/projects/p10");
  const history = page.getByRole("status", { name: "Zgodovina vrstnega reda" });
  await expect(history).toHaveText("Razveljavitve: 0. Ponovitve: 0.");
  await expect(page.locator("[data-task-id=\"task-02\"]").locator("[aria-label=\"Mesto opravila task-02\"]")).toHaveText("2");
  await expect(page.getByRole("button", { name: "Premakni task-01 gor" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Premakni task-03 dol" })).toBeDisabled();
  await page.getByRole("button", { name: "Premakni task-02 dol" }).click();
  await expect(page.locator("[data-task-id]").first()).toHaveAttribute("data-task-id", "task-01");
  await expect(page.locator("[data-task-id=\"task-03\"]").locator("[aria-label=\"Mesto opravila task-03\"]")).toHaveText("2");
  await expect(history).toHaveText("Razveljavitve: 1. Ponovitve: 0.");
  await page.getByRole("button", { name: "Razveljavi premik" }).click();
  await expect(history).toHaveText("Razveljavitve: 0. Ponovitve: 1.");
  await page.getByRole("button", { name: "Ponovi premik" }).click();
  await expect(history).toHaveText("Razveljavitve: 1. Ponovitve: 0.");
  await page.getByRole("button", { name: "Začetni vrstni red" }).click();
  await expect(history).toHaveText("Razveljavitve: 2. Ponovitve: 0.");
  await page.locator("[data-task-id=\"task-02\"]").getByRole("link").click();
  await page.getByRole("button", { name: "Zapri podrobnosti" }).click();
  await page.getByRole("button", { name: "Tabla", exact: true }).click();
  await page.getByRole("button", { name: "Preglednica", exact: true }).click();
  await expect(history).toHaveText("Razveljavitve: 2. Ponovitve: 0.");
});

test("the board keeps status columns while moving global neighbors across columns", async ({ page }) => {
  await routeProjects(page, ["p10"]);
  await routeTasks(page, "p10", tasks);
  await page.goto("/#/projects/p10?view=board");
  const board = page.getByRole("region", { name: "Tabla opravil", exact: true });
  const work = board.getByRole("region", { name: "V delu", exact: true });
  const done = board.getByRole("region", { name: "Končano", exact: true });
  await expect(work.locator("[data-task-id=\"task-02\"]")).toBeVisible();
  await expect(work.getByRole("link")).toHaveAttribute("href", "#/projects/p10/tasks/task-02?view=board");
  await board.getByRole("button", { name: "Premakni task-02 dol" }).click();
  await expect(work.locator("[data-task-id=\"task-02\"]").locator("[aria-label=\"Mesto opravila task-02\"]")).toHaveText("3");
  await expect(done.locator("[data-task-id=\"task-03\"]").locator("[aria-label=\"Mesto opravila task-03\"]")).toHaveText("2");
  await board.getByRole("button", { name: "Premakni task-03 gor" }).click();
  await expect(page.getByRole("status", { name: "Zgodovina vrstnega reda" })).toHaveText("Razveljavitve: 2. Ponovitve: 0.");
});

test("a new valid move clears redo, while twenty-one moves keep only twenty undo entries", async ({ page }) => {
  await routeProjects(page, ["p10"]);
  await routeTasks(page, "p10", tasks);
  await page.goto("/#/projects/p10");
  const history = page.getByRole("status", { name: "Zgodovina vrstnega reda" });
  for (let index = 0; index < 21; index += 1) {
    await page.getByRole("button", { name: index % 2 === 0 ? "Premakni task-02 dol" : "Premakni task-02 gor" }).click();
  }
  await expect(history).toHaveText("Razveljavitve: 20. Ponovitve: 0.");
  for (let index = 0; index < 20; index += 1) await page.getByRole("button", { name: "Razveljavi premik" }).click();
  await expect(history).toHaveText("Razveljavitve: 0. Ponovitve: 20.");
  await page.getByRole("button", { name: "Premakni task-02 gor" }).click();
  await expect(history).toHaveText("Razveljavitve: 1. Ponovitve: 0.");
});

test("project changes and refresh reset local order without persistence or writes", async ({ page }) => {
  await routeProjects(page, ["p10", "p10-other"]);
  await routeTasks(page, "p10", tasks);
  await routeTasks(page, "p10-other", tasks);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") requests.push(request.method() + " " + request.url());
  });
  await page.goto("/#/projects/p10");
  await page.getByRole("button", { name: "Premakni task-02 dol" }).click();
  await page.getByRole("navigation").getByRole("link", { name: "p10-other" }).click();
  await expect(page.getByRole("status", { name: "Zgodovina vrstnega reda" })).toHaveText("Razveljavitve: 0. Ponovitve: 0.");
  await page.goBack();
  await page.getByRole("button", { name: "Premakni task-02 dol" }).click();
  await page.reload();
  await expect(page.getByRole("status", { name: "Zgodovina vrstnega reda" })).toHaveText("Razveljavitve: 0. Ponovitve: 0.");
  expect(requests).toEqual([]);
});

test("empty and single-task projects remain usable without valid moves", async ({ page }) => {
  await routeProjects(page, ["empty", "single"]);
  await routeTasks(page, "empty", []);
  await routeTasks(page, "single", [structuredClone(tasks[0])]);
  await page.goto("/#/projects/empty");
  await expect(page.getByRole("heading", { name: "V tem projektu še ni opravil" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Razveljavi premik" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Ponovi premik" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Začetni vrstni red" })).toBeDisabled();
  await page.goto("/#/projects/single");
  await expect(page.getByRole("button", { name: "Premakni task-01 gor" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Premakni task-01 dol" })).toBeDisabled();
  await expect(page.getByRole("status", { name: "Zgodovina vrstnega reda" })).toHaveText("Razveljavitve: 0. Ponovitve: 0.");
});

test("mobile layout stays inside the viewport at 390 pixels", async ({ page }) => {
  await routeProjects(page, ["p10"]);
  await routeTasks(page, "p10", tasks);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/projects/p10?view=board");
  await expect(page.getByRole("region", { name: "Tabla opravil", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
});
