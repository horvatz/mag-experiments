import { expect, test } from '@playwright/test'
import { createCsv, csvColumns, defaultCsvColumns } from '../../src/csv.ts'
import type { Task } from '../../shared/types.ts'

const task: Task = {
  id: 'task-01',
  projectId: 'web-01',
  title: '\t=SUM(A1)\r\n"Citati", življenje',
  description: 'Prva\r\nDruga; čšž',
  status: 'in_progress',
  assignee: 'Živa Kovač',
  dueDate: '2026-10-10',
}

test('creates complete default CSV', () => {
  expect(createCsv([task], defaultCsvColumns, ';', 'all')).toBe(
    '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    '"task-01";"web-01";"\'\t=SUM(A1)\r\n""Citati"", življenje";"in_progress";"Živa Kovač";"2026-10-10";"Prva\r\nDruga; čšž"\r\n',
  )
})

test('keeps canonical column order and supports comma separator', () => {
  expect(createCsv([task], ['description', 'id'], ',', 'all')).toBe(
    '\uFEFF"id","description"\r\n"task-01","Prva\r\nDruga; čšž"\r\n',
  )
})

test('filters rows without changing the interface data source', () => {
  const second: Task = { ...task, id: 'task-02', status: 'done' }
  expect(createCsv([task, second], csvColumns, ';', 'done')).toContain('"task-02"')
  expect(createCsv([task, second], csvColumns, ';', 'done')).not.toContain('"task-01"')
})
