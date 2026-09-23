import type { Page } from '@playwright/test'
import { test, expect, mount, makeTask, select, board, table, project, details, summary, expectIds, readonly } from '../development/helpers.ts'

const columns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']
const records = Array.from({ length: 13 }, (_, index) => makeTask(`custom-${30 - index}`, {
  title: 'Enak naslov', description: 'Celoten opis čšž 🦉',
  status: (['todo', 'in_progress', 'done'] as const)[index % 3],
}))
const other = makeTask('launch-custom', { projectId: 'launch', title: 'Drugi projekt' })

async function file(page: Page) {
  const event = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Izvozi CSV', exact: true }).click()
  const download = await event
  const stream = await download.createReadStream()
  if (!stream) throw new Error('Missing download stream')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return { name: download.suggestedFilename(), bytes: Buffer.concat(chunks) }
}

async function defaults(page: Page) {
  for (const column of columns) await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
}

async function only(page: Page, selected: string[]) {
  for (const column of columns) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).setChecked(selected.includes(column))
}

test('A01: default download keeps 13 original rows, all fields and current project', async ({ page }) => {
  const writes = await mount(page, [...records, other])
  await defaults(page)
  const initialUrl = page.url()
  const pages = page.context().pages().length
  const downloaded = await file(page)
  const expected = '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    records.map(t => `"${t.id}";"web";"Enak naslov";"${t.status}";"Ana Novak";"2026-09-21";"Celoten opis čšž 🦉"\r\n`).join('')
  expect(downloaded).toEqual({ name: 'folio-web.csv', bytes: Buffer.from(expected) })
  expect([...downloaded.bytes.subarray(0, 3)]).toEqual([239, 187, 191])
  expect(page.url()).toBe(initialUrl)
  expect(page.context().pages()).toHaveLength(pages)
  await expectIds(page, records.map(t => t.id))
  await readonly(page, writes)
})

test('A02: zero columns cannot download; click order never reorders columns', async ({ page }) => {
  await mount(page, [records[0]])
  await only(page, [])
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  let downloads = 0
  page.on('download', () => { downloads++ })
  await button.evaluate((node: HTMLButtonElement) => node.click())
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).check()
  await expect(button).toBeEnabled()
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await select(page, 'Ločilo CSV', ',')
  expect((await file(page)).bytes.toString('utf8')).toBe('\uFEFF"id","description"\r\n"custom-30","Celoten opis čšž 🦉"\r\n')
  expect(downloads).toBe(1)
})

test('A03: all filters affect only CSV in both views', async ({ page }) => {
  const writes = await mount(page, records)
  await only(page, ['id'])
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    for (const filter of ['all', 'todo', 'in_progress', 'done']) {
      await select(page, 'Filter izvoza', filter)
      const rows = records.filter(t => filter === 'all' || t.status === filter)
      expect((await file(page)).bytes.toString('utf8')).toBe('\uFEFF"id"\r\n' + rows.map(t => `"${t.id}"\r\n`).join(''))
      await expectIds(page, records.map(t => t.id), view === 'table')
      await summary(page, [5, 4, 4])
    }
  }
  await readonly(page, writes)
})

test('A04: current settings, view parity, project and reload resets', async ({ page }) => {
  const writes = await mount(page, [...records, other])
  const original = await file(page)
  await only(page, ['id', 'title'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  const changed = await file(page)
  expect(changed.bytes).not.toEqual(original.bytes)
  expect(changed.bytes.toString('utf8')).toBe('\uFEFF"id","title"\r\n"custom-28","Enak naslov"\r\n"custom-25","Enak naslov"\r\n"custom-22","Enak naslov"\r\n"custom-19","Enak naslov"\r\n')
  await board(page)
  expect(await file(page)).toEqual(changed)
  await table(page)
  expect(await file(page)).toEqual(changed)
  await project(page, 'launch')
  await defaults(page)
  const second = await file(page)
  expect(second.name).toBe('folio-launch.csv')
  expect(second.bytes.toString('utf8')).toContain('"launch-custom";"launch";"Drugi projekt"')
  await project(page, 'web')
  await defaults(page)
  expect(await file(page)).toEqual(original)
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    await only(page, ['description'])
    await select(page, 'Ločilo CSV', ',')
    await select(page, 'Filter izvoza', 'in_progress')
    await page.reload()
    await defaults(page)
    expect(await file(page)).toEqual(original)
  }
  await readonly(page, writes)
})

test('A05: empty projects and empty filtered results remain disabled', async ({ page }) => {
  await mount(page, [])
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  await board(page)
  await expect(button).toBeDisabled()
  await project(page, 'launch')
  await expect(button).toBeDisabled()
  await page.unroute('**/api/**')
  await mount(page, [records[0]])
  await select(page, 'Filter izvoza', 'done')
  await expect(button).toBeDisabled()
  await only(page, [])
  await page.getByRole('checkbox', { name: 'Stolpec id', exact: true }).check()
  await expect(button).toBeDisabled()
  await select(page, 'Filter izvoza', 'todo')
  await expect(button).toBeEnabled()
})

test('A06: mobile and desktop Folio, focus, details and read-only controls', async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 1440, height: 960 })
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeEnabled()
  await page.screenshot({ path: 'docs/agent/P06/desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  const checkbox = page.getByRole('checkbox', { name: 'Stolpec id', exact: true })
  await checkbox.focus()
  await page.keyboard.press('Space')
  await expect(checkbox).not.toBeChecked()
  expect(await checkbox.evaluate(node => getComputedStyle(node).outlineStyle)).toBe('solid')
  await page.keyboard.press('Space')
  await details(page, 'web-01')
  await file(page)
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P06/mobile.png', fullPage: true })
  await board(page)
  await details(page, 'web-01')
  await file(page)
  await readonly(page, writes)
  await page.screenshot({ path: 'docs/agent/P06/mobile-board.png', fullPage: true })
})

test('A07: browser download preserves embedded breaks and neutralizes formulas', async ({ page }) => {
  await mount(page, [makeTask('special', { title: ' \t\r\n=SUM("č")', description: 'A\rB\nC\r\nD; 🦉', assignee: '@Ana' })])
  await only(page, ['title', 'assignee', 'description'])
  const expected = '\uFEFF"title";"assignee";"description"\r\n"\' \t\r\n=SUM(""č"")";"\'@Ana";"A\rB\nC\r\nD; 🦉"\r\n'
  expect((await file(page)).bytes).toEqual(Buffer.from(expected))
})
