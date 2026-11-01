# Specifikacija P04: Stabilno razvrščanje z dvema ključema

- Različica: 1.0, datum: 2026-11-01
- Vir zahtev: `task/instructions.md` (R01–R12); izvirne zahteve so merilo, tudi če jih ta dokument kje povzame krajše.
- Ustava: `.specify/memory/constitution.md`; pot funkcionalnosti: `docs/agent/P04` (`.specify/feature.json`).

## Problem in kontekst

Uporabnik želi opravila projekta razvrstiti po dveh ključih (na primer stanje, nato rok), ne da bi pri tem spremenil podatke. Začetna aplikacija Folio prikazuje opravila v vrstnem redu, kot jih prejme iz javnega API-ja, ponuja preglednico in tablo, podrobnosti odpira prek usmeritve v `#/`, potrjeni videz pa je opisan v `docs/dizajn.md`.

Predvidena sprememba je projekcija: seznam se pred prikazom razvrsti z izbranima ključema in smermi; izvorno polje, polja opravil, pripadnost in skupni števci ostanejo nespremenjeni. Vmesnik dobi štiri kontrole in gumb za ponastavitev.

## Vhodi, dejanja in izidi

### Podatki

- `GET /api/projects` vrne projekte (`id`, `name`); `GET /api/projects/:id/tasks` vrne opravila v poljubnem vrstnem redu.
- Opravilo: `id`, `projectId`, `title`, `description`, `status` (`todo` | `in_progress` | `done`), `assignee`, `dueDate` (veljaven `YYYY-MM-DD`).
- Testi lahko vrnejo nič, eno ali več opravil, enake naslove, drugačne ID-je, različna zaporedja in veljavne datume; projekta sta lahko prazna. Imena so neprazna in različna od rezervirane vrednosti `all`.
- Aplikacija bere samo `/api/`; testnih kontrol `/__test/` ne uvaža, ne uporablja in ne bere (ustava, načelo III).

### Dejanja in stanje

- Stanje razvrščanja je četverica σ = (primarniKljuč, primarnaSmer, sekundarniKljuč, sekundarnaSmer); privzeto σ0 = (original, asc, none, asc).
- Izbira katerekoli kontrole spremeni σ in takoj preuredi prikaz.
- Preklop pogleda ohrani σ; odpiranje in zapiranje podrobnosti ne spremeni σ (R08).
- Menjava projekta in osvežitev strani nastavita σ0; σ ni v trajni shrambi ali URL-ju (R09).
- Gumb Izvorni vrstni red nastavi σ0 (R10).
- Napaka branja: obstoječi `LoadError` s ponovitvijo; nad nepopolnimi podatki se ne razvršča.
- Vse spremembe so lokalne trenutnemu projektu; novih zapisovalnih API-jev ni.

### Dogovor o vmesniku

- HTML `select` Primarni ključ: `original`/`title`/`assignee`/`status`/`dueDate`; Primarna smer: `asc`/`desc`.
- HTML `select` Sekundarni ključ: `none`/`title`/`assignee`/`status`/`dueDate`; Sekundarna smer: `asc`/`desc`.
- Gumb Izvorni vrstni red.
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev, `aria-label="Pregled stanj opravil"`, povezave opravil ter prilagodljiv videz Folio. Nova dejanja ob opravilu so zunaj njegove povezave. Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno, in razporeditev novih kontrol nista predpisana.

## Zahteve in pravila

### Simboli in predikati

Za opravilo t: T(t) naslov, A(t) odgovorna oseba, S(t) stanje, D(t) rok, i(t) izvorni indeks v prejetem polju P.

- normaliziraj(s) = male črke(NFD(s) brez znakov U+0300–U+036F).
- rang(S(t)): todo = 0, in_progress = 1, done = 2.
- vrednost(D(t)): kronološka vrednost veljavnega datuma `YYYY-MM-DD`.
- primerjaj(k, a, b) ∈ {−1, 0, 1}: za title/assignee leksikografska primerjava normaliziranih nizov po UTF-16 z `<` in `>`; za status po rangu; za dueDate po vrednosti; za original po i(t). Jezikovno ali številsko prilagojeno razvrščanje se ne uporablja.
- Izid primerjave para (a, b): c = primerjaj(primarniKljuč, a, b); če c ≠ 0, je izid c ob asc oziroma −c ob desc. Če je c = 0 in sekundarniKljuč ≠ none, je c2 = primerjaj(sekundarniKljuč, a, b) in izid je c2 ob asc oziroma −c2 ob desc. Če je c = 0 in (sekundarniKljuč = none ali c2 = 0), je izid 0.
- Stabilnost: S = stabilno_uredi(P, primerjava); pri izidu 0 se relativni vrstni red iz P ohrani. Smer obrne samo izid primerjave, ne celotnega polja.
- Predikat izvornega reda: primarniKljuč = original ⟹ S = P, ne glede na smer in druge kontrole.
- Predikat ohranitve projekcije: polja opravil, pripadnost, skupna števila in P ostanejo nespremenjeni; noben zahtevek ne zapisuje na API.

