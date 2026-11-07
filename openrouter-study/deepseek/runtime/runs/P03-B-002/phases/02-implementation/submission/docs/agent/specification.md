# P03 — razvojna specifikacija: iskanje in sestavljeni filtri

Različica: 1 (osnutek 1), 2026-10-09. Avtor: agent-specifikator.
Viri: `task/instructions.md`, `PROJECT_RULES.md`, `task/specification-template.md`,
`shared/types.ts`, `src/App.tsx`, `src/api.ts`, `docs/dizajn.md`.

## Problem in kontekst

Folio trenutno prikaže vsa opravila trenutnega projekta v preglednici ali na tabli
(`src/App.tsx`), brez iskanja in filtrov. Uporabnik želi v velikem projektu hitro
najti opravila: prosto iskanje po besedilu (neobčutljivo na č/š/ž in velikost črk),
filter stanja in filter odgovorne osebe, ki delujeta hkrati, ter jasno število
zadetkov. Vmesnik ostane Folio (`docs/dizajn.md`), bere in piše samo prek javnega
`/api/`, vse stanje filtrov pa je lokalno trenutnemu projektu in se ne shranjuje.

## Vhodi, dejanja in izidi

**Podatki.** Opravilo `Task = { id, projectId, title, description, status, assignee, dueDate }`,
`status ∈ {todo, in_progress, done}`; projekti `Project = { id, name }` (`shared/types.ts`).
Vira sta obstoječa GET klica `/api/projects` in `/api/projects/:id/tasks`; nobenih novih
zapisovalnih klicev ni. Projekta sta lahko prazna, opravil je lahko 0..n (>10), ID-ji so
enkratni, vrstni red in datumi poljubni, besedila navaden Unicode z ločili.

**Stanje filtriranja** (lokalno, ne v URL in ne v trajni shrambi):
`W` = seznam nepraznih iskalnih besed, `S ∈ {all, todo, in_progress, done}`,
`A ∈ {all} ∪ imena`. Privzeto `W = []`, `S = all`, `A = all`.

**Predikati.** Naj bo `n(s)` = `NFD(s)` z odstranjenimi znaki U+0300–U+036F in
pretvorjenimi v male črke. Naj bo `F(t) = [t.id, t.title, t.description, t.assignee].join(" ")`
in `N(t) = n(F(t))`.

- `beseda(w, t) ⇔ n(w) ⊆ N(t)` (dobesedni podniz; ločila v `w` so dobesedna).
- `ujemanje(t, W) ⇔ W = [] ∨ ∀w ∈ W: beseda(w, t)` (vrstni red besed ni pomemben).
- `stanje(t, S) ⇔ S = all ∨ t.status = S`.
- `oseba(t, A) ⇔ A = all ∨ t.assignee = A` (natančno, brez normalizacije).
- `viden(t) ⇔ ujemanje(t, W) ∧ stanje(t, S) ∧ oseba(t, A)`.

Množica `T` = opravila trenutnega projekta v vrstnem redu odgovora API-ja;
`Nvid` = |{t ∈ T : viden(t)}|; `M` = |T|.

**Dejanja in izidi.**
- Vnos v iskalnik doda/odstrani besedo; prazen ali samo beli prostor ne omejuje.
- Izbira stanja/osebe nastavi `S`/`A`; `Počisti filtre` v enem dejanju nastavi `W=[]`, `S=all`, `A=all`.
- Menjava projekta ponastavi vse tri kontrole; preklop pogleda (preglednica/tabla) jih ohrani.
- Uspeh: prikazani so točno `viden(t)` zadetki v izvornem vrstnem redu, števci ustrezajo `Nvid`/`M`,
  ob praznem zadetku sporočilo `Ni zadetkov.`. Napake branja ostanejo obstoječe (`LoadError`, ponovni poskus).
- Preklic/neveljaven vnos: ni posebnih dejanj; prazno iskanje = brez omejitve.

## Zahteve in pravila

