# P10 — Lokalni vrstni red z razveljavitvami: specifikacija

Izdelano po predlogi `task/specification-template.md`. Postopek A, en agent.

## Problem in kontekst

Folio trenutno prikaže opravila projekta v vrstnem redu, kot ga vrne
`GET /api/projects/:id/tasks`, in ne omogoča spreminjanja vrstnega reda.
Uporabnik želi lokalno preurejati vrstni red (gor/dol), razveljavljati in
ponavljati premike ter se vrniti na začetni vrstni red. Vrstni red je
permutacija istih ID-jev: polja opravil, stanja in podrobnosti se ne
spreminjajo, na API se ne piše in stanje ni trajno (osvežitev/menjava
projekta vrneta izhodišče).

## Vhodi, dejanja in izidi

- Vhod: polje `Task` iz javnega API-ja (ne glede na število, vrstni red,
  enake naslove, Unicode). ID-ji so edinstveni znotraj projekta.
- Dejanja: `Premakni <id> gor`, `Premakni <id> dol`, `Razveljavi premik`,
  `Ponovi premik`, `Začetni vrstni red`; preklop pogleda in podrobnosti.
- Uspeh: trenutni vrstni red je nova permutacija iste množice ID-jev;
  ustrezna zgodovina se posodobi (glej pravila).
- Zavrnitev/rob: dejanje je onemogočeno (disabled) ali pa je obravnavano
  kot neuspešno brez spremembe vrstnega reda in brez novega vpisa v zgodovino.
- Napaka branja podatkov: obstoječi prikaz napake in "Poskusi znova" ostaneta.

Simboli: `P` = trenutna permutacija (polje ID-jev), `P0` = izhodiščna
permutacija iz API-ja, `U` = sklad prejšnjih permutacij (max 20), `R` =
sklad razveljavljenih permutacij. `swap_up(P,id)` zamenja `id` z neposrednim
globalnim predhodnikom, `swap_down(P,id)` z neposrednim globalnim naslednikom.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju velja `P = P0`; vsako opravilo ima element `aria-label="Mesto opravila <id>"` z globalnim mestom `index(id,P)+1` od 1 do N. Enaki naslovi ne vplivajo na identiteto. | Testi vrstnega reda in mest; ročni pregled |
| R02 | Ob veljavnem `swap_up/swap_down` je `P'` enaka P z zamenjanima sosedoma; polja `Task` in `status` se ne spreminjajo; `P' ≠ P`. | Testi premikov gor/dol + nespremenjena polja |
| R03 | `gor` je onemogočen, če `index(id,P)=0`; `dol` je onemogočen, če `index(id,P)=N-1`. Neveljavno dejanje: `P' = P`, `U`, `R` nespremenjena. | Testi robnih gumbov in zgodovine |
| R04 | Veljaven premik: `U' = cap20(U ++ [P])`, `R' = []`, `P' = swap(P)`. `Razveljavi premik` (ob `U ≠ []`): `R' = R ++ [P]`, `P' = U.last`, `U' = U[:-1]`. | Testi undo/redo |
| R05 | `Ponovi premik` (ob `R ≠ []`): `U' = cap20(U ++ [P])`, `P' = R.last`, `R' = R[:-1]`. Zaporedja ostanejo pravilna brez izgube/podvajanja ID-jev. | Večkratni undo/redo test |
| R06 | Veljaven premik ali `Začetni vrstni red` po razveljavitvi: `R' = []`. Neveljavno robno dejanje ne spremeni `R`. | Testi počiščenja ponovitev |
| R07 | `cap20(X) = X` pri `len ≤ 20`, sicer zadnjih 20 elementov. Ponovitve delujejo za vse trenutno razveljavljene korake. | Test 21 premikov |
| R08 | `Začetni vrstni red` ob `P ≠ P0`: `U' = cap20(U ++ [P])`, `R' = []`, `P' = P0`. Ob `P = P0`: gumb onemogočen, zgodovini nespremenjeni. | Test reset + ponovni reset |
| R09 | Preglednica prikazuje `P` globalno; tabla grupira po stolpcih stanj in znotraj njih ohranja relativni vrstni red iz `P`. Premiki na tabli uporabijo globalna soseda in prikažejo globalno mesto; `status` se ne spremeni. | Test tablice in globalnega mesta |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita `P`, `U`, `R`. Menjava projekta (remount) in osvežitev ponastavita na `P0` novega projekta; ni trajne shrambe. | Test preklopa pogleda/podrobnosti/osvežitve |
| R11 | Element `role=status`, `aria-label="Zgodovina vrstnega reda"` ima točno besedilo `Razveljavitve: {len U}. Ponovitve: {len R}.`; gumba sta onemogočena pri `len=0`. Prazen projekt in projekt z 1 opravilom ostaneta uporabna brez dovoljenega premika. | Test števca, praznega in enojnega projekta |
| R12 | Spremembe so lokalne permutacije iste množice ID-jev; ni zahtev PATCH/POST na `/api/` in ni sprememb polj. Števci stanj in podrobnosti ostanejo enaki; Folio videz in notranje drsenje na 390 px ostaneta. | `readonly` test + pregled nespremenjenih vrednosti |

Splošna pravila veljajo za vsak testni primer ne glede na število opravil,
vrstni red ali enake naslove. Testni primeri so primeri, ne celoten obseg.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R08, R10–R11 | pravila zgoraj | `tests/development/P10.spec.ts` D01–D04 | `src/order.ts` (`orderReducer`), `src/App.tsx` (`ProjectView`), `src/TaskBoard.tsx` | glej `docs/agent/verification.md` |
| R01–R12 | lastni scenariji | `tests/agent/p10.spec.ts` | `src/order.ts`, `src/App.tsx`, `src/TaskBoard.tsx` | glej `docs/agent/verification.md` |
| R12 | ni zapisov | `readonly` pomočnik v D04 | `src/api.ts` (samo GET prek `request`) | glej `docs/agent/verification.md` |

## Zgodovina popravkov specifikacije

- 2026-11-02: prva različica. Pred implementacijo.

## Odprta vprašanja in omejitve

- Natančna razporeditev novih kontrol ni predpisana; izbrana je vrstica
  orodij pod naslovom in stolpec "Mesto" v preglednici.
- Nezaključeno nalaganje in sočasne spremembe podatkov niso del obsega.
- Končnih (skritih) testov ni mogoče zagnati; navedena so le dejansko
  izvedena preverjanja.
