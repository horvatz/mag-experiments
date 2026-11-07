import { board, expect, ids, makeTask, mount, project, select, table, test, type Task } from '../development/helpers.ts'
import type { Page } from '@playwright/test'
import { taskValue } from '../../src/csvExport.ts'

const allColumns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const

async function download(page: Page) {
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Izvozi CSV', exact: true }).click()
  const file = await downloadPromise
  const stream = await file.createReadStream()
  if (!stream) throw Error('Download has no stream')
  const parts: Buffer[] = []
  for await (const part of stream) parts.push(Buffer.from(part))
  return { name: file.suggestedFilename(), bytes: Buffer.concat(parts), text: Buffer.concat(parts).toString('utf8') }
}

test('P06 agent export covers all requirements', async ({ page }) => {
  const records: Task[] = [
    makeTask('web-01', { title: '=SUM(A1)', description: 'Vsebina čšž', status: 'todo', assignee: 'Ana Novak', dueDate: '2026-09-21' }),
    makeTask('web-02', { title: ' "citat", druga', description: 'Prva\r\nDruga\t; čšž', status: 'in_progress', assignee: 'Živa, "Žiga"', dueDate: '2026-09-22' }),
    makeTask('web-03', { title: ' -Minus', description: 'Opis', status: 'done', assignee: 'Maja Zupan', dueDate: '2026-09-23' }),
    makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt', status: 'done', assignee: 'Luka Kovač', dueDate: '2026-09-24' }),
  ]
  const writes = await mount(page, records)
  const requests: string[] = []
  page.on('request', (request) => requests.push(`${request.method()} ${request.url()}`))
  const popups: unknown[] = []
  page.on('popup', (popup) => popups.push(popup))
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })

  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toBeVisible()
  await expect(page.locator('[data-task-id]')).toHaveCount(3)
  for (const column of allColumns) {
    await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
  }
  await expect(button).toBeEnabled()

  const defaultCsv = [
    '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"',
    '"web-01";"web";"\'=SUM(A1)";"todo";"Ana Novak";"2026-09-21";"Vsebina čšž"',
    '"web-02";"web";" ""citat"", druga";"in_progress";"Živa, ""Žiga""";"2026-09-22";"Prva\r\nDruga\t; čšž"',
    '"web-03";"web";"\' -Minus";"done";"Maja Zupan";"2026-09-23";"Opis"',
  ].join('\r\n') + '\r\n'
  const defaultFile = await download(page)
  expect(defaultFile.name).toBe('folio-web.csv')
  expect(Buffer.compare(defaultFile.bytes, Buffer.from(defaultCsv, 'utf8'))).toBe(0)
  expect(defaultFile.bytes.subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]))
  expect(defaultFile.bytes.subarray(-2)).toEqual(Buffer.from([0x0d, 0x0a]))

  for (const column of allColumns) {
    await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  }
  await expect(button).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).check()
  await expect(button).toBeEnabled()
  const descriptionOnly = await download(page)
  expect(descriptionOnly.text).toBe('\uFEFF"description"\r\n"Vsebina čšž"\r\n"Prva\r\nDruga\t; čšž"\r\n"Opis"\r\n')

  for (const column of [...allColumns].reverse()) {
    if (column !== 'description') await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).check()
  }
  expect(await download(page)).toEqual(defaultFile)

  await select(page, 'Filter izvoza', 'todo')
  const todoFile = await download(page)
  expect(todoFile.text).toBe('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n"web-01";"web";"\'=SUM(A1)";"todo";"Ana Novak";"2026-09-21";"Vsebina čšž"\r\n')
  await select(page, 'Filter izvoza', 'in_progress')
  const progressFile = await download(page)
  expect(progressFile.text).toBe('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n"web-02";"web";" ""citat"", druga";"in_progress";"Živa, ""Žiga""";"2026-09-22";"Prva\r\nDruga\t; čšž"\r\n')
  await select(page, 'Filter izvoza', 'done')
  const doneFile = await download(page)
  expect(doneFile.text).toBe('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n"web-03";"web";"\' -Minus";"done";"Maja Zupan";"2026-09-23";"Opis"\r\n')
  expect(await ids(page)).toEqual(['web-01', 'web-02', 'web-03'])

  for (const column of ['projectId', 'status', 'assignee', 'dueDate']) {
    await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  }
  await select(page, 'Filter izvoza', 'in_progress')
  await select(page, 'Ločilo CSV', ',')
  const commaCsv = '\uFEFF"id","title","description"\r\n"web-02"," ""citat"", druga","Prva\r\nDruga\t; čšž"\r\n'
  const firstView = await download(page)
  expect(firstView.text).toBe(commaCsv)
  await board(page)
  expect(await ids(page)).toEqual(['web-01', 'web-02', 'web-03'])
  const boardFile = await download(page)
  expect(Buffer.compare(boardFile.bytes, firstView.bytes)).toBe(0)
  await table(page)
  const tableFile = await download(page)
  expect(Buffer.compare(tableFile.bytes, firstView.bytes)).toBe(0)

  await project(page, 'launch')
  for (const column of allColumns) {
    await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
  }
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(button).toBeEnabled()
  const launchFile = await download(page)
  expect(launchFile.name).toBe('folio-launch.csv')
  expect(launchFile.text).toBe('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n"launch-01";"launch";"Drugi projekt";"done";"Luka Kovač";"2026-09-24";"Opis opravila launch-01"\r\n')

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  requests.length = 0
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')

  await select(page, 'Filter izvoza', 'todo')
  await expect(button).toBeDisabled()
  expect(await ids(page)).toEqual(['launch-01'])
  expect(writes).toEqual([])
  expect(requests).toEqual([])
  expect(popups).toEqual([])
})

test('P06 agent empty project stays readable and export stays disabled', async ({ page }) => {
  await mount(page, [makeTask('launch-01', { projectId: 'launch' })], '#/projects/web')
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('group', { name: 'Nastavitve izvoza CSV' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('P06 agent formula neutralization covers every prefix and data column', () => {
  const task = {
    id: '=id',
    projectId: '+projectId',
    title: '@title',
    status: '-status',
    assignee: '\r\n+assignee',
    dueDate: '\t-dueDate',
    description: '\n=description',
  } as unknown as Task
  for (const column of allColumns) {
    expect(taskValue(task, column)).toBe(`'${task[column]}`)
  }
  expect(taskValue({ ...task, title: 'Običajno besedilo' }, 'title')).toBe('Običajno besedilo')
})
