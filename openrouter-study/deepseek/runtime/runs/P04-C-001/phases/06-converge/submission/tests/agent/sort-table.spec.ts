import { click, expectIds, expectSelection, mount, select, test, webIds } from './helpers.ts'

const titleAsc = ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06']
const titleDesc = ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07']
const assigneeAsc = ['web-01', 'web-03', 'web-05', 'web-07', 'web-02', 'web-04', 'web-08', 'web-06']
const statusAsc = ['web-02', 'web-04', 'web-07', 'web-08', 'web-01', 'web-05', 'web-03', 'web-06']
const dueDateAsc = ['web-03', 'web-01', 'web-07', 'web-06', 'web-02', 'web-04', 'web-05', 'web-08']

test('R01: privzete nastavitve in vrstni red prejetega polja', async ({ page }) => {
  await mount(page)
  await expectIds(page, webIds())
  await expectSelection(page, 'Primarni ključ', 'original')
  await expectSelection(page, 'Primarna smer', 'asc')
  await expectSelection(page, 'Sekundarni ključ', 'none')
  await expectSelection(page, 'Sekundarna smer', 'asc')
})

test('R02/R03: naslov in odgovorna oseba po normaliziranih nizih', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, titleAsc)
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, assigneeAsc)
})

test('R04/R06: smer obrne samo izid primerjave, izenaceni ostanejo v izvornem redu', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, titleDesc)
})

test('R03: stanje in rok', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, statusAsc)
  await select(page, 'Primarni ključ', 'dueDate')
  await expectIds(page, dueDateAsc)
})

test('R05: sekundarni ključ velja ob enakosti primarnega, s samostojno smerjo', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-08', 'web-04', 'web-02', 'web-07', 'web-05', 'web-01', 'web-06', 'web-03'])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-03', 'web-02', 'web-06'])
})

test('R06: enak primarni in sekundarni ključ ne doda obrata', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Sekundarni ključ', 'title')
  await expectIds(page, titleAsc)
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, titleDesc)
})

test('R06: original na primarnem ključu vedno vrne izvorni vrstni red', async ({ page }) => {
  await mount(page)
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, webIds())
})

test('R10: gumb Izvorni vrstni red ponastavi vse stiri kontrole', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await click(page, 'Izvorni vrstni red')
  await expectIds(page, webIds())
  await expectSelection(page, 'Primarni ključ', 'original')
  await expectSelection(page, 'Primarna smer', 'asc')
  await expectSelection(page, 'Sekundarni ključ', 'none')
  await expectSelection(page, 'Sekundarna smer', 'asc')
})
