import { expect, test, mount, expectIds, makeTask } from '../development/helpers.ts'

test('R02: a question mark inside q remains part of the literal phrase', async ({ page }) => {
  const task = makeTask('question-mark-task', { description: 'literal phrase foo?bar stays whole' })
  await mount(page, [task], '#/projects/web?q=foo?bar')
  await expectIds(page, [task.id])
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('foo?bar')
  await expect(page).toHaveURL(/#\/projects\/web\?q=foo\?bar$/)
})
