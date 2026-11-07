import { columnIds, expect, expectSelection, mount, openBoard, openTable, select, test } from './helpers.ts'

test('R07: stolpci obdrzijo stalen vrstni red Pripravljeno, V delu, Končano', async ({ page }) => {
  await mount(page)
  await openBoard(page)
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Pripravljeno', 'V delu', 'Končano'])
})

test('R07: relativni vrstni red v stolpcih je isti kot v preglednici', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await openBoard(page)
  await expect.poll(() => columnIds(page, 'Pripravljeno')).toEqual(['web-07', 'web-02', 'web-04', 'web-08'])
  await expect.poll(() => columnIds(page, 'V delu')).toEqual(['web-01', 'web-05'])
  await expect.poll(() => columnIds(page, 'Končano')).toEqual(['web-03', 'web-06'])
})

test('R07: sekundarni ključ velja tudi na tabli', async ({ page }) => {
  await mount(page)
  await openBoard(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expect.poll(() => columnIds(page, 'Pripravljeno')).toEqual(['web-08', 'web-04', 'web-02', 'web-07'])
  await expect.poll(() => columnIds(page, 'V delu')).toEqual(['web-05', 'web-01'])
  await expect.poll(() => columnIds(page, 'Končano')).toEqual(['web-06', 'web-03'])
})

test('R08: preklop pogleda ohrani vse stiri nastavitve in vrstni red', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await openBoard(page)
  await expectSelection(page, 'Primarni ključ', 'assignee')
  await expectSelection(page, 'Primarna smer', 'desc')
  await expectSelection(page, 'Sekundarni ključ', 'status')
  await expectSelection(page, 'Sekundarna smer', 'desc')
  await openTable(page)
  await expectSelection(page, 'Primarni ključ', 'assignee')
  await expectSelection(page, 'Primarna smer', 'desc')
})
