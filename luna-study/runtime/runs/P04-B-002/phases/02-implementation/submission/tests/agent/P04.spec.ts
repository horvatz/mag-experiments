import { expect, test } from '@playwright/test'

type Task = {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  dueDate: string
}

const task = (id: string, values: Partial<Task> = {}): Task => ({
  id,
  projectId: 'web',
  title: id,
  description: `Opis ${id}`,
  status: 'todo',
  assignee: 'Ana',
  dueDate: '2026-01-01',
  ...values,
})

const records = [
  task('z', { title: 'Žito', status: 'done', assignee: 'Živa', dueDate: '2026-03-01' }),
  task('accent-first', { title: 'Élan', status: 'in_progress', assignee: 'Éma', dueDate: '2026-01-10' }),
  task('number-2', { title: 'Alpha 2', assignee: 'Ana', dueDate: '2026-02-01' }),
  task('elan-lower', { title: 'elan', status: 'in_progress', assignee: 'ema', dueDate: '2026-01-10' }),
  task('number-10', { title: 'Alpha 10', status: 'done', assignee: 'Ana', dueDate: '2026-01-20' }),
  task('angstrom', { title: 'Ångström', status: 'todo', assignee: 'Ána', dueDate: '2026-01-01' }),
]

async function mount(page: import('@playwright/test').Page, data = records) {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'empty', name: 'Prazen projekt' }] })
    if (path === '/api/projects/web/tasks') return route.fulfill({ json: data })
    if (path === '/api/projects/empty/tasks') return route.fulfill({ json: [] })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const found = data.find((item) => item.id === decodeURIComponent(detail[1]))
      return found ? route.fulfill({ json: found }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  await page.goto('/#/projects/web')
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
}

const ids = (page: import('@playwright/test').Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
const choose = (page: import('@playwright/test').Page, label: string, value: string) => page.getByRole('combobox', { name: label, exact: true }).selectOption(value)

test('R01-R06: default order, normalized UTF-16 comparisons, two keys, directions, and stable ties', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await expect.poll(() => ids(page)).toEqual(records.map((item) => item.id))

  await choose(page, 'Primarni ključ', 'title')
  await expect.poll(() => ids(page)).toEqual(['number-10', 'number-2', 'angstrom', 'accent-first', 'elan-lower', 'z'])
  await choose(page, 'Primarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['z', 'accent-first', 'elan-lower', 'angstrom', 'number-2', 'number-10'])

  await choose(page, 'Primarni ključ', 'assignee')
  await choose(page, 'Primarna smer', 'asc')
  await expect.poll(() => ids(page)).toEqual(['number-2', 'number-10', 'angstrom', 'accent-first', 'elan-lower', 'z'])
  await choose(page, 'Primarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['z', 'accent-first', 'elan-lower', 'number-2', 'number-10', 'angstrom'])

  await choose(page, 'Primarni ključ', 'status')
  await choose(page, 'Primarna smer', 'asc')
  await choose(page, 'Sekundarni ključ', 'dueDate')
  await choose(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['number-2', 'angstrom', 'accent-first', 'elan-lower', 'z', 'number-10'])
  await choose(page, 'Sekundarni ključ', 'status')
  await choose(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(['number-2', 'angstrom', 'accent-first', 'elan-lower', 'z', 'number-10'])

  await choose(page, 'Primarni ključ', 'original')
  await choose(page, 'Primarna smer', 'desc')
  await expect.poll(() => ids(page)).toEqual(records.map((item) => item.id))
})

test('R07-R09: board, details, and route changes retain or reset local settings as specified', async ({ page }) => {
  const sameTitle = [task('first', { title: 'Enak naslov' }), task('second', { title: 'Enak naslov', assignee: 'Boris' })]
  await mount(page, sameTitle)
  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toHaveCount(1)
  await choose(page, 'Primarni ključ', 'assignee')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect.poll(() => ids(page)).toEqual(['first', 'second'])
  await page.locator('[data-task-id="second"] a').click()
  await expect(page.getByRole('dialog')).toContainText('second')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('assignee')
  await expect.poll(() => ids(page)).toEqual(['first', 'second'])

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Prazen projekt' }).click()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await choose(page, 'Sekundarna smer', 'desc')
  await choose(page, 'Primarni ključ', 'title')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
})

test('R10: reset and empty or single-task projects support every sort control', async ({ page }) => {
  await mount(page, [])
  for (const key of ['title', 'assignee', 'status', 'dueDate', 'original']) await choose(page, 'Primarni ključ', key)
  for (const direction of ['desc', 'asc']) await choose(page, 'Primarna smer', direction)
  for (const key of ['title', 'assignee', 'status', 'dueDate', 'none']) await choose(page, 'Sekundarni ključ', key)
  for (const direction of ['desc', 'asc']) await choose(page, 'Sekundarna smer', direction)
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
})

test('R10: one task remains available for every sort control and reset', async ({ page }) => {
  await mount(page, [task('only', { title: 'Eno opravilo' })])
  for (const key of ['title', 'assignee', 'status', 'dueDate', 'original']) await choose(page, 'Primarni ključ', key)
  for (const direction of ['desc', 'asc']) await choose(page, 'Primarna smer', direction)
  for (const key of ['title', 'assignee', 'status', 'dueDate', 'none']) await choose(page, 'Sekundarni ključ', key)
  for (const direction of ['desc', 'asc']) await choose(page, 'Sekundarna smer', direction)
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await expect.poll(() => ids(page)).toEqual(['only'])
})