Splošno pravilo: vsi trije pogoji se vedno uporabijo na celotnem `T` trenutnega projekta
(`viden`), nikoli na že filtrirani množici. Posamezni testni primer določi konkretne podatke,
ne spreminja pravila.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob prvem izrisu `W=[]`, `S=all`, `A=all`; preglednica/tabla prikažeta vsa `t ∈ T` v vrstnem redu API-ja. | Scenarij: naloži projekt z >1 opravilom; primerjaj `data-task-id` zaporedje z odgovorom API-ja. |
| R02 | `n()` na obeh straneh: NFD, odstranjeni U+0300–U+036F, male črke; zato `č≈c`, `Č≈č`, `š≈s`, `ž≈z` in velikost črk ne vpliva. | Predikati `n()`; iskanje `can` najde `Čan`, `solar` najde `Šolar`. |
| R03 | `W` = razdelitev vnosa po belinah brez praznih besed; `ujemanje` = vse besede so podnizi `N(t)`; vrstni red poljuben; ločila dobesedna; `W=[]` ne omejuje. | Iskanje `a b` vrne opravila z obema; `a.*` se ne obnaša kot regex; vrstni red `b a` enak. |
| R04 | `viden = ujemanje ∧ stanje ∧ oseba`; `stanje`/`oseba` se uporabita poleg iskanja (IN), ne neodvisno. `A` se primerja natančno (brez `n()`, brez trim/case-fold). | Matrika kombinacij W/S/A na podatkih z različnimi stanji in imeni. |
| R05 | Možnosti osebe = `{all} ∪ {t.assignee : t ∈ T, t.assignee ≠ ""}`, vsako ime natanko enkrat; vir je celoten `T`, neodvisno od `W`/`S`/`A`. Ob menjavi projekta `A=all`. | Preveri število in vsebino `<option>`; skrij vsa opravila osebe z drugim filtrom in preveri, da možnost ostane. |
| R06 | Preglednica in tabla prikažeta isto množico ID-jev `{t : viden(t)}`; preklop pogleda ohrani `W`,`S`,`A`. Stolpec stanja na tabli vsebuje natanko vidna opravila tega stanja. | Primerjaj `data-task-id` med pogledoma; preklopi pogled po filtriranju in preveri števce stolpcev. |
| R07 | Menjava projekta (drug ID v `/api/projects/:id/tasks`) nastavi `W=[]`, `S=all`, `A=all`; noben pogoj iz prejšnjega projekta se ne prenese. | Filtriraj projekt A, preklopi na B: prazne kontrole in vsa opravila B. |
| R08 | Osvežitev strani (`reload`) začne s privzetki; `W`,`S`,`A` niso v URL (query/hash) ne v `localStorage`/`sessionStorage`/`IndexedDB`/cookie. | Reload po filtriranju; pregled URL in trajnih shramb. |
| R09 | Besedilo `Prikazano: N od M.`, kjer `N=Nvid`, `M=|T|`. Vsi vidni števci (pregled stanj Pripravljeno/V delu/Končano, števci stolpcev table, značka ob naslovu, noga) štejejo vidne zadetke. | Po filtrih preberi `role=status` in števce; primerjaj z ročno izračunanim `Nvid` in `M`. |
| R10 | `T ≠ ∅ ∧ Nvid = 0` → sporočilo `Ni zadetkov.`, oba pogleda ostaneta uporabna (navigacija/preklop/čiščenje delujejo). `T = ∅` → obstoječe prazno stanje in `Prikazano: 0 od 0.` | Vzpostavi nič zadetkov s kombinacijo filtrov; ločeno prazen projekt. |
| R11 | `Počisti filtre` v enem dejanju nastavi `W=[]`, `S=all`, `A=all` in prikaže vsa `t ∈ T`. Filtriranje ne spremeni vrstnega reda `T` ali vrednosti polj (brez PATCH). | Klik po poljubni kombinaciji filtrov; primerjaj stanje kontrol in `data-task-id` z izhodiščem. |
| R12 | Navigacija med projekti in bralne podrobnosti (`TaskDetails`, `data-task-id`, dostopna imena) delujejo. Filtriranje ne pošlje POST/PATCH/PUT/DELETE na `/api/`. Ohranjena sta Folio videz in prikaz pri 390 px brez vodoravnega raztezanja strani (notranje drsenje tabele dovoljeno). | Omrežni dnevnik med filtriranjem; preverjanje `aria-label` in širine 390 px. |

