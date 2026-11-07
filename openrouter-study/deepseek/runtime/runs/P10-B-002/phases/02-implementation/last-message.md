Implementacija je zaključena in predana. Povzetek:

**Kaj je narejeno**
- `src/orderHistory.ts` (nov): čisti prehodi `moveTask`/`undoMove`/`redoMove`/`resetOrder`, sklad razveljavitev omejen na 20, redo se zavrže ob novem premiku.
- `src/App.tsx`: `ProjectView` zdaj vodi lokalno permutacijo `(P, U, R)`; ob nalaganju/retryju se ponastavi na prejeto polje, ob menjavi projekta/osvežitvi pa komponenta remounta. Dodana orodna vrstica (`Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`, `role=status` z `aria-label="Zgodovina vrstnega reda"`) in stolpec z `Premakni <id> gor/dol` ter `Mesto opravila <id>`.
- `src/TaskBoard.tsx`: kartice prikazujejo globalno mesto, premiki uporabljajo globalnega soseda, stolpci/statusi nespremenjeni.
- `src/styles.css`: slog novih kontrol ob ohranjenem Folio videzu.
- `tests/agent/p10-order.spec.ts` (nov): 6 testov za R01–R12, vključno z n=0, n=1, 21 premiki (cap 20), ohranitvijo reda ob preklopu pogleda/podrobnosti, resetom na izhodišče, 390 px brez vodoravnega drsenja in `readonly` (0 zapisov).

**Rezultati preverjanja**
- `npm run check`: **52/52 uspešno** (38 osnovnih/API, 8 razvojnih P10, 6 lastnih), lint, tipi in gradnja zeleni.
- Ciljno: D01–D04 ×2 = 8/8; baseline+API = 38/38; agent = 6/6.

Rezultati, sledljivost R01–R12 in omejitve (skriti testi nedostopni, brskalnik prek `wsEndpoint`, internet blokiran) so v `docs/agent/verification.md`, ki se konča s predajo pregledovalcu. Napak specifikacije nisem našel; edino pojasnilo (reset doda eno dejanje v undo sklad, ne počisti prejšnjih) je zabeleženo. Čas prevzame pregledovalec.
