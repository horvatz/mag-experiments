# Specifikacija: P10 — Lokalni vrstni red z razveljavitvami

Vir zahtev: `task/instructions.md` (R01–R12, dogovor o vmesniku, podatki in
obseg). Predloga: `task/specification-template.md`. Načela:
`.specify/memory/constitution.md`. Zahteve izhodišča so merilo tudi, če ta
dokument katero izpusti.

## Problem in kontekst

Uporabnik v aplikaciji Folio pregleduje opravila dveh projektov v preglednici
in na tabli ter odpira njihove podrobnosti. Naloga P10 doda urejanje
**globalnega vrstnega reda** opravil znotraj trenutnega projekta: premikanje
opravila za eno mesto gor/dol, razveljavitev in ponovitev premikov ter vrnitev
na začetni vrstni red. Vse spremembe so lokalne permutacije iste množice ID-jev;
polja opravil in stanje na strežniku se ne spreminjajo. Začetno delovanje
(izbor projekta, preglednica/tabla, podrobnosti, branje prek `/api/`) ostane.

## Vhodi, dejanja in izidi

- **Vhodi**: seznam opravil trenutnega projekta iz javnega vmesnika `/api/`
  (ista polja in tipi kot izhodišče; ID-ji so enkratni, naslovi so lahko enaki,
  število opravil je poljubno, tudi 0 ali 1). Izbira projekta določa, kateri
  seznam je aktiven.
- **Dejanja**: `Premakni <id> gor`, `Premakni <id> dol` ob vrstici/kartici
  (ločeno od povezave opravila), `Razveljavi premik`, `Ponovi premik`,
  `Začetni vrstni red`.
- **Izid uspeha**: nova permutacija je vidna v preglednici (globalni vrstni red)
  in na tabli (relativni vrstni red znotraj stolpcev stanj), števca in
  omogočenost gumbov sta usklajena z zgodovino.
- **Preklic/neveljavno**: premik na robu (prvo gor, zadnje dol) in dejanja ob
  prazni zgodovini so onemogočeni in ne spremenijo vrstnega reda ne zgodovine.
- **Napaka**: če branje `/api/` ne uspe, se prikaz ne spremeni; lokalne
  permutacije se ne poskušajo zapisovati na strežnik.

## Zahteve in pravila

