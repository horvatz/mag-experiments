# P10 — načrt izvedbe

**Vir zahtev**: `docs/agent/P10/spec.md` | **Meje projekta**: `.specify/memory/constitution.md`

## Tehnični kontekst

Aplikacija je React 19.3, TypeScript 6 in Vite 8. Testiranje je Playwright 1.63, ikone pa `lucide-react`. Odvisnosti, strežnik, skupni tipi, konfiguracija in skupni testi ostanejo nespremenjeni.

Obstoječi `ProjectView` v `src/App.tsx` naloži opravila z `GET /api/projects/:id/tasks`, izračuna števce stanj in prikaže preglednico ali `TaskBoard`. Komponenta je že ključena z `project.id`, zato menjave projekta ponastavijo lokalno stanje, preklop pogleda in podrobnosti pa ne rabita remounta.

## Odločitve in arhitektura

1. **Čisti model vrstnega reda**: dodaj `src/taskOrder.ts` z nemutirajočim reducerjem stanja. Stanje naj vsebuje trenutno permutacijo `order`, sklad razveljavitev `undo` in sklad ponovitev `redo`. Akcije so `move`, `undo`, `redo` in `reset`. Vsi vnosi zgodovin so celotne permutacije taskov, ne samo ID-jev, da podrobnosti in statusi ostanejo nespremenjeni.
2. **Hook za življenjski cikel**: dodaj `src/useTaskOrder.ts`. Ob novem uspešno prejetem polju opravil nastavi začetno stanje; veljaven premik počisti `redo`, vsaka dodatev v `undo` pa obdrži največ 20 zadnjih vnosov. Ker se `ProjectView` remounta ob menjavi projekta, ta hook pokriva tudi osvežitev in menjavo brez trajne shrambe.
3. **Preglednica**: v `src/App.tsx` uporabljaj urejena opravila namesto surovega polja. V celici opravila dodaj globalno mesto z `aria-label="Mesto opravila <id>"` in gumba `Premakni <id> gor/dol` zunaj obstoječe povezave. Robna gumba sta onemogočena; polja, statusi, števci stanj in podrobnosti se ne spremenijo.
4. **Tabla**: `src/TaskBoard.tsx` še vedno združuje opravila po stalnih stolpcih stanj, vendar kartice znotraj stolpca razvrsti po globalnem vrstnem redu. Gumbi in mesto so izven povezave na kartici. Premik vedno zamenja globalnega soseda, tudi če je v drugem stolpcu; status se ne spremeni.
5. **Glavna zgodovina**: v `src/App.tsx` dodaj `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red` ter `role="status"` z `aria-label="Zgodovina vrstnega reda"` in besedilom `Razveljavitve: U. Ponovitve: R.`. Gumba sta onemogočena pri praznem skladu, `Začetni vrstni red` pa le, ko je trenutni vrstni red že izvoren.
6. **Dizajn**: v `src/styles.css` uporabi obstoječe Folio barve, radij, tipografijo in razmike. Nova kontrola naj ne povzroči širjenja celotne strani na 390 px; drsenje ostane znotraj obstoječih `table-scroll` in `board-scroll`.

## Datoteke

| Datoteka | Namen |
| --- | --- |
| `src/taskOrder.ts` | Čisti reducer in pomožne funkcije za permutacije, zgodovini in omejitev 20. |
| `src/useTaskOrder.ts` | React hook, ki poveže reducer z naloženim poljem taskov. |
| `src/App.tsx` | Stanje vrstnega reda, števci, glavna dejanja in preglednica. |
| `src/TaskBoard.tsx` | Urejena tabla, globalna mesta in premiki po statusnih stolpcih. |
| `src/styles.css` | Folio slogi za mesta, gumbe in ozke zaslone. |
| `tests/agent/p10.spec.ts` | Lastni Playwright testi za P10 in reduktor. |

## Zaporedje izvedbe

1. Napiši in preveri čisti model vrstnega reda, vključno z robovi, omejitvijo 20 in resetom.
2. Poveži hook z `ProjectView`, dodaj glavna dejanja in števec ter preveri, da preklop pogleda in podrobnosti ne spreminjata zgodovin.
3. Dopolni preglednico: globalna mesta, gumbe zunaj povezav, onemogočeni robni premiki in ohranjeni števci.
4. Dopolni tablo z globalnim sosedom znotraj obstoječih statusnih stolpcev in ohrani `data-task-id`.
5. Dopolni Folio sloge in dodaj lastne Playwright teste za R01–R12, vključno s praznim projektom, enim opravilom, 21 premiki, menjavo projekta, osvežitvijo in širino 390 px.

## Preverjanje

- Najprej poženi ciljne lastne teste: `npx playwright test tests/agent/p10.spec.ts`.
- Nato poženi celotna vrata: `npm run lint`, `npm run build` in `npm test`.
- Preveri, da UI ne kliče `/__test/`, ne izvaja `PATCH`/`POST` in ne uporablja `localStorage`.
- Rezultate in morebitne nepreverjene dele zapiši v sledljivost specifikacije, ne da bi izide označili kot uspešne brez dejanskega zagona.

## Tveganja in omejitve

- Enaki naslovi se ne smejo uporabiti za izbor; izključno ID je ključ.
- Tabla ne sme preklopiti na soseda znotraj istega statusa; globalni sosed je lahko v drugem stolpcu.
- Osvežitev in menjava projekta namerno ponastavita vrstni red in obe zgodovini.
- Ne dodajamo novih odvisnosti, API-jev, zunanjih meritev ali sprememb infrastrukture.
