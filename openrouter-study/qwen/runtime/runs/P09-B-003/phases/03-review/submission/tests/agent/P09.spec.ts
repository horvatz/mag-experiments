import { test, expect } from '@playwright/test'
import { mount } from './helpers.ts'

test('P09-R01: URL filter parsing', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=pregled&status=todo')
  await expect(page.locator('[aria-label="Iskanje v povezavi"]').first()).toHaveValue('pregled')
  const select = page.getByRole('combobox', { name: 'Stanje v povezavi', exact: true })
  await expect.poll(() => select.inputValue()).toContain('todo')
})

