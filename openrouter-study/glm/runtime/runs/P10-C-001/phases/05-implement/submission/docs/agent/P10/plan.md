# P10 načrt: Lokalni vrstni red z razveljavitvami

**Status:** sprejet izvedbeni načrt  
**Različica:** 1.0 | **Datum:** 2026-10-09

## Tehnični kontekst

- Aplikacija je React 19 + TypeScript 6 + Vite 8. Preverjanja so ESLint, `tsc`, produkcijska gradnja in Playwright 1.63; odvisnosti ostanejo nespremenjene.
- Podatki prihajajo iz obstoječega javnega API-ja `/api/`; skupni tipi, strežnik, prvoizhodni testi, nastavitve in testna infrastruktura ostanejo nespremenjeni.
- P10 je lokalno stanje izbranega projekta: trenutna permutacija ID-jev, sklad razveljavitev in sklad ponovitev. Ni zapisovalnega API-ja, `localStorage` ali trajne shrambe.
- Merila so v [`spec.md`](./spec.md); zasnova Folio je obvezna po [`docs/dizajn.md`](../../dizajn.md).

## Odločitve

1. **Stanje prenesi v `ProjectView` v `src/App.tsx`.** Trenutni vrstni red bo `string[]` ID-jev; obe zgodovini bosta `string[][]`. Komponenta je že ponastavljena ob menjavi projekta (`key={project.id}`), kar izpolnjuje zahtevo o ponastavitvi.
2. **Čista logika premikov in zgodovine v novo datoteko `src/ordering.ts`.** Funkcije bodo delujejo samo s seznami ID-jev: inicializacija iz opravil, premik soseda, razveljavitev, ponovitev, vrnitev na izvorno stanje in omejitev zgodovine na 20 vnosov. Tako bodo pravila enolična in preverljiva.
3. **Prikaz opravil sortiraj po trenutni permutaciji.** Preglednica bo ostala globalno urejena. Tabla bo znotraj vsakega statusnega stolpca ohranila relativni vrstni red, gumba pa bosta še vedno izmenjala globalnega soseda.
4. **Zgodovinske kontrole postavi v obstoječo glavo razdelka.** Gumba `Razveljavi premik` in `Ponovi premik`, gumb `Začetni vrstni red` ter element `role=status` bodo dostopni v obeh pogledih, ne da bi spreminjali navigacijske povezave.
5. **Novi gumbi premika dodaj kot ločene akcije ob obstoječi povezavi.** Vsaka vrstica in kartica bo ohranila `data-task-id`, dobila gube `Premakni <id> gor/dol` in element `aria-label="Mesto opravila <id>"` z globalno številko.
6. **Obstoječe vizualne spremenljivke in Folio gradnike razširi z minimanim CSS.** Novi razredi bodo v `src/styles.css`; gumbi bodo sledili obstoječi velikosti, fokusu in 390-pikselni omejitvi brez vodoravnega prelivanja cele strani.

## Datoteke

| Datoteka | Delo |
| --- | --- |
| `src/ordering.ts` | Tipi in čiste funkcije za trenutni vrstni red, premik soseda, zgodovini in omejitev na 20. |
| `src/App.tsx` | Lokalno stanje, vrstni red preglednice, zgodovinske kontrole, globalna mesta in gumbi premika v vrsticah. |
| `src/TaskBoard.tsx` | Prikaz kartic v relativnem redu statusnega stolpca, globalna mesta in gumbi premika zunaj povezave do podrobnosti. |
| `src/styles.css` | Minimalni Folio slogi za vrstične/kartične akcije in zgodovinske kontrole. |
| `tests/agent/P10.spec.ts` | Lastni Playwright testi za vsa merila R01–R12, vključno s preklopi pogleda, podrobnostmi, menjavo projekta in osvežitvijo. |
| `tests/agent/helpers.ts` | Lastna testna priprava z nadzorovanimi GET odgovori in sledenjem morebitnih zapisovalnih zahtev; testne kontrole `/__test/` uporablja samo test. |
| `docs/agent/P10/spec.md` | Po izvedbi in preverjanju dopolni sledljivostno tabelo z dejanskimi datotekami, testi in izidi. |

## Izvedbeni koraki

1. Izdelaj `src/ordering.ts` in pokrij čista pravila premikanja, zgodovine, ponovitev, resetiranja in meje 20.
2. V `src/App.tsx` dodaj stanje in zgodovinske kontrole ter uporabi urejena opravila v preglednici. Ohrani obstoječe števce stanj, dostopna imena in povezave.
3. V `src/TaskBoard.tsx` uporabi isti vrstni red znotraj statusnih stolpcev, dodaj globalna mesta in gube premika ter ne spreminjaj statusov.
4. V `src/styles.css` dodaj minimale, dostopne in prilagodljive stile, ki ohranijo potrjen Folio.
5. Izdelaj lastne teste v `tests/agent/`: inicialni vrstni red in mesta, veljavne/neveljavne premike, undo/redo, brisanje ponovitev, mejo 20, reset, tablo z globalnim sosedom, ohranjanje stanja pri preklopih in podrobnostih, ponastavitev pri menjavi/osvežitvi, števce ter zvrsto stanj brez zapisov na API.
6. Zaženi usmerjene Playwright teste, nato `npm run lint`, `npm run build` in na koncu `npm run check`; dokumentiraj dejanske izide in omejitve.

## Preverjanje in izidi

- Usmerjeni testi morajo pokriti vsako zahtevo R01–R12 vsaj z enim konkretnim scenarijem in ločeno preveriti splošna pravila zgodovine.
- Sledenje omrežnim zahtevam preveri, da novi premiki ne sprožijo zapisov na API ali uporabe testnih kontrol v uporabniški kodi.
- Skupni testi izhodišca morajo ostati uspešni; noben test ne sme biti prijavljen kot uspešen brez dejanske izvedbe.
- Po morebitnih popravkih posodobi sledljivost v specifikaciji, ne da bi prepisala prejšnje načrte ali prikrila neuspehe.

## Tveganja in omejitve

- Tabla ne sme dobiti lokalne zgolj statusne logike premikanja, ker bi s tem uporabila soseda znotraj stolpca namesto globalnega soseda.
- Zgodovini sta dve ločeni strukturi; zgodovina razveljavitev se omeji na 20, zgodovina ponovitev pa ostane vezana na trenutno razveljavljena dejanja.
- Prenovljena stanja med sočasnim nalaganjem ali podatkovnimi spremembami niso del P10 in se ne širijo.
- Izdelek ne spreminja strežnika, skupnih tipov, prvoizhodnih testov, odvisnosti ali javnih API-jev.
