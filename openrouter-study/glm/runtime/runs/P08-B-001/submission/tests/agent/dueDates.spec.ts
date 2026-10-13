import { addDays, isCalendarDate, taskDueGroup } from "../../src/dueDates.ts";
import { expect, test } from "@playwright/test";
import type { Task } from "../../shared/types.ts";

const makeTask = (id: string, dueDate: string, status: Task['status'] = "todo"): Task => ({
  id,
  projectId: "test",
  title: `Task ${id}`,
  description: `Description ${id}`,
  status,
  assignee: "Ana Novak",
  dueDate,
});

test("calendar dates cross month, year and leap-day boundaries", () => {
  expect(addDays("2026-02-23", 7)).toBe("2026-03-02");
  expect(addDays("2025-12-28", 7)).toBe("2026-01-04");
  expect(addDays("2024-02-23", 7)).toBe("2024-03-01");
  expect(isCalendarDate("2024-02-29")).toBe(true);
  expect(isCalendarDate("2026-02-29")).toBe(false);
});

test("due groups are complete, disjoint and independent of wall time", () => {
  const referenceDate = "2026-09-21";
  const cases: [string, Task, ReturnType<typeof taskDueGroup>][] = [
    ["done before reference", makeTask("before", "2026-09-20", "done"), "done"],
    ["done on reference", makeTask("same", "2026-09-21", "done"), "done"],
    ["done after reference", makeTask("after", "2026-10-01", "done"), "done"],
    ["overdue", makeTask("overdue", "2026-09-20"), "overdue"],
    ["today", makeTask("today", "2026-09-21"), "today"],
    ["week start", makeTask("week-start", "2026-09-22"), "week"],
    ["week end", makeTask("week-end", "2026-09-28"), "week"],
    ["later", makeTask("later", "2026-09-29"), "later"],
  ];
  for (const [, task, expected] of cases) expect(taskDueGroup(task, referenceDate)).toBe(expected);
});
