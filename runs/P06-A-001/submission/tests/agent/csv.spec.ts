import { expect, test } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { createCsv, CSV_COLUMNS } from '../../src/csv.ts'

const record: Task = {
  id: 'Z-9', projectId: 'Projekt-8', title: 'Enak naslov', status: 'in_progress',
  assignee: 'Živa Čuk', dueDate: '2028-02-29', description: '  Živjo 世界 🌍  ',
}

test('A01: canonical fields, original row order and immutable inputs', () => {
  const records = Object.freeze([
    Object.freeze({ ...record }),
    Object.freeze({ ...record, id: 'A-1', status: 'done' as const, description: '' }),
  ])
  const before = JSON.stringify(records)
  const selected = Object.freeze([...CSV_COLUMNS].reverse())
  const result = createCsv(records, selected, ';')
  expect(result).toBe(
    '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    '"Z-9";"Projekt-8";"Enak naslov";"in_progress";"Živa Čuk";"2028-02-29";"  Živjo 世界 🌍  "\r\n' +
    '"A-1";"Projekt-8";"Enak naslov";"done";"Živa Čuk";"2028-02-29";""\r\n',
  )
  expect(JSON.stringify(records)).toBe(before)
  expect(selected).toEqual([...CSV_COLUMNS].reverse())
  expect(createCsv(records, ['description', 'id'], ',')).toBe(
    '\uFEFF"id","description"\r\n"Z-9","  Živjo 世界 🌍  "\r\n"A-1",""\r\n',
  )
})

test('A02: quoted delimiters, exact line breaks and dangerous IDs with both separators', () => {
  const special: Task = {
    ...record, id: '-9', projectId: '-Projekt', title: ' Zapis, "citat"; čšž ',
    description: '\t@"ime"\r\nDruga; vrstica, 🌍\rTretja\nZadnja  ',
  }
  const values = '"\'-9";"\'-Projekt";" Zapis, ""citat""; čšž ";"\'\t@""ime""\r\nDruga; vrstica, 🌍\rTretja\nZadnja  "\r\n'
  expect(createCsv([special], ['description', 'title', 'projectId', 'id'], ';')).toBe(
    '\uFEFF"id";"projectId";"title";"description"\r\n' + values,
  )
  expect(createCsv([special], ['description', 'title', 'projectId', 'id'], ',')).toBe(
    '\uFEFF"id","projectId","title","description"\r\n' +
    '"\'-9","\'-Projekt"," Zapis, ""citat""; čšž ","\'\t@""ime""\r\nDruga; vrstica, 🌍\rTretja\nZadnja  "\r\n',
  )
})

test('A03: formulas use exactly the specified leading characters and preserve safe strings', () => {
  const cases: [string, string][] = [
    ['=1', "'=1"], ['+1', "'+1"], ['-1', "'-1"], ['@name', "'@name"],
    [' =1', "' =1"], ['\t+1', "'\t+1"], ['\r-1', "'\r-1"], ['\n@name', "'\n@name"],
    [' \t\r\n =1', "' \t\r\n =1"], ['\n \r\t +1', "'\n \r\t +1"],
    ['\r\n\t -1', "'\r\n\t -1"], ['\t\n\r @name', "'\t\n\r @name"],
    ['', ''], [' \t\r\n', ' \t\r\n'], ['text =1', 'text =1'], ["'=1", "'=1"],
    ['\u00a0=1', '\u00a0=1'], ['\v+1', '\v+1'], ['\f-1', '\f-1'],
    ['＋牌', '＋牌'], ['Živjo 👩‍💻 e\u0301', 'Živjo 👩‍💻 e\u0301'],
  ]
  for (const column of ['title', 'assignee', 'description'] as const) {
    for (const [input, expected] of cases) {
      expect(createCsv([{ ...record, [column]: input }], [column], ';'), `${column}: ${JSON.stringify(input)}`)
        .toBe(`\uFEFF"${column}"\r\n"${expected}"\r\n`)
    }
  }
})