**Simboli in predpostavke.** `T` je trenutna permutacija ID-jev opravil
trenutnega projekta, `T0` izvorna permutacija (vrstni red iz `/api/`), `n = |T|`.
`U` je sklad prejšnjih permutacij za razveljavitev (največ 20), `R` sklad
razveljavljenih permutacij za ponovitev. `poz(id) = index(T, id) + 1`.
`pred(id)`/`nasl(id)` sta neposredni globalni sosed v `T`. Premik zamenja
soseda v `T`; polja opravil (`id`, naslov, opis, stanje, oseba, rok) se ne
spreminjajo. Zgodovina je vezana na trenutni projekt in se ne shranjuje trajno.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku velja `T = T0`. Vsako opravilo prikazuje `poz(id)` od 1 do `n`; enaki naslovi se ne povezujejo. | Test začetnega vrstnega reda in oznak mest; več opravil z enakimi naslovi. |
| R02 | `Premakni <id> gor`: če `poz(id) > 1`, velja `T' = T` z zamenjanima `id` in `pred(id)`. `Premakni <id> dol`: če `poz(id) < n`, velja `T' = T` z zamenjanima `id` in `nasl(id)`. Polja in stanja opravil ostanejo nespremenjena. | Test premika gor/dol v obeh pogledih; primerjava polj pred/po. |
| R03 | Robna dejanja (`poz(id) = 1` pri gor, `poz(id) = n` pri dol) so onemogočena; `T' = T` in `U`, `R` nespremenjena. Ponovljeno neveljavno dejanje ne doda zgodovine. | Test onemogočenih robnih gumbov in nespremenjene zgodovine. |
| R04 | Veljaven premik: `U' = U + [T]` (do meje), `R' = []`, `T' = zamenjava`. `Razveljavi premik`: če `U ≠ []`, `T' = U[-1]`, `U' = U brez zadnjega`, `R' = R + [T]`. | Test razveljavitve vrne prejšnjo permutacijo; preverjanje skladov. |
| R05 | `Ponovi premik`: če `R ≠ []`, `T' = R[-1]`, `R' = R brez zadnjega`, `U' = U + [T]` (do meje). Zaporedja več razveljavitev/ponovitev ohranijo ID-je brez izgube ali podvajanja. | Test zaporedja undo/redo z več koraki in primerjava množice ID-jev. |
| R06 | Nov veljaven premik po razveljavitvi nastavi `R' = []`; neveljavno robno dejanje ohrani `R`. | Test: undo, nato premik → ponovitev ni mogoča; robni klik → zgodovina ponovitev nespremenjena. |
| R07 | `U` vsebuje največ 20 prejšnjih permutacij; ob 21. veljavnem premiku se najstarejša zavrže. Ponovitve delujejo za vse trenutno razveljavljene korake. | Test 21+ premikov in meje sklada; undo vseh razpoložljivih ponovitev. |
| R08 | `Začetni vrstni red`: če `T ≠ T0`, `U' = U + [T]`, `R' = []`, `T' = T0` (eno novo razveljavljivo dejanje). Če `T = T0`, je gumb onemogočen in zgodovina nespremenjena. | Test vrnitve na izvor in ponovne razveljavitve; test onemogočenega gumba v izvoru. |
| R09 | Preglednica prikazuje globalni `T`. Tabla prikazuje relativni vrstni red znotraj stalnih stolpcev stanj glede na `T`; premik na tabli uporablja globalnega soseda, spremeni le `T` in ne statusa. | Test ujemanja obeh pogledov; test premika na tabli z nespremenjenim statusom. |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita `T`, `U`, `R`. Menjava projekta in osvežitev nastavita `T = T0` ter `U = R = []`; podatki se ne shranjujejo trajno. | Test preklopa pogledov/podrobnosti; test menjave projekta in osvežitve. |
| R11 | `role=status` z `aria-label="Zgodovina vrstnega reda"` kaže `Razveljavitve: U. Ponovitve: R.`; gumba sta onemogočena pri ničli. Prazen projekt in projekt z enim opravilom ostaneta uporabna brez dovoljenega premika. | Test števcev, onemogočenih gumbov in robnih projektov (0, 1 opravilo). |
| R12 | Vse spremembe so lokalne permutacije iste množice ID-jev; ni zapisov na API ne sprememb polj. Števci stanj in podrobnosti ostanejo enaki; prilagodljiv Folio je ohranjen. | Test nespremenjenih polj/statusov in odsotnosti zapisovalnih klicev; vizualna preverjanja v obeh pogledih. |

### Dogovor o vmesniku

- Ob vrstici/kartici: gumba `Premakni <id> gor` in `Premakni <id> dol`, ločena
  od povezave; element `aria-label="Mesto opravila <id>"` z globalno številko.
- Gumbi `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`.
- Element `role=status`, `aria-label="Zgodovina vrstnega reda"`, besedilo
  `Razveljavitve: U. Ponovitve: R.`.
- Ohranjeni `data-task-id`, dostopna imena pogledov in stolpcev ter
  `aria-label="Pregled stanj opravil"`. Pri širini 390 pik se stran ne
  razširi; notranje drsenje preglednice in table je dovoljeno.

## Izvedba in sledljivost

Izid se zapiše šele po dejanski izvedbi; ta specifikacija ne trdi rezultatov.
Podrobnejši načrt in opravila so v `plan.md` in `tasks.md` te mape; dokazi
(ime testa, dnevnik zagona) se dopolnijo med izvedbo.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Pravila iz preglednice zgoraj | `tests/agent/P10.spec.ts` A01–A12 + skupni `tests/baseline.spec.ts`, `tests/api.spec.ts`, `tests/development/P10.spec.ts` | `src/order.ts`, `src/OrderControls.tsx`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | `npm test`: 58 uspešnih (glej `docs/agent/verification.md`). |

## Odprta vprašanja in omejitve

- Trajna shramba, URL stanje, sočasne spremembe in nalaganje med navigacijo
  niso del obsega (izhaja iz R10 in `task/instructions.md`).
- Končni ocenjevalni testi agentu niso dostopni; navajajo se le dejansko
  izvedena lastna in skupna preverjanja.
- Podrobna razporeditev novih kontrol in besedila, ki niso predpisana, so
  prepuščeni izvedbi ob ohranitvi potrjenega videza Folio.
- Zunanje meritve uspešnosti niso predvidene; sprejemni pogoji so funkcijski.