**Dogovor o vmesniku (obvezen).** Iskalnik `input type="search"` z dostopnim
imenom/besedilom `Išči opravila`; `select` z oznako `Filter stanja` (`all`, `todo`,
`in_progress`, `done`) in `select` z oznako `Filter odgovorne osebe` (`all` ali točno ime);
gumb `Počisti filtre`; element `role="status"` z `aria-label="Rezultati filtriranja"`
in besedilom `Prikazano: N od M.`. Ohranjeni so `data-task-id` na vrsticah in karticah,
obstoječa dostopna imena pogledov/stolpcev ter `aria-label="Pregled stanj opravil"`.
Nova dejanja ob opravilu so zunaj njegove povezave. Na 390 px se stran ne razširi.

## Izvedba in sledljivost

Povezave na kodo in dokaze dopolni implementer po izvedbi; specifikator kode ne
označuje kot preverjene. Predvideno mesto: `src/App.tsx` (stanje filtrov, predikati,
števci, prazna stanja), `src/TaskBoard.tsx` (filtrirana tabla in števci stolpcev),
`src/components.tsx`/`src/styles.css` (kontrole, `role=status`, 390 px),
`tests/agent/` (scenariji R01–R12).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzetki + izvorni vrstni red | scenarij nalaganja | — | ni izvedeno (specifikacija) |
| R02 | `n()` NFD in č≈c | primer Unicode iskanja | — | ni izvedeno |
| R03 | vse besede, poljuben vrstni red | večbesedno iskanje | — | ni izvedeno |
| R04 | IN vseh pogojev | matrika filtrov | — | ni izvedeno |
| R05 | možnosti iz celega projekta | pregled `<option>` | — | ni izvedeno |
| R06 | isti ID-ji v obeh pogledih | primerjava pogledov | — | ni izvedeno |
| R07 | ponastavitev ob menjavi projekta | preklop projekta | — | ni izvedeno |
| R08 | privzetki po reloadu, brez shrambe | reload + pregled | — | ni izvedeno |
| R09 | `Prikazano: N od M.` in števci | branje statusa in števcev | — | ni izvedeno |
| R10 | `Ni zadetkov.` / `0 od 0.` | nič zadetkov + prazen projekt | — | ni izvedeno |
| R11 | eno dejanje počisti vse | klik + primerjava | — | ni izvedeno |
| R12 | navigacija, brez zapisov, 390 px | omrežje + širina | — | ni izvedeno |

## Odprta vprašanja in omejitve

- Predpostavka: `F(t)` združi polja z enojnim presledkom; beseda se zato ne more
  raztezati čez mejo dveh polj (posledica delitve po belinah).
- Predpostavka: belina = JavaScript `\s` (vključno s tabulatorjem in prelomom).
- R09: zahteva imenuje pregled stanj in števce stolpcev; specifikacija k temu
  šteje tudi značko ob naslovu in nogo preglednice, ker gre za iste števce.
- Vrstni red možnosti v izbirniku oseb in razporeditev novih kontrol nista predpisana.
- Vzporedne spremembe podatkov brez osvežitve in nalaganje med navigacijo nista
  razširjena prek obstoječih regresijskih zahtev; stanje filtrov je vezano na trenutni projekt.
- Vsi izidi R01–R12 so za zdaj nepreverjeni; dejanske dokaze (ime testa, dnevnik)
  vpiše implementer, pregleda pa ocenjevalec.

- Preverjeno v izhodišču: `Loading` že uporablja `role="status"`, zato mora biti novi
  element rezultatov določljiv z `aria-label="Rezultati filtriranja"`; števci stolpcev
  table imajo `aria-label="N opravil"`, tabla pa `role="region"` z `aria-label="Tabla opravil"`.