### Pregled zahtev

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | σ0 = (original, asc, none, asc); S = P. | Test privzetih vrednosti in vrstnega reda; test izbir ključev in smeri. |
| R02 | title/assignee: primerjava normaliziranih nizov po UTF-16. | Testi z NFD, ločili, velikimi črkami in znaki zunaj U+0300–U+036F. |
| R03 | status po rangu todo, in_progress, done; dueDate kronološko. | Testi statusnega in datumskega ključa. |
| R04 | Smer obrne izid primerjave; izenačeni elementi se ne obrnejo. | Testi asc/desc z izenačenimi elementi. |
| R05 | Sekundarni ključ velja samo ob enakosti primarnega, s samostojno smerjo. | Testi parov ključev z delno enakostjo. |
| R06 | Ob enakosti obeh ključev izvorni vrstni red; enak sekundarni in primarni ključ ne doda obrata; original na primarnem ključu vedno vrne P. | Testi stabilnosti, dvojnega ključa in original. |
| R07 | Stolpci ostanejo todo, in_progress, done; znotraj stolpca relativni vrstni red istega S kot v preglednici. | Primerjava zaporedja kartic s preglednico. |
| R08 | Preklop pogleda in podrobnosti ohranita σ. | Test preklopa pogleda in odpiranja/zapiranja podrobnosti. |
| R09 | Menjava projekta in osvežitev nastavita σ0; brez trajne shrambe in URL-ja. | Test menjave projekta in ponovnega nalaganja. |
| R10 | Gumb nastavi σ0; prazno in eno-opravilno stanje delujeta pri vseh ključih in smereh. | Test gumba in robnih velikosti. |
| R11 | Razvrščanje je projekcija; brez sprememb podatkov in brez zapisov na API. | Test zapisov zahtevkov in nespremenjenih podatkov. |
| R12 | Vsak ID prikazan natanko enkrat, podrobnosti prave tudi pri enakih naslovih; ohranjene bralne funkcije in videz. | Testi ID-jev, podrobnosti ob enakih naslovih in ozkega zaslona. |

## Izvedba in sledljivost

Podrobnosti izvedbe in razčlenitev dela so v `plan.md` in `tasks.md`; izidi so vpisani po dejanskem zagonu (npm run check, 2026-11-01).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | σ0, S = P | `tests/agent/sort-table.spec.ts:9` | `src/App.tsx`, `src/sorting.ts` | uspešno (npm run check, 2026-11-01) |
| R02 | normalizirana primerjava | `tests/agent/sort-table.spec.ts:18` | `src/sorting.ts` (normalizeLabel) | uspešno |
| R03 | rang in datumi | `tests/agent/sort-table.spec.ts:33` | `src/sorting.ts` (compareValues) | uspešno |
| R04 | smer obrne primerjavo | `tests/agent/sort-table.spec.ts:26` | `src/sorting.ts` (primarySign) | uspešno |
| R05 | sekundarni ob enakosti | `tests/agent/sort-table.spec.ts:41` | `src/sorting.ts` (secondarySign) | uspešno |
| R06 | stabilnost in original | `tests/agent/sort-table.spec.ts:53,63` | `src/sorting.ts` (sortTasks) | uspešno |
| R07 | stolpci in relativni red | `tests/agent/sort-board.spec.ts:3,9,18` | `src/TaskBoard.tsx`, `src/App.tsx` | uspešno |
| R08 | ohranitev σ | `tests/agent/sort-board.spec.ts:29`, `sort-state.spec.ts:28` | `src/App.tsx`, `src/SortControls.tsx` | uspešno |
| R09 | ponastavitev σ | `tests/agent/sort-state.spec.ts:3,16` | `src/App.tsx` | uspešno |
| R10 | gumb in robna stanja | `tests/agent/sort-table.spec.ts:71`, `sort-state.spec.ts:40,56` | `src/SortControls.tsx` | uspešno |
| R11 | projekcija | `tests/agent/sort-projection.spec.ts:3` | `src/sorting.ts`, `src/App.tsx` | uspešno |
| R12 | ID-ji in videz | `tests/agent/sort-projection.spec.ts:19,31,44,54` in `tests/baseline.spec.ts` | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno |

## Odprta vprašanja in omejitve

- Razporeditev in besedilo novih kontrol nista predpisana; rešitev uporabi obstoječe gradnike in slogovne spremenljivke Folio.
- Končni testi niso dostopni v tem okolju; skupni testi preverjajo izhodišče in infrastrukturo, zahteve P04 pa lastni testi v `tests/agent/`. Neizvedeni testi se ne navajajo kot uspešni.
- Sočasne spremembe podatkov in navigacija med nedokončanim nalaganjem niso predmet zahtev (izven obsega).
- Strežnik, odvisnosti, skupni tipi in skupni testi so nespremenjeni; novih zapisovalnih API-jev ni.
- Bistvenih odprtih vprašanj ni; sproti navedene izbire so skladne z izvirnimi zahtevami.

## Zgodovina sprememb

- 1.0 (2026-11-01): prva različica za R01–R12.
- 1.1 (2026-11-01): izpolnjena sledljivost z dejanskimi izidi; npm run check: 68 testov uspešno, lint in typecheck brez napak.
