import { expect, test, type Page } from '@playwright/test'
import {
  board, table, mount, makeTask, select, project, expectIds, summary, readonly,
} from '../development/helpers.ts'

const columns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']
const checkbox = (page: Page, column: string) => page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })
const exportButton = (page: Page) => page.getByRole('button', { name: 'Izvozi CSV', exact: true })

async function chooseColumns(page: Page, selected: string[]) {
  for (const column of columns) await checkbox(page, column).uncheck()
  for (const column of selected) await checkbox(page, column).check()
}

async function download(page: Page) {
  const pending = page.waitForEvent('download')
  await exportButton(page).click()
  const file = await pending
  const stream = await file.createReadStream()
  if (!stream) throw new Error('Missing download stream')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  expect(await file.failure()).toBeNull()
  return { name: file.suggestedFilename(), bytes: Buffer.concat(chunks) }
}

async function defaults(page: Page) {
  for (const column of columns) await expect(checkbox(page, column)).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
}

test('A04: more than ten rows, every filter, click order and consecutive exports', async ({ page, context }) => {
  const states = ['done', 'todo', 'in_progress'] as const
  const records = [91, 3, 42, 8, 17, 2, 80, 11, 9, 26, 12, 5, 77].map((n, i) =>
    makeTask(`item-${n}`, { title: 'Enak naslov', status: states[i % 3] }))
  const writes = await mount(page, [...records, makeTask('other-1', { projectId: 'launch' })])
  await defaults(page)
  const originalUrl = page.url()
  const pages = context.pages().length
  const first = await download(page)
  expect(first.name).toBe('folio-web.csv')
  expect([...first.bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  expect(first.bytes.toString('utf8').split('\r\n').slice(1, -1).map((line) => line.split(';')[0]))
    .toEqual(records.map((task) => `"${task.id}"`))
  await chooseColumns(page, ['title', 'id'])
  await select(page, 'Ločilo CSV', ',')
  for (const filter of ['todo', 'in_progress', 'done', 'all']) {
    await select(page, 'Filter izvoza', filter)
    const rows = records.filter((task) => filter === 'all' || task.status === filter)
    expect((await download(page)).bytes.toString('utf8')).toBe(
      '\uFEFF"id","title"\r\n' + rows.map((task) => `"${task.id}","Enak naslov"\r\n`).join(''),
    )
    await expectIds(page, records.map((task) => task.id))
    await summary(page, [4, 4, 5])
  }
  await select(page, 'Ločilo CSV', ';')
  await chooseColumns(page, ['status'])
  expect((await download(page)).bytes.toString('utf8')).toBe(
    '\uFEFF"status"\r\n' + records.map((task) => `"${task.status}"\r\n`).join(''),
  )
  expect(page.url()).toBe(originalUrl)
  expect(context.pages()).toHaveLength(pages)
  await readonly(page, writes)
})

test('A05: zero columns and empty filters cannot download, selection recovers', async ({ page }) => {
  const writes = await mount(page, [makeTask('unique-7')])
  await chooseColumns(page, [])
  await expect(exportButton(page)).toBeDisabled()
  let downloads = 0
  page.on('download', () => { downloads += 1 })
  // A programmatic native click also cannot activate a disabled button.
  await exportButton(page).evaluate((button: HTMLButtonElement) => button.click())
  await board(page)
  await expect(exportButton(page)).toBeDisabled()
  await checkbox(page, 'description').check()
  await expect(exportButton(page)).toBeEnabled()
  expect((await download(page)).bytes.toString('utf8')).toBe('\uFEFF"description"\r\n"Opis opravila unique-7"\r\n')
  for (const filter of ['done', 'in_progress']) {
    await select(page, 'Filter izvoza', filter)
    await expect(exportButton(page)).toBeDisabled()
    await exportButton(page).evaluate((button: HTMLButtonElement) => button.click())
    await expectIds(page, ['unique-7'])
  }
  await select(page, 'Filter izvoza', 'todo')
  await expect(exportButton(page)).toBeEnabled()
  await table(page)
  await expect(exportButton(page)).toBeEnabled()
  expect(downloads).toBe(1)
  await readonly(page, writes)
})

test('A06: project changes and reload reset all settings, including empty projects', async ({ page }) => {
  await mount(page, [makeTask('solo-4', { status: 'done' })])
  await chooseColumns(page, ['description'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  const expected = await download(page)
  await board(page)
  expect(await download(page)).toEqual(expected)
  await table(page)
  expect(await download(page)).toEqual(expected)
  await project(page, 'launch')
  await defaults(page)
  await expect(exportButton(page)).toBeDisabled()
  await board(page)
  await expect(exportButton(page)).toBeDisabled()
  await chooseColumns(page, ['id'])
  await project(page, 'web')
  await defaults(page)
  expect((await download(page)).name).toBe('folio-web.csv')
  await chooseColumns(page, ['title'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'todo')
  await page.reload()
  await defaults(page)
  await expect(exportButton(page)).toBeEnabled()
  await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true })).toBeVisible()
  await project(page, 'launch')
  await page.reload()
  await defaults(page)
  await expect(exportButton(page)).toBeDisabled()
})

test('A07: exact UTF-8 download bytes, view parity, unchanged details and no export requests', async ({ page, context }) => {
  const task = makeTask('-record', {
    projectId: 'launch', title: ' \t\r\n+"Čas"; 🌍', status: 'in_progress',
    assignee: '\t@Živa', dueDate: '2028-02-29', description: '  Prva, "dvojna"\r\nDruga\rTretja\nčšž 世界  ',
  })
  const writes = await mount(page, [task], '#/projects/launch')
  await chooseColumns(page, ['description', 'dueDate', 'assignee', 'status', 'title', 'projectId', 'id'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'in_progress')
  const expected = Buffer.from(
    '\uFEFF"id","projectId","title","status","assignee","dueDate","description"\r\n' +
    '"\'-record","launch","\' \t\r\n+""Čas""; 🌍","in_progress","\'\t@Živa","2028-02-29","  Prva, ""dvojna""\r\nDruga\rTretja\nčšž 世界  "\r\n',
    'utf8',
  )
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.method() + ' ' + request.url()))
  const originalUrl = page.url()
  const pages = context.pages().length
  const first = await download(page)
  expect(first).toEqual({ name: 'folio-launch.csv', bytes: expected })
  expect(page.url()).toBe(originalUrl)
  await board(page)
  expect(await download(page)).toEqual(first)
  await table(page)
  expect(await download(page)).toEqual(first)
  expect(requests).toEqual([])
  expect(context.pages()).toHaveLength(pages)
  await page.locator('[data-task-id="-record"]').getByRole('link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  expect(await dialog.locator('#detail-title').textContent()).toBe(task.title)
  expect(await dialog.locator('.description p').textContent()).toBe(task.description)
  await expect(dialog.locator('time')).toHaveAttribute('datetime', task.dueDate)
  await page.keyboard.press('Escape')
  expect(await download(page)).toEqual(first)
  await readonly(page, writes)
})

test('A08: 390px layout, keyboard controls and preserved task links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await defaults(page)
  const column = checkbox(page, 'id')
  await column.focus()
  await page.keyboard.press('Space')
  await expect(column).not.toBeChecked()
  await expect(column).toBeFocused()
  await page.keyboard.press('Space')
  await expect(column).toBeChecked()
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    await readonly(page, writes)
    for (const control of await page.locator('.csv-export input, .csv-export select, .csv-export button').all()) {
      const box = await control.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    }
    expect(await page.locator('[data-task-id] a input, [data-task-id] a button, [data-task-id] a select').count()).toBe(0)
    await exportButton(page).focus()
    const pending = page.waitForEvent('download')
    await page.keyboard.press('Enter')
    expect((await pending).suggestedFilename()).toBe('folio-web.csv')
  }
})
