import { test, expect } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { CSV_COLUMNS, csvValue, serializeCsv } from '../../src/csv.ts'

const task: Task = {
  id: 'z-19', projectId: 'web', title: 'Čas, "citat"; 🦉', status: 'in_progress',
  assignee: ' Živa ', dueDate: '2028-02-29', description: 'Prva\rDruga\nTretja\r\nČetrta',
}

test('C01: exact bytes, original fields and line endings for both delimiters', () => {
  expect(serializeCsv([task], CSV_COLUMNS, ';', 'all')).toBe(
    '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    '"z-19";"web";"Čas, ""citat""; 🦉";"in_progress";" Živa ";"2028-02-29";"Prva\rDruga\nTretja\r\nČetrta"\r\n',
  )
  const csv = serializeCsv([task], ['description', 'title'], ',', 'all')!
  const expected = '\uFEFF"title","description"\r\n"Čas, ""citat""; 🦉","Prva\rDruga\nTretja\r\nČetrta"\r\n'
  expect(Buffer.from(csv)).toEqual(Buffer.from(expected))
  expect([...Buffer.from(csv).subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
})

test('C02: canonical columns, stable filtering, empty selections and frozen inputs', () => {
  const tasks = Object.freeze([
    Object.freeze({ ...task, id: 'second', status: 'done' as const }),
    Object.freeze(task),
    Object.freeze({ ...task, id: 'first', status: 'done' as const }),
  ])
  const snapshot = JSON.stringify(tasks)
  const columns = Object.freeze(['status', 'id'] as const)
  expect(serializeCsv(tasks, columns, ',', 'done')).toBe('\uFEFF"id","status"\r\n"second","done"\r\n"first","done"\r\n')
  expect(serializeCsv(tasks, [], ';', 'all')).toBeNull()
  expect(serializeCsv([], CSV_COLUMNS, ';', 'all')).toBeNull()
  expect(serializeCsv(tasks, CSV_COLUMNS, ';', 'todo')).toBeNull()
  expect(JSON.stringify(tasks)).toBe(snapshot)
  expect(columns).toEqual(['status', 'id'])
})

test('C03: exact formula prefixes and unchanged negative cases', () => {
  for (const prefix of ['', ' ', '\t', '\r', '\n', ' \t\r\n  ']) {
    for (const trigger of ['=', '+', '-', '@']) {
      const input = `${prefix}${trigger}SUM("č")`
      expect(csvValue(input)).toBe(`"'${prefix}${trigger}SUM(""č"")"`)
    }
  }
  for (const input of ['', '  ', ' čšž 🦉 ', 'abc=1', "'=1", '\u00a0=1', '\v+1', '\f-1', '\uFEFF@1']) {
    expect(csvValue(input)).toBe(`"${input}"`)
  }
})

test('C04: every data column uses neutralization, headers stay literal', () => {
  // Exercise the cell rule independently of status/date domain validation.
  for (const column of CSV_COLUMNS) {
    const record = { ...task, [column]: ' \t=1' } as Task
    expect(serializeCsv([record], [column], ';', 'all')).toBe(`\uFEFF"${column}"\r\n"' \t=1"\r\n`)
  }
  expect(serializeCsv([{ ...task, description: '' }], ['description'], ';', 'all')).toBe('\uFEFF"description"\r\n""\r\n')
})
