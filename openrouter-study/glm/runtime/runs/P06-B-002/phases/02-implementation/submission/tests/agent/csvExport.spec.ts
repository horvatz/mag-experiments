import { expect, makeTask, mount, test } from '../development/helpers.ts'
import type { Download } from '@playwright/test'
import { buildCsvContent, EXPORT_COLUMNS } from '../../src/csvExport.ts'

const csvText = (bytes: Uint8Array) => new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes)

async function downloadBytes(download: Download) {
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream ?? []) chunks.push(chunk as Buffer)
  return new Uint8Array(Buffer.concat(chunks))
}

test('CSV utility preserves exact quoting, ordering and formula safety', () => {
  const tasks = [
    makeTask('task-01', {
      title: 'Šumniki, presledki',
      description: 'Prva vrstica\r\nDruga; "citat", vsebina',
      status: 'in_progress',
      dueDate: '2026-09-18',
    }),
    makeTask('task-02', {
      title: '=SUM(A1)',
      assignee: ' + Ime',
      status: 'done',
    }),
    makeTask('task-03', {
      description: '\t-x',
      status: 'todo',
    }),
  ]

  const content = buildCsvContent({
    tasks,
    selectedColumns: ['description', 'dueDate', 'id'],
    delimiter: ',',
    filter: 'all',
  })

  expect(content.startsWith('\uFEFF')).toBe(true)
  expect(content).toBe(
    '\uFEFF' +
    '"id","dueDate","description"\r\n' +
    '"task-01","2026-09-18","Prva vrstica\r\nDruga; ""citat"", vsebina"\r\n' +
    '"task-02","2026-09-21","Opis opravila task-02"\r\n' +
    '"task-03","2026-09-21","\'\t-x"\r\n'
  )
  expect(EXPORT_COLUMNS).toEqual(['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'])
})

test('default export uses BOM, project order and current project', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Prvi korak', status: 'in_progress' }),
    makeTask('web-02', { title: 'Drugi korak', status: 'todo' }),
    makeTask('web-03', { title: 'Tretji korak', status: 'done' }),
    makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt' }),
  ]
  const writes = await mount(page, records)
  const urlBefore = page.url()

  await expect(page.getByRole('checkbox')).toHaveCount(EXPORT_COLUMNS.length)
  for (const column of EXPORT_COLUMNS) {
    await expect(page.getByRole('checkbox', { name: `Stolpec ${column}` })).toBeChecked()
  }
  await expect(page.getByLabel('Ločilo CSV')).toHaveValue(';')
  await expect(page.getByLabel('Filter izvoza')).toHaveValue('all')
  await expect(page.getByRole('button', { name: 'Izvozi CSV' })).toBeEnabled()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Izvozi CSV' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe('folio-web.csv')
  const bytes = await downloadBytes(download)
  expect(new Uint8Array(bytes.subarray(0, 3))).toEqual(new Uint8Array([0xEF, 0xBB, 0xBF]))
  expect(csvText(bytes)).toBe(
    '\uFEFF' +
    '"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    '"web-01";"web";"Prvi korak";"in_progress";"Ana Novak";"2026-09-21";"Opis opravila web-01"\r\n' +
    '"web-02";"web";"Drugi korak";"todo";"Ana Novak";"2026-09-21";"Opis opravila web-02"\r\n' +
    '"web-03";"web";"Tretji korak";"done";"Ana Novak";"2026-09-21";"Opis opravila web-03"\r\n'
  )
  expect(page.url()).toBe(urlBefore)
  expect(writes).toEqual([])
})

test('filters, column order, views, disabling and resets work together', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Priprava', status: 'in_progress' }),
    makeTask('web-02', { title: 'Pregled', status: 'done' }),
    makeTask('web-03', { title: 'Objava', status: 'todo' }),
    makeTask('launch-01', { projectId: 'launch', title: 'Kampanja' }),
  ]
  await mount(page, records)
  await page.getByLabel('Filter izvoza').selectOption('in_progress')
  await page.getByLabel('Ločilo CSV').selectOption(',')

  const checkboxes = page.getByRole('checkbox')
  for (const checkbox of await checkboxes.all()) await checkbox.uncheck()
  await page.getByRole('checkbox', { name: 'Stolpec description' }).check()
  await page.getByRole('checkbox', { name: 'Stolpec title' }).check()
  await page.getByRole('checkbox', { name: 'Stolpec id' }).check()

  const expectedContent =
    '\uFEFF"id","title","description"\r\n' +
    '"web-01","Priprava","Opis opravila web-01"\r\n'

  const boardDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await page.getByRole('button', { name: 'Izvozi CSV' }).click()
  const boardBytes = await downloadBytes(await boardDownload)
  expect(csvText(boardBytes)).toBe(expectedContent)

  const tableDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await page.getByRole('button', { name: 'Izvozi CSV' }).click()
  expect(csvText(await downloadBytes(await tableDownload))).toBe(expectedContent)

  await page.getByLabel('Filter izvoza').selectOption('todo')
  for (const checkbox of await checkboxes.all()) await checkbox.uncheck()
  await expect(page.getByRole('button', { name: 'Izvozi CSV' })).toBeDisabled()
  const unexpectedDownload = page.waitForEvent('download', { timeout: 500 })
  await page.getByRole('button', { name: 'Izvozi CSV' }).click({ force: true })
  expect(await unexpectedDownload.catch(() => null)).toBeNull()

  await page.getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByLabel('Ločilo CSV')).toHaveValue(';')
  await expect(page.getByLabel('Filter izvoza')).toHaveValue('all')
  for (const column of EXPORT_COLUMNS) {
    await expect(page.getByRole('checkbox', { name: `Stolpec ${column}` })).toBeChecked()
  }

  await page.getByLabel('Ločilo CSV').selectOption(',')
  await page.reload()
  await expect(page.getByLabel('Ločilo CSV')).toHaveValue(';')
  await expect(page.getByLabel('Filter izvoza')).toHaveValue('all')

  await page.setViewportSize({ width: 390, height: 844 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
