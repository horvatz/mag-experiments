import { expect, test } from "@playwright/test"
import { defaultSortOptions, sortTasks, type SortOptions } from "../../src/sorting.ts"

interface TestTask {
  id: string
  title: string
  assignee: string
  status: string
  dueDate: string
}

const task = (id: string, title: string, assignee: string, status: string, dueDate: string): TestTask => ({ id, title, assignee, status, dueDate })

const options = (partial: Partial<SortOptions> = {}): SortOptions => ({ ...defaultSortOptions, ...partial })

test("sorting rules are stable and normalized", () => {
  const source = [
    task("z", "Žaba", "Žiga", "done", "2026-03-03"),
    task("s", "Šola", "Ana", "in_progress", "2026-03-02"),
    task("c1", "Čebula", "Bojan", "in_progress", "2026-03-02"),
    task("c2", "Čebula", "Ana", "todo", "2026-03-01"),
  ]
  const original = [...source]

  expect(sortTasks(source, options()).map(item => item.id)).toEqual(["z", "s", "c1", "c2"])
  expect(sortTasks(source, options({ primary: "title" })).map(item => item.id)).toEqual(["c1", "c2", "s", "z"])
  expect(sortTasks(source, options({ primary: "title", primaryDirection: "desc", secondary: "assignee" })).map(item => item.id)).toEqual(["z", "s", "c2", "c1"])
  expect(sortTasks(source, options({ primary: "status" })).map(item => item.id)).toEqual(["c2", "s", "c1", "z"]);
  expect(sortTasks(source, options({ primary: "status", primaryDirection: "desc" })).map(item => item.id)).toEqual(["z", "s", "c1", "c2"]);
  expect(sortTasks(source, options({ primary: "title", secondary: "dueDate", secondaryDirection: "desc" })).map(item => item.id)).toEqual(["c1", "c2", "s", "z"]);
  expect(sortTasks(source, options({ primary: "dueDate" })).map(item => item.id)).toEqual(["c2", "s", "c1", "z"]);
  expect(sortTasks(source, options({ primary: "title", primaryDirection: "desc", secondary: "title", secondaryDirection: "desc" })).map(item => item.id)).toEqual(["z", "s", "c1", "c2"]);
  expect(sortTasks(source, options({ primary: "original", primaryDirection: "desc", secondary: "title", secondaryDirection: "desc" }))).toEqual(source)

  const sorted = sortTasks(source, options({ primary: "title", secondary: "assignee" }))
  expect(sorted.every(item => source.includes(item))).toBe(true)
  expect(source).toEqual(original)
})
